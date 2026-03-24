"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  obsidianCopyPlugin: () => obsidianCopyPlugin
});
module.exports = __toCommonJS(index_exports);
var import_node_fs = __toESM(require("fs"), 1);
var import_node_path = __toESM(require("path"), 1);
var FILES_TO_COPY = ["main.js", "manifest.json", "styles.css"];
var resolvePluginId = (targetDirName) => {
  var _a;
  if (!import_node_fs.default.existsSync("manifest.json")) {
    console.error("obsidian-copy: [Error] manifest.json not found in current directory.");
    return null;
  }
  const manifest = JSON.parse(import_node_fs.default.readFileSync("manifest.json", "utf8"));
  const pluginId = targetDirName ?? manifest.id;
  if (!pluginId) {
    console.error(
      "obsidian-copy: [Error] Could not determine plugin ID. Specify 'targetDirName' or ensure 'id' exists in manifest.json."
    );
    return null;
  }
  if ((_a = manifest.id) == null ? void 0 : _a.includes("sample")) {
    console.warn("obsidian-copy: [Warning] manifest.json 'id' still includes 'sample'. Please change it.");
  }
  return pluginId;
};
var copyToDir = (targetDir, files, force) => {
  if (import_node_fs.default.existsSync(targetDir) && !force) {
    console.error(
      `obsidian-copy: [Error] Target directory '${targetDir}' already exists. Set 'force: true' to overwrite.`
    );
    return;
  }
  import_node_fs.default.mkdirSync(targetDir, { recursive: true });
  for (const file of files) {
    if (import_node_fs.default.existsSync(file)) {
      import_node_fs.default.copyFileSync(file, import_node_path.default.join(targetDir, file));
    }
  }
  import_node_fs.default.writeFileSync(import_node_path.default.join(targetDir, ".hotreload"), "");
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
        const pluginId = resolvePluginId(targetDirName);
        if (!pluginId) return;
        try {
          for (const dir of pluginsDirs) {
            const targetDir = import_node_path.default.resolve(dir, pluginId);
            copyToDir(targetDir, files, force);
          }
        } catch (err) {
          console.error(`obsidian-copy: [Error] ${err.message}`);
        }
      });
    }
  };
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  obsidianCopyPlugin
});
//# sourceMappingURL=index.cjs.map