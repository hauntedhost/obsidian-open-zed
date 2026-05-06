# Open in Zed

Open the current vault, folder, or note in [Zed](https://zed.dev).

## Features

- Ribbon button: Opens the vault root
- Command palette: Opens the vault root
- File/folder menu:
  - Opens a selected file or folder
  - For the active note, it jumps to the cursor's line and column

## Requirements

- Install the Zed CLI: In Zed click the Zed menu > Install CLI
- Check the absolute path to `zed` binary is correct in the plugin settings

Common paths for `zed` binary:

- `/usr/local/bin/zed`: default macOS install location
- `/opt/homebrew/bin/zed`: Apple Silicon Homebrew
- `~/.local/bin/zed` or `/usr/bin/zed`: Linux

## Installation

### Manual

Manual-only until this PR is merged: https://github.com/obsidianmd/obsidian-releases/pull/12600

1. Build: `npm install && npm run build`
2. Copy `target/` into `<your-vault>/.obsidian/plugins/open-in-zed/`
3. Enable `Open in Zed` in Obsidian's Community Plugins settings
4. Confirm the `zed` binary path in the plugin settings

### Community plugins

Once published in Obsidian's community plugin directory:

1. Open Obsidian Settings, Community plugins
2. Browse for `Open in Zed`
3. Install and enable the plugin
4. Confirm the `zed` binary path in the plugin settings

## Development

```bash
npm install
npm run dev      # esbuild watch mode, rebuilds into target/
npm run check    # type-check + lint + format
npm run build    # production build into target/
```

**Tip:** For fast local testing:

- Create a `.devtarget` file containing the absolute path to a test vault plugin folder
- Each build syncs `target/*` there

### Release prep

```bash
npm run bump-version -- <version>`
```

This will update:

- `package.json`
- `manifest.json`
- `versions.json`

## License

MIT.
