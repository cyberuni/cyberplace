import { existsSync, readdirSync, readFileSync, rmSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { selectSessionAdapter } from './console/index.ts'
import { gitWorktreeAdapter, resolvePrimaryRoot } from './console/worktree.ts'
import { type AgentRecord, type Exec, type IdContext, loadAgent, realExec } from './identity.ts'
import { paths } from './paths.ts'

export interface DecommissionInput {
	id: string
	/** Discard uncommitted changes in the worktree. Never overrides the flagship rule. */
	force?: boolean
}

export interface DecommissionResult {
	agent: AgentRecord
	worktreeRoot?: string
	pane?: string
}

/**
 * Tear a ship down and reap its `.cyberfleet/` record — the deterministic inverse of `spawn`
 * (ADR-0022 decisions 8–9). Refuses the primary checkout (the flagship rule, absolute — `--force`
 * never overrides it) and a dirty worktree unless `--force`. Teardown always precedes reap: an
 * already-gone worktree or pane is tolerated, but a genuine worktree-removal failure aborts and
 * leaves the record intact so the operation is retryable.
 */
export function decommission(ctx: IdContext, input: DecommissionInput): DecommissionResult {
	const rec = loadAgent(ctx.root, input.id)
	if (!rec) throw new Error(`no ship registered as agents/${input.id}.json — nothing to decommission`)

	const exec = ctx.exec ?? realExec
	const env = ctx.env ?? process.env
	const worktreeRoot = rec.worktree?.root
	// Resolve the primary checkout once — reused by the flagship guard and the worktree removal.
	const primaryRoot = worktreeRoot ? resolvePrimaryRoot(exec) : undefined

	if (worktreeRoot && resolve(worktreeRoot) === resolve(primaryRoot as string)) {
		throw new Error(
			`refusing to decommission "${input.id}" — its worktree is the primary checkout (the flagship); ` +
				'--force does not override this',
		)
	}

	// A worktree already gone from disk has nothing to check or remove — tolerated regardless of
	// --force. Only a worktree that still exists is subject to the dirty check and real removal.
	const worktreeExists = worktreeRoot != null && existsSync(worktreeRoot)

	if (worktreeExists && !input.force && isDirty(exec, worktreeRoot as string)) {
		throw new Error(`ship "${input.id}" has uncommitted changes in its worktree — pass --force to discard them`)
	}

	const pane = rec.tmux?.pane ?? resolvePaneFromIndex(ctx.root, input.id)

	if (worktreeExists) {
		try {
			gitWorktreeAdapter.remove(exec, worktreeRoot as string, { primaryRoot: primaryRoot as string })
		} catch (err) {
			// A genuine teardown failure aborts BEFORE any reap — the record is left intact so the
			// decommission can be retried, never half-reaped.
			throw new Error(
				`decommission "${input.id}" aborted — worktree removal failed, record left intact for retry: ` +
					`${err instanceof Error ? err.message : String(err)}`,
			)
		}
	}

	if (pane) {
		try {
			selectSessionAdapter(env).teardown(exec, { id: pane })
		} catch {
			// Already gone, or no session backend available — tolerated; reap proceeds regardless.
		}
	}

	// Reap only this id's state, after teardown succeeded or was already done.
	rmSync(paths.agentFile(ctx.root, input.id), { force: true })
	if (pane) rmSync(paths.paneFile(ctx.root, pane), { force: true })
	rmSync(paths.dataDir(ctx.root, input.id), { recursive: true, force: true })

	return { agent: rec, worktreeRoot, pane }
}

function isDirty(exec: Exec, worktreeRoot: string): boolean {
	return !!exec('git', ['-C', worktreeRoot, 'status', '--porcelain'])
}

/**
 * Reverse-resolve a herdr ship's pane from `panes/<pane>.id → id` — a herdr ship's pane is stored
 * only here (never on `agents/<id>.json`), unlike a tmux ship's `tmux.pane`.
 */
function resolvePaneFromIndex(root: string, id: string): string | undefined {
	const dir = paths.panesDir(root)
	if (!existsSync(dir)) return undefined
	for (const f of readdirSync(dir)) {
		if (!f.endsWith('.id')) continue
		if (readFileSync(join(dir, f), 'utf8').trim() === id) return f.slice(0, -'.id'.length)
	}
	return undefined
}
