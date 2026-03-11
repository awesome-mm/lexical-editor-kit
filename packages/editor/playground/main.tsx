import React from "react";
import ReactDOM from "react-dom/client";

import { createEditor, getPlaygroundNodes } from "../src/index";
import { EditorContextProvider } from "../src/editor/provider/EditorContextProvider";
import PlaygroundEditorPlugin from "../src/editor/PlaygroundEditorPlugin";

const showErrorOverlay = (err: Event) => {
  const ErrorOverlay = customElements.get("vite-error-overlay");
  if (!ErrorOverlay) return;
  const overlay = new (ErrorOverlay as new (arg: Event) => HTMLElement)(err);
  document.body?.appendChild(overlay);
};

window.addEventListener("error", showErrorOverlay);
window.addEventListener("unhandledrejection", ({ reason }) => showErrorOverlay(reason));

const PlaygroundEditorComponent = createEditor({
  plugins: [PlaygroundEditorPlugin],
  nodes: [...getPlaygroundNodes()],
  providers: [EditorContextProvider],
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <EditorContextProvider>
    <PlaygroundEditorComponent />
  </EditorContextProvider>,
);
