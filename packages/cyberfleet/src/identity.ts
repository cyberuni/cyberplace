import { execFileSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { ensureFleetMarker, paths } from './paths.ts'

export type Harness = 'claude' | 'cursor' | 'codex'
export type AgentStatus = 'spawning' | 'active' | 'idle' | 'stale' | 'exited' | 'paused'

export interface AgentRecord {
	id: string
	handle: string
	harness: Harness
	cwd: string
	worktree?: { root: string; branch?: string } | null
	tmux?: { pane: string; window?: string; session?: string } | null
	pid?: number
	status: AgentStatus
	createdAt: string
	lastSeen: string
	brief?: string
	spawnedBy?: string
}

/** Runs a command synchronously; returns trimmed stdout, or null on any failure. */
export type Exec = (cmd: string, args: string[]) => string | null

export const realExec: Exec = (cmd, args) => {
	try {
		return execFileSync(cmd, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
	} catch {
		return null
	}
}

export interface IdContext {
	root: string
	env?: NodeJS.ProcessEnv
	exec?: Exec
	now?: () => number
}

const nowIso = (ctx: IdContext) => new Date(ctx.now?.() ?? Date.now()).toISOString()

export function randomId(): string {
	return randomBytes(8).toString('hex')
}

function writeJson(file: string, data: unknown): void {
	mkdirSync(dirname(file), { recursive: true })
	writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`)
}

/** Detect the harness: explicit wins, then env probes, then the tmux pane command. */
export function detectHarness(explicit: string | undefined, ctx: IdContext): Harness | undefined {
	if (explicit) {
		if (explicit === 'claude' || explicit === 'cursor' || explicit === 'codex') return explicit
		throw new Error(`unknown --harness "${explicit}" (expected claude | cursor | codex)`)
	}
	const env = ctx.env ?? process.env
	if (env.CLAUDECODE || env.CLAUDE_CODE_ENTRYPOINT) return 'claude'
	if (Object.keys(env).some((k) => k.startsWith('CURSOR'))) return 'cursor'
	if (Object.keys(env).some((k) => k.startsWith('CODEX'))) return 'codex'
	const pane = env.TMUX_PANE
	if (pane) {
		const cmd = (ctx.exec ?? realExec)('tmux', ['display-message', '-p', '-t', pane, '#{pane_current_command}'])
		if (cmd?.includes('cursor')) return 'cursor'
		if (cmd?.includes('codex')) return 'codex'
		if (cmd?.includes('claude')) return 'claude'
	}
	return undefined
}

/**
 * Recover the calling agent's own id. In tmux the pane file is authoritative — a pane with no
 * pane file is simply unregistered and must NOT adopt the non-tmux self identity (per the frozen
 * scenario, the env/self-file fallback applies only when there is no $TMUX_PANE).
 */
export function resolveSelfId(ctx: IdContext): string | undefined {
	const env = ctx.env ?? process.env
	const pane = env.TMUX_PANE
	if (pane) {
		const file = paths.paneFile(ctx.root, pane)
		return existsSync(file) ? readFileSync(file, 'utf8').trim() : undefined
	}
	if (env.CYBERFLEET_AGENT_ID) return env.CYBERFLEET_AGENT_ID
	const self = paths.selfFile(ctx.root)
	if (existsSync(self)) return readFileSync(self, 'utf8').trim()
	return undefined
}

export function loadAgent(root: string, id: string): AgentRecord | undefined {
	const file = paths.agentFile(root, id)
	if (!existsSync(file)) return undefined
	return JSON.parse(readFileSync(file, 'utf8')) as AgentRecord
}

export function saveAgent(root: string, rec: AgentRecord): void {
	writeJson(paths.agentFile(root, rec.id), rec)
}

export function listAgents(root: string): AgentRecord[] {
	const dir = paths.agentsDir(root)
	if (!existsSync(dir)) return []
	return readdirSync(dir)
		.filter((f) => f.endsWith('.json'))
		.map((f) => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')) as AgentRecord)
		.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export interface RegisterInput {
	handle?: string
	harness?: string
}

/** Register (or idempotently refresh) this session's identity. */
export function register(ctx: IdContext, input: RegisterInput): AgentRecord {
	ensureFleetMarker(ctx.root)
	const env = ctx.env ?? process.env
	const harness = detectHarness(input.harness, ctx)
	if (!harness) {
		throw new Error('could not detect harness — pass --harness claude|cursor|codex')
	}
	const existingId = resolveSelfId(ctx)
	const existing = existingId ? loadAgent(ctx.root, existingId) : undefined
	// A caller-provided self id ($CYBERFLEET_AGENT_ID / self file / pane file) IS this agent's
	// id — honor it; only mint a fresh id when nothing self-identifies (a fresh tmux pane).
	const id = existing?.id ?? existingId ?? randomId()
	const ts = nowIso(ctx)
	const pane = env.TMUX_PANE
	const exec = ctx.exec ?? realExec

	const rec: AgentRecord = {
		id,
		handle: input.handle ?? existing?.handle ?? id.slice(0, 6),
		harness,
		cwd: process.cwd(),
		worktree: existing?.worktree ?? gitWorktree(exec),
		tmux: pane
			? {
					pane,
					window: exec('tmux', ['display-message', '-p', '-t', pane, '#{window_id}']) ?? undefined,
					session: env.TMUX?.split(',')[0],
				}
			: null,
		status: 'active',
		createdAt: existing?.createdAt ?? ts,
		lastSeen: ts,
		...(existing?.brief ? { brief: existing.brief } : {}),
		...(existing?.spawnedBy ? { spawnedBy: existing.spawnedBy } : {}),
	}
	saveAgent(ctx.root, rec)
	if (pane) writeFileText(paths.paneFile(ctx.root, pane), id)
	else writeFileText(paths.selfFile(ctx.root), id)
	return rec
}

function gitWorktree(exec: Exec): { root: string; branch?: string } | null {
	const root = exec('git', ['rev-parse', '--show-toplevel'])
	if (!root) return null
	return { root, branch: exec('git', ['rev-parse', '--abbrev-ref', 'HEAD']) ?? undefined }
}

function writeFileText(file: string, text: string): void {
	mkdirSync(dirname(file), { recursive: true })
	writeFileSync(file, text)
}

/** Resolve a recipient argument (id or handle) to an agent id. */
export function resolveRecipient(root: string, to: string): string {
	if (loadAgent(root, to)) return to
	const match = listAgents(root).find((a) => a.handle === to)
	if (!match) throw new Error(`no agent addressable as "${to}"`)
	return match.id
}

/**
 * Resolve a ship reference by id, handle, or its worktree branch (the ship↔CR join key, ADR-0022
 * decision 8 + the `add-fleet-comms` CR's convention: an `AgentRecord.worktree.branch` equals the
 * SDD `<cr-ref>` it maps to). Used by verbs that address "the ship working on CR X" as well as
 * "the ship named X".
 */
export function resolveShip(root: string, ref: string): AgentRecord {
	const byId = loadAgent(root, ref)
	if (byId) return byId
	const agents = listAgents(root)
	const byHandle = agents.find((a) => a.handle === ref)
	if (byHandle) return byHandle
	const byBranch = agents.find((a) => a.worktree?.branch === ref)
	if (byBranch) return byBranch
	throw new Error(`no ship addressable as "${ref}" (tried id, handle, and worktree branch/CR)`)
}

/**
 * Pause a ship's mission — a cyberfleet-level marker on its `AgentRecord.status` only. This is
 * NOT a bridge to SDD's `pause-mission` checkpoint (which rewrites the plan brief's todos/NEXT
 * anchor) — that gap is flagged, not silently papered over: a caller who wants the actual mission
 * checkpoint must run `sdd:pause-mission` in-session.
 */
export function pauseAgent(root: string, id: string): AgentRecord {
	const rec = loadAgent(root, id)
	if (!rec) throw new Error(`no agent "${id}"`)
	rec.status = 'paused'
	saveAgent(root, rec)
	return rec
}

export function bumpLastSeen(ctx: IdContext, id: string): void {
	const rec = loadAgent(ctx.root, id)
	if (!rec) return
	rec.lastSeen = nowIso(ctx)
	saveAgent(ctx.root, rec)
}

/** Refresh this session's own last-seen if it is registered — best-effort, never throws. */
export function touch(ctx: IdContext): void {
	const id = resolveSelfId(ctx)
	if (id) bumpLastSeen(ctx, id)
}

const STALE_MS = 15 * 60 * 1000

/** Mark agents whose pane is gone or whose last-seen is stale as exited. */
export function prune(ctx: IdContext): AgentRecord[] {
	const exec = ctx.exec ?? realExec
	const now = ctx.now?.() ?? Date.now()
	const changed: AgentRecord[] = []
	for (const rec of listAgents(ctx.root)) {
		if (rec.status === 'exited') continue
		const paneGone = rec.tmux?.pane
			? exec('tmux', ['has-session', '-t', rec.tmux.pane]) === null &&
				!(exec('tmux', ['list-panes', '-a', '-F', '#{pane_id}']) ?? '').split('\n').includes(rec.tmux.pane)
			: false
		const stale = now - new Date(rec.lastSeen).getTime() > STALE_MS
		if (paneGone || stale) {
			rec.status = 'exited'
			saveAgent(ctx.root, rec)
			changed.push(rec)
		}
	}
	return changed
}
