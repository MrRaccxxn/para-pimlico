import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills({
      // Whether to polyfill `global`, `process`, and `Buffer`.
      // By default, all are true.
      protocolImports: true,
    }),
  ],
  // Additional Vite configurations if needed
});
