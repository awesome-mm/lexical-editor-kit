import { useSharedHistoryContext } from "lexical-editor-kit";
import {
  AutocompletePlugin,
  AutoEmbedPlugin,
  AutoLinkPlugin,
  CodeActionMenuPlugin,
  CodeHighlightPrismPlugin,
  CollapsiblePlugin,
  ComponentPickerPlugin,
  ContextMenuPlugin,
  DragDropPastePlugin,
  DraggableBlockPlugin,
  EmojiPickerPlugin,
  EmojisPlugin,
  ImagesPlugin,
  KeywordsPlugin,
  LayoutPlugin,
  LinkPlugin,
  MarkdownShortcutPlugin,
  MentionsPlugin,
  PageBreakPlugin,
  SpecialTextPlugin,
  TabFocusPlugin,
  TableActionMenuPlugin,
  TableCellResizerPlugin,
  TableHoverActionsV2Plugin,
  TableScrollShadowPlugin,
  YouTubePlugin,
  LightToolbarPlugin,
  FloatingLinkEditorPlugin,
} from "lexical-editor-kit/plugins";

import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";

import { useState, useEffect } from "react";
import { CAN_USE_DOM } from "@lexical/utils";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";

export default function CustomEditorPlugin() {
  const { historyState } = useSharedHistoryContext();
  const isEditable = useLexicalEditable();
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState(false);
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
  const onRef = (elem: HTMLDivElement) => {
    if (elem !== null) {
      setFloatingAnchorElem(elem);
    }
  };

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNext = CAN_USE_DOM && window.matchMedia("(max-width: 1025px)").matches;
      if (isNext !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNext);
      }
    };
    updateViewPortWidth();
    window.addEventListener("resize", updateViewPortWidth);
    return () => window.removeEventListener("resize", updateViewPortWidth);
  }, [isSmallWidthViewport]);

  return (
    <div className="editor-shell">
      <div className="editor-container">
        <LightToolbarPlugin
          editor={editor}
          activeEditor={activeEditor}
          setActiveEditor={setActiveEditor}
          setIsLinkEditMode={setIsLinkEditMode}
        />

        <div className={`editor-container`}>
          {/* ── core ── */}
          <HistoryPlugin externalHistoryState={historyState} />
          <RichTextPlugin
            contentEditable={
              <div className="editor-scroller">
                <div className="editor" ref={onRef}>
                  <ContentEditable
                    className="ContentEditable__root"
                    aria-placeholder="Enter some rich text..."
                    placeholder={
                      <div className="ContentEditable__placeholder">
                        Enter some rich text...
                      </div>
                    }
                  />
                </div>
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <AutoFocusPlugin />
          <ClearEditorPlugin />

          {/* ── list / checklist ── */}
          <ListPlugin />
          <CheckListPlugin />
          <TabIndentationPlugin maxIndent={7} />

          {/* ── table ── */}
          <TablePlugin />
          <TableCellResizerPlugin />
          <TableActionMenuPlugin />
          <TableHoverActionsV2Plugin />
          <TableScrollShadowPlugin />

          {/* ── code ── */}
          <CodeHighlightPrismPlugin />
          <CodeActionMenuPlugin />

          {/* ── link ── */}
          <LinkPlugin />
          <AutoLinkPlugin />
          <ClickableLinkPlugin disabled={isEditable} />
          {floatingAnchorElem && (
            <>
              <FloatingLinkEditorPlugin
                anchorElem={floatingAnchorElem}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
              />
            </>
          )}

          {/* ── markdown ── */}
          <MarkdownShortcutPlugin />
          <HorizontalRulePlugin />

          {/* ── pickers ── */}
          <ComponentPickerPlugin />
          <EmojiPickerPlugin />
          <AutoEmbedPlugin />

          {/* ── feature plugins ── */}
          <EmojisPlugin />
          <HashtagPlugin />
          <KeywordsPlugin />
          <CollapsiblePlugin />
          <LayoutPlugin />
          <SpecialTextPlugin />
          <AutocompletePlugin />
          <ContextMenuPlugin />
          <TabFocusPlugin />
          <DragDropPastePlugin />
          <PageBreakPlugin />
          <MentionsPlugin />
          <ImagesPlugin />
          <YouTubePlugin />

          {/* ── floating (anchor 필요) ── */}
          {floatingAnchorElem && !isSmallWidthViewport && <DraggableBlockPlugin />}
        </div>
      </div>
    </div>
  );
}
