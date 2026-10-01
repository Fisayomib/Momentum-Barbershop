/**
 * Verify the app compiles without disturbing a running dev server.
 *
 * Exists because `next build` writes to the same .next directory `next dev`
 * is serving from: run it while dev is up and the browser starts throwing
 * ChunkLoadError on every navigation until you restart. This points the build
 * at a scratch directory instead.
 *
 * Uses spawn rather than an inline env assignment so it works the same in
 * PowerShell, cmd and bash.
 */
import { spawn } from "node:child_process";

const child = spawn("next", ["build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, NEXT_DIST_DIR: ".next-verify" },
});

child.on("exit", (code) => process.exit(code ?? 1));
