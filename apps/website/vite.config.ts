import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: [
      "lexical",
      "@lexical/react",
      "@lexical/rich-text",
      "@lexical/html",
      "@lexical/clipboard",
      "@lexical/markdown",
      "@lexical/mark",
      "@lexical/overflow",
      "@lexical/history",
      "@lexical/utils",
      "@lexical/list",
      "@lexical/link",
      "@lexical/code",
      "@lexical/table",
      "@lexical/code-shiki",
      "@lexical/extension",
      "@lexical/file",
      "@lexical/hashtag",
      "@lexical/selection",
      "react",
      "react-dom",
    ],
  },
  server: {
    port: 5173,
  },
});
