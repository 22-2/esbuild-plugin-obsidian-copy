// src/index.ts
import fs from "fs";
import path from "path";
var FILES_TO_COPY = ["main.js", "manifest.json", "styles.css"];
var resolvePluginId = () => {
  if (!fs.existsSync("manifest.json")) {
    console.error("obsidian-copy: [Error] manifest.json not found in current directory.");
    return null;
  }
  const manifest = JSON.parse(fs.readFileSync("manifest.json", "utf8"));
  const pluginId = manifest.id;
  if (!pluginId) {
    console.error(
      "obsidian-copy: [Error] Could not determine plugin ID. Specify 'targetDirName' or ensure 'id' exists in manifest.json."
    );
    return null;
  }
  if (manifest.id?.includes("sample")) {
    console.warn("obsidian-copy: [Warning] manifest.json 'id' still includes 'sample'. Please change it.");
  }
  return pluginId;
};
var copyToDir = (targetDir, files, force) => {
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
var obsidianCopyPlugin = (options) => {
  const { pluginsDir, targetDirName, force = false, files = FILES_TO_COPY } = options;
  return {
    name: "obsidian-copy",
    setup(build) {
      build.onEnd(async (result) => {
        if (result.errors.length > 0) return;
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
          }
        } catch (err) {
          console.error(`obsidian-copy: [Error] ${err.message}`);
        }
      });
    }
  };
};
export {
  obsidianCopyPlugin
};
//# sourceMappingURL=index.mjs.map