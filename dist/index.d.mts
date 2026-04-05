import { Plugin } from 'esbuild';

interface ObsidianCopyOptions {
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
/**
 * esbuild plugin to copy Obsidian plugin files to one or more target plugin directories.
 */
declare const obsidianCopyPlugin: (options: ObsidianCopyOptions) => Plugin;

export { type ObsidianCopyOptions, obsidianCopyPlugin };
