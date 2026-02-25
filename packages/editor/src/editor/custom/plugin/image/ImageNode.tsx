import React from "react";
import type { SerializedLexicalNode } from "lexical";
import { DecoratorNode, type NodeKey } from "lexical";

export class ImageNode extends DecoratorNode<React.ReactElement> {
  __src: string;
  __alt?: string;

  static getType() {
    return "image";
  }

  static clone(node: ImageNode) {
    return new ImageNode(node.__src, node.__alt, node.__key);
  }

  constructor(src: string, alt?: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__alt = alt;
  }

  createDOM() {
    return document.createElement("div");
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return <img src={this.__src} alt={this.__alt} style={{ maxWidth: "100%" }} />;
  }

  exportJSON() {
    return {
      type: "image",
      version: 1,
      src: this.__src,
      alt: this.__alt,
    };
  }

  static importJSON(data: SerializedLexicalNode) {
    const { src, alt } = data as unknown as { src: string; alt?: string };
    return new ImageNode(src, alt);
  }
}

export function $createImageNode(payload: { src: string; alt?: string }) {
  return new ImageNode(payload.src, payload.alt);
}
