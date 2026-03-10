import ExampleTheme from "./themes/ExampleTheme";

import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { HashtagNode } from "@lexical/hashtag";
import { HorizontalRuleNode } from "@lexical/extension";

import { TableNode, TableRowNode, TableCellNode } from "@lexical/table";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { initialEditorState } from "./initialEditorState";

function getEditorConfigNodes() {
  return [
    HeadingNode,
    QuoteNode,
    ListNode,
    ListItemNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableRowNode,
    TableCellNode,
    AutoLinkNode,
    LinkNode,
    HashtagNode,
    HorizontalRuleNode,
  ];
}

export const EditorConfig = {
  namespace: "MyEditor",
  theme: ExampleTheme,
  editable: true,
  get nodes() {
    return getEditorConfigNodes();
  },
  onError(error: Error) {
    throw error;
  },
  editorState: initialEditorState,
};
