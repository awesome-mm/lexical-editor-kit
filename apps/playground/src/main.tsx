import { createRoot } from "react-dom/client";
import App from "./App";

const showErrorOverlay = (err: Event) => {
  const ErrorOverlay = customElements.get("vite-error-overlay");
  if (!ErrorOverlay) return;
  const overlay = new (ErrorOverlay as new (arg: Event) => HTMLElement)(err);
  document.body?.appendChild(overlay);
};

window.addEventListener("error", showErrorOverlay);
window.addEventListener("unhandledrejection", ({ reason }) => showErrorOverlay(reason));

createRoot(document.getElementById("root")!).render(<App />);
