import { TextNode, type EditorConfig, type NodeKey, type SerializedTextNode } from "lexical";

export type SerializedEmojiNode = SerializedTextNode & {
  type: "emoji";
  unifiedID: string;
  version: 1;
};

export class EmojiNode extends TextNode {
  __unifiedID: string;

  static getType(): string {
    return "emoji";
  }

  static clone(node: EmojiNode): EmojiNode {
    return new EmojiNode(node.__unifiedID, node.__key);
  }

  constructor(unifiedID: string, key?: NodeKey) {
    super("😀", key); // 실제로는 unifiedID → unicode 변환
    this.__unifiedID = unifiedID.toLowerCase();
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const dom = document.createElement("span");
    dom.className = "emoji-node";
    dom.textContent = this.__text;
    return dom;
  }

  static importJSON(serializedNode: SerializedEmojiNode): EmojiNode {
    const node = new EmojiNode(serializedNode.unifiedID);
    node.setTextContent(serializedNode.text);
    return node;
  }

  exportJSON(): SerializedEmojiNode {
    return {
      ...super.exportJSON(),
      type: "emoji",
      unifiedID: this.__unifiedID,
      version: 1,
    };
  }

  isInline(): true {
    return true;
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  canInsertTextAfter(): boolean {
    return false;
  }
}
