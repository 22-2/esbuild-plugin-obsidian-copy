import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "esbuild";

export interface ObsidianCopyOptions {
  /**
   * The base plugins directory (or directories) to copy into.
   * e.g., path to your vault's .obsidian/plugins
   */
  pluginsDir: string | string[];
  /**
   * Explicitly specify the target directory name.
   * If not provided, the plugin ID from `manifest.json` will be used.
   */
  targetDirName?: string;
  /**
   * If true, overwrite existing target directory.
   * @default false
   */
  force?: boolean;
  /**
   * Files to copy. Defaults to ["main.js", "manifest.json", "styles.css"].
   */
  files?: string[];
}

const FILES_TO_COPY = ["main.js", "manifest.json", "styles.css"];

const resolvePluginId = (): string | null => {
  if (!fs.existsSync("manifest.json")) {
    console.error("obsidian-copy: [Error] manifest.json not found in current directory.");
    return null;
  }

  const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
  const pluginId = manifest.id;

  if (!pluginId) {
    console.error(
      "obsidian-copy: [Error] Could not determine plugin ID. " +
        "Specify 'targetDirName' or ensure 'id' exists in manifest.json."
    );
    return null;
  }

  if (manifest.id?.includes("sample")) {
    console.warn("obsidian-copy: [Warning] manifest.json 'id' still includes 'sample'. Please change it.");
  }

  return pluginId;
};

const copyToDir = (targetDir: string, files: string[], force: boolean): void => {
  if (fs.existsSync(targetDir) && !force) {
    console.error(
      `obsidian-copy: [Error] Target directory '${targetDir}' already exists. Set 'force: true' to overwrite.`
    );
    return;
  }

  fs.mkdirSync(targetDir, { recursive: true });

  for (const file of files) {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(targetDir, file));
    }
  }

  fs.writeFileSync(path.join(targetDir, ".hotreload"), "");

  console.log(`obsidian-copy: Successfully copied files to ${targetDir}`);
};

/**
 * esbuild plugin to copy Obsidian plugin files to one or more target plugin directories.
 */
export const obsidianCopyPlugin = (options: ObsidianCopyOptions): Plugin => {
  const { pluginsDir, targetDirName, force = false, files = FILES_TO_COPY } = options;

  return {
    name: "obsidian-copy",
    setup(build) {
      build.onEnd(async (result) => {
        if (result.errors.length > 0) {
          console.error("obsidian-copy: [Error] Build failed with errors. Skipping copy.");
          return;
        }
        console.log("obsidian-copy: Build succeeded. Starting copy process...");

        const pluginsDirs = Array.isArray(pluginsDir) ? pluginsDir : [pluginsDir];

        if (pluginsDirs.length === 0) {
          console.error("obsidian-copy: [Error] pluginsDir is empty.");
          return;
        }

        const pluginId = targetDirName ?? resolvePluginId();
        if (!pluginId) return;

        try {
          for (const dir of pluginsDirs) {
            const targetDir = path.resolve(dir, pluginId);
            copyToDir(targetDir, files, force);
            console.log(`obsidian-copy: Copied to ${targetDir}`);
          }
        } catch (err: any) {
          console.error(`obsidian-copy: [Error] ${err.message}`);
        }
      });
    },
  };
};
