import React from "react";
import ReactDOM from "react-dom/client";
import { Editor } from "../src/index";
import { EditorContextProvider } from "../src/editor/provider/EditorContextProvider";

const showErrorOverlay = (err: Event) => {
  const ErrorOverlay = customElements.get("vite-error-overlay");
  if (!ErrorOverlay) return;
  const overlay = new (ErrorOverlay as new (arg: Event) => HTMLElement)(err);
  document.body?.appendChild(overlay);
};

window.addEventListener("error", showErrorOverlay);
window.addEventListener("unhandledrejection", ({ reason }) => showErrorOverlay(reason));

ReactDOM.createRoot(document.getElementById("root")!).render(
  <EditorContextProvider>
    <Editor />
  </EditorContextProvider>,
);
