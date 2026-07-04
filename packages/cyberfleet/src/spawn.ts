import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { selectSessionAdapter } from './console/index.ts'
import { assertDistinctFromPrimary, gitWorktreeAdapter, resolvePrimaryRoot } from './console/worktree.ts'
import {
	type AgentRecord,
	type Harness,
	type IdContext,
	randomId,
	realExec,
	resolveSelfId,
	saveAgent,
} from './identity.ts'
import { ensureFleetMarker, paths } from './paths.ts'

/** How each harness's own CLI is launched in the new pane. */
export const LAUNCH_MAP: Record<Harness, string> = {
	claude: 'claude',
	cursor: 'cursor-agent',
	codex: 'codex',
}

export interface SpawnInput {
	harness?: string
	task?: string
	briefFile?: string
	handle?: string
	/** Branch to create the ship's worktree on; defaults to `cyberfleet/ship-<id>`. */
	branch?: string
	/** Where to check out the ship's worktree; defaults under `.cyberfleet/worktrees/<id>`. */
	worktreePath?: string
}

export interface SpawnResult {
	agent: AgentRecord
	pane: string
	launch: string
}

/**
 * Launch a new peer session as a genuine sibling ship (ADR-0022 decision 8): create a real git
 * worktree distinct from the primary checkout (the flagship rule), open a session backend (tmux
 * or herdr — decision 9) with its cwd set to that worktree, pre-register the peer, and drop its
 * brief as a file the peer's own SessionStart hook reads — never typed into its prompt.
 */
export function spawn(ctx: IdContext, input: SpawnInput): SpawnResult {
	ensureFleetMarker(ctx.root)
	const env = ctx.env ?? process.env
	const exec = ctx.exec ?? realExec
	const sessionAdapter = selectSessionAdapter(env)

	const harness = input.harness as Harness | undefined
	if (!harness || !(harness in LAUNCH_MAP)) {
		throw new Error(`spawn needs a --harness in the launch map (${Object.keys(LAUNCH_MAP).join(' | ')})`)
	}
	const brief = resolveBrief(input)
	if (brief == null) {
		throw new Error('spawn needs a brief — pass --task <text>, --task - (stdin), or --brief-file <path>')
	}

	const id = randomId()
	const primaryRoot = resolvePrimaryRoot(exec)
	const branch = input.branch ?? `cyberfleet/ship-${id}`
	const worktreePath = input.worktreePath ?? paths.worktreeDir(ctx.root, id)
	const worktree = gitWorktreeAdapter.add(exec, { primaryRoot, path: worktreePath, branch })
	assertDistinctFromPrimary(worktree.root, primaryRoot)
	// Stamp the new worktree-ship with its own tracked marker immediately — its `.cyberfleet/`
	// branch state hasn't been committed yet, so without this the freshly spawned ship wouldn't
	// detect itself as a ship until that marker lands on the branch.
	ensureFleetMarker(join(worktree.root, '.cyberfleet'))

	const launch = LAUNCH_MAP[harness]
	const target = sessionAdapter.open(exec, { cwd: worktree.root, launch })

	const ts = new Date(ctx.now?.() ?? Date.now()).toISOString()
	const rec: AgentRecord = {
		id,
		handle: input.handle ?? id.slice(0, 6),
		harness,
		cwd: worktree.root,
		worktree,
		tmux: sessionAdapter.name === 'tmux' ? { pane: target.id } : null,
		status: 'spawning',
		createdAt: ts,
		lastSeen: ts,
		brief: paths.briefFile(ctx.root, id),
		...(resolveSelfId(ctx) ? { spawnedBy: resolveSelfId(ctx) } : {}),
	}
	saveAgent(ctx.root, rec)
	writeText(paths.paneFile(ctx.root, target.id), id)
	writeText(paths.briefFile(ctx.root, id), brief)

	return { agent: rec, pane: target.id, launch }
}

/** Resolve a spawn brief from --brief-file, --task -, or --task <text>; null if no source given. */
export function resolveBrief(
	input: SpawnInput,
	readStdin: () => string = () => readFileSync(0, 'utf8'),
): string | null {
	if (input.briefFile) return readFileSync(input.briefFile, 'utf8')
	if (input.task === '-') return readStdin()
	if (input.task != null && input.task !== '') return input.task
	return null
}

function writeText(file: string, text: string): void {
	mkdirSync(dirname(file), { recursive: true })
	writeFileSync(file, text)
}
