// vite.config.ts
import { defineConfig } from "vite";
import { resolve } from "path";
import copy from "rollup-plugin-copy";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/extension/popup/popup.html"),
        options: resolve(__dirname, "src/extension/options/options.html"),
        content: resolve(__dirname, "src/extension/content/content.ts"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
      plugins: [
        copy({
          targets: [
            { src: "src/extension/manifest.json", dest: "dist" },
            { src: "src/extension/icons/*", dest: "dist/icons" },
            { src: "src/extension/content/content.js", dest: "dist/content" },
          ],
          hook: "writeBundle",
        }),
      ],
    },
  },
});
