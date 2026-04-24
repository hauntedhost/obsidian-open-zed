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
            id: "open-vault-in-zed",
            name: "Open vault in Zed",
            callback: () => {
                void this.openVault();
            },
        });

        this.registerEvent(this.app.workspace.on("file-menu", this.fileMenuHandler.bind(this)));
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
                `Failed to launch Zed at "${this.settings.zedPath}". ` + `Check the path in plugin settings.`,
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
