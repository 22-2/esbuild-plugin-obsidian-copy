import { Plugin } from 'esbuild';
import { Plugin as Plugin$1 } from 'vite';

interface ObsidianCopyOptions {
    pluginsDir: string | string[];
    targetDirName?: string;
    force?: boolean;
}
declare const obsidianCopyEsbuild: (options: ObsidianCopyOptions) => Plugin;
declare const obsidianCopyVite: (options: ObsidianCopyOptions) => Plugin$1;

export { type ObsidianCopyOptions, obsidianCopyEsbuild, obsidianCopyVite };
