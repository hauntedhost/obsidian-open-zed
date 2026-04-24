# obsidian-open-zed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a small Obsidian desktop plugin that opens the current vault, any folder, or any note in the Zed editor via three entry points: a ribbon button, a palette command, and a file-menu item.

**Architecture:** Three source files. `src/zed.ts` is a pure Node helper wrapping `child_process.execFile`. `src/settings.ts` holds the one-field settings tab. `src/main.ts` is the plugin class that registers the ribbon, command, and `file-menu` handler, and coordinates the launch calls. No unit tests — per the spec, the plugin is too small to justify a `vitest` + `obsidian-stub.ts` setup. Verification is static: type-check, lint, format, build. Runtime verification is user-performed.

**Tech Stack:** TypeScript (strict), esbuild, Biome (formatter + linter), ESLint + `eslint-plugin-obsidianmd`, Obsidian API 1.7.2+.

**Spec:** `docs/superpowers/specs/2026-04-24-obsidian-open-zed-design.md` — the source of truth. If anything in this plan conflicts with the spec, the spec wins.

**Working directory:** `~/code/obsidian-plugins/obsidian-open-zed/` (the plan sits in this repo; implementation happens here).

---

## Ground Rules for the Implementer

- **Do not launch Obsidian.** All Obsidian-runtime verification is the user's job. Your job ends at: build succeeds, type-check clean, lint clean, format clean, spec behaviors implementable on inspection. Call those out explicitly in the handoff.
- **No unit tests.** The spec explicitly scopes them out. Do not add `vitest`, `jest`, or any test runner. Do not create `src/**/*.test.ts` files.
- **Follow the spec's non-goals list.** No URL-scheme launching, no template interpolation, no multi-variant support, no mobile support, no fallback path chain. If you're tempted to add any of these, stop and ask the user.
- **Commit after each task.** Frequent small commits. Use `git -c user.email=jules@haunted.host -c user.name="Jules Omlor" commit`.
- **Commit message style:** match the JulesVault convention — leading emoji + imperative. Examples below per task.

---

## File Structure

```
obsidian-open-zed/
├── .gitignore               build artifacts, node_modules, obsidian data.json
├── LICENSE                  MIT
├── README.md                install + usage instructions
├── biome.json               formatter + linter config
├── eslint.config.mjs        obsidianmd rules + tseslint strict
├── esbuild.config.mts       bundle src/main.ts → main.js
├── manifest.json            Obsidian plugin manifest
├── package.json             scripts + devDependencies
├── tsconfig.json            strict TS config
├── docs/                    (already exists, contains spec + this plan)
└── src/
    ├── main.ts              plugin class, icon const, registrations, handlers (~120 lines)
    ├── settings.ts          interface, defaults, settings tab (~45 lines)
    └── zed.ts               launchZed helper (~15 lines)
```

Responsibility split:
- **`zed.ts`**: pure Node, no Obsidian imports. Hides the `execFile` callback shape behind a Promise.
- **`settings.ts`**: Obsidian-side settings UI + default values + interface. Does not touch the filesystem or child processes.
- **`main.ts`**: wiring — connects settings, Obsidian events, and the launch helper. Holds the icon SVG constant and the handler methods.

---

## Task 1: Scaffold the project

**Files:**
- Create: `.gitignore`, `LICENSE`, `biome.json`, `eslint.config.mjs`, `esbuild.config.mts`, `manifest.json`, `package.json`, `tsconfig.json`
- Create stub: `src/main.ts`

Goal: end this task with a repo that installs, type-checks, lints, formats, and builds cleanly on an empty plugin class. No behavior yet — just the skeleton.

- [ ] **Step 1: Create `.gitignore`**

Write `/.gitignore`:

```gitignore
# vscode
.vscode/*
!.vscode/settings.json

# Intellij
*.iml
.idea

# npm
node_modules
pnpm-lock.yaml

# Compiled plugin bundle — generated, do not commit
main.js

# Source maps
*.map

# Obsidian plugin local data
data.json

# macOS
.DS_Store

# Personal dev artifacts
.hotreload
.devtarget
```

- [ ] **Step 2: Create `LICENSE`**

