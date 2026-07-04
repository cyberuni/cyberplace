import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { resolvePrimaryRoot } from './console/worktree.ts'

/** The tracked marker file inside `.cyberfleet/` that makes a project root a ship (see detectMode). */
const MARKER_FILE = 'config.json'

/** Walk up from `cwd` to the nearest git repo root; fall back to `cwd`. */
export function projectRoot(cwd: string = process.cwd()): string {
	let dir = resolve(cwd)
	for (;;) {
		if (existsSync(join(dir, '.git'))) return dir
		const parent = dirname(dir)
		if (parent === dir) return resolve(cwd)
		dir = parent
	}
}

/** Runs a command synchronously in `cwd`; returns trimmed stdout, or null on any failure. */
type Exec = (cmd: string, args: string[]) => string | null

function makeDefaultExec(cwd: string | undefined): Exec {
	return (cmd, args) => {
		try {
			return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], cwd }).trim()
		} catch {
			return null
		}
	}
}

export interface RootOptions {
	root?: string
	space?: string
	cwd?: string
	env?: NodeJS.ProcessEnv
	exec?: Exec
}

/**
 * Resolve the shared `.cyberfleet` transport root. Precedence: explicit --root/--space, then
 * CYBERFLEET_ROOT, then the PRIMARY checkout's `.cyberfleet` (ADR-0022 decision 10 — the primary
 * and every worktree are both ships, but runtime state — agents/inbox/panes — stays pinned to the
 * primary so it is shared fleet-wide instead of forking per worktree), falling back to the
 * caller's own project root when not inside a git repository.
 */
export function resolveRoot(opts: RootOptions = {}): string {
	const env = opts.env ?? process.env
	const explicit = opts.root ?? opts.space ?? env.CYBERFLEET_ROOT
	if (explicit) return resolve(explicit)
	const exec = opts.exec ?? makeDefaultExec(opts.cwd)
	let primary: string | undefined
	try {
		primary = resolvePrimaryRoot(exec)
	} catch {
		primary = undefined
	}
	return join(primary ?? projectRoot(opts.cwd), '.cyberfleet')
}

type Mode = 'ship' | 'command-center'

export interface ModeInfo {
	/** ship (the tracked `.cyberfleet/config.json` marker is present here) or command-center (absent). */
	mode: Mode
	/** This working directory's own project root (a worktree-ship's root, if this is a ship). */
	cwdRoot: string
	/** The shared fleet root every ship's cyberfleet CLI invocation resolves to (see resolveRoot). */
	fleetRoot: string
}

/**
 * Detect ship vs. command-center by the tracked `.cyberfleet/config.json` marker's presence alone
 * at this project root — no check against `.agents/specs` or any other SDD state. The marker is
 * tracked (`.gitignore` excludes the rest of `.cyberfleet/`), so it travels to every worktree: the
 * primary checkout AND every worktree it spawns are both ships once the marker exists. Checking
 * the marker file rather than just the directory avoids a false positive from a stray empty
 * `.cyberfleet/` dir (e.g. one left behind after a partial teardown).
 */
export function detectMode(opts: RootOptions = {}): ModeInfo {
	const cwdRoot = projectRoot(opts.cwd)
	const mode: Mode = existsSync(join(cwdRoot, '.cyberfleet', MARKER_FILE)) ? 'ship' : 'command-center'
	return { mode, cwdRoot, fleetRoot: resolveRoot(opts) }
}

/**
 * Create the tracked `.cyberfleet/config.json` marker at `root` (a fleet root, i.e. a
 * `.cyberfleet/` dir path) if it does not already exist, making that project root a ship. Callers
 * pass the root under which `.cyberfleet/` should be created/ensured; this mkdir's it as needed.
 * Idempotent — never overwrites an existing marker.
 */
export function ensureFleetMarker(root: string): void {
	mkdirSync(root, { recursive: true })
	const marker = join(root, MARKER_FILE)
	if (!existsSync(marker)) {
		writeFileSync(marker, `${JSON.stringify({ version: 1 }, null, 2)}\n`)
	}
}

export const paths = {
	agentsDir: (root: string) => join(root, 'agents'),
	agentFile: (root: string, id: string) => join(root, 'agents', `${id}.json`),
	panesDir: (root: string) => join(root, 'panes'),
	paneFile: (root: string, pane: string) => join(root, 'panes', `${sanitizePane(pane)}.id`),
	selfFile: (root: string) => join(root, 'self'),
	inboxDir: (root: string, id: string) => join(root, 'inbox', id),
	inboxReadDir: (root: string, id: string) => join(root, 'inbox', id, 'read'),
	dataDir: (root: string, id: string) => join(root, 'data', id),
	briefFile: (root: string, id: string) => join(root, 'data', id, 'brief.md'),
	worktreeDir: (root: string, id: string) => join(root, 'worktrees', id),
}

/** tmux pane ids look like "%3"; make them filesystem-safe. */
export function sanitizePane(pane: string): string {
	return pane.replace(/[^A-Za-z0-9_-]/g, '_')
}
