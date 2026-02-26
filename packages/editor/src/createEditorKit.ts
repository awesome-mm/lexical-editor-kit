import type { Klass, LexicalEditor, LexicalNode } from "lexical";
import { getTableNodes } from "./features/table";
import { getListNodes } from "./features/list";
import { getCodeNodes } from "./features/code";
import { registerTable } from "./features/table";
import { registerList } from "./features/list";
import { registerCode } from "./features/code";

export type EditorKitOptions = {
  table?: boolean;
  list?: boolean;
  code?: boolean;
};

export type EditorKit = {
  /** Returns nodes to include in initialConfig.nodes (base nodes not included; merge with your base nodes). */
  getOptionalNodes(): Klass<LexicalNode>[];
  /** Registers optional feature nodes/plugins on the editor. Call after editor is created. */
  setup(editor: LexicalEditor): void;
};

/**
 * Create an editor kit with optional features.
 * Only features whose packages are installed (e.g. @lexical/table) will be enabled.
 */
export function createEditorKit(options: EditorKitOptions = {}): EditorKit {
  const { table = true, list = true, code = true } = options;

  return {
    getOptionalNodes(): Klass<LexicalNode>[] {
      const nodes: Klass<LexicalNode>[] = [];
      if (list) {
        const listNodes = getListNodes();
        if (listNodes) nodes.push(...listNodes);
      }
      if (code) {
        const codeNodes = getCodeNodes();
        if (codeNodes) nodes.push(...codeNodes);
      }
      if (table) {
        const tableNodes = getTableNodes();
        if (tableNodes) nodes.push(...tableNodes);
      }
      return nodes;
    },

    setup(editor: LexicalEditor): void {
      if (list) registerList(editor);
      if (code) registerCode(editor);
      if (table) registerTable(editor);
    },
  };
}