Write `/LICENSE` with the MIT license text, copyright holder "Jules Omlor", year 2026. Standard MIT template — no modifications.

- [ ] **Step 3: Create `package.json`**

Write `/package.json`:

```json
{
  "name": "obsidian-open-zed",
  "version": "0.1.0",
  "description": "Open the current Obsidian vault, folder, or note in the Zed editor.",
  "main": "main.js",
  "private": true,
  "author": "Jules Omlor",
  "license": "MIT",
  "engines": {
    "node": ">=22.18"
  },
  "scripts": {
    "dev": "node esbuild.config.mts",
    "build": "node esbuild.config.mts production",
    "check": "npm run type-check && npm run lint && npm run format",
    "type-check": "tsc",
    "lint": "biome lint && eslint",
    "lint:fix": "biome lint --fix && eslint --fix",
    "format": "biome format",
    "format:fix": "biome format --write"
  },
  "devDependencies": {
    "@biomejs/biome": "^2.4.10",
    "@eslint/js": "^9.39.4",
    "@types/node": "~22.18.0",
    "builtin-modules": "^5.0.0",
    "esbuild": "^0.27.4",
    "eslint": "^9.39.4",
    "eslint-plugin-obsidianmd": "^0.1.9",
    "obsidian": "1.8.7",
    "tslib": "^2.8.1",
    "typescript": "^5.9.3",
    "typescript-eslint": "^8.58.0"
  }
}
```

- [ ] **Step 4: Create `tsconfig.json`**

Write `/tsconfig.json`:

```json
{
  "include": ["src/**/*.ts", "**/*.mts", "**/*.mjs"],
  "compilerOptions": {
    "inlineSourceMap": true,
    "inlineSources": true,
    "module": "ESNext",
    "target": "ES2021",
    "lib": ["DOM", "ES5", "ES6", "ES7", "ES2021"],
    "allowJs": true,
    "skipLibCheck": true,
    "moduleResolution": "node",
    "importHelpers": true,
    "isolatedModules": true,
    "noEmit": true,
    "checkJs": true,
    "resolveJsonModule": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

- [ ] **Step 5: Create `esbuild.config.mts`**

Write `/esbuild.config.mts`:

```typescript
import builtins from "builtin-modules";
import esbuild from "esbuild";
import process from "process";

const banner = `/*
THIS IS A GENERATED/BUNDLED FILE BY ESBUILD
if you want to view the source, please visit the github repository of this plugin
*/
`;

const prod = process.argv[2] === "production";

const context = await esbuild.context({
    banner: { js: banner },
    entryPoints: ["src/main.ts"],
    bundle: true,
    external: [
        "obsidian",
        "electron",
        "@codemirror/autocomplete",
        "@codemirror/collab",
        "@codemirror/commands",
        "@codemirror/language",
        "@codemirror/lint",
        "@codemirror/search",
        "@codemirror/state",
        "@codemirror/view",
        "@lezer/common",
        "@lezer/highlight",
        "@lezer/lr",
        ...builtins,
    ],
    format: "cjs",
    target: "es2021",
    logLevel: "info",
    sourcemap: prod ? false : "inline",
    minify: prod,
    platform: "browser",
    treeShaking: true,
    outfile: "main.js",
});

if (prod) {
    await context.rebuild();
    await context.dispose();
} else {
    await context.watch();
}
```

- [ ] **Step 6: Create `biome.json`**

Write `/biome.json`:

```json
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "formatter": {
    "indentStyle": "space",
    "indentWidth": 4,
    "lineWidth": 110
  },
  "json": {
    "formatter": { "indentWidth": 2 }
  },
  "linter": {
    "rules": {
      "complexity": {
        "useLiteralKeys": "off"
      },
      "correctness": {
        "useParseIntRadix": "off"
      },
      "style": {
        "useNodejsImportProtocol": "off",
        "noNonNullAssertion": "off"
      }
    }
  },
  "assist": {
    "enabled": true,
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  }
}
```

- [ ] **Step 7: Create `eslint.config.mjs`**

Write `/eslint.config.mjs`:

```javascript
import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";
import tseslint from "typescript-eslint";

