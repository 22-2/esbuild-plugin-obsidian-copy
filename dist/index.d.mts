import { Plugin } from "esbuild";
import { Plugin as Plugin$1 } from "vite";

//#region src/index.d.ts
interface ObsidianCopyOptions {
  /** コピー先のディレクトリパス (例: "/path/to/vault/.obsidian/plugins/my-plugin") */
  targetDir: string | string[];
  /** 既にディレクトリが存在する場合でも上書きするかどうか (デフォルト: true) */
  force?: boolean;
}
declare const obsidianCopyEsbuild: (options: ObsidianCopyOptions) => Plugin;
declare const obsidianCopyVite: (options: ObsidianCopyOptions) => Plugin$1;
//#endregion
export { ObsidianCopyOptions, obsidianCopyEsbuild, obsidianCopyVite };