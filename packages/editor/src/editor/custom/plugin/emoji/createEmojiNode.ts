import { EmojiNode } from "./EmojiNode";
import { $applyNodeReplacement } from "lexical";

export function $createEmojiNode(unifiedID: string): EmojiNode {
  return $applyNodeReplacement(new EmojiNode(unifiedID));
}

export function $isEmojiNode(node: unknown): node is EmojiNode {
  return node instanceof EmojiNode;
}
