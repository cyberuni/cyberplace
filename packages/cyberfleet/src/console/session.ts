import type { Exec } from '../identity.ts'

/** Generic multiplexer seam — no cyberfleet-specific concepts, so this can be extracted later. */

export interface SessionOpenOptions {
	/** Working directory the new pane/window/session should start in. */
	cwd: string
	/** Command line to launch inside the new pane once it is open. */
	launch: string
}

/** Opaque handle to an open pane/window/session; backend-specific id lives in `id`. */
export interface SessionTarget {
	id: string
}

export interface SessionReadOptions {
	/** How many trailing lines of output to capture; omit for the backend's default. */
	lines?: number
}

export interface SessionAdapter {
	/** Backend name, e.g. "tmux" or "herdr". */
	readonly name: string
	/** Create a new pane/window running `opts.launch` in `opts.cwd`; returns its target handle. */
	open(exec: Exec, opts: SessionOpenOptions): SessionTarget
	/** Type text into the target session (submitted, not queued). */
	send(exec: Exec, target: SessionTarget, text: string): void
	/** Capture the target session's current output. */
	read(exec: Exec, target: SessionTarget, opts?: SessionReadOptions): string
	/** Close the target session. */
	teardown(exec: Exec, target: SessionTarget): void
}
