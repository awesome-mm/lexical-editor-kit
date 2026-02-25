import type { EditorThemeClasses } from "lexical";
import { isHTMLElement } from "lexical";
import { getThemeSelector } from "@/editor/utils/getThemeSelector";

/**
 * MouseEvent로부터 테이블과 셀 위치 정보 가져오기
 */
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

/**
 * 가장 가까운 상단 셀 위치 찾기
 */
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