export default defineConfig({
    files: ["**/*.{ts,mts,mjs}"],
    extends: [
        eslint.configs.recommended,
        ...tseslint.configs.strictTypeChecked,
        ...tseslint.configs.stylisticTypeChecked,
    ],
    plugins: { obsidianmd },
    languageOptions: {
        parserOptions: { projectService: true },
    },
    // @ts-expect-error -- Temporary fixes for v0.1.9., see https://github.com/obsidianmd/eslint-plugin/issues/90
    rules: {
        // eslint-disable-next-line @typescript-eslint/no-misused-spread
        ...obsidianmd.configs?.["recommended"],
        "obsidianmd/ui/sentence-case": [
            "error",
            {
                brands: ["Zed"],
                ignoreRegex: ["Open in Zed"],
            },
        ],
        "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
        "@typescript-eslint/restrict-template-expressions": ["error", { allowNumber: true }],
        "@typescript-eslint/no-non-null-assertion": "off",
    },
});
```

- [ ] **Step 8: Create `manifest.json`**

Write `/manifest.json`:

```json
{
  "id": "open-in-zed",
  "name": "Open in Zed",
  "version": "0.1.0",
  "minAppVersion": "1.7.2",
  "description": "Open the current vault, folder, or note in the Zed editor.",
  "author": "Jules Omlor",
  "isDesktopOnly": true
}
```

- [ ] **Step 9: Create stub `src/main.ts`**

Write `/src/main.ts`:

```typescript
import { Plugin } from "obsidian";

export default class OpenInZed extends Plugin {
    override async onload(): Promise<void> {
        // Scaffold only — real implementation in later tasks.
    }
}
```

- [ ] **Step 10: Install dependencies**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm install`
Expected: installs without errors. `node_modules/` and `package-lock.json` are created.

- [ ] **Step 11: Verify type-check is clean**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm run type-check`
Expected: exits 0, no type errors.

- [ ] **Step 12: Verify lint is clean**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm run lint`
Expected: exits 0. If rules flag the stub (e.g. unused `onload`), adjust the stub minimally — but do NOT loosen lint rules.

- [ ] **Step 13: Verify format is clean**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm run format`
Expected: exits 0 with no diffs. If biome reports format issues, run `npm run format:fix` and re-run `npm run format` to confirm clean.

- [ ] **Step 14: Verify build succeeds**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm run build`
Expected: exits 0. File `main.js` exists in the repo root.

- [ ] **Step 15: Commit**

```bash
cd ~/code/obsidian-plugins/obsidian-open-zed
git add .gitignore LICENSE package.json package-lock.json tsconfig.json \
        esbuild.config.mts biome.json eslint.config.mjs manifest.json src/main.ts
git -c user.email=jules@haunted.host -c user.name="Jules Omlor" commit -m "$(cat <<'EOF'
🔧 scaffold obsidian-open-zed project

TypeScript, esbuild, biome, eslint-plugin-obsidianmd. Stub main.ts
compiles and builds. No runtime behavior yet.
EOF
)"
```

---

## Task 2: Pure launch helper (`src/zed.ts`)

**Files:**
- Create: `src/zed.ts`

Goal: a tiny, Obsidian-free Promise-wrapping function over `child_process.execFile`.

- [ ] **Step 1: Create `src/zed.ts`**

Write `/src/zed.ts`:

```typescript
import { execFile } from "child_process";

/**
 * Launch the Zed editor with the given target path.
 *
 * Target may be a directory, a file, or "file:line:col" (Zed CLI format,
 * 1-based). Uses execFile rather than exec to avoid shell quoting issues
 * and command-injection risk when paths contain spaces.
 *
 * Rejects with the underlying NodeJS.ErrnoException on failure.
 */
export function launchZed(zedPath: string, target: string): Promise<void> {
    return new Promise((resolve, reject) => {
        execFile(zedPath, [target], (error) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}
```

- [ ] **Step 2: Verify type-check**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm run type-check`
Expected: exits 0.

- [ ] **Step 3: Verify lint**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm run lint`
Expected: exits 0. If `eslint-plugin-obsidianmd` or the tseslint strict-type-checked configs flag anything (e.g. the `@types/node` import style), adjust the imports to match the rule rather than loosening the rule.

