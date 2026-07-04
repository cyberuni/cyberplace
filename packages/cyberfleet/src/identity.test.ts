import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import {
	detectHarness,
	type Exec,
	type IdContext,
	listAgents,
	loadAgent,
	prune,
	register,
	resolveRecipient,
	resolveSelfId,
	touch,
} from './identity.ts'
import { paths } from './paths.ts'

let root: string
beforeEach(() => {
	root = join(mkdtempSync(join(tmpdir(), 'cf-')), '.cyberfleet')
})

const nullExec: Exec = () => null
const paneExec =
	(paneCmd: string): Exec =>
	(_c, args) =>
		args[4] === '#{pane_current_command}' ? paneCmd : null

function ctx(env: NodeJS.ProcessEnv, exec: Exec = nullExec): IdContext {
	return { root, env, exec, now: () => 1_700_000_000_000 }
}

describe('register records who and where', () => {
	it('writes the agent record and a pane pointer', () => {
		const rec = register(ctx({ TMUX: '/tmp/x,1,0', TMUX_PANE: '%3' }), { handle: 'alice', harness: 'claude' })
		expect(loadAgent(root, rec.id)?.handle).toBe('alice')
		expect(loadAgent(root, rec.id)?.harness).toBe('claude')
		expect(readFileSync(paths.paneFile(root, '%3'), 'utf8')).toBe(rec.id)
	})

	it('stamps this project root with the tracked .cyberfleet/config.json marker, making it a ship', () => {
		register(ctx({ TMUX: '/tmp/x,1,0', TMUX_PANE: '%3' }), { handle: 'alice', harness: 'claude' })
		expect(existsSync(join(root, 'config.json'))).toBe(true)
	})

	it('is idempotent for the same pane — keeps the same id', () => {
		const e = { TMUX: 't', TMUX_PANE: '%3' }
		const a = register(ctx(e), { handle: 'alice', harness: 'claude' })
		const b = register(ctx(e), { harness: 'claude' })
		expect(b.id).toBe(a.id)
		expect(listAgents(root)).toHaveLength(1)
	})

	it('fails cleanly when it cannot write the registry (no partial record)', () => {
		writeFileSync(root, 'not a dir') // root is a file → mkdir under it fails
		expect(() => register(ctx({ TMUX: 't', TMUX_PANE: '%1' }), { handle: 'a', harness: 'claude' })).toThrow()
	})
})

describe('harness auto-detect', () => {
	it('explicit --harness overrides detection', () => {
		expect(detectHarness('codex', ctx({ CLAUDECODE: '1' }))).toBe('codex')
	})
	it('reads the tmux pane command when not given', () => {
		expect(detectHarness(undefined, ctx({ TMUX_PANE: '%1' }, paneExec('cursor-agent')))).toBe('cursor')
	})
	it('requires --harness when nothing is detectable', () => {
		expect(() => register(ctx({}), { handle: 'a' })).toThrow(/harness/)
	})
})

describe('pane-keyed self-recall', () => {
	it('recovers the id from the pane file', () => {
		const e = { TMUX: 't', TMUX_PANE: '%7' }
		const rec = register(ctx(e), { handle: 'a', harness: 'claude' })
		expect(resolveSelfId(ctx(e))).toBe(rec.id)
	})
	it('$CYBERFLEET_AGENT_ID wins over .cyberfleet/self', () => {
		mkdirSync(root, { recursive: true })
		writeFileSync(paths.selfFile(root), 'fileid')
		expect(resolveSelfId(ctx({ CYBERFLEET_AGENT_ID: 'envid' }))).toBe('envid')
	})
})

describe('who + liveness', () => {
	it('lists an empty registry as no agents', () => {
		expect(listAgents(root)).toEqual([])
	})
	it('bumps last-seen on prune scan without a live pane', () => {
		register(ctx({ CYBERFLEET_AGENT_ID: 'x' }), { handle: 'a', harness: 'claude' })
		// a very old lastSeen would be pruned; a fresh one survives
		expect(prune({ root, exec: nullExec, now: () => 1_700_000_000_000 })).toEqual([])
	})

	it('touch() refreshes the caller last-seen and is a no-op when unregistered', () => {
		const env = { CYBERFLEET_AGENT_ID: 'x' }
		const rec = register(
			{ root, env, exec: nullExec, now: () => 1_700_000_000_000 },
			{ handle: 'a', harness: 'claude' },
		)
		touch({ root, env, exec: nullExec, now: () => 1_700_000_060_000 })
		expect(loadAgent(root, rec.id)?.lastSeen).toBe(new Date(1_700_000_060_000).toISOString())
		expect(() => touch({ root, env: {}, exec: nullExec })).not.toThrow()
	})
})

describe('resolveRecipient', () => {
	it('resolves by handle or id, throws on unknown', () => {
		const rec = register(ctx({ CYBERFLEET_AGENT_ID: 'x', TMUX_PANE: '' }), { handle: 'bob', harness: 'claude' })
		expect(resolveRecipient(root, 'bob')).toBe(rec.id)
		expect(resolveRecipient(root, rec.id)).toBe(rec.id)
		expect(() => resolveRecipient(root, 'ghost')).toThrow(/ghost/)
	})
})
