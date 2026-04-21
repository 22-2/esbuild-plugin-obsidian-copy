import { defineConfig } from "tsdown";
// @ts-expect-error
import { builtinModules } from "node:module";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  minify: false,
  target: "node24",
  outDir: "dist",
  platform: "node",
  external: [...builtinModules],
});
