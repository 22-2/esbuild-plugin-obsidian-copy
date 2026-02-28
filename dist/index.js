// src/index.ts
import fs from "fs";
import path from "path";
var obsidianCopyPlugin = (options) => {
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
          const filesToCopy = ["main.js", "manifest.json", "styles.css"];
          for (const file of filesToCopy) {
            if (fs.existsSync(file)) {
              fs.copyFileSync(file, path.join(targetDir, file));
            }
          }
          fs.writeFileSync(path.join(targetDir, ".hotreload"), "");
          console.log(`obsidian-copy: Successfully copied files to ${targetDir}`);
        } catch (err) {
          console.error(`obsidian-copy: [Error] ${err.message}`);
        }
      });
    }
  };
};
var index_default = obsidianCopyPlugin;
export {
  index_default as default,
  obsidianCopyPlugin
};
//# sourceMappingURL=index.js.map