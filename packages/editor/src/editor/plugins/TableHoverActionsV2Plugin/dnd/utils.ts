import type { EditorThemeClasses } from "lexical";
import { isHTMLElement } from "lexical";
import { getThemeSelector } from "@/editor/utils/getThemeSelector";

export function getTableFromMouseEvent(
  event: MouseEvent,
  getTheme: () => EditorThemeClasses | null | undefined,
): { isOutside: boolean; tableElement: HTMLTableElement | null } {
  if (!isHTMLElement(event.target)) return { isOutside: true, tableElement: null };
  const cellSelector = `td${getThemeSelector(getTheme, "tableCell")}, th${getThemeSelector(
    getTheme,
    "tableCell",
  )}`;
  const cell = event.target.closest<HTMLTableCellElement>(cellSelector);
  const tableElement = cell?.closest<HTMLTableElement>("table") ?? null;
  return { isOutside: tableElement == null, tableElement };
}

export function getClosestTopCellPosition(
  tableElement: HTMLTableElement,
  clientX: number,
): { centerX: number; top: number; cell: HTMLTableCellElement } | null {
  const firstRow = tableElement.rows[0];
  if (!firstRow) return null;

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
): { edge: "left" | "right"; height: number; left: number; top: number } | null {
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
