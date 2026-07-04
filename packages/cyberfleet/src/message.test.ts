import { existsSync, mkdtempSync, readdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { type AgentRecord, register } from './identity.ts'
import { inbox, read, send } from './message.ts'
import { paths } from './paths.ts'

let root: string
let alice: AgentRecord
let bob: AgentRecord

beforeEach(() => {
	root = join(mkdtempSync(join(tmpdir(), 'cf-')), '.cyberfleet')
	alice = register(
		{ root, env: { TMUX: 't', TMUX_PANE: '%1' }, exec: () => null },
		{ handle: 'alice', harness: 'claude' },
	)
	bob = register({ root, env: { TMUX: 't', TMUX_PANE: '%2' }, exec: () => null }, { handle: 'bob', harness: 'cursor' })
})

const at = (t: number) => ({ root, now: () => t })

describe('send', () => {
	it('writes exactly one message file into the recipient inbox', () => {
		send(at(1), { fromId: alice.id, to: 'bob', body: 'ping' })
		const files = readdirSync(paths.inboxDir(root, bob.id))
		expect(files).toHaveLength(1)
		const items = inbox({ root }, { meId: bob.id })
		expect(items[0]).toMatchObject({ from: alice.id, to: bob.id, body: 'ping' })
	})

	it('addresses by handle or by id', () => {
		send(at(1), { fromId: alice.id, to: 'bob', body: 'a' })
		send(at(2), { fromId: alice.id, to: bob.id, body: 'b' })
		expect(inbox({ root }, { meId: bob.id })).toHaveLength(2)
	})

	it('errors on an unknown recipient without writing a partial file', () => {
		expect(() => send(at(1), { fromId: alice.id, to: 'ghost', body: 'hi' })).toThrow(/ghost/)
		expect(existsSync(paths.inboxDir(root, 'ghost'))).toBe(false)
	})
})

describe('collision-free, time-ordered names', () => {
	it('sorts chronologically by filename', () => {
		send(at(1000), { fromId: alice.id, to: 'bob', body: 'first' })
		send(at(2000), { fromId: alice.id, to: 'bob', body: 'second' })
		expect(inbox({ root }, { meId: bob.id }).map((m) => m.body)).toEqual(['first', 'second'])
	})

	it('two sends in the same millisecond do not clobber each other', () => {
		send(at(5000), { fromId: alice.id, to: 'bob', body: 'x' })
		send(at(5000), { fromId: alice.id, to: 'bob', body: 'y' })
		expect(readdirSync(paths.inboxDir(root, bob.id))).toHaveLength(2)
	})
})

describe('inbox', () => {
	it('--unread lists only un-acked; --from filters; empty reports nothing', () => {
		expect(inbox({ root }, { meId: bob.id })).toEqual([])
		const m = send(at(1), { fromId: alice.id, to: 'bob', body: 'a' })
		send(at(2), { fromId: alice.id, to: 'bob', body: 'b' })
		read({ root }, bob.id, m.id)
		expect(inbox({ root }, { meId: bob.id, unread: true }).map((x) => x.body)).toEqual(['b'])
		expect(inbox({ root }, { meId: bob.id, from: 'alice' })).toHaveLength(2)
	})
})

describe('read prints + acks by move', () => {
	it('moves the message to read/ and drops it from the unread set', () => {
		const m = send(at(1), { fromId: alice.id, to: 'bob', body: 'hello' })
		const got = read({ root }, bob.id, m.id)
		expect(got.body).toBe('hello')
		expect(existsSync(join(paths.inboxReadDir(root, bob.id), `${m.id}.json`))).toBe(true)
		expect(existsSync(join(paths.inboxDir(root, bob.id), `${m.id}.json`))).toBe(false)
		expect(inbox({ root }, { meId: bob.id, unread: true })).toEqual([])
	})

	it('errors on an unknown or already-acked message', () => {
		const m = send(at(1), { fromId: alice.id, to: 'bob', body: 'once' })
		read({ root }, bob.id, m.id)
		expect(() => read({ root }, bob.id, m.id)).toThrow(/not an unread/)
		expect(() => read({ root }, bob.id, '9999-deadbe')).toThrow()
	})
})
