import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import svgr from "vite-plugin-svgr";
import fs from "fs";

export default defineConfig({
  plugins: [
    react(),
    svgr(),
    {
      name: "vite-plugin-check-assets",
      enforce: "pre",
      load(id) {
        const exts = [".png", ".jpg", ".jpeg", ".gif", ".svg"];
        for (const ext of exts) {
          if (id.endsWith(ext) && !fs.existsSync(id)) {
            throw new Error(`[Asset Missing] File does not exist: ${id}`);
          }
        }
        return null;
      },
    },
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
