import type { LexicalEditor } from "lexical";
import { CodeHighlightNode, CodeNode } from "@lexical/code";

export function registerCode(_editor: LexicalEditor): boolean {
  return true;
}

export function getCodeNodes(): [typeof CodeNode, typeof CodeHighlightNode] {
  return [CodeNode, CodeHighlightNode];
}
