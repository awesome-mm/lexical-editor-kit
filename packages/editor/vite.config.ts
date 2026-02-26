import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "LexicalEditorKit",
      fileName: (format) => `index.${format === "es" ? "es" : "cjs"}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "@dnd-kit/core",
        "@dnd-kit/sortable",
        "react",
        "react-dom",
        "lexical",
        "@lexical/react",
        "@lexical/rich-text",
        "@lexical/html",
        "@lexical/clipboard",
        "@lexical/markdown",
        "@lexical/mark",
        "@lexical/overflow",
        "@lexical/history",
        "@lexical/auto-link",
        "@lexical/table",
        "@lexical/code-highlight",
        "@lexical/code-block",
        "@lexical/utils",
        "@lexical/yjs",
        "@lexical/list",
        "@lexical/link",
        "@lexical/code",
        "@lexical/table",
        "@lexical/code-shiki",
        "@lexical/extension",
        "@lexical/file",
        "@lexical/hashtag",
        "@lexical/selection",
        "@lexical/utils",
        "yjs",
        "katex",
        "react-error-boundary",
        "@floating-ui/react",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          lexical: "Lexical",
        },
      },
    },
    sourcemap: true,
    cssCodeSplit: true,
  },
  server: {
    open: "./playground/index.html",
  },
});
