/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  CHECK_LIST,
  ELEMENT_TRANSFORMERS,
  ElementTransformer,
  MULTILINE_ELEMENT_TRANSFORMERS,
  TEXT_FORMAT_TRANSFORMERS,
  TEXT_MATCH_TRANSFORMERS,
  TextMatchTransformer,
  Transformer,
} from "@lexical/markdown";
import {
  $createHorizontalRuleNode,
  $isHorizontalRuleNode,
  HorizontalRuleNode,
} from "@lexical/react/LexicalHorizontalRuleNode";
import { $createTextNode, $isParagraphNode, $isTextNode, LexicalNode } from "lexical";

import { getOptionalTable } from "@/utils/optional";
import { $createImageNode, $isImageNode, ImageNode } from "../../nodes/ImageNode";
import { $createTweetNode, $isTweetNode, TweetNode } from "../../nodes/TweetNode";
import emojiList from "../../utils/emoji-list";

export const HR: ElementTransformer = {
  dependencies: [HorizontalRuleNode],
  export: (node: LexicalNode) => {
    return $isHorizontalRuleNode(node) ? "***" : null;
  },
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _1, _2, isImport) => {
    const line = $createHorizontalRuleNode();

    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }

    line.selectNext();
  },
  type: "element",
};

export const IMAGE: TextMatchTransformer = {
  dependencies: [ImageNode],
  export: (node) => {
    if (!$isImageNode(node)) {
      return null;
    }

    return `![${node.getAltText()}](${node.getSrc()})`;
  },
  importRegExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))/,
  regExp: /!(?:\[([^[]*)\])(?:\(([^(]+)\))$/,
  replace: (textNode, match) => {
    const [, altText, src] = match;
    const imageNode = $createImageNode({
      altText,
      maxWidth: 800,
      src,
    });
    textNode.replace(imageNode);
  },
  trigger: ")",
  type: "text-match",
};

export const EMOJI: TextMatchTransformer = {
  dependencies: [],
  export: () => null,
  importRegExp: /:([a-z0-9_]+):/,
  regExp: /:([a-z0-9_]+):$/,
  replace: (textNode, [, name]) => {
    const emoji = emojiList.find((e) => e.aliases.includes(name))?.emoji;
    if (emoji) {
      textNode.replace($createTextNode(emoji));
    }
  },
  trigger: ":",
  type: "text-match",
};

export const TWEET: ElementTransformer = {
  dependencies: [TweetNode],
  export: (node) => {
    if (!$isTweetNode(node)) {
      return null;
    }

    return `<tweet id="${node.getId()}" />`;
  },
  regExp: /<tweet id="([^"]+?)"\s?\/>\s?$/,
  replace: (textNode, _1, match) => {
    const [, id] = match;
    const tweetNode = $createTweetNode(id);
    textNode.replace(tweetNode);
  },
  type: "element",
};

const TABLE_ROW_REG_EXP = /^(?:\|)(.+)(?:\|)\s?$/;
const TABLE_ROW_DIVIDER_REG_EXP = /^(\| ?:?-*:? ?)+\|\s?$/;

