import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { type Exec, type IdContext, loadAgent } from './identity.ts'
import { paths } from './paths.ts'
import { resolveBrief, spawn } from './spawn.ts'

let root: string
let sent: string[][]
let worktreeAddCalls: string[][]
beforeEach(() => {
	root = join(mkdtempSync(join(tmpdir(), 'cf-')), '.cyberfleet')
	sent = []
	worktreeAddCalls = []
})

const primaryRoot = '/repo'

const fakeExec: Exec = (cmd, args) => {
	if (cmd === 'git') {
		if (args.includes('--git-common-dir')) return '/repo/.git'
		if (args.includes('worktree')) {
			worktreeAddCalls.push(args)
			return ''
		}
		return null
	}
	if (args[0] === 'split-window') return '%9'
	if (args[0] === 'send-keys') sent.push(args)
	return null
}

function ctx(): IdContext {
	return { root, env: { TMUX: 't', CYBERFLEET_AGENT_ID: 'spawner' }, exec: fakeExec, now: () => 1_700_000_000_000 }
}

describe('spawn opens a pane + pre-registers the peer', () => {
	it('registers the peer (spawning, pane, spawnedBy) and writes its brief', () => {
		const res = spawn(ctx(), { harness: 'claude', task: 'reply to alice', handle: 'bob' })
		expect(res.pane).toBe('%9')
		const rec = loadAgent(root, res.agent.id)
		expect(rec).toMatchObject({ harness: 'claude', status: 'spawning', spawnedBy: 'spawner' })
		expect(rec?.tmux?.pane).toBe('%9')
		expect(readFileSync(paths.paneFile(root, '%9'), 'utf8')).toBe(res.agent.id)
		expect(readFileSync(paths.briefFile(root, res.agent.id), 'utf8')).toBe('reply to alice')
	})

	it('takes the brief from a file too', () => {
		const bf = join(root, '..', 'brief.txt')
		writeFileSync(bf, 'from file')
		const res = spawn(ctx(), { harness: 'codex', briefFile: bf })
		expect(readFileSync(paths.briefFile(root, res.agent.id), 'utf8')).toBe('from file')
	})

	it('resolveBrief reads --task - from stdin, and --task text / --brief-file too', () => {
		const bf = join(root, '..', 'b2.txt')
		writeFileSync(bf, 'file brief')
		expect(resolveBrief({ task: '-' }, () => 'stdin brief')).toBe('stdin brief')
		expect(resolveBrief({ task: 'inline' })).toBe('inline')
		expect(resolveBrief({ briefFile: bf })).toBe('file brief')
		expect(resolveBrief({})).toBeNull()
	})
})

describe('per-harness launch', () => {
	it.each([
		['claude', 'claude'],
		['cursor', 'cursor-agent'],
		['codex', 'codex'],
	])('starts the %s pane with its own CLI', (harness, launch) => {
		const res = spawn(ctx(), { harness, task: 't' })
		expect(res.launch).toBe(launch)
		expect(sent.at(-1)).toEqual(['send-keys', '-t', '%9', launch, 'Enter'])
	})
})

describe('spawn errors', () => {
	it('errors on an unmapped harness without launching', () => {
		expect(() => spawn(ctx(), { harness: 'grok', task: 't' })).toThrow(/launch map/)
	})
	it('errors when no brief source is supplied', () => {
		expect(() => spawn(ctx(), { harness: 'claude' })).toThrow(/brief/)
	})
	it('errors when neither tmux nor herdr is detected', () => {
		const noBackend: IdContext = { root, env: {}, exec: fakeExec }
		expect(() => spawn(noBackend, { harness: 'claude', task: 't' })).toThrow(/tmux/)
	})
})

describe('spawn creates a real worktree-ship (ADR-0022 decision 8)', () => {
	it('creates a git worktree distinct from the primary checkout and opens the session there', () => {
		const res = spawn(ctx(), { harness: 'claude', task: 't' })
		const expectedPath = resolve(paths.worktreeDir(root, res.agent.id))
		expect(res.agent.worktree?.root).toBe(expectedPath)
		expect(res.agent.cwd).toBe(expectedPath)
		// git worktree add ran against the primary root, not the ship path
		const addCall = worktreeAddCalls[0]!
		expect(addCall).toEqual(expect.arrayContaining(['-C', primaryRoot, 'worktree', 'add']))
	})

	it('opens the tmux pane with -c set to the new worktree root, not the caller cwd', () => {
		const openCalls: string[][] = []
		const exec: Exec = (cmd, args) => {
			if (cmd === 'git') {
				if (args.includes('--git-common-dir')) return `${primaryRoot}/.git`
				if (args.includes('worktree')) return ''
				return null
			}
			if (args[0] === 'split-window') {
				openCalls.push(args)
				return '%9'
			}
			return null
		}
		const res = spawn({ root, env: { TMUX: 't' }, exec, now: () => 1 }, { harness: 'claude', task: 't' })
		const expectedPath = resolve(paths.worktreeDir(root, res.agent.id))
		expect(openCalls[0]).toEqual(['split-window', '-h', '-c', expectedPath, '-P', '-F', '#{pane_id}'])
	})

	it('accepts an explicit --branch and --worktree-path', () => {
		const custom = join(root, '..', 'custom-ship')
		const res = spawn(ctx(), { harness: 'claude', task: 't', branch: 'my-branch', worktreePath: custom })
		expect(res.agent.worktree).toEqual({ root: resolve(custom), branch: 'my-branch' })
		const addCall = worktreeAddCalls[0]!
		expect(addCall).toEqual(['-C', primaryRoot, 'worktree', 'add', '-b', 'my-branch', custom])
	})
})

describe('the flagship rule refuses a ship that resolves onto the primary checkout', () => {
	it('throws a clear error rather than opening a session in the primary', () => {
		const exec: Exec = (cmd, args) => {
			if (cmd === 'git') {
				if (args.includes('--git-common-dir')) return `${primaryRoot}/.git`
				if (args.includes('worktree')) return ''
				return null
			}
			return null
		}
		expect(() =>
			spawn({ root, env: { TMUX: 't' }, exec }, { harness: 'claude', task: 't', worktreePath: primaryRoot }),
		).toThrow(/primary checkout/)
	})
})

describe('backend selection: herdr', () => {
	it('spawns via the herdr adapter when $HERDR_ENV is set and no $TMUX', () => {
		const herdrCalls: string[][] = []
		const exec: Exec = (cmd, args) => {
			if (cmd === 'git') {
				if (args.includes('--git-common-dir')) return `${primaryRoot}/.git`
				if (args.includes('worktree')) return ''
				return null
			}
			if (cmd === 'herdr') {
				herdrCalls.push(args)
				if (args[1] === 'split') return 'herdr-pane-1'
				return null
			}
			return null
		}
		const res = spawn({ root, env: { HERDR_ENV: '1' }, exec }, { harness: 'claude', task: 't' })
		expect(res.pane).toBe('herdr-pane-1')
		expect(herdrCalls[0]).toEqual(['pane', 'split', '--current', '--direction', 'right', '--cwd', res.agent.cwd])
		expect(herdrCalls[1]).toEqual(['pane', 'run', 'herdr-pane-1', 'claude'])
		expect(loadAgent(root, res.agent.id)?.tmux).toBeNull()
	})
})
