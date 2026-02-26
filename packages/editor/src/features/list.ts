import type { LexicalEditor } from "lexical";
import { ListItemNode, ListNode } from "@lexical/list";

export function registerList(_editor: LexicalEditor): boolean {
  return true;
}

export function getListNodes(): [typeof ListNode, typeof ListItemNode] {
  return [ListNode, ListItemNode];
}
