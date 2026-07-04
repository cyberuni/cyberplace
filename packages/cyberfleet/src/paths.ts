import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

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

export interface RootOptions {
	root?: string
	space?: string
	cwd?: string
	env?: NodeJS.ProcessEnv
}

/**
 * Resolve the `.cyberfleet` transport root. Precedence: explicit --root/--space,
 * then CYBERFLEET_ROOT, then `<project root>/.cyberfleet` (project-scoped default).
 */
export function resolveRoot(opts: RootOptions = {}): string {
	const env = opts.env ?? process.env
	const explicit = opts.root ?? opts.space ?? env.CYBERFLEET_ROOT
	if (explicit) return resolve(explicit)
	return join(projectRoot(opts.cwd), '.cyberfleet')
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
}

/** tmux pane ids look like "%3"; make them filesystem-safe. */
export function sanitizePane(pane: string): string {
	return pane.replace(/[^A-Za-z0-9_-]/g, '_')
}
