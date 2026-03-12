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
  const [isVisible, setIsVisible] = useState(false);
  const [isLeftVisible, setIsLeftVisible] = useState(false);
  const virtualRef = useRef<VirtualElement>({
    getBoundingClientRect: () => new DOMRect(),
  });
  const leftVirtualRef = useRef<VirtualElement>({
    getBoundingClientRect: () => new DOMRect(),
  });
  const floatingElemRef = useRef<HTMLElement | null>(null);
  const leftFloatingElemRef = useRef<HTMLElement | null>(null);
  const hoveredLeftCellRef = useRef<HTMLTableCellElement | null>(null);
  const hoveredTopCellRef = useRef<HTMLTableCellElement | null>(null);
  const handleMouseLeaveRef = useRef<((event: MouseEvent) => void) | null>(null);
  const [hoveredTable, setHoveredTable] = useState<HTMLTableElement | null>(null);
  const [hoveredColumnIndex, setHoveredColumnIndex] = useState<number | null>(null);
  const [canReorder, setCanReorder] = useState(false);
  const [dropIndicatorState, setDropIndicatorState] = useState<DropIndicatorState | null>(null);

  // Drag state for column reordering
  const dragHandleRef = useRef<HTMLButtonElement | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartColumnRef = useRef<number | null>(null);

  const { refs, floatingStyles, update } = useFloating({
    middleware: [
      offset({ mainAxis: -TOP_BUTTON_OVERHANG }),
      shift({ padding: 8 }),
    ],
    placement: "top",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });

  const {
    refs: leftRefs,
    floatingStyles: leftFloatingStyles,
    update: updateLeft,
  } = useFloating({
    middleware: [
      offset({ mainAxis: -LEFT_BUTTON_OVERHANG }),
      shift({ padding: 8 }),
    ],
    placement: "left",
    strategy: "fixed",
    whileElementsMounted: autoUpdate,
  });

  // Mouse move handler for tracking hovered table/cell
  useEffect(() => {
    if (!isEditable) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      // Ignore events on the floating elements themselves
      if (
        (floatingElemRef.current &&
          event.target instanceof Node &&
          floatingElemRef.current.contains(event.target)) ||
        (leftFloatingElemRef.current &&
          event.target instanceof Node &&
          leftFloatingElemRef.current.contains(event.target))
      ) {
        return;
      }

      const { tableElement, isOutside } = getTableFromMouseEvent(event, getTheme);

      if (
        isOutside ||
        tableElement == null ||
        (anchorElem && !anchorElem.contains(tableElement))
      ) {
        setIsVisible(false);
        setIsLeftVisible(false);
        setHoveredTable(null);
        setHoveredColumnIndex(null);
        setDropIndicatorState(null);
        return;
      }

      const cellSelector = `td${getThemeSelector(getTheme, "tableCell")}, th${getThemeSelector(getTheme, "tableCell")}`;
      const hoveredCell = isHTMLElement(event.target)
        ? event.target.closest<HTMLTableCellElement>(cellSelector)
        : null;

      if (!hoveredCell) {
        setIsVisible(false);
        setIsLeftVisible(false);
        hoveredTopCellRef.current = null;
        hoveredLeftCellRef.current = null;
        return;
      }

      const rowIndex =
        hoveredCell.parentElement instanceof HTMLTableRowElement
          ? hoveredCell.parentElement.rowIndex
          : -1;
      const colIndex = hoveredCell.cellIndex ?? -1;

      const closestTopCell = getClosestTopCellPosition(tableElement, event.clientX);

      if (!closestTopCell || rowIndex !== 0) {
        setIsVisible(false);
        hoveredTopCellRef.current = null;
        setHoveredTable(null);
        setHoveredColumnIndex(null);
      } else {
        hoveredTopCellRef.current = closestTopCell.cell;
        setHoveredTable(tableElement);
        setHoveredColumnIndex(closestTopCell.cell.cellIndex ?? null);
        virtualRef.current.getBoundingClientRect = () =>
          new DOMRect(closestTopCell.centerX, closestTopCell.top, 0, 0);
        refs.setPositionReference(virtualRef.current);
        setIsVisible(true);
        update?.();
      }

      const tableRect = tableElement.getBoundingClientRect();
      if (colIndex !== 0) {
        setIsLeftVisible(false);
        hoveredLeftCellRef.current = null;
      } else {
        const { top, height } = hoveredCell.getBoundingClientRect();
        const centerY = top + height / 2;
        hoveredLeftCellRef.current = hoveredCell;
        leftVirtualRef.current.getBoundingClientRect = () =>
          new DOMRect(tableRect.left, centerY, 0, 0);
        leftRefs.setPositionReference(leftVirtualRef.current);
        setIsLeftVisible(true);
        updateLeft?.();
      }
    };

    document.addEventListener("mousemove", handleMouseMove);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      setIsVisible(false);
      setIsLeftVisible(false);
    };
  }, [anchorElem, getTheme, isEditable, leftRefs, refs, update, updateLeft]);

  // Mouse leave handler
  useEffect(() => {
    const handleMouseLeave = (event: MouseEvent) => {
      const nextTarget = event.relatedTarget;
      if (
        nextTarget &&
        floatingElemRef.current &&
        floatingElemRef.current.contains(nextTarget as Node)
      ) {
        return;
      }
      if (
        nextTarget &&
        leftFloatingElemRef.current &&
        leftFloatingElemRef.current.contains(nextTarget as Node)
      ) {
        return;
      }
      setIsVisible(false);
      setIsLeftVisible(false);
    };
    handleMouseLeaveRef.current = handleMouseLeave;

    return editor.registerRootListener((rootElement, prevRootElement) => {
      if (prevRootElement && handleMouseLeaveRef.current) {
        prevRootElement.removeEventListener("mouseleave", handleMouseLeaveRef.current);
      }
      if (rootElement && handleMouseLeaveRef.current) {
        rootElement.addEventListener("mouseleave", handleMouseLeaveRef.current);
      }
    });
  }, [editor]);

  // Check if table supports reordering
  useEffect(() => {
    if (!hoveredTable) {
      setCanReorder(false);
      return;
    }
    if (!isTableFromEditor(hoveredTable, editor)) {
      setCanReorder(false);
      return;
    }
    editor.getEditorState().read(
      () => {
        const tableNode = $getNearestNodeFromDOMNode(hoveredTable);
        setCanReorder($isTableNode(tableNode) && $isSimpleTable(tableNode));
      },
      { editor },
    );
  }, [editor, hoveredTable]);

  // Drag handle: native drag for column reordering
  useEffect(() => {
    const handle = dragHandleRef.current;
    const tableElement = hoveredTable;
    const columnIndex = hoveredColumnIndex;
    if (!handle || tableElement == null || columnIndex == null || !canReorder) {
      return;
    }

    const tableKey = getTableKey(tableElement);

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      isDraggingRef.current = true;
      dragStartColumnRef.current = columnIndex;
      setDropIndicatorState(null);

      const handleMouseMoveWhileDragging = (moveEvent: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const headerRow = tableElement.rows[0];
        if (!headerRow) return;

        // Find which cell the mouse is over
        const cells = Array.from(headerRow.cells);
        for (const cell of cells) {
          const rect = cell.getBoundingClientRect();
          if (moveEvent.clientX >= rect.left && moveEvent.clientX <= rect.right) {
            const boundaryIndex = getBoundaryIndex(cell, moveEvent.clientX);
            const tableRect = tableElement.getBoundingClientRect();
            setDropIndicatorState(getDropIndicatorState(headerRow, tableRect, boundaryIndex));
            break;
          }
        }
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        if (!isDraggingRef.current) return;
        isDraggingRef.current = false;
        setDropIndicatorState(null);

        const headerRow = tableElement.rows[0];
        if (!headerRow || dragStartColumnRef.current == null) return;

        // Find drop target
        const cells = Array.from(headerRow.cells);
        let targetBoundaryIndex: number | null = null;
        for (const cell of cells) {
          const rect = cell.getBoundingClientRect();
          if (upEvent.clientX >= rect.left && upEvent.clientX <= rect.right) {
            targetBoundaryIndex = getBoundaryIndex(cell, upEvent.clientX);
            break;
          }
        }

        if (targetBoundaryIndex != null) {
          const startIndex = dragStartColumnRef.current;
          editor.update(() => {
            const tableNode = $getNearestNodeFromDOMNode(tableElement);
            if (!$isTableNode(tableNode)) return;
            const columnCount = tableNode.getColumnCount();
            const clampedBoundary = Math.max(0, Math.min(targetBoundaryIndex, columnCount));
            if (
              clampedBoundary === startIndex ||
              clampedBoundary === startIndex + 1 ||
              startIndex < 0 ||
              startIndex >= columnCount
            ) {
              return;
            }
            const finishIndex =
              clampedBoundary > startIndex ? clampedBoundary - 1 : clampedBoundary;
            $moveTableColumn(tableNode, startIndex, finishIndex);
          });
        }

        dragStartColumnRef.current = null;
        document.removeEventListener("mousemove", handleMouseMoveWhileDragging);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMoveWhileDragging);
      document.addEventListener("mouseup", handleMouseUp);
    };

    handle.addEventListener("mousedown", handleMouseDown);
    return () => {
      handle.removeEventListener("mousedown", handleMouseDown);
    };
  }, [canReorder, editor, hoveredColumnIndex, hoveredTable]);

  if (!isEditable) {
    return null;
  }

  const handleAddColumn = () => {
    const targetCell = hoveredTopCellRef.current;
    if (!targetCell) return;
    editor.update(() => {
      const maybeCellNode = $getNearestNodeFromDOMNode(targetCell);
      if ($isTableCellNode(maybeCellNode)) {
        maybeCellNode.selectEnd();
        $insertTableColumnAtSelection();
      }
    });
  };

  const handleAddRow = () => {
    const targetCell = hoveredLeftCellRef.current;
    if (!targetCell) return;
    editor.update(() => {
      const maybeCellNode = $getNearestNodeFromDOMNode(targetCell);
      if ($isTableCellNode(maybeCellNode)) {
        maybeCellNode.selectEnd();
        $insertTableRowAtSelection();
      }
    });
  };

  const handleSortColumn = (direction: "asc" | "desc") => {
    const targetCell = hoveredTopCellRef.current;
    if (!targetCell) return;

    editor.update(() => {
      const cellNode = $getNearestNodeFromDOMNode(targetCell);
      if (!$isTableCellNode(cellNode)) return;

      const rowNode = cellNode.getParent();
      if (!rowNode || !$isTableRowNode(rowNode)) return;

      const tableNode = rowNode.getParent();
      if (!$isTableNode(tableNode) || !$isSimpleTable(tableNode)) return;

      const colIndex = cellNode.getIndexWithinParent();
      const rows = tableNode.getChildren().filter($isTableRowNode);

      const [tableMap] = $computeTableMapSkipCellCheck(tableNode, cellNode, cellNode);

      const headerCell = tableMap[0]?.[colIndex]?.cell;
      const shouldSkipTopRow = headerCell?.hasHeader() ?? false;

      const sortableRows = shouldSkipTopRow ? rows.slice(1) : rows;

      if (sortableRows.length <= 1) return;

      sortableRows.sort((a, b) => {
        const aRowIndex = rows.indexOf(a);
        const bRowIndex = rows.indexOf(b);

        const aMapRow = tableMap[aRowIndex] ?? [];
        const bMapRow = tableMap[bRowIndex] ?? [];

        const aText = aMapRow[colIndex]?.cell.getTextContent() ?? "";
        const bText = bMapRow[colIndex]?.cell.getTextContent() ?? "";
        const result = aText.localeCompare(bText, undefined, { numeric: true });
        return direction === "asc" ? -result : result;
      });

      const insertionCaret = shouldSkipTopRow
        ? $getSiblingCaret(rows[0], "next")
        : $getChildCaret(tableNode, "next");

      insertionCaret?.splice(0, sortableRows);
    });
  };

  return (
    <>
      {/* Top floating controls: drag handle + sort + add column */}
      <div
        ref={(node) => {
          floatingElemRef.current = node;
          refs.setFloating(node);
        }}
        style={{
          ...floatingStyles,
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? "auto" : "none",
        }}
        className="floating-top-actions"
      >
        <button
          ref={dragHandleRef}
          className="floating-drag-indicator"
          aria-label="Drag to reorder column"
          type="button"
          style={{ display: canReorder ? undefined : "none" }}
        />
        <DropDown
          buttonAriaLabel="Sort column"
          buttonClassName="floating-filter-indicator"
          hideChevron={true}
        >
          <DropDownItem className="item" onClick={() => handleSortColumn("desc")}>
            Sort Ascending
          </DropDownItem>
          <DropDownItem className="item" onClick={() => handleSortColumn("asc")}>
            Sort Descending
          </DropDownItem>
        </DropDown>
        <button
          className="floating-add-indicator"
          aria-label="Add column"
          type="button"
          onClick={handleAddColumn}
        />
      </div>

      {/* Left floating control: add row */}
      <button
        ref={(node) => {
          leftFloatingElemRef.current = node;
          leftRefs.setFloating(node);
        }}
        style={{
          ...leftFloatingStyles,
          opacity: isLeftVisible ? 1 : 0,
          pointerEvents: isLeftVisible ? "auto" : "none",
        }}
        className="floating-add-indicator"
        aria-label="Add row"
        type="button"
        onClick={handleAddRow}
      />

      {/* Drop indicator for column reordering */}
      {dropIndicatorState ? (
        <div
          style={{
            backgroundColor: "#1b6ef3",
            height: dropIndicatorState.height,
            left: dropIndicatorState.left,
            pointerEvents: "none",
            position: "fixed",
            top: dropIndicatorState.top,
            width: 2,
            zIndex: 20,
          }}
        />
      ) : null}
    </>
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
