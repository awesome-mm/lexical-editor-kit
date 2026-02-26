import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer, type InitialConfigType } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
// 링크
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
// 리스트
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
// 체크리스트
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";

import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
// 해쉬태그
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
// 테이블
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
// 탭키 들여쓰기
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";

import TreeViewPlugin from "./plugins/TreeViewPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentLevelPlugin";
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
import AutoLinkPlugin from "./plugins/AutoLinkPlugin";
import { TRANSFORMERS } from "@lexical/markdown";

import MyOnChangePluginComponent from "./custom/plugin/onChange/MyOnChangePlugin";

import { EditorConfig } from "./config/EditorConfig";
import { useEffect, useMemo, useState } from "react";
import { useSettings } from "./context/SettingsContext";
import Placeholder from "./ui/Placeholder";
import { useSharedHistoryContext } from "./context/SharedHistoryContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { CAN_USE_DOM } from "@lexical/utils";

export default function EditorCustom() {
  const { historyState } = useSharedHistoryContext();
  const {
    settings: {
      isCodeHighlighted,
      isCodeShiki,
      isCollab,
      useCollabV2,
      isAutocomplete,
      isMaxLength,
      isCharLimit,
      hasLinkAttributes,
      hasNestedTables,
      hasFitNestedTables,
      isCharLimitUtf8,
      isRichText,
      showTreeView,
      showTableOfContents,
      shouldUseLexicalContextMenu,
      shouldPreserveNewLinesInMarkdown,
      tableCellMerge,
      tableCellBackgroundColor,
      tableHorizontalScroll,
      shouldAllowHighlightingWithBrackets,
      selectionAlwaysOnDisplay,
      listStrictIndent,
    },
  } = useSettings();
  const isEditable = useLexicalEditable();
  const placeholder = isCollab
    ? "Enter some collaborative rich text..."
    : isRichText
      ? "Enter some rich text..."
      : "Enter some plain text...";
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia("(max-width: 1025px)").matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener("resize", updateViewPortWidth);

    return () => {
      window.removeEventListener("resize", updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  return (
    <LexicalComposer initialConfig={EditorConfig as unknown as InitialConfigType}>
      <div className="editor-container">
        <ToolbarPlugin />
        <div className="editor-inner">
          <div className="editor-input-wrapper">
            <RichTextPlugin
              contentEditable={<ContentEditable className="editor-input" tabIndex={0} />}
              placeholder={<Placeholder text="Enter some rich text..." />}
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
          {/* 작성 코드 트리뷰 출력 */}
          {/* <TreeViewPlugin /> */}
          {/* -------------- */}
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <CodeHighlightPlugin />
          <LinkPlugin />
          <AutoLinkPlugin />
          <TablePlugin />
          <ListMaxIndentLevelPlugin maxDepth={7} />
          <CheckListPlugin />
          <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
          <HashtagPlugin />
          <TabIndentationPlugin />
          {/* 편집 내용 변경 시 실행 */}
          <MyOnChangePluginComponent />
        </div>
      </div>
    </LexicalComposer>
  );
}
