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

function Placeholder({ text }: { text: string }) {
  return <div className="editor-placeholder">{text}</div>;
}

export default function Editor() {
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
          <TreeViewPlugin />
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
