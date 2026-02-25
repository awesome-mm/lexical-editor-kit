// drag.ts
/**
 * DnD Kit 기반 컬럼 Drag & Drop 처리
 * 기존 600줄 코드의 draggable / dropTargetForElements 역할 대체
 */

import { useDraggable, useDroppable, DndContext, DragEndEvent } from "@dnd-kit/core";
import { useState, useEffect } from "react";
import { arrayMove } from "@dnd-kit/sortable";
import type { ColumnDragData } from "./types";

export function useTableColumnDnD(columnCount: number, tableKey: string | null) {
  const [columns, setColumns] = useState<number[]>([]);
  const [dragData, setDragData] = useState<ColumnDragData | null>(null);

  // 컬럼 초기화
  useEffect(() => {
    setColumns(Array.from({ length: columnCount }).map((_, idx) => idx));
  }, [columnCount]);

  const handleDragStart = (id: number) => {
    setDragData({ columnIndex: id, tableKey, type: "table-column" });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || dragData?.tableKey !== tableKey) return;

    setColumns((cols) => {
      const oldIndex = cols.indexOf(Number(active.id));
      const newIndex = cols.indexOf(Number(over.id));
      if (oldIndex === newIndex) return cols;
      return arrayMove(cols, oldIndex, newIndex);
    });

    setDragData(null);
  };

  const getDraggableProps = (id: number) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
    const style = {
      transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    };
    return { attributes, listeners, setNodeRef, style };
  };

  const getDroppableProps = (id: number) => {
    const { setNodeRef } = useDroppable({ id });
    return { setNodeRef };
  };

  return { columns, handleDragStart, handleDragEnd, getDraggableProps, getDroppableProps };
}
