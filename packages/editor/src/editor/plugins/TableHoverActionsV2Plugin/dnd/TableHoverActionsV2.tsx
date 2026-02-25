import type { JSX } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
  closestCenter,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";

import { ColumnDragData, DropIndicatorState } from "./types";
import {
  TOP_BUTTON_OVERHANG,
  LEFT_BUTTON_OVERHANG,
  getTableFromMouseEvent,
  getClosestTopCellPosition,
  isTableFromEditor,
  getDropIndicatorState,
  getTableKey,
} from "./helpers";
import { FloatingAddControls } from "./FloatingAddControls";

// DropIndicator 컴포넌트
function DropIndicator({ edge }: { edge: "left" | "right" }) {
  return <div className={`drop-indicator ${edge}`}></div>;
}

// 드래그 가능한 컬럼
function DraggableColumn({ id, children }: { id: number; children: JSX.Element }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      {children}
    </div>
  );
}

export function TableHoverActionsV2({ anchorElem }: { anchorElem: HTMLElement }) {
  const [editor, { getTheme }] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();

  const [hoveredTable, setHoveredTable] = useState<HTMLTableElement | null>(null);
  const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number | null>(null);
  const [dropIndicatorState, setDropIndicatorState] = useState<DropIndicatorState | null>(null);

  const [columns, setColumns] = useState<number[]>([]);
  const virtualRef = useRef<HTMLDivElement | null>(null);

  // 컬럼 초기화
  useEffect(() => {
    if (!hoveredTable) return;
    const firstRow = hoveredTable.rows[0];
    if (!firstRow) return;
    setColumns(Array.from(firstRow.cells).map((_, idx) => idx));
  }, [hoveredTable]);

  // 컬럼 드래그 완료
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    setColumns((cols) => {
      const oldIndex = cols.indexOf(Number(active.id));
      const newIndex = cols.indexOf(Number(over.id));
      return arrayMove(cols, oldIndex, newIndex);
    });
  };

  // 마우스 무브 감지
  useEffect(() => {
    if (!isEditable) return;

    const handleMouseMove = (event: MouseEvent) => {
      const { tableElement, isOutside } = getTableFromMouseEvent(event, getTheme);
      if (isOutside || !tableElement) {
        setHoveredTable(null);
        setHoveredColumnIndex(null);
        setDropIndicatorState(null);
        return;
      }

      const closestTopCell = getClosestTopCellPosition(tableElement, event.clientX);
      if (!closestTopCell) {
        setHoveredTable(null);
        setHoveredColumnIndex(null);
        setDropIndicatorState(null);
        return;
      }

      setHoveredTable(tableElement);
      setHoveredColumnIndex(closestTopCell.cell.cellIndex ?? null);

      virtualRef.current = closestTopCell.cell as unknown as HTMLDivElement;

      const tableRect = tableElement.getBoundingClientRect();
      const boundaryIndex = closestTopCell.cell.cellIndex;
      setDropIndicatorState(
        getDropIndicatorState(
          tableElement.rows[0],
          tableRect,
          boundaryIndex,
        ) as DropIndicatorState,
      );
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isEditable, getTheme]);

  if (!isEditable) return null;

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={columns} strategy={horizontalListSortingStrategy}>
        <div className="floating-top-actions" ref={virtualRef}>
          {columns.map((colIdx) => (
            <DraggableColumn key={colIdx} id={colIdx}>
              <FloatingAddControls
                hoveredTable={hoveredTable}
                hoveredColumnIndex={colIdx}
                editor={editor}
              />
            </DraggableColumn>
          ))}
        </div>
      </SortableContext>

      {dropIndicatorState && <DropIndicator edge={dropIndicatorState.edge} />}
    </DndContext>
  );
}

// Portal Plugin
export default function TableHoverActionsV2Plugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement;
}): React.ReactPortal | null {
  const isEditable = useLexicalEditable();
  return isEditable
    ? createPortal(<TableHoverActionsV2 anchorElem={anchorElem} />, anchorElem)
    : null;
}
