import { TableNode } from "@lexical/table";
import { $isTableRowNode } from "@lexical/table";
import { $isTableCellNode } from "@lexical/table";

/**
 * Checks if the table does not have any merged cells.
 *
 * @param table Table to check for if it has any merged cells.
 * @returns True if the table does not have any merged cells, false otherwise.
 */
export function $isSimpleTable(table: TableNode): boolean {
  const rows = table.getChildren();
  let columns: null | number = null;
  for (const row of rows) {
    if (!$isTableRowNode(row)) {
      return false;
    }
    if (columns === null) {
      columns = row.getChildrenSize();
    }
    if (row.getChildrenSize() !== columns) {
      return false;
    }
    const cells = row.getChildren();
    for (const cell of cells) {
      if (!$isTableCellNode(cell) || cell.getRowSpan() !== 1 || cell.getColSpan() !== 1) {
        return false;
      }
    }
  }
  return (columns || 0) > 0;
}
