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

import { getTableNodes } from "../../../features/table";
import { getListNodes } from "../../../features/list";
import { getCodeNodes } from "../../../features/code";
import { CollapsibleContainerNode } from "../../plugins/CollapsiblePlugin/CollapsibleContainerNode";
import { CollapsibleContentNode } from "../../plugins/CollapsiblePlugin/CollapsibleContentNode";
import { CollapsibleTitleNode } from "../../plugins/CollapsiblePlugin/CollapsibleTitleNode";
import { AutocompleteNode } from "../../nodes/AutocompleteNode";
import { EmojiNode } from "../../nodes/EmojiNode";
import { ImageNode } from "../../nodes/ImageNode";
import { KeywordNode } from "../../nodes/KeywordNode";
import { LayoutContainerNode } from "../../nodes/LayoutContainerNode";
import { LayoutItemNode } from "../../nodes/LayoutItemNode";
import { MentionNode } from "../../nodes/MentionNode";
import { PageBreakNode } from "../../nodes/PageBreakNode";
import { SpecialTextNode } from "../../nodes/SpecialTextNode";
import { StickyNode } from "../../nodes/StickyNode";
import { YouTubeNode } from "../../nodes/YouTubeNode";

function getPlaygroundNodesArray(): Array<Klass<LexicalNode>> {
  const listNodes = getListNodes();
  const codeNodes = getCodeNodes();
  const tableNodes = getTableNodes();
  return [
    HeadingNode,
    QuoteNode,
    ...(listNodes ?? []),
    ...(codeNodes ?? []),
    ...(tableNodes ?? []),
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
