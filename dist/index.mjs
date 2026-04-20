import fs from "node:fs";
import path from "node:path";
//#region src/index.ts
/**
* manifest.json をカレントまたは親ディレクトリから探す
*/
const resolveManifestPath = () => {
	for (const p of ["./manifest.json", "../manifest.json"]) {
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
const runCopy = (outDir, options) => {
	const { targetDir, force = true } = options;
	const manifestPath = resolveManifestPath();
	if (!manifestPath) {
		console.error("obsidian-copy: [Error] manifest.json not found.");
		return;
	}
	const buildFiles = fs.existsSync(outDir) ? fs.readdirSync(outDir) : [];
	const targets = Array.isArray(targetDir) ? targetDir : [targetDir];
	for (const rawPath of targets) {
		const absoluteTargetPath = path.resolve(rawPath);
		if (fs.existsSync(absoluteTargetPath) && !force) {
			console.log(`obsidian-copy: [Skip] ${absoluteTargetPath} already exists.`);
			continue;
		}
		try {
			if (!fs.existsSync(absoluteTargetPath)) fs.mkdirSync(absoluteTargetPath, { recursive: true });
			for (const file of buildFiles) {
				const src = path.join(outDir, file);
				if (fs.statSync(src).isFile()) fs.copyFileSync(src, path.join(absoluteTargetPath, file));
			}
			fs.copyFileSync(manifestPath, path.join(absoluteTargetPath, "manifest.json"));
			fs.writeFileSync(path.join(absoluteTargetPath, ".hotreload"), "");
			console.log(`obsidian-copy: Copied to ${absoluteTargetPath}`);
		} catch (err) {
			console.error(`obsidian-copy: [Error] ${err.message}`);
		}
	}
};
const obsidianCopyEsbuild = (options) => ({
	name: "obsidian-copy",
	setup(build) {
		build.onEnd((result) => {
			if (result.errors.length > 0) return;
			const { outdir, outfile } = build.initialOptions;
			runCopy(outdir || (outfile ? path.dirname(outfile) : "."), options);
		});
	}
});
const obsidianCopyVite = (options) => {
	let config;
	return {
		name: "obsidian-copy",
		apply: "build",
		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},
		closeBundle() {
			runCopy(config.build.outDir || "dist", options);
		}
	};
};
//#endregion
export { obsidianCopyEsbuild, obsidianCopyVite };
