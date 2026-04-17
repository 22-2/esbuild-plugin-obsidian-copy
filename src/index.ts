import fs from "node:fs";
import path from "node:path";
import type { Plugin as EsbuildPlugin } from "esbuild";
import type { Plugin as VitePlugin, ResolvedConfig } from "vite";

export interface ObsidianCopyOptions {
  pluginsDir: string | string[];
  targetDirName?: string;
  force?: boolean;
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
  const { pluginsDir, targetDirName, force = false } = options;

  // 1. manifest.json の解決
  const manifestPath = resolveManifestPath();
  if (!manifestPath) {
    console.error("obsidian-copy: [Error] manifest.json not found in current or parent directory.");
    return;
  }

  // 2. Plugin ID の決定
  let pluginId = targetDirName;
  if (!pluginId) {
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      pluginId = manifest.id;
    } catch (e) {
      console.error("obsidian-copy: [Error] Failed to read manifest.json");
      return;
    }
  }

  if (!pluginId) {
    console.error("obsidian-copy: [Error] Could not determine plugin ID.");
    return;
  }

  // 3. コピー対象ファイルの収集
  // outDir 内の全ファイル + 解決した manifest.json
  const buildFiles = fs.existsSync(outDir) ? fs.readdirSync(outDir) : [];
  const targets = Array.isArray(pluginsDir) ? pluginsDir : [pluginsDir];

  for (const baseDir of targets) {
    const targetPath = path.resolve(baseDir, pluginId);

    if (fs.existsSync(targetPath) && !force) {
      console.log(`obsidian-copy: [Skip] ${targetPath} already exists.`);
      continue;
    }

    try {
      if (!fs.existsSync(targetPath)) {
        fs.mkdirSync(targetPath, { recursive: true });
      }

      // outDir からファイルをコピー (main.js, styles.css 等)
      for (const file of buildFiles) {
        const src = path.join(outDir, file);
        if (fs.statSync(src).isFile()) {
          fs.copyFileSync(src, path.join(targetPath, file));
        }
      }

      // manifest.json をコピー (outDirにない場合を考慮)
      fs.copyFileSync(manifestPath, path.join(targetPath, "manifest.json"));

      // Hot Reload 用ファイル
      fs.writeFileSync(path.join(targetPath, ".hotreload"), "");

      console.log(`obsidian-copy: Copied to ${targetPath}`);
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

      // esbuild の設定から出力先を特定
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
      // Vite の設定からビルド出力先 (デフォルトは 'dist') を取得
      const resolvedOutDir = config.build.outDir || "dist";
      runCopy(resolvedOutDir, options);
    },
  };
};
