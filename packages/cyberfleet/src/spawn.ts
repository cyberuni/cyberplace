import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import {
	type AgentRecord,
	type Exec,
	type Harness,
	type IdContext,
	randomId,
	realExec,
	resolveSelfId,
	saveAgent,
} from './identity.ts'
import { paths } from './paths.ts'

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
}

export interface SpawnResult {
	agent: AgentRecord
	pane: string
	launch: string
}

/**
 * Launch a new peer session in a tmux split, pre-register it, and drop its brief
 * as a file the peer's own SessionStart hook reads — never typed into its prompt.
 */
export function spawn(ctx: IdContext, input: SpawnInput): SpawnResult {
	const env = ctx.env ?? process.env
	if (!env.TMUX) {
		throw new Error('spawn requires tmux — run inside a tmux session')
	}
	const harness = input.harness as Harness | undefined
	if (!harness || !(harness in LAUNCH_MAP)) {
		throw new Error(`spawn needs a --harness in the launch map (${Object.keys(LAUNCH_MAP).join(' | ')})`)
	}
	const brief = resolveBrief(input)
	if (brief == null) {
		throw new Error('spawn needs a brief — pass --task <text>, --task - (stdin), or --brief-file <path>')
	}
	const exec = ctx.exec ?? realExec
	const cwd = process.cwd()
	const pane = exec('tmux', ['split-window', '-h', '-c', cwd, '-P', '-F', '#{pane_id}'])
	if (!pane) throw new Error('tmux split-window failed')

	const id = randomId()
	const ts = new Date(ctx.now?.() ?? Date.now()).toISOString()
	const rec: AgentRecord = {
		id,
		handle: input.handle ?? id.slice(0, 6),
		harness,
		cwd,
		tmux: { pane },
		status: 'spawning',
		createdAt: ts,
		lastSeen: ts,
		brief: paths.briefFile(ctx.root, id),
		...(resolveSelfId(ctx) ? { spawnedBy: resolveSelfId(ctx) } : {}),
	}
	saveAgent(ctx.root, rec)
	writeText(paths.paneFile(ctx.root, pane), id)
	writeText(paths.briefFile(ctx.root, id), brief)

	const launch = LAUNCH_MAP[harness]
	launchPane(exec, pane, launch)
	return { agent: rec, pane, launch }
}

function resolveBrief(input: SpawnInput): string | null {
	if (input.briefFile) return readFileSync(input.briefFile, 'utf8')
	if (input.task === '-') return readFileSync(0, 'utf8') // stdin
	if (input.task != null && input.task !== '') return input.task
	return null
}

function launchPane(exec: Exec, pane: string, launch: string): void {
	exec('tmux', ['send-keys', '-t', pane, launch, 'Enter'])
}

function writeText(file: string, text: string): void {
	mkdirSync(dirname(file), { recursive: true })
	writeFileSync(file, text)
}
