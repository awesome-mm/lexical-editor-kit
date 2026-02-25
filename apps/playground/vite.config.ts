import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "lexical",
      "@lexical/react",
      "@lexical/rich-text",
      "@lexical/list",
      "@lexical/link",
      "@lexical/code",
      "@lexical/table",
      "@lexical/code-shiki",
      "@lexical/extension",
      "@lexical/file",
      "@lexical/hashtag",
      "@lexical/markdown",
      "@lexical/selection",
      "@lexical/utils",
      "@lexical/yjs",
    ],
  },
  server: {
    port: 5173,
  },
});
