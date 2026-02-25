import React from "react";
import ReactDOM from "react-dom/client";
import { Editor } from "../src/index";

const showErrorOverlay = (err: Event) => {
  const ErrorOverlay = customElements.get("vite-error-overlay");
  if (!ErrorOverlay) return;
  const overlay = new (ErrorOverlay as new (arg: Event) => HTMLElement)(err);
  document.body?.appendChild(overlay);
};

window.addEventListener("error", showErrorOverlay);
window.addEventListener("unhandledrejection", ({ reason }) => showErrorOverlay(reason));

ReactDOM.createRoot(document.getElementById("root")!).render(<Editor />);
