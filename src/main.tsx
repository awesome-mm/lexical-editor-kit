import { createRoot } from "react-dom/client";
import "./style/editor.css";
import App from "./App.tsx";

// Handle runtime errors
const showErrorOverlay = (err: Event) => {
  const ErrorOverlay = customElements.get("vite-error-overlay");
  if (!ErrorOverlay) {
    return;
  }
  const overlay = new ErrorOverlay(err);
  const body = document.body;
  if (body !== null) {
    body.appendChild(overlay);
  }
};

window.addEventListener("error", showErrorOverlay);
window.addEventListener("unhandledrejection", ({ reason }) => showErrorOverlay(reason));

createRoot(document.getElementById("root")!).render(<App />);
