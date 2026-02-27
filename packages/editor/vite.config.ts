import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";
import visualizer from "rollup-plugin-visualizer";

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    visualizer({
      filename: "./report.html",
      open: true,
      brotliSize: true,
    }),
  ],
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
        "react/jsx-runtime",
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
        "yjs",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          lexical: "Lexical",
        },
        inlineDynamicImports: true,
      },
    },
    sourcemap: true,
    cssCodeSplit: true,
    cssMinify: true,
  },
  server: {
    open: "./playground/index.html",
  },
});
