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
    cssCodeSplit: false,
    lib: {
      entry: {
        index: path.resolve(__dirname, "src/index.ts"),
        plugins: path.resolve(__dirname, "src/plugins.ts"),
        nodes: path.resolve(__dirname, "src/nodes.ts"),
        providers: path.resolve(__dirname, "src/providers.ts"),
        playground: path.resolve(__dirname, "src/playground.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.es.js`,
    },
    rollupOptions: {
      external: (id) =>
        /^(react($|\/|-dom)|lexical($|\/)|@lexical\/|prettier|typescript$)/.test(
          id,
        ),
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          lexical: "Lexical",
        },
        manualChunks(id) {
          // if (id.includes("node_modules")) {
          //   if (id.includes("date-fns")) {
          //     return "date-fns";
          //   }
          //   if (id.includes("@floating-ui")) {
          //     return "floating-ui";
          //   }
          //   if (id.includes("@dnd-kit")) {
          //     return "dnd-kit";
          //   }
          //   if (id.includes("emoji-list")) {
          //     return "emoji";
          //   }
          //   return "vendor";
          // }
        },
      },
    },
  },
});
