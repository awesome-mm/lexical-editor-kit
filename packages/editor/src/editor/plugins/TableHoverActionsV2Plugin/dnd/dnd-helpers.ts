import type { ColumnDragData, DropIndicatorState } from "./types";

/**
 * 테이블 셀 기준으로 DropIndicator 상태 계산
 */
export function getBoundaryIndex(cell: HTMLTableCellElement, clientX: number): number {
  const rect = cell.getBoundingClientRect();
  const isRightHalf = clientX > rect.left + rect.width / 2;
  const cellIndex = cell.cellIndex ?? 0;
  return cellIndex + (isRightHalf ? 1 : 0);
}

export function getDropIndicatorState(
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
