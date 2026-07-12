import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { projectRoot, type RootOptions, resolveRoot } from 'cyberlegion'

/** cyberfleet's own tracked marker — decoupled from cyberlegion's private `.agents/cyberlegion/`
 * (ship/command-center is cyberfleet's own concept; see ADR-0021). Written by `cyberfleet init`. */
const MARKER_DIR = 'cyberfleet'
const MARKER_FILE = 'ship.json'

type Mode = 'ship' | 'command-center'

export interface ModeInfo {
	/** ship (cyberfleet's own tracked `.agents/cyberfleet/ship.json` marker is present at this
	 * project root — written by `cyberfleet init`) or command-center (absent — off-ship: a neutral
	 * spot, a fresh clone before init; not necessarily "the primary checkout", which is a ship like
	 * any other once initialized). */
	mode: Mode
	/** This working directory's own project root. */
	cwdRoot: string
	/** The shared cyberlegion hub root every fleet CLI invocation resolves to (see cyberlegion's
	 * `resolveRoot`) — the global hub by default, `--root`/`--space`-overridable. */
	fleetRoot: string
}

/**
 * Detect ship vs. command-center by cyberfleet's own tracked `.agents/cyberfleet/ship.json`
 * marker's presence alone at this project root — no check against cyberlegion state or any other
 * SDD state. Git shape is irrelevant: a git primary checkout, a git linked worktree, and a
 * non-git folder are all equal — the marker alone decides (`projectRoot` walks up to the nearest
 * `.git`, falling back to `cwd` itself when none is found, so this works the same without git).
 */
export function detectMode(opts: RootOptions = {}): ModeInfo {
	const cwdRoot = projectRoot(opts.cwd)
	const mode: Mode = existsSync(join(cwdRoot, '.agents', MARKER_DIR, MARKER_FILE)) ? 'ship' : 'command-center'
	return { mode, cwdRoot, fleetRoot: resolveRoot(opts) }
}
