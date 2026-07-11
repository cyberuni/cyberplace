import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { projectRoot } from 'cyberlegion'

/** cyberfleet's own tracked marker — mirrors cyberlegion's `ensureMarker` shape but writes into
 * cyberfleet's own namespace (`.agents/cyberfleet/`), never cyberlegion's. */
const MARKER_DIR = 'cyberfleet'
const MARKER_FILE = 'ship.json'

export interface InitResult {
	/** The project root the marker was written at (or already existed at) — the same root
	 * `detectMode` checks, so `init` and `mode` compose. */
	root: string
	/** true when this call wrote a fresh marker; false when one already existed (a clean no-op —
	 * the existing marker is never overwritten). */
	created: boolean
}

/**
 * Commission `cwd`'s project root as a ship by writing cyberfleet's own minimal opt-in marker
 * `.agents/cyberfleet/ship.json` (a schema `version`). Idempotent — an existing marker is left
 * untouched — and git-independent (`projectRoot` falls back to `cwd` itself when no `.git` is
 * found up the tree, so a plain non-git folder becomes a ship just the same). Never touches
 * `.agents/cyberlegion/` — that is cyberlegion's own namespace and concern.
 */
export function initShip(cwd: string = process.cwd()): InitResult {
	const root = projectRoot(cwd)
	const dir = join(root, '.agents', MARKER_DIR)
	const marker = join(dir, MARKER_FILE)
	if (existsSync(marker)) {
		return { root, created: false }
	}
	mkdirSync(dir, { recursive: true })
	writeFileSync(marker, `${JSON.stringify({ version: 1 }, null, 2)}\n`)
	return { root, created: true }
}
