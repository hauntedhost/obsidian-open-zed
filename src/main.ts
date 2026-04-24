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
