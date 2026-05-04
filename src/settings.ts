import { type App, PluginSettingTab, Setting } from "obsidian";
import type OpenInZed from "./main";

export interface OpenInZedSettings {
    zedPath: string;
    zedAppName: string;
}

// Zed's "Install CLI" command drops the shim at /usr/local/bin/zed on macOS.
// Apple Silicon Homebrew users typically have /opt/homebrew/bin/zed.
// Linux users typically have ~/.local/bin/zed or /usr/bin/zed.
export const DEFAULT_SETTINGS: OpenInZedSettings = {
    zedPath: "/usr/local/bin/zed",
    zedAppName: "Zed",
};

export class OpenInZedSettingsTab extends PluginSettingTab {
    plugin: OpenInZed;
    private saveTimer: number | null = null;

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
                    .onChange((value) => {
                        const trimmed = value.trim();
                        this.plugin.settings.zedPath = trimmed || DEFAULT_SETTINGS.zedPath;
                        this.queueSave();
                    }),
            );

        new Setting(containerEl)
            .setName("Zed app name")
            .setDesc(
                "macOS application name used to focus Zed after launch. Use 'Zed Preview' " +
                    "or 'Zed Dev' if you run one of those builds.",
            )
            .addText((text) =>
                text
                    .setPlaceholder(DEFAULT_SETTINGS.zedAppName)
                    .setValue(this.plugin.settings.zedAppName)
                    .onChange((value) => {
                        const trimmed = value.trim();
                        this.plugin.settings.zedAppName = trimmed || DEFAULT_SETTINGS.zedAppName;
                        this.queueSave();
                    }),
            );
    }

    override hide(): void {
        if (this.saveTimer !== null) {
            window.clearTimeout(this.saveTimer);
            this.saveTimer = null;
            void this.plugin.saveSettings();
        }
    }

    private queueSave(): void {
        if (this.saveTimer !== null) {
            window.clearTimeout(this.saveTimer);
        }

        this.saveTimer = window.setTimeout(() => {
            this.saveTimer = null;
            void this.plugin.saveSettings();
        }, 400);
    }
}
