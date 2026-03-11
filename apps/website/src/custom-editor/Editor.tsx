import {
  createEditor,
  ProviderComponent,
  SettingsContext,
  SharedHistoryContext,
} from "lexical-editor-kit";
import * as Nodes from "lexical-editor-kit/nodes";
import {
  FlashMessageContext,
  TableContext,
  ToolbarContext,
} from "lexical-editor-kit/providers";
import CustomEditorPlugin from "./components/CustomEditorPlugin";

// createEditor로 plugins, nodes, providers를 조합하여 에디터를 구성합니다.
// plugins: 커스텀 에디터 플러그인 컴포넌트를 배열로 전달
// nodes: lexical-editor-kit/nodes에서 필요한 노드만 선택하여 사용 가능
// providers: 필요한 Context Provider만 선택하여 사용
const EditorComponent = createEditor({
  plugins: [CustomEditorPlugin],
  nodes: Object.values(Nodes).filter(
    (v): v is (typeof Nodes)[keyof typeof Nodes] => typeof v === "function",
  ),
  providers: [
    SettingsContext,
    SharedHistoryContext,
    FlashMessageContext,
    TableContext as unknown as ProviderComponent,
    ToolbarContext,
  ],
});

export default function Editor() {
  return <EditorComponent />;
}
