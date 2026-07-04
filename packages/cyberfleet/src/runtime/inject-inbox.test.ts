import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { type AgentRecord, register, saveAgent } from '../identity.ts'
import { send } from '../message.ts'
import { paths } from '../paths.ts'
import { injectInbox } from './inject-inbox.ts'

let root: string
let bob: AgentRecord
beforeEach(() => {
	root = join(mkdtempSync(join(tmpdir(), 'cf-')), '.cyberfleet')
	const alice = register(
		{ root, env: { TMUX: 't', TMUX_PANE: '%1' }, exec: () => null },
		{ handle: 'alice', harness: 'claude' },
	)
	bob = register({ root, env: { TMUX: 't', TMUX_PANE: '%2' }, exec: () => null }, { handle: 'bob', harness: 'cursor' })
	send({ root, now: () => 1 }, { fromId: alice.id, to: 'bob', body: 'ping' })
})

const bobCtx = () => ({ root, env: { CYBERFLEET_AGENT_ID: bob.id } })

describe('inbox --hook emits the SessionStart payload', () => {
	it('emits additionalContext with unread mail', () => {
		const payload = injectInbox(bobCtx(), 'SessionStart')
		expect(payload?.hookSpecificOutput.hookEventName).toBe('SessionStart')
		expect(payload?.hookSpecificOutput.additionalContext).toContain('ping')
	})

	it('surfaces a spawned peer brief with no mail present', () => {
		// A fresh peer with a pending brief and an empty inbox — isolates the "and no mail" precondition.
		const peer = register(
			{ root, env: { TMUX: 't', TMUX_PANE: '%9' }, exec: () => null },
			{ handle: 'peer', harness: 'claude' },
		)
		saveAgent(root, { ...peer, status: 'spawning' })
		mkdirSync(paths.dataDir(root, peer.id), { recursive: true })
		writeFileSync(paths.briefFile(root, peer.id), 'do the migration')
		const payload = injectInbox({ root, env: { CYBERFLEET_AGENT_ID: peer.id } }, 'SessionStart')
		expect(payload?.hookSpecificOutput.additionalContext).toContain('do the migration')
		expect(payload?.hookSpecificOutput.additionalContext).not.toContain('Unread')
	})
})

describe('empty / error cases', () => {
	it('injects nothing when there is no unread mail and no brief', () => {
		const solo = register(
			{ root, env: { CYBERFLEET_AGENT_ID: 'lone', TMUX_PANE: '%9' }, exec: () => null },
			{ handle: 'lone', harness: 'claude' },
		)
		expect(injectInbox({ root, env: { CYBERFLEET_AGENT_ID: solo.id } }, 'SessionStart')).toBeNull()
	})

	it('injects nothing (no error) for an unregistered caller', () => {
		expect(injectInbox({ root, env: {} }, 'SessionStart')).toBeNull()
	})

	it('rejects an unsupported --event', () => {
		expect(() => injectInbox(bobCtx(), 'Frobnicate')).toThrow(/unsupported/)
	})
})
