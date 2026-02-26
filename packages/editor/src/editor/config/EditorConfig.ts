import ExampleTheme from "./themes/ExampleTheme";

import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { HashtagNode } from "@lexical/hashtag";
import { HorizontalRuleNode } from "@lexical/extension";

import { EmojiNode } from "../custom/plugin/emoji/EmojiNode";
import { getTableNodes } from "../../features/table";
import { getListNodes } from "../../features/list";
import { getCodeNodes } from "../../features/code";
import { initialEditorState } from "./initialEditorState";

function getEditorConfigNodes() {
  const listNodes = getListNodes();
  const codeNodes = getCodeNodes();
  const tableNodes = getTableNodes();
  return [
    HeadingNode,
    QuoteNode,
    ...(listNodes ?? []),
    ...(codeNodes ?? []),
    ...(tableNodes ?? []),
    AutoLinkNode,
    LinkNode,
    EmojiNode,
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
