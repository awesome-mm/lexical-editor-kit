import ExampleTheme from "./ExampleTheme";

import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";
import { EmojiNode } from "../custom/plugin/emoji/EmojiNode";
import { HashtagNode } from "@lexical/hashtag";
import { HorizontalRuleNode } from "@lexical/extension";

import { initialEditorState } from "./initialEditorState";

export const EditorConfig = {
  namespace: "MyEditor",
  // The editor theme
  theme: ExampleTheme,
  // 편집 가능 여부 (명시적으로 true)
  editable: true,
  // Any custom nodes go here
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
    EmojiNode,
    HashtagNode,
    HorizontalRuleNode,
  ],
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },

  // 초기 에디터 상태
  editorState: initialEditorState,
};
