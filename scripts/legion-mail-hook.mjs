#!/usr/bin/env node
// Repo-local dogfooding wrapper for cyberlegion's mail-surfacing hook.
//
// cyberlegion is not yet published to npm, so this repo's committed
// .claude/settings.json cannot register `npx cyberlegion@<version> mail hook`
// (nothing would resolve). This wrapper runs the WORKSPACE CLI instead.
//
// Candidates, first runnable wins:
//   1. this worktree's built `dist/cli.mjs`      (fast, this branch's code)
//   2. this worktree's `src` via its own `tsx`   (this branch, if provisioned)
//   3. [opt-in] the PRIMARY checkout's `src` via its `tsx`   (stop-gap; runs SOURCE
//      so it needs no build, keeps `cwd` on THIS worktree for correct worktree/branch
//      detection — module resolution follows the entry to the primary's node_modules)
//   4. [opt-in] the PRIMARY checkout's built `dist/cli.mjs`  (last resort)
//
// Candidates 3–4 are the PRIMARY-CHECKOUT BACKSTOP and are OFF by default. They run a
// SIBLING dev checkout, which is only sound while the primary is on trustworthy code —
// an assumption we deliberately do NOT bake in (the primary may be on any branch, mid-
// refactor, or broken). Opt in with CYBERLEGION_HOOK_PRIMARY_FALLBACK ONLY while
// cyberlegion is unpublished or in flux and a fresh spawn must self-register off the
// primary's build. When cyberlegion is published and stable, leave it off: the committed
// hook becomes `npx cyberlegion@<pin> mail hook` (branch-independent, no provisioning),
// and an unprovisioned worktree here simply surfaces nothing that turn (non-fatal).
//
// This is repo dogfooding infrastructure, NOT shipped code.
import { spawnSync } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const worktreeRoot = dirname(dirname(fileURLToPath(import.meta.url)))

// The primary checkout shares this worktree's git object store; `--git-common-dir`
// points at the primary's `.git`, whose parent is the primary root. Returns null
// when git is unavailable or this isn't a linked worktree (then the primary IS us).
function resolvePrimaryRoot() {
	const out = spawnSync('git', ['-C', worktreeRoot, 'rev-parse', '--path-format=absolute', '--git-common-dir'], {
		encoding: 'utf8',
	})
	if (out.status !== 0 || !out.stdout) return null
	const commonDir = out.stdout.trim() // e.g. /home/me/repo/.git
	const primary = dirname(commonDir)
	return primary && primary !== worktreeRoot ? primary : null
}

// A cyberlegion CLI entry point runnable from `root`, or null if `root` has neither
// a built dist nor a tsx to run its source. `preferSource` runs `src` over `dist`
// (used for the primary backstop, so a stale primary `dist` never wins over current
// source); otherwise `dist` wins for speed on this worktree's own build.
function resolveCli(root, preferSource) {
	if (!root) return null
	const pkgDir = join(root, 'packages', 'cyberlegion')
	const dist = join(pkgDir, 'dist', 'cli.mjs')
	const src = join(pkgDir, 'src', 'cli.ts')
	const tsxBin = join(pkgDir, 'node_modules', '.bin', 'tsx')
	const distCandidate = existsSync(dist) ? { runner: process.execPath, entry: dist } : null
	const srcCandidate = existsSync(src) && existsSync(tsxBin) ? { runner: tsxBin, entry: src } : null
	return preferSource ? (srcCandidate ?? distCandidate) : (distCandidate ?? srcCandidate)
}

// Fail-safe for the stop-gap: when we're LEANING on the primary backstop (because the
// worktree can't run its own CLI) and it can't resolve or errors, don't fail silently —
// the whole reason to enable the stop-gap is that we're depending on it. The alert can't
// use the cyberlegion CLI (that's exactly what just failed), so it goes to stderr AND a
// durable hub log the owner can find. Non-fatal: the session still proceeds.
function stopGapAlert(reason) {
	const msg = `[legion-mail-hook] STOP-GAP FAILED for worktree ${worktreeRoot}: ${reason}. The primary-checkout fallback (CYBERLEGION_HOOK_PRIMARY_FALLBACK) could not surface mail / self-register — cyberlegion may be unstable in the primary checkout, or this worktree needs provisioning.`
	process.stderr.write(`${msg}\n`)
	try {
		const hubRoot = process.env.CYBERLEGION_ROOT || (homedir() && join(homedir(), '.agents', 'cyberlegion'))
		if (hubRoot) {
			mkdirSync(hubRoot, { recursive: true })
			appendFileSync(join(hubRoot, 'hook-stop-gap-failures.log'), `${new Date().toISOString()} ${msg}\n`)
		}
	} catch {
		// last-resort alerting must never itself fail the hook
	}
}

// This worktree's own build/src first (its branch — real dogfooding). The primary-checkout
// backstop is an opt-in stop-gap (see header) for the unpublished / in-flux window only.
const stopGapOn = Boolean(process.env.CYBERLEGION_HOOK_PRIMARY_FALLBACK)
const ownCli = resolveCli(worktreeRoot, false)
// leaningOnStopGap: the worktree can't run itself, so a failure now IS a stop-gap failure.
const leaningOnStopGap = !ownCli && stopGapOn
const cli = ownCli ?? (stopGapOn ? resolveCli(resolvePrimaryRoot(), true) : null)
if (process.env.CYBERLEGION_HOOK_DEBUG) {
	process.stderr.write(
		`[legion-mail-hook] cwd=${worktreeRoot} stopGap=${stopGapOn} cli=${cli ? `${cli.runner} ${cli.entry}` : 'none'}\n`,
	)
}
if (!cli) {
	if (leaningOnStopGap) stopGapAlert('no runnable cyberlegion CLI found in the primary checkout')
	process.exit(0)
}

// Forward whatever Claude/Cursor/Codex passed (e.g. `--event SessionStart`).
const cliArgs = ['mail', 'hook', ...process.argv.slice(2)]

// stdio: 'inherit' so the hook input (stdin) and the injection payload (stdout)
// flow straight through to/from the CLI. cwd stays THIS worktree so the CLI detects
// the ship's own worktree + branch even when the binary came from the primary.
const result = spawnSync(cli.runner, [cli.entry, ...cliArgs], { stdio: 'inherit', cwd: worktreeRoot })

// A spawn error (e.g. tsx unavailable) leaves status null — treat as non-fatal. If the stop-gap
// CLI itself errored, alert (see above) so a broken primary doesn't silently strand ships.
if (leaningOnStopGap && result.status !== 0) {
	stopGapAlert(
		`the primary-checkout CLI exited with status ${result.status === null ? 'null (spawn error)' : result.status}`,
	)
}
process.exit(result.status ?? 0)