- [ ] **Step 4: Verify format**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm run format`
Expected: exits 0 clean. If not, `npm run format:fix` then re-run.

- [ ] **Step 5: Verify build**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm run build`
Expected: exits 0, `main.js` regenerated. Note: `src/zed.ts` is not imported by `main.ts` yet, so tree-shaking will remove it — that's fine. Build just needs to succeed.

- [ ] **Step 6: Commit**

```bash
cd ~/code/obsidian-plugins/obsidian-open-zed
git add src/zed.ts
git -c user.email=jules@haunted.host -c user.name="Jules Omlor" commit -m "$(cat <<'EOF'
✨ add launchZed helper

Promise-wrapping execFile call. Uses execFile (not exec) for safe
handling of paths with spaces and to avoid shell injection.
EOF
)"
```

---

## Task 3: Settings (`src/settings.ts`)

**Files:**
- Create: `src/settings.ts`

Goal: interface + default + settings tab with a single text input for the Zed binary path.

- [ ] **Step 1: Create `src/settings.ts`**

Write `/src/settings.ts`:

```typescript
import { type App, PluginSettingTab, Setting } from "obsidian";
import type OpenInZed from "./main";

export interface OpenInZedSettings {
    zedPath: string;
}

// Zed's "Install CLI" command drops the shim at /usr/local/bin/zed on macOS.
// Apple Silicon Homebrew users typically have /opt/homebrew/bin/zed.
// Linux users typically have ~/.local/bin/zed or /usr/bin/zed.
export const DEFAULT_SETTINGS: OpenInZedSettings = {
    zedPath: "/usr/local/bin/zed",
};

export class OpenInZedSettingsTab extends PluginSettingTab {
    override plugin: OpenInZed;

    constructor(app: App, plugin: OpenInZed) {
        super(app, plugin);
        this.plugin = plugin;
    }

    override display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName("Path to Zed binary")
            .setDesc(
                "Absolute path to the 'zed' executable. An absolute path is required " +
                    "because Obsidian launched from Finder or Dock does not inherit your " +
                    "shell PATH. Common locations: /usr/local/bin/zed (from Zed's " +
                    "'Install CLI' command), /opt/homebrew/bin/zed (Apple Silicon " +
                    "Homebrew), ~/.local/bin/zed (Linux).",
            )
            .addText((text) =>
                text
                    .setPlaceholder(DEFAULT_SETTINGS.zedPath)
                    .setValue(this.plugin.settings.zedPath)
                    .onChange(async (value) => {
                        const trimmed = value.trim();
                        this.plugin.settings.zedPath = trimmed || DEFAULT_SETTINGS.zedPath;
                        await this.plugin.saveSettings();
                    }),
            );
    }
}
```

- [ ] **Step 2: Verify type-check**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm run type-check`
Expected: exits 0. Note: this file imports `OpenInZed` from `./main` as a type. The `main.ts` stub must still be a valid default export — it is, since Task 1 Step 9 defined `export default class OpenInZed extends Plugin`. But the stub class does not yet have a `settings` field or `saveSettings` method referenced here. Since these are only used at runtime (not in type signatures within settings.ts), TypeScript does not error — `this.plugin.settings` would only error if the type of `OpenInZed` did not include it. To keep this task self-contained, add temporary field/method shims to `src/main.ts`:

Replace the stub `src/main.ts` with:

```typescript
import { Plugin } from "obsidian";
import type { OpenInZedSettings } from "./settings";

export default class OpenInZed extends Plugin {
    // Populated in Task 4; declared here so settings.ts type-checks.
    settings!: OpenInZedSettings;

    override async onload(): Promise<void> {
        // Scaffold only — real implementation in Task 4.
    }

    // Populated in Task 4; declared here so settings.ts type-checks.
    async saveSettings(): Promise<void> {
        await Promise.resolve();
    }
}
```

Re-run: `npm run type-check`. Expected: exits 0.

- [ ] **Step 3: Verify lint**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm run lint`
Expected: exits 0. If `@typescript-eslint/require-await` flags the empty `saveSettings`, keep the `await Promise.resolve()` — it's a deliberate placeholder until Task 4 replaces it.

