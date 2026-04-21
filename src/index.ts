import fs from "node:fs";
import path from "node:path";
import type { Plugin as EsbuildPlugin } from "esbuild";
import type { Plugin as VitePlugin, ResolvedConfig } from "vite";

export interface ObsidianCopyOptions {
  /** コピー先のディレクトリパス (例: "/path/to/vault/.obsidian/plugins/my-plugin") */
  targetDir: string | string[];
  /** 既にディレクトリが存在する場合でも上書きするかどうか (デフォルト: true) */
  force?: boolean;
  /** 追加でコピーしたいファイル名 */
  include?: string[];
}

// --- 共通ロジック ---

/**
 * manifest.json をカレントまたは親ディレクトリから探す
 */
const resolveManifestPath = (): string | null => {
  const lookups = ["./manifest.json", "../manifest.json"];
  for (const p of lookups) {
    const resolved = path.resolve(p);
    if (fs.existsSync(resolved)) return resolved;
  }
  return null;
};

/**
 * 実際のコピー処理
 * @param outDir ビルド出力先ディレクトリ (dist等)
 * @param options プラグイン設定
 */
const runCopy = (outDir: string, options: ObsidianCopyOptions) => {
  const { targetDir, force = true } = options;

  // 1. manifest.json の場所を特定
  const manifestPath = resolveManifestPath();
  if (!manifestPath) {
    console.error("obsidian-copy: [Error] manifest.json not found.");
    return;
  }

  // 2. コピー対象ファイルの収集
  // Obsidian プラグインで通常必要な成果物だけコピーするように絞る。
  // なぜ: 中間ファイル（.map 等）や不要なアセットを無差別にコピーすると、
  // プラグインディレクトリが肥大化したり誤配布の原因になるため。
  const OBSIDIAN_FILES = new Set(["main.js", "styles.css"]);
  const allowList = new Set([...(OBSIDIAN_FILES), ...(options.include ?? [])]);

  const buildFiles = fs.existsSync(outDir)
    ? fs.readdirSync(outDir).filter((f) => allowList.has(f))
    : [];
  const targets = Array.isArray(targetDir) ? targetDir : [targetDir];

  for (const rawPath of targets) {
    const absoluteTargetPath = path.resolve(rawPath);

    // すでに存在し、force=false の場合はスキップ
    if (fs.existsSync(absoluteTargetPath) && !force) {
      console.log(`obsidian-copy: [Skip] ${absoluteTargetPath} already exists.`);
      continue;
    }

    try {
      if (!fs.existsSync(absoluteTargetPath)) {
        fs.mkdirSync(absoluteTargetPath, { recursive: true });
      }

      // ビルド成果物 (main.js, styles.css 等) をコピー
      for (const file of buildFiles) {
        const src = path.join(outDir, file);
        if (fs.statSync(src).isFile()) {
          fs.copyFileSync(src, path.join(absoluteTargetPath, file));
        }
      }

      // manifest.json をコピー
      fs.copyFileSync(manifestPath, path.join(absoluteTargetPath, "manifest.json"));

      // Hot Reload 用の隠しファイルを作成
      fs.writeFileSync(path.join(absoluteTargetPath, ".hotreload"), "");

      console.log(`obsidian-copy: Copied to ${absoluteTargetPath}`);
    } catch (err: any) {
      console.error(`obsidian-copy: [Error] ${err.message}`);
    }
  }
};

// --- esbuild 用ラッパー ---

export const obsidianCopyEsbuild = (options: ObsidianCopyOptions): EsbuildPlugin => ({
  name: "obsidian-copy",
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length > 0) return;

      const { outdir, outfile } = build.initialOptions;
      const resolvedOutDir = outdir || (outfile ? path.dirname(outfile) : ".");

      runCopy(resolvedOutDir, options);
    });
  },
});

// --- Vite 用ラッパー ---

export const obsidianCopyVite = (options: ObsidianCopyOptions): VitePlugin => {
  let config: ResolvedConfig;

  return {
    name: "obsidian-copy",
    apply: "build",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    closeBundle() {
      const resolvedOutDir = config.build.outDir || "dist";
      runCopy(resolvedOutDir, options);
    },
  };
};
