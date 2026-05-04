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
- On macOS, the **Zed app name** setting controls which app is focused after launch. The default is `Zed`; use `Zed Preview` or `Zed Dev` if you run one of those builds.

An absolute path is required because Obsidian launched from Finder or Dock does not inherit your shell `PATH`.

## Installation (manual)

1. Build: `npm install && npm run build`.
2. Copy the contents of `target/` into `<your-vault>/.obsidian/plugins/open-in-zed/`. E.g. `cp -r target/* <your-vault>/.obsidian/plugins/open-in-zed/`.
3. Enable `Open in Zed` in Obsidian's Community Plugins settings.
4. Open the plugin's settings and confirm the path to the `zed` binary.

## Installation (community plugins)

Once published in Obsidian's community plugin directory:

1. Open Obsidian Settings → Community plugins.
2. Browse for `Open in Zed`.
3. Install and enable the plugin.
4. Open the plugin's settings and confirm the path to the `zed` binary.

## Development

```bash
npm install
npm run dev      # esbuild watch mode, rebuilds into target/
npm run check    # type-check + lint + format
npm run build    # production build into target/
```

For fast iteration during development, create a `.devtarget` file in the repo root containing the absolute path to your test vault's plugin folder (one path per line, comments with `#` or `//` allowed). Each build then auto-syncs `target/*` into that path. Alternatively, symlink `target/` into your vault.

## Release prep

Use `npm run bump-version -- <version>` to update `package.json`, `manifest.json`, and `versions.json` together. Pushing a tag will run the release workflow and attach the built plugin files to a GitHub release.

## License

MIT.