- [ ] **Step 4: Verify format and build**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm run format && npm run build`
Expected: both exit 0.

- [ ] **Step 5: Commit**

```bash
cd ~/code/obsidian-plugins/obsidian-open-zed
git add src/settings.ts src/main.ts
git -c user.email=jules@haunted.host -c user.name="Jules Omlor" commit -m "$(cat <<'EOF'
✨ add settings tab with zed binary path

Single-field settings tab. Default /usr/local/bin/zed (from Zed's
'Install CLI' command). Description covers Apple Silicon Homebrew
and Linux defaults and explains why absolute paths are required.
EOF
)"
```

---

## Task 4: Plugin wiring (`src/main.ts`)

**Files:**
- Modify: `src/main.ts` (replace stub with full implementation)

Goal: register icon, ribbon button, command, and `file-menu` handler. Implement `openVault` and `openFile` methods that call `launchZed` and surface errors via `Notice`.

- [ ] **Step 1: Replace `src/main.ts`**

Overwrite `/src/main.ts`:

```typescript
import {
    addIcon,
    FileSystemAdapter,
    MarkdownView,
    type Menu,
    Notice,
    Plugin,
    type TAbstractFile,
} from "obsidian";
import { DEFAULT_SETTINGS, type OpenInZedSettings, OpenInZedSettingsTab } from "./settings";
import { launchZed } from "./zed";

const ZED_ICON_ID = "zed-logo";

// Zed logo, supplied by the user. `fill="white"` on the path was swapped to
// `fill="currentColor"` so the icon adapts to Obsidian's light/dark theme.
const ZED_ICON_SVG =
    '<svg viewBox="0 0 90 90" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path fill-rule="evenodd" clip-rule="evenodd" ' +
    'd="M8.4375 5.625C6.8842 5.625 5.625 6.8842 5.625 8.4375V70.3125H0V8.4375C0 ' +
    "3.7776 3.7776 0 8.4375 0H83.7925C87.551 0 89.4333 4.5442 86.7756 " +
    "7.20186L40.3642 53.6133H53.4375V47.8125H59.0625V55.0195C59.0625 57.3495 " +
    "57.1737 59.2383 54.8438 59.2383H34.7392L25.0712 68.9062H68.9062V33.75H74.5312" +
    "V68.9062C74.5312 72.0128 72.0128 74.5312 68.9062 74.5312H19.4462L9.60248 " +
    "84.375H81.5625C83.1158 84.375 84.375 83.1158 84.375 81.5625V19.6875H90V81.5625" +
    "C90 86.2224 86.2224 90 81.5625 90H6.20749C2.44898 90 0.566723 85.4558 3.22438 " +
    "82.7981L49.46 36.5625H36.5625V42.1875H30.9375V35.1562C30.9375 32.8263 32.8263 " +
    "30.9375 35.1562 30.9375H55.085L64.9288 21.0938H21.0938V56.25H15.4688V21.0938C" +
    "15.4688 17.9871 17.9871 15.4688 21.0938 15.4688H70.5538L80.3975 5.625H8.4375Z" +
    '" fill="currentColor"/></svg>';

export default class OpenInZed extends Plugin {
    settings!: OpenInZedSettings;

    override async onload(): Promise<void> {
        addIcon(ZED_ICON_ID, ZED_ICON_SVG);
        await this.loadSettings();

        this.addSettingTab(new OpenInZedSettingsTab(this.app, this));

        this.addRibbonIcon(ZED_ICON_ID, "Open vault in Zed", () => {
            void this.openVault();
        });

        this.addCommand({
            // eslint-disable-next-line obsidianmd/commands/no-plugin-id-in-command-id
            id: "open-vault-in-zed",
            name: "Open vault in Zed",
            callback: () => {
                void this.openVault();
            },
        });

        this.registerEvent(
            this.app.workspace.on("file-menu", this.fileMenuHandler.bind(this)),
        );
    }

