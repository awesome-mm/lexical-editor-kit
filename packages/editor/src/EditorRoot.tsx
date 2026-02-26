import type { JSX } from "react";
import { SettingsContext } from "./editor/context/SettingsContext";
import { EditorContextProvider } from "./editor/provider/EditorContextProvider";
import EditorInner from "./editor/Editor";

export default function Editor(): JSX.Element {
  return (
    <SettingsContext>
      <EditorContextProvider>
        <EditorInner />
      </EditorContextProvider>
    </SettingsContext>
  );
}
