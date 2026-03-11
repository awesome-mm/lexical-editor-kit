import type { JSX } from "react";
import { SettingsContext } from "./context/SettingsContext";
import { EditorContextProvider } from "./provider/EditorContextProvider";
import EditorInner from "./PlaygroundEditorPlugin";

export default function PlaygroundEditorRoot(): JSX.Element {
  return (
    <SettingsContext>
      <EditorContextProvider>
        <EditorInner />
      </EditorContextProvider>
    </SettingsContext>
  );
}