    async loadSettings(): Promise<void> {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            (await this.loadData()) as OpenInZedSettings | null,
        );
    }

    async saveSettings(): Promise<void> {
        await this.saveData(this.settings);
    }

    async openVault(): Promise<void> {
        const basePath = this.getVaultBasePath();
        if (basePath === null) return;
        await this.launch(basePath);
    }

    async openFile(file: TAbstractFile): Promise<void> {
        const basePath = this.getVaultBasePath();
        if (basePath === null) return;

        let target = `${basePath}/${file.path}`;

        // Append 1-based line:col only when the menu's file is the currently
        // active note AND a MarkdownView cursor is available. Obsidian's
        // Editor is 0-based; Zed's CLI is 1-based.
        const activeFile = this.app.workspace.getActiveFile();
        if (file === activeFile) {
            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            const cursor = view?.editor.getCursor();
            if (cursor) {
                target += `:${cursor.line + 1}:${cursor.ch + 1}`;
            }
        }

        await this.launch(target);
    }

    private getVaultBasePath(): string | null {
        const adapter = this.app.vault.adapter;
        if (!(adapter instanceof FileSystemAdapter)) return null;
        return adapter.getBasePath();
    }

    private async launch(target: string): Promise<void> {
        try {
            await launchZed(this.settings.zedPath, target);
        } catch (error) {
            new Notice(
                `Failed to launch Zed at "${this.settings.zedPath}". ` +
                    `Check the path in plugin settings.`,
            );
            console.error(`[${this.manifest.id}] launch error`, error);
        }
    }

    private fileMenuHandler(menu: Menu, file: TAbstractFile): void {
        menu.addItem((item) =>
            item
                .setTitle("Open in Zed")
                .setIcon(ZED_ICON_ID)
                .onClick(() => {
                    void this.openFile(file);
                }),
        );
    }
}
```

- [ ] **Step 2: Verify type-check**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm run type-check`
Expected: exits 0.

If the strict-type-checked eslint (next step) or tsc complains that `this.app.workspace.on("file-menu", ...)` callback types don't match, the third arg of `file-menu` events is `source: string` (optional for our purposes). If the signature mismatches, adjust `fileMenuHandler` to `(menu: Menu, file: TAbstractFile, _source?: string): void` — keep the underscore prefix so `@typescript-eslint/no-unused-vars` ignores it.

- [ ] **Step 3: Verify lint**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm run lint`
Expected: exits 0.

Rules that may flag something — handle each specifically, do NOT disable the rule globally:
- `obsidianmd/commands/no-plugin-id-in-command-id`: the command id `"open-vault-in-zed"` contains the plugin id `"open-in-zed"` as a substring. The inline `eslint-disable-next-line` above the `id` property handles this. Do not remove that comment.
- `obsidianmd/ui/sentence-case`: the `ignoreRegex: ["Open in Zed"]` + `brands: ["Zed"]` from Task 1 Step 7 cover all labels used here.
- `@typescript-eslint/no-floating-promises`: all async calls are either `await`-ed or prefixed with `void`. Do not remove any `void`.

- [ ] **Step 4: Verify format**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm run format`
Expected: exits 0 clean. If not, `npm run format:fix`, then re-run.

- [ ] **Step 5: Verify build**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm run build`
Expected: exits 0. `main.js` in the repo root. Open it briefly to confirm it contains the text "zed-logo" and the plugin class name — a sanity-check the bundle is what you expect.

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && grep -c "zed-logo" main.js`
Expected: output is 1 or greater.

- [ ] **Step 6: Commit**

```bash
cd ~/code/obsidian-plugins/obsidian-open-zed
git add src/main.ts
git -c user.email=jules@haunted.host -c user.name="Jules Omlor" commit -m "$(cat <<'EOF'
✨ wire ribbon, command, and file-menu to launchZed

Ribbon button and palette command open the vault root. File-menu entry
(all sources) opens the file the menu is attached to, appending 1-based
line:col only when that file is the active note with a MarkdownView
cursor. Errors surface via Notice; failures log to console.
EOF
)"
```

---

## Task 5: README + final verification

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

Write `/README.md`:

```markdown
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
```

- [ ] **Step 2: Final full check**

Run: `cd ~/code/obsidian-plugins/obsidian-open-zed && npm run check && npm run build`
Expected: exits 0, both commands clean. `main.js` regenerated.

