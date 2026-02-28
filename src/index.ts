import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "esbuild";

export interface ObsidianCopyOptions {
  /**
   * The base plugins directory (e.g., path to your vault's .obsidian/plugins).
   */
  pluginsDir: string;
  /**
   * Explicitly specify the target directory name.
   * If not provided, the plugin ID from `manifest.json` will be used.
   */
  targetDirName?: string;
  /**
   * If true, overwrite existing target directory.
   */
  force?: boolean;
}

/**
 * esbuild plugin to copy Obsidian plugin files to a target plugins directory.
 */
export const obsidianCopyPlugin = (options: ObsidianCopyOptions): Plugin => {
  const { pluginsDir, targetDirName, force = false } = options;

  return {
    name: "obsidian-copy",
    setup(build) {
      build.onEnd(async (result) => {
        if (result.errors.length > 0) return;

        if (!pluginsDir) {
          console.error("obsidian-copy: [Error] pluginsDir is not specified in options.");
          return;
        }

        try {
          if (!fs.existsSync("manifest.json")) {
            console.error("obsidian-copy: [Error] manifest.json not found in current directory.");
            return;
          }

          const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
          const pluginIdFromManifest = manifest.id;
          const pluginId = targetDirName || pluginIdFromManifest;

          if (!pluginId) {
            console.error(
              "obsidian-copy: [Error] Could not determine plugin ID. Please specify 'targetDirName' or ensure 'id' exists in manifest.json."
            );
            return;
          }

          if (pluginIdFromManifest && pluginIdFromManifest.includes("sample")) {
            console.warn(
              "obsidian-copy: [Warning] manifest.json plugin 'id' still includes 'sample'. Please change it."
            );
          }

          const targetDir = path.resolve(pluginsDir, pluginId);

          if (fs.existsSync(targetDir) && !force) {
            console.error(
              `obsidian-copy: [Error] Target directory '${targetDir}' already exists. Set 'force: true' to overwrite.`
            );
            return;
          }

          if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
          }

          // In esbuild build result, the files are typically in current directory or specified output directory.
          // For Obsidian plugins, it's usually main.js, manifest.json, styles.css in the current directory.
          const filesToCopy = ["main.js", "manifest.json", "styles.css"];
          for (const file of filesToCopy) {
            if (fs.existsSync(file)) {
              fs.copyFileSync(file, path.join(targetDir, file));
            }
          }

          // Hot-reload support
          fs.writeFileSync(path.join(targetDir, ".hotreload"), "");

          console.log(`obsidian-copy: Successfully copied files to ${targetDir}`);
        } catch (err: any) {
          console.error(`obsidian-copy: [Error] ${err.message}`);
        }
      });
    },
  };
};

export default obsidianCopyPlugin;
