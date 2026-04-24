# Open in Zed

An Obsidian plugin that opens the current vault, any folder, or any note in the [Zed](https://zed.dev) editor.

## Features

- **Ribbon button** — opens the vault root in Zed.
- **Command palette** — `Open in Zed: Open vault in Zed` opens the vault root.
- **File/folder menu** — `Open in Zed` in the right-click/kebab menu opens that specific file or folder. When invoked on the currently active note, jumps to the cursor's line and column.

Desktop only. Uses `child_process.execFile` to launch Zed via its CLI.

## Requirements

- The `zed` CLI must be installed. In Zed: `Zed` menu → `Install CLI`.
- The **absolute path** to the `zed` binary must be set in this plugin's settings. Common locations:
  - `/usr/local/bin/zed` — default, where Zed's "Install CLI" command places it on macOS.
  - `/opt/homebrew/bin/zed` — Apple Silicon Homebrew.
  - `~/.local/bin/zed` or `/usr/bin/zed` — Linux.

An absolute path is required because Obsidian launched from Finder or Dock does not inherit your shell `PATH`.

## Installation (manual)

1. Build: `npm install && npm run build`.
2. Copy `manifest.json` and `main.js` into `<your-vault>/.obsidian/plugins/open-in-zed/`.
3. Enable `Open in Zed` in Obsidian's Community Plugins settings.
4. Open the plugin's settings and confirm the path to the `zed` binary.

## Development

```bash
npm install
npm run dev      # esbuild watch mode
npm run check    # type-check + lint + format
npm run build    # production build
```

## License

MIT.
