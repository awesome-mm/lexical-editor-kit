import type { EditorThemeClasses } from "lexical";
import { isHTMLElement } from "lexical";
import { getThemeSelector } from "@/editor/utils/getThemeSelector";

export const TOP_BUTTON_OVERHANG = 18 / 2;
export const LEFT_BUTTON_OVERHANG = 18 / 2;

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

export function isTableFromEditor(
  tableElement: HTMLTableElement | null,
  editor: ReturnType<any>[0],
): boolean {
  const root = editor.getRootElement();
  return !!root && !!tableElement && root.contains(tableElement);
}

export function getDropIndicatorState(
  headerRow: HTMLTableRowElement,
  tableRect: DOMRect,
  boundaryIndex: number,
) {
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

export function getTableKey(tableElement: HTMLTableElement | null) {
  return tableElement?.getAttribute("data-lexical-key") ?? null;
}
