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
        "react",
        "react-dom",
        "lexical",
        "@lexical/react",
        "@lexical/rich-text",
        "@lexical/html",
        "@lexical/clipboard",
        "@lexical/hashtag",
        "@lexical/mark",
        "@lexical/overflow",
        "@lexical/selection",
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
        "@lexical/markdown",
        "@lexical/selection",
        "@lexical/utils",
        "@lexical/yjs",
        "katex",
        "react-error-boundary",
        "@floating-ui/react-dom",
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
});