- [ ] **Step 3: Confirm all spec surfaces are wired**

Manually inspect `src/main.ts` and confirm, item by item:
- `addIcon("zed-logo", ...)` is called in `onload` — ✓ means ribbon/file-menu icons render.
- `addRibbonIcon("zed-logo", "Open vault in Zed", ...)` is registered — ✓ means ribbon tooltip text is right.
- `addCommand({ id: "open-vault-in-zed", name: "Open vault in Zed", ... })` is registered — ✓ means palette entry is right.
- `workspace.on("file-menu", ...)` handler adds an item titled `"Open in Zed"` with `setIcon("zed-logo")` — ✓ means menu label + icon are right.
- `openFile` appends `:line:col` only when `file === getActiveFile()` AND a `MarkdownView` cursor exists — ✓ matches spec.
- Errors are surfaced via `Notice` with the message `Failed to launch Zed at "..."` — ✓ matches spec.
- No `detachLeavesOfType`, no stored view references, no bare `addEventListener`, no `MarkdownRenderer` usage — ✓ matches pitfalls checklist.
- `onunload` is not defined (or defined as empty) — ✓ matches spec.

If any item fails inspection, fix in place, re-run `npm run check && npm run build`, and include the fix in this task's commit.

- [ ] **Step 4: Commit**

```bash
cd ~/code/obsidian-plugins/obsidian-open-zed
git add README.md
git -c user.email=jules@haunted.host -c user.name="Jules Omlor" commit -m "$(cat <<'EOF'
📝 add README with install, usage, and dev instructions
EOF
)"
```

- [ ] **Step 5: Handoff note to user**

Report to the user:
- Build succeeds, `npm run check` clean.
- The plugin is ready to install manually into a test vault: copy `main.js` + `manifest.json` into `<vault>/.obsidian/plugins/open-in-zed/` and enable in Community Plugins.
- The user must manually verify: enable the plugin, click ribbon, run palette command, use right-click menus, confirm cursor-position jumping works on the active note, confirm the Notice appears when the path is bogus, confirm the icon renders sensibly in light + dark theme.
- Do NOT claim the plugin "works" — only that static verification is clean.

---

## Self-Review Notes (for the planner, not the implementer)

**Spec coverage:**
- Plugin name `Open in Zed` + manifest → Task 1 Step 8. ✓
- Ribbon tooltip `Open vault in Zed` → Task 4 Step 1. ✓
- Palette command `Open in Zed: Open vault in Zed` → Task 4 Step 1 (`name: "Open vault in Zed"`). ✓
- `file-menu` registered for all sources, label `Open in Zed` → Task 4 Step 1. ✓
- Line:col only when menu file === active note with cursor → Task 4 Step 1 `openFile`. ✓
- `execFile` not `exec`, no shell → Task 2 Step 1. ✓
- One setting `zedPath` default `/usr/local/bin/zed`, no interpolation → Task 3 Step 1. ✓
- Notice on failure, `console.error` with the full error → Task 4 Step 1 `launch`. ✓
- `isDesktopOnly: true` → Task 1 Step 8. ✓
- Icon sourced from user's SVG, `fill="white"` → `fill="currentColor"` → Task 4 Step 1. ✓
- `registerEvent`, no `detachLeavesOfType`, no bare listeners → Task 4 Step 1. ✓
- No unit tests, no `vitest` — intentionally absent. ✓
- Non-goals (URL scheme, templates, variants, mobile, fallback path chain) — not introduced by any task. ✓

**Placeholder scan:** no "TBD" / "TODO" / "implement later" / "handle edge cases" / unimplemented steps. Every code step shows exact code.

**Type consistency:**
- `OpenInZedSettings` defined in `src/settings.ts` (Task 3 Step 1), imported by `src/main.ts` (Task 3 Step 2 shim, Task 4 Step 1 full).
- `launchZed(zedPath, target)` signature in Task 2 matches call site in Task 4.
- `saveSettings` signature `async (): Promise<void>` matches between shim (Task 3 Step 2) and final (Task 4 Step 1).
- Icon id string constant `ZED_ICON_ID = "zed-logo"` used consistently in `addIcon`, `addRibbonIcon`, `setIcon`.
