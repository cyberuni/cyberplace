import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { type Exec, type IdContext, loadAgent } from './identity.ts'
import { paths } from './paths.ts'
import { spawn } from './spawn.ts'

let root: string
let sent: string[][]
beforeEach(() => {
	root = join(mkdtempSync(join(tmpdir(), 'cf-')), '.cyberfleet')
	sent = []
})

const fakeExec: Exec = (_cmd, args) => {
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
	it('errors outside tmux', () => {
		const noTmux: IdContext = { root, env: {}, exec: fakeExec }
		expect(() => spawn(noTmux, { harness: 'claude', task: 't' })).toThrow(/tmux/)
	})
})
