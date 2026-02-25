import DropDown, { DropDownItem } from "@/editor/ui/DropDown";
import {
  $computeTableMapSkipCellCheck,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  $isTableCellNode,
  $isTableNode,
  $isTableRowNode,
} from "@lexical/table";
import { $getNearestNodeFromDOMNode, $getChildCaret, $getSiblingCaret } from "lexical";
import { $isSimpleTable } from "../isSimpleTable";

export function FloatingAddControls({
  hoveredTable,
  hoveredColumnIndex,
  editor,
}: {
  hoveredTable: HTMLTableElement | null;
  hoveredColumnIndex: number | null;
  editor: ReturnType<any>[0];
}) {
  const handleAddColumn = () => {
    const targetCell = hoveredTable?.rows[0].cells[hoveredColumnIndex ?? 0];
    if (!targetCell) return;
    editor.update(() => {
      const maybeCellNode = $getNearestNodeFromDOMNode(targetCell);
      if ($isTableCellNode(maybeCellNode)) $insertTableColumnAtSelection();
    });
  };

  const handleAddRow = () => {
    const targetCell = hoveredTable?.rows[0].cells[0];
    if (!targetCell) return;
    editor.update(() => {
      const maybeCellNode = $getNearestNodeFromDOMNode(targetCell);
      if ($isTableCellNode(maybeCellNode)) $insertTableRowAtSelection();
    });
  };

  const handleSortColumn = (direction: "asc" | "desc") => {
    const targetCell = hoveredTable?.rows[0].cells[hoveredColumnIndex ?? 0];
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
      <button
        className="floating-add-indicator"
        aria-label="Add column"
        onClick={handleAddColumn}
      />
      <button className="floating-add-indicator" aria-label="Add row" onClick={handleAddRow} />
      <DropDown
        buttonAriaLabel="Sort column"
        buttonClassName="floating-filter-indicator"
        hideChevron
      >
        <DropDownItem className="item" onClick={() => handleSortColumn("asc")}>
          Sort Ascending
        </DropDownItem>
        <DropDownItem className="item" onClick={() => handleSortColumn("desc")}>
          Sort Descending
        </DropDownItem>
      </DropDown>
    </>
  );
}
