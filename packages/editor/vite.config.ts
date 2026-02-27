import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";
import visualizer from "rollup-plugin-visualizer";

const isAnalyze = process.env.VITE_ANALYZE === "true";

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    isAnalyze &&
      visualizer({
        filename: "./report.html",
        open: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
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
        "@lexical/list",
        "@lexical/link",
        "@lexical/code",
        "@lexical/table",
        "@lexical/code-shiki",
        "@lexical/extension",
        "@lexical/file",
        "@lexical/hashtag",
        "@lexical/selection",
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