function createTableTransformer(
  table: NonNullable<ReturnType<typeof getOptionalTable>>,
  getTransformers: () => Transformer[],
): ElementTransformer {
  const {
    $createTableCellNode,
    $createTableNode,
    $createTableRowNode,
    $isTableCellNode,
    $isTableNode,
    $isTableRowNode,
    TableCellHeaderStates,
    TableCellNode,
    TableNode,
    TableRowNode,
  } = table;

  const getTableColumnsSize = (t: InstanceType<typeof TableNode>) => {
    const row = t.getFirstChild();
    return $isTableRowNode(row) ? row.getChildrenSize() : 0;
  };

  const createTableCell = (textContent: string): InstanceType<typeof TableCellNode> => {
    textContent = textContent.replace(/\\n/g, "\n");
    const cell = $createTableCellNode(TableCellHeaderStates.NO_STATUS);
    $convertFromMarkdownString(textContent, getTransformers(), cell);
    return cell;
  };

  const mapToTableCells = (
    textContent: string,
  ): InstanceType<typeof TableCellNode>[] | null => {
    const match = textContent.match(TABLE_ROW_REG_EXP);
    if (!match || !match[1]) {
      return null;
    }
    return match[1].split("|").map((text) => createTableCell(text));
  };

  return {
    dependencies: [TableNode, TableRowNode, TableCellNode],
    export: (node: LexicalNode) => {
      if (!$isTableNode(node)) {
        return null;
      }

      const output: string[] = [];

      for (const row of node.getChildren()) {
        const rowOutput = [];
        if (!$isTableRowNode(row)) {
          continue;
        }

        let isHeaderRow = false;
        for (const cell of row.getChildren()) {
          if ($isTableCellNode(cell)) {
            rowOutput.push(
              $convertToMarkdownString(getTransformers(), cell).replace(/\n/g, "\\n").trim(),
            );
            if (
              (cell as { __headerState?: number }).__headerState === TableCellHeaderStates.ROW
            ) {
              isHeaderRow = true;
            }
          }
        }

        output.push(`| ${rowOutput.join(" | ")} |`);
        if (isHeaderRow) {
          output.push(`| ${rowOutput.map((_) => "---").join(" | ")} |`);
        }
      }

      return output.join("\n");
    },
    regExp: TABLE_ROW_REG_EXP,
    replace: (parentNode, _1, match) => {
      if (TABLE_ROW_DIVIDER_REG_EXP.test(match[0])) {
        const tablePrev = parentNode.getPreviousSibling();
        if (!tablePrev || !$isTableNode(tablePrev)) {
          return;
        }

        const rows = tablePrev.getChildren();
        const lastRow = rows[rows.length - 1];
        if (!lastRow || !$isTableRowNode(lastRow)) {
          return;
        }

        lastRow.getChildren().forEach((cell) => {
          if (!$isTableCellNode(cell)) {
            return;
          }
          cell.setHeaderStyles(TableCellHeaderStates.ROW, TableCellHeaderStates.ROW);
        });

        parentNode.remove();
        return;
      }

      const matchCells = mapToTableCells(match[0]);

      if (matchCells == null) {
        return;
      }

      const rows = [matchCells];
      let sibling = parentNode.getPreviousSibling();
      let maxCells = matchCells.length;

      while (sibling) {
        if (!$isParagraphNode(sibling)) {
          break;
        }

        if (sibling.getChildrenSize() !== 1) {
          break;
        }

        const firstChild = sibling.getFirstChild();

        if (!$isTextNode(firstChild)) {
          break;
        }

        const cells = mapToTableCells(firstChild.getTextContent());

        if (cells == null) {
          break;
        }

        maxCells = Math.max(maxCells, cells.length);
        rows.unshift(cells);
        const previousSibling = sibling.getPreviousSibling();
        sibling.remove();
        sibling = previousSibling;
      }

      const newTable = $createTableNode();

      for (const cells of rows) {
        const tableRow = $createTableRowNode();
        newTable.append(tableRow);

        for (let i = 0; i < maxCells; i++) {
          tableRow.append(i < cells.length ? cells[i] : createTableCell(""));
        }
      }

      const previousSibling = parentNode.getPreviousSibling();
      if ($isTableNode(previousSibling) && getTableColumnsSize(previousSibling) === maxCells) {
        previousSibling.append(...newTable.getChildren());
        parentNode.remove();
      } else {
        parentNode.replace(newTable);
      }

      newTable.selectEnd();
    },
    type: "element",
  };
}

let cachedTransformers: Transformer[] | null = null;

export function getPlaygroundTransformers(): Transformer[] {
  if (cachedTransformers) {
    return cachedTransformers;
  }

  const base: Transformer[] = [
    HR,
    IMAGE,
    EMOJI,
    TWEET,
    CHECK_LIST,
    ...ELEMENT_TRANSFORMERS,
    ...MULTILINE_ELEMENT_TRANSFORMERS,
    ...TEXT_FORMAT_TRANSFORMERS,
    ...TEXT_MATCH_TRANSFORMERS,
  ];

  const tableApi = getOptionalTable();
  if (!tableApi) {
    cachedTransformers = base;
    return cachedTransformers;
  }

  const TABLE = createTableTransformer(tableApi, getPlaygroundTransformers);
  cachedTransformers = [TABLE, ...base];
  return cachedTransformers;
}

/** @deprecated Use getPlaygroundTransformers() for optional table support. */
export const PLAYGROUND_TRANSFORMERS: Transformer[] = getPlaygroundTransformers();
