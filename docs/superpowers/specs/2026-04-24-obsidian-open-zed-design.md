# obsidian-open-zed — Design

**Date:** 2026-04-24
**Status:** Approved, ready for implementation plan
**Location:** `~/code/obsidian-plugins/obsidian-open-zed/`

## Purpose

A small Obsidian plugin that opens the current vault — or a specific note/folder — in the [Zed](https://zed.dev) editor. Desktop-only. Modelled loosely on [NomarCub/obsidian-open-vscode](https://github.com/NomarCub/obsidian-open-vscode) but deliberately narrower in scope.

Explicit non-goals: URL-scheme launching (`zed://`), template interpolation, multi-variant support (Preview/Dev channels), mobile support.

## User-facing Surface

| Surface | Label | Action |
|---|---|---|
| Plugin name (manifest) | `Open in Zed` | — |
| Ribbon button tooltip | `Open vault in Zed` | opens vault root |
| Command palette | `Open in Zed: Open vault in Zed` | opens vault root |
| `file-menu` entry (all sources) | `Open in Zed` | opens the menu's file; appends `:line:col` iff that file is the active note |

There is **no dedicated "open current note" command** — the `file-menu` handler covers that case via the active note's tab/header menu, so a palette entry would be redundant.

The `file-menu` handler registers for all sources (sidebar context menu, tab kebab, tab right-click, header three-dot menu) with no source filter. The handler acts on the `file` arg from the event, not on `getActiveFile()`.

## Architecture

```
obsidian-open-zed/
├── manifest.json       id: open-in-zed, isDesktopOnly: true
├── package.json        esbuild + biome + eslint-plugin-obsidianmd
├── esbuild.config.mts
├── tsconfig.json       strict: true
├── eslint.config.mjs   obsidianmd/recommended
├── biome.json
├── README.md
├── LICENSE             MIT
└── src/
    ├── main.ts         plugin class, registrations, handlers (~110 lines)
    ├── settings.ts     one-field settings tab + DEFAULT_SETTINGS (~40 lines)
    └── zed.ts          pure launchZed() helper (~25 lines, no Obsidian imports)
```

### `src/zed.ts` — pure launch helper

No Obsidian imports. Wraps Node's `child_process.execFile`.

```ts
export async function launchZed(zedPath: string, target: string): Promise<void>
```

Uses `execFile` (not `exec`) to avoid shell-quoting issues and command-injection vectors with spaces in paths. On error, rejects with the underlying error; the caller decides how to surface it.

### `src/settings.ts` — single-field settings tab

```ts
export interface OpenInZedSettings {
    zedPath: string;  // absolute path to the zed binary
}

export const DEFAULT_SETTINGS: OpenInZedSettings = {
    zedPath: "/usr/local/bin/zed",  // Zed's "Install CLI" command drops it here
};
```

Settings tab renders one text input with placeholder = default, description explaining the user may need `/opt/homebrew/bin/zed` (Apple Silicon Homebrew) or similar.

No interpolation, no template variables, no fallback chain.

### `src/main.ts` — plugin class

Three entry points, one code path per action:

```ts
// Ribbon
this.addRibbonIcon("zed-logo", "Open vault in Zed", () => this.openVault());

// Command palette
this.addCommand({
    id: "open-vault-in-zed",
    name: "Open vault in Zed",
    callback: () => this.openVault(),
});

// file-menu (all sources — no filter)
this.registerEvent(this.app.workspace.on("file-menu", (menu, file) => {
    menu.addItem(item => item
        .setTitle("Open in Zed")
        .setIcon("zed-logo")
        .onClick(() => this.openFile(file)));
}));
```

**`openVault()`** — builds absolute vault path from `FileSystemAdapter.getBasePath()`, calls `launchZed(settings.zedPath, vaultPath)`.

**`openFile(file)`** —
1. Get vault base path.
2. Build `absPath = basePath + "/" + file.path`.
3. If `file === app.workspace.getActiveFile()` **and** the active view is a `MarkdownView` with a cursor, append `:line:col` (1-based, matches Zed's CLI).
4. `launchZed(settings.zedPath, absPath)`.

### Icon

The icon is Zed's logo, supplied by the user at `/Users/julie/Downloads/zed-logo.svg`. Inlined as a string constant in `main.ts` (like the VSCode plugin does with its SVG), with `fill="white"` → `fill="currentColor"` so it adapts to Obsidian's light/dark theme. Registered via `addIcon("zed-logo", svg)` in `onload()`.

## Data Flow

1. User clicks ribbon / selects palette command / picks file-menu entry.
2. Handler builds a `target` string (vault path, or file path, optionally with `:line:col`).
3. `launchZed(settings.zedPath, target)` runs `execFile` with that path + single-arg target.
4. Zed opens.
5. If `execFile` errors, a `Notice` is shown and the error is logged to console.

## Error Handling

- `app.vault.adapter` not a `FileSystemAdapter` → silent no-op. This should never happen given `isDesktopOnly: true` but guards against future API shifts.
- `launchZed` rejects → `new Notice(\`Failed to launch Zed at "${zedPath}". Check the path in plugin settings.\`)` plus `console.error` with the full error object. **No fallback, no retry** — least surprise.
- Settings loaded with `Object.assign({}, DEFAULT_SETTINGS, await loadData())` so future fields don't break old configs.

## Pitfalls Checklist (from `~/code/obsidian-plugins/obsidian-plugin-dev/pitfalls.md`)

- [x] All event handlers use `registerEvent` (auto-cleanup on unload).
- [x] `onunload()` left empty — no `detachLeavesOfType` calls.
- [x] No stored view references.
- [x] No `MarkdownRenderer` usage.
- [x] No bare `addEventListener` / `setInterval`.
- [x] No `MutationObserver` usage.
- [x] `isDesktopOnly: true` because we use `child_process`.
- [x] No `innerHTML` with user content.
- [x] Plugin ID does not contain "obsidian".
- [x] Icon uses `currentColor` for theme compatibility.

## Submission Checklist (from `~/code/obsidian-plugins/obsidian-plugin-dev/build-and-test.md`)

Keep in mind but do not block on these — this plugin isn't necessarily aimed at the community plugins directory.

- Plugin ID `open-in-zed` does not contain "obsidian" ✓
- Description < 250 chars, starts with verb, ends with period, no emoji
- `isDesktopOnly: true` set ✓
- LICENSE file (MIT)
- No default hotkeys
- Use `this.app` not `window.app` ✓
- `const`/`let`, `async`/`await` ✓

## Testing

**Unit tests:** intentionally skipped. The plugin is too small to justify a `vitest` setup with an `obsidian-stub.ts`. `zed.ts` is ~25 lines of `execFile` wrapping; `main.ts` logic is entangled with Obsidian APIs (cursor, active view). Revisit if the plugin grows.

**Static checks (automated, enforceable by the implementation session):**
- `npm run build` succeeds
- `npm run type-check` (tsc) clean
- `npm run lint` (biome + eslint) clean
- `npm run format` clean

**Manual smoke test (user-performed — implementation session will NOT launch Obsidian):**
1. Install to a test vault (symlink `main.js` + `manifest.json` into `<vault>/.obsidian/plugins/open-in-zed/`).
2. Enable plugin; check console for errors.
3. Ribbon click → Zed opens vault root.
4. Cmd-P → "Open in Zed: Open vault in Zed" → Zed opens vault root.
5. Right-click a note in sidebar → "Open in Zed" → file opens (no cursor suffix).
6. Tab kebab / header menu on active note → "Open in Zed" → file opens at cursor line:col.
7. Break `zedPath` setting to `/bad/path` → any action → Notice appears, console logs the error.
8. Icon visually correct in light + dark theme.

## Scope Guardrails

If the implementation drifts toward adding any of the following, stop and confirm with the user — these are explicit non-goals:

- URL-scheme launching (`zed://`)
- Template-variable interpolation like `{{vaultpath}}`, `{{filepath}}`
- Multiple launch methods / switchable backends
- Settings for Zed variants (Preview, Dev, Insiders-equivalent)
- Mobile support
- Per-workspace configuration
- Dedicated "open current note" command
- Unit tests with `vitest` + `obsidian-stub.ts`
- Automated runtime verification inside Obsidian
