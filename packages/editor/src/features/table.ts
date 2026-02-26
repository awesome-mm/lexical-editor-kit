import type { LexicalEditor } from "lexical";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";

export function registerTable(_editor: LexicalEditor): boolean {
  return true;
}

export function getTableNodes(): [typeof TableNode, typeof TableRowNode, typeof TableCellNode] {
  return [TableNode, TableRowNode, TableCellNode];
}
