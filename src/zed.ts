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
        execFile(zedPath, [target], (error: Error | null) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}
