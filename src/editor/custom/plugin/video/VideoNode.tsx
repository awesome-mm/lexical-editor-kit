import React from "react";
import type { SerializedLexicalNode } from "lexical";
import { DecoratorNode, type NodeKey } from "lexical";

export class VideoNode extends DecoratorNode<React.ReactElement> {
  __src: string;

  static getType() {
    return "video";
  }

  static clone(node: VideoNode) {
    return new VideoNode(node.__src, node.__key);
  }

  constructor(src: string, key?: NodeKey) {
    super(key);
    this.__src = src;
  }

  createDOM() {
    return document.createElement("div");
  }

  updateDOM() {
    return false;
  }

  decorate() {
    return (
      <video controls style={{ maxWidth: "100%" }}>
        <source src={this.__src} />
      </video>
    );
  }

  exportJSON() {
    return {
      type: "video",
      version: 1,
      src: this.__src,
    };
  }

  static importJSON(data: SerializedLexicalNode) {
    const { src } = data as unknown as { src: string };
    return new VideoNode(src);
  }
}

export function $createVideoNode(src: string) {
  return new VideoNode(src);
}
