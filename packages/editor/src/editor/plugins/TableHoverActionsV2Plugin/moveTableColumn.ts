import { TableNode } from "@lexical/table";
import { $isSimpleTable } from "./isSimpleTable";
import { $isTableRowNode } from "@lexical/table";
/**
 * Moves a column from one position to another within a simple (non-merged) table.
 *
 * @param tableNode The table node to modify.
 * @param originColumn The index of the column to move.
 * @param targetColumn The index to move the column to.
 */
export function $moveTableColumn(
  tableNode: TableNode,
  originColumn: number,
  targetColumn: number,
): void {
  if (originColumn === targetColumn) {
    return;
  }
  const columnCount = tableNode.getColumnCount();
  if (
    originColumn < 0 ||
    originColumn >= columnCount ||
    targetColumn < 0 ||
    targetColumn >= columnCount
  ) {
    return;
  }
  if (!$isSimpleTable(tableNode)) {
    return;
  }
  const rows = tableNode.getChildren().filter($isTableRowNode);
  rows.forEach((row) => {
    const cells = row.getChildren();
    const [moved] = cells.splice(originColumn, 1);
    cells.splice(targetColumn, 0, moved);
    row.splice(0, cells.length, cells);
  });
  const colWidths = tableNode.getColWidths();
  if (colWidths && colWidths.length === columnCount) {
    const newWidths = [...colWidths];
    const [movedWidth] = newWidths.splice(originColumn, 1);
    newWidths.splice(targetColumn, 0, movedWidth);
    tableNode.setColWidths(newWidths);
  }
}
