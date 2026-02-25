/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import type { JSX } from "react";
import "./index.css";
import {
  autoUpdate,
  offset,
  shift,
  useFloating,
  type VirtualElement,
} from "@floating-ui/react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import {
  $computeTableMapSkipCellCheck,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
} from "@lexical/table";
import { $isSimpleTable } from "./isSimpleTable";
import { $moveTableColumn } from "./moveTableColumn";
import {
  $getChildCaret,
  $getNearestNodeFromDOMNode,
  $getSiblingCaret,
  type EditorThemeClasses,
  isHTMLElement,
} from "lexical";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import DropDown, { DropDownItem } from "../../ui/DropDown";
import { getThemeSelector } from "../../utils/getThemeSelector";

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  useDraggable,
  useDroppable,
  closestCenter,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";

const INDICATOR_SIZE_PX = 18;
const SIDE_INDICATOR_SIZE_PX = 18;
const TOP_BUTTON_OVERHANG = INDICATOR_SIZE_PX / 2;
const LEFT_BUTTON_OVERHANG = SIDE_INDICATOR_SIZE_PX / 2;

function getTableFromMouseEvent(
  event: MouseEvent,
  getTheme: () => EditorThemeClasses | null | undefined,
): { isOutside: boolean; tableElement: HTMLTableElement | null } {
  if (!isHTMLElement(event.target)) {
    return { isOutside: true, tableElement: null };
  }

  const cellSelector = `td${getThemeSelector(getTheme, "tableCell")}, th${getThemeSelector(
    getTheme,
    "tableCell",
  )}`;
  const cell = event.target.closest<HTMLTableCellElement>(cellSelector);
  const tableElement = cell?.closest<HTMLTableElement>("table") ?? null;

  return {
    isOutside: tableElement == null,
    tableElement,
  };
}

function getClosestTopCellPosition(
  tableElement: HTMLTableElement,
  clientX: number,
): { centerX: number; top: number; cell: HTMLTableCellElement } | null {
  const firstRow = tableElement.rows[0];
  if (!firstRow) {
    return null;
  }

  let closest: { cell: HTMLTableCellElement; centerX: number; top: number } | null = null;
  let smallestDelta = Number.POSITIVE_INFINITY;

  for (const cell of Array.from(firstRow.cells)) {
    const rect = cell.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const delta = Math.abs(centerX - clientX);
    if (delta < smallestDelta) {
      smallestDelta = delta;
      closest = { cell, centerX, top: rect.top };
    }
  }

  return closest;
}

function isTableFromEditor(
  tableElement: HTMLTableElement | null,
  editor: ReturnType<typeof useLexicalComposerContext>[0],
): boolean {
  const root = editor.getRootElement();
  return !!root && !!tableElement && root.contains(tableElement);
}

type ColumnDragData = {
  columnIndex: number;
  tableKey: string | null;
  type: "table-column";
};

type DropIndicatorState = {
  edge: "left" | "right";
  height: number;
  left: number;
  top: number;
};

function getBoundaryIndex(cell: HTMLTableCellElement, clientX: number): number {
  const rect = cell.getBoundingClientRect();
  const isRightHalf = clientX > rect.left + rect.width / 2;
  const cellIndex = cell.cellIndex ?? 0;
  return cellIndex + (isRightHalf ? 1 : 0);
}

function getDropIndicatorState(
  headerRow: HTMLTableRowElement,
  tableRect: DOMRect,
  boundaryIndex: number,
): DropIndicatorState | null {
  const cellCount = headerRow.cells.length;
  if (cellCount === 0) return null;

  const clampedIndex = Math.max(0, Math.min(boundaryIndex, cellCount));

  if (clampedIndex === 0) {
    const firstRect = headerRow.cells[0].getBoundingClientRect();
    return { edge: "left", height: tableRect.height, left: firstRect.left, top: tableRect.top };
  }
  if (clampedIndex === cellCount) {
    const lastRect = headerRow.cells[cellCount - 1].getBoundingClientRect();
    return {
      edge: "right",
      height: tableRect.height,
      left: lastRect.right,
      top: tableRect.top,
    };
  }

  const targetRect = headerRow.cells[clampedIndex].getBoundingClientRect();
  return { edge: "left", height: tableRect.height, left: targetRect.left, top: tableRect.top };
}

function getTableKey(tableElement: HTMLTableElement | null): string | null {
  return tableElement?.getAttribute("data-lexical-key") ?? null;
}

function TableHoverActionsV2({ anchorElem }: { anchorElem: HTMLElement }): JSX.Element | null {
  const [editor, { getTheme }] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();

  const [hoveredTable, setHoveredTable] = useState<HTMLTableElement | null>(null);
  const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number | null>(null);
  const [dropIndicatorState, setDropIndicatorState] = useState<DropIndicatorState | null>(null);

  const virtualRef = useRef<HTMLElement | null>(null);

  // DnD Kit state
  const [columns, setColumns] = useState<number[]>([]);

  useEffect(() => {
    if (!hoveredTable) return;
    const firstRow = hoveredTable.rows[0];
    if (!firstRow) return;
    setColumns(Array.from(firstRow.cells).map((_, idx) => idx));
  }, [hoveredTable]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    setColumns((cols) => {
      const oldIndex = cols.indexOf(Number(active.id));
      const newIndex = cols.indexOf(Number(over.id));
      return arrayMove(cols, oldIndex, newIndex);
    });
  };

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
        return;
      }

      setHoveredTable(tableElement);
      setHoveredColumnIndex(closestTopCell.cell.cellIndex ?? null);
      virtualRef.current = closestTopCell.cell;
      const tableRect = tableElement.getBoundingClientRect();
      const boundaryIndex = getBoundaryIndex(closestTopCell.cell, event.clientX);
      setDropIndicatorState(
        getDropIndicatorState(tableElement.rows[0], tableRect, boundaryIndex),
      );
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isEditable, getTheme]);

  if (!isEditable) return null;

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={columns} strategy={horizontalListSortingStrategy}>
        <div
          className="floating-top-actions"
          ref={virtualRef as React.RefObject<HTMLDivElement>}
        >
          {columns.map((colIdx) => (
            <DraggableColumn key={colIdx} id={colIdx} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function DraggableColumn({ id }: { id: number }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = {
    transform: transform ? `translate3d(${transform.x}px,${transform.y}px,0)` : undefined,
  };
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style}>
      <div className="drag-handle">::</div>
    </div>
  );
}

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
