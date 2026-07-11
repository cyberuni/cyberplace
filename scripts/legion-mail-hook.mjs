#!/usr/bin/env node
// Repo-local dogfooding wrapper for cyberlegion's mail-surfacing hook.
//
// cyberlegion is not yet published to npm, so this repo's committed
// .claude/settings.json cannot register `npx cyberlegion@<version> mail hook`
// (nothing would resolve). This wrapper runs the WORKSPACE CLI instead:
//   - the built `dist/cli.mjs` when present (fast path), else
//   - the TypeScript source via tsx (a devDep) — so a fresh git worktree or a
//     post-`clean` tree with no `dist/` still surfaces mail without a build.
//
// A surfacing-hook failure is non-fatal (the session just gets no mail
// injection that turn), so if neither path resolves we exit 0 quietly.
//
// This is repo dogfooding infrastructure, NOT shipped code: the published
// cyberlegion registers the `npx cyberlegion@<version> mail hook` form itself.
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const pkgDir = join(repoRoot, 'packages', 'cyberlegion')
const dist = join(pkgDir, 'dist', 'cli.mjs')
const src = join(pkgDir, 'src', 'cli.ts')
// tsx is cyberlegion's devDep, so its bin lives under the package (not the repo root).
const tsxBin = join(pkgDir, 'node_modules', '.bin', 'tsx')

// Forward whatever Claude/Cursor/Codex passed (e.g. `--event SessionStart`).
const cliArgs = ['mail', 'hook', ...process.argv.slice(2)]

// stdio: 'inherit' so the hook input (stdin) and the injection payload (stdout)
// flow straight through to/from the CLI.
const opts = { stdio: 'inherit', cwd: repoRoot }

let result
if (existsSync(dist)) {
	result = spawnSync(process.execPath, [dist, ...cliArgs], opts)
} else if (existsSync(src) && existsSync(tsxBin)) {
	// No build yet (fresh/clean worktree) — run the source through tsx, no dist needed.
	result = spawnSync(tsxBin, [src, ...cliArgs], opts)
} else {
	process.exit(0)
}

// A spawn error (e.g. tsx unavailable) leaves status null — treat as non-fatal.
process.exit(result.status ?? 0)
