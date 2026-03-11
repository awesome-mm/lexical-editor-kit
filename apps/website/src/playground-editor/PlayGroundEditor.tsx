import { createEditor, getPlaygroundNodes, SettingsContext } from "lexical-editor-kit";
import { PlaygroundEditorPlugin } from "lexical-editor-kit/playground";
import { EditorContextProvider } from "lexical-editor-kit/playground";

const PlaygroundEditorComponent = createEditor({
  plugins: [PlaygroundEditorPlugin],
  nodes: [...getPlaygroundNodes()],
  providers: [SettingsContext, EditorContextProvider],
});

export default function PlayGroundEditor() {
  return <PlaygroundEditorComponent />;
}
