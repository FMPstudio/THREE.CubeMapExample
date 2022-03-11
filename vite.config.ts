import { defineConfig } from "vite";
import glslify from "vite-plugin-glslify";

export default defineConfig({
  plugins: [glslify()],
  build: {
    target: "esnext",
    polyfillDynamicImport: false,
  },
});
