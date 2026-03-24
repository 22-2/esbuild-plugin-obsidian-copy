import { defineConfig } from "tsup";
import { builtinModules } from "node:module";
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  minify: false,
  target: "node24",
  outDir: "dist",
  platform: "node",
  external: [...builtinModules],
});
