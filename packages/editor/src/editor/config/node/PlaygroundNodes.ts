/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { Klass, LexicalNode } from "lexical";

import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { MarkNode } from "@lexical/mark";
import { OverflowNode } from "@lexical/overflow";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableNode, TableRowNode, TableCellNode } from "@lexical/table";
import { ListNode, ListItemNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";

import { CollapsibleContainerNode } from "../../plugins/CollapsiblePlugin/CollapsibleContainerNode";
import { CollapsibleContentNode } from "../../plugins/CollapsiblePlugin/CollapsibleContentNode";
import { CollapsibleTitleNode } from "../../plugins/CollapsiblePlugin/CollapsibleTitleNode";
import { AutocompleteNode } from "../../nodes/AutocompleteNode/AutocompleteNode";
import { EmojiNode } from "../../nodes/EmojiNode/EmojiNode";
import { ImageNode } from "../../nodes/ImageNode/ImageNode";
import { KeywordNode } from "../../nodes/KeywordNode/KeywordNode";
import { LayoutContainerNode } from "../../nodes/LayoutContainerNode/LayoutContainerNode";
import { LayoutItemNode } from "../../nodes/LayoutItemNode/LayoutItemNode";
import { MentionNode } from "../../nodes/MentionNode/MentionNode";
import { PageBreakNode } from "../../nodes/PageBreakNode";
import { SpecialTextNode } from "../../nodes/SpecialTextNode/SpecialTextNode";
import { StickyNode } from "../../nodes/StickyNode/StickyNode";
import { YouTubeNode } from "../../nodes/YouTubeNode/YouTubeNode";

function getPlaygroundNodesArray(): Array<Klass<LexicalNode>> {
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
    HashtagNode,
    AutoLinkNode,
    LinkNode,
    OverflowNode,
    StickyNode,
    ImageNode,
    MentionNode,
    EmojiNode,
    AutocompleteNode,
    KeywordNode,
    HorizontalRuleNode,
    YouTubeNode,
    MarkNode,
    CollapsibleContainerNode,
    CollapsibleContentNode,
    CollapsibleTitleNode,
    PageBreakNode,
    LayoutContainerNode,
    LayoutItemNode,
    SpecialTextNode,
  ];
}

/** Playground nodes including optional table/list/code when those packages are installed. */
const PlaygroundNodes = getPlaygroundNodesArray();

export default PlaygroundNodes;
export { getPlaygroundNodesArray as getPlaygroundNodes };
