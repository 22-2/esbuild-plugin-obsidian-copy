import { Plugin } from 'esbuild';

interface ObsidianCopyOptions {
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
declare const obsidianCopyPlugin: (options: ObsidianCopyOptions) => Plugin;

export { type ObsidianCopyOptions, obsidianCopyPlugin as default, obsidianCopyPlugin };
