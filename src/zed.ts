import { execFile } from "child_process";

/**
 * Launch the Zed editor with the given target path, then focus Zed.
 *
 * Target may be a directory, a file, or "file:line:col" (Zed CLI format,
 * 1-based). Uses execFile rather than exec to avoid shell quoting issues
 * and command-injection risk when paths contain spaces.
 *
 * On macOS, follows the zed CLI call with `open -a Zed` to bring an
 * already-running Zed window to the foreground — the zed CLI alone does
 * not activate an existing window when opening a path that's already
 * loaded. Focus errors are swallowed (the content is already delivered).
 *
 * Rejects with the underlying NodeJS.ErrnoException from the zed CLI on
 * failure; focus step errors do not propagate.
 */
export async function launchZed(zedPath: string, target: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
        execFile(zedPath, [target], (error: Error | null) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });

    if (process.platform === "darwin") {
        await new Promise<void>((resolve) => {
            execFile("open", ["-a", "Zed"], () => {
                resolve();
            });
        });
    }
}
