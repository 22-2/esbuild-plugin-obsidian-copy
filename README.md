# esbuild-plugin-obsidian-copy

A simple esbuild plugin to copy built Obsidian plugin files (`main.js`, `manifest.json`, `styles.css`) to a target plugins directory in an Obsidian vault.

## Features

- Automatically copies files after a successful build.
- Supports hotreload by touching a `.hotreload` file in the target directory (requires [Obsidian Hot Reload plugin](https://github.com/pjeby/hot-reload-obsidian)).
- Configurable target directory.

## Installation

```bash
pnpm add -D @22-2/esbuild-plugin-obsidian-copy
```

## Usage

Add it to your `esbuild` build script:

```javascript
import esbuild from 'esbuild';
import { obsidianCopyPlugin } from '@22-2/esbuild-plugin-obsidian-copy';

esbuild.build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'main.js',
  plugins: [
    obsidianCopyPlugin({
      pluginsDir: 'path/to/your/vault/.obsidian/plugins',
      force: true
    })
  ]
}).catch(() => process.exit(1));
```

### Options

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `pluginsDir` | `string` | **Required** | The base plugins directory (e.g., path to your vault's `.obsidian/plugins`). |
| `force` | `boolean` | `false` | If `true`, overwrite even if the target directory already exists. |

## License

MIT
