// src/index.ts
import fs from "fs";
import path from "path";
var resolveManifestPath = () => {
  const lookups = ["./manifest.json", "../manifest.json"];
  for (const p of lookups) {
    const resolved = path.resolve(p);
    if (fs.existsSync(resolved)) return resolved;
  }
  return null;
};
var runCopy = (outDir, options) => {
  const { pluginsDir, targetDirName, force = false } = options;
  const manifestPath = resolveManifestPath();
  if (!manifestPath) {
    console.error("obsidian-copy: [Error] manifest.json not found in current or parent directory.");
    return;
  }
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
      for (const file of buildFiles) {
        const src = path.join(outDir, file);
        if (fs.statSync(src).isFile()) {
          fs.copyFileSync(src, path.join(targetPath, file));
        }
      }
      fs.copyFileSync(manifestPath, path.join(targetPath, "manifest.json"));
      fs.writeFileSync(path.join(targetPath, ".hotreload"), "");
      console.log(`obsidian-copy: Copied to ${targetPath}`);
    } catch (err) {
      console.error(`obsidian-copy: [Error] ${err.message}`);
    }
  }
};
var obsidianCopyEsbuild = (options) => ({
  name: "obsidian-copy",
  setup(build) {
    build.onEnd((result) => {
      if (result.errors.length > 0) return;
      const { outdir, outfile } = build.initialOptions;
      const resolvedOutDir = outdir || (outfile ? path.dirname(outfile) : ".");
      runCopy(resolvedOutDir, options);
    });
  }
});
var obsidianCopyVite = (options) => {
  let config;
  return {
    name: "obsidian-copy",
    apply: "build",
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    closeBundle() {
      const resolvedOutDir = config.build.outDir || "dist";
      runCopy(resolvedOutDir, options);
    }
  };
};
export {
  obsidianCopyEsbuild,
  obsidianCopyVite
};
//# sourceMappingURL=index.mjs.map