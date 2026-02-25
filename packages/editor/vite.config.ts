import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
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
    cssCodeSplit: true,
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
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
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          lexical: "Lexical",
        },
      },
    },
    sourcemap: true,
  },
});
