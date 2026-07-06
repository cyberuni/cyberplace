import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { projectRoot, type RootOptions, resolveRoot } from 'cyberlegion'

/** The tracked marker file that makes a cyberlegion root initialized (mirrors cyberlegion's own
 * `ensureMarker` — kept in sync by hand since it is not itself exported). */
const MARKER_FILE = 'config.json'

type Mode = 'ship' | 'command-center'

export interface ModeInfo {
	/** ship (a tracked `.agents/cyberlegion/config.json` marker is present at this project root, i.e.
	 * a spawned unit worktree) or command-center (absent — the primary checkout, or a bare project). */
	mode: Mode
	/** This working directory's own project root. */
	cwdRoot: string
	/** The shared cyberlegion hub root every fleet CLI invocation resolves to (see cyberlegion's
	 * `resolveRoot`) — the global hub by default, `--root`/`--space`-overridable. */
	fleetRoot: string
}

/**
 * Detect ship vs. command-center by the tracked `.agents/cyberlegion/config.json` marker's
 * presence alone at this project root — no check against `.agents/specs` or any other SDD state.
 * A spawned unit worktree is stamped with its own marker at spawn time (see cyberlegion's
 * `session.ts`), so this simply asks: is this cwd's project root one of those stamped worktrees?
 */
export function detectMode(opts: RootOptions = {}): ModeInfo {
	const cwdRoot = projectRoot(opts.cwd)
	const mode: Mode = existsSync(join(cwdRoot, '.agents', 'cyberlegion', MARKER_FILE)) ? 'ship' : 'command-center'
	return { mode, cwdRoot, fleetRoot: resolveRoot(opts) }
}
