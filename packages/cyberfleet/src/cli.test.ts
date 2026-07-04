import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeEach, describe, expect, it } from 'vitest'

// Exercises the actual built CLI entrypoint (bin → dist/cli.mjs) end-to-end.
const BIN = fileURLToPath(new URL('../bin/cyberfleet.mjs', import.meta.url))

let work: string
let root: string
beforeEach(() => {
	work = mkdtempSync(join(tmpdir(), 'cf-'))
	root = join(work, '.cyberfleet')
})

function cf(args: string[], env: Record<string, string> = {}, cwd?: string): string {
	return execFileSync('node', [BIN, ...args, '--root', root], {
		encoding: 'utf8',
		env: { ...process.env, CYBERFLEET_AGENT_ID: '', ...env },
		...(cwd ? { cwd } : {}),
	})
}

describe('cli end-to-end', () => {
	it('who prints the cwd column and value', () => {
		cf(['register', '--handle', 'alice', '--harness', 'codex'], { CYBERFLEET_AGENT_ID: 'alice1' })
		const out = cf(['who'])
		expect(out).toMatch(/\bCWD\b/)
		expect(out).toContain(process.cwd())
	})

	it('send --body-file delivers the file body to the peer inbox', () => {
		cf(['register', '--handle', 'alice', '--harness', 'codex'], { CYBERFLEET_AGENT_ID: 'alice1' })
		cf(['register', '--handle', 'bob', '--harness', 'cursor'], { CYBERFLEET_AGENT_ID: 'bob1' })
		const bf = join(work, 'msg.txt')
		writeFileSync(bf, 'from a file')
		cf(['send', '--to', 'bob', '--body-file', bf], { CYBERFLEET_AGENT_ID: 'alice1' })
		const unread = cf(['inbox', '--unread'], { CYBERFLEET_AGENT_ID: 'bob1' })
		expect(unread).toContain('from a file')
	})

	it('inbox --hook emits the SessionStart payload over the wire', () => {
		cf(['register', '--handle', 'alice', '--harness', 'codex'], { CYBERFLEET_AGENT_ID: 'alice1' })
		cf(['register', '--handle', 'bob', '--harness', 'cursor'], { CYBERFLEET_AGENT_ID: 'bob1' })
		cf(['send', '--to', 'bob', '--body', 'hook me'], { CYBERFLEET_AGENT_ID: 'alice1' })
		const out = cf(['inbox', '--hook', '--event', 'SessionStart'], { CYBERFLEET_AGENT_ID: 'bob1' })
		const payload = JSON.parse(out)
		expect(payload.hookSpecificOutput.hookEventName).toBe('SessionStart')
		expect(payload.hookSpecificOutput.additionalContext).toContain('hook me')
	})

	it('ack is a thin alias of read — prints and moves the message to acked', () => {
		cf(['register', '--handle', 'alice', '--harness', 'codex'], { CYBERFLEET_AGENT_ID: 'alice1' })
		cf(['register', '--handle', 'bob', '--harness', 'cursor'], { CYBERFLEET_AGENT_ID: 'bob1' })
		cf(['send', '--to', 'bob', '--body', 'ack me', '--subject', 'hi'], { CYBERFLEET_AGENT_ID: 'alice1' })
		const unread = cf(['inbox', '--unread'], { CYBERFLEET_AGENT_ID: 'bob1' })
		const msgId = /^\*\s+(\S+)/.exec(unread)?.[1]
		expect(msgId).toBeTruthy()
		const acked = cf(['ack', msgId!], { CYBERFLEET_AGENT_ID: 'bob1' })
		expect(acked).toContain('acked')
		const afterUnread = cf(['inbox', '--unread'], { CYBERFLEET_AGENT_ID: 'bob1' })
		expect(afterUnread).toContain('no unread mail')
	})

	it('pause flips the ship record to status:paused and flags the SDD-bridge gap', () => {
		cf(['register', '--handle', 'alice', '--harness', 'codex'], { CYBERFLEET_AGENT_ID: 'alice1' })
		const out = cf(['pause', 'alice'])
		expect(out).toContain('paused')
		const who = cf(['who', '--all'])
		expect(who).toContain('paused')
	})

	it("jump prints the ship's cwd when there is no live tmux pane to select", () => {
		cf(['register', '--handle', 'alice', '--harness', 'codex'], { CYBERFLEET_AGENT_ID: 'alice1' }, work)
		const out = cf(['jump', 'alice'], {}, work)
		expect(out.trim()).toBe(work)
	})

	it('gate approve is a stub that prints what it would write and exits non-zero', () => {
		expect(() => cf(['gate', 'approve', 'some-cr', 'spec'])).toThrow()
	})

	it('missions --json emits an array shaped by the mission row schema', () => {
		cf(['register', '--handle', 'alice', '--harness', 'codex'], { CYBERFLEET_AGENT_ID: 'alice1' }, work)
		const out = cf(['missions', '--json', '--agents-root', work])
		const rows = JSON.parse(out)
		expect(Array.isArray(rows)).toBe(true)
		expect(rows).toHaveLength(1)
		expect(rows[0]).toMatchObject({ handle: 'alice', cr: null, needsCouncil: false, hal: false })
	})

	it('missions --json joins a ship to a real SDD ledger fixture (gate/leash/hal end to end)', () => {
		const project = 'cyberspace'
		mkdirSync(join(work, '.agents', 'specs', project, 'ledger'), { recursive: true })
		writeFileSync(
			join(work, '.agents', 'specs', project, 'ledger', 'add-fleet-comms.f1e2d3.jsonl'),
			[
				JSON.stringify({ kind: 'leash', cr: 'add-fleet-comms', leash: 'auto-spec', by: 'derived' }),
				JSON.stringify({ kind: 'gate', cr: 'add-fleet-comms', gate: 'spec', verdict: 'approve', by: 'agent' }),
				JSON.stringify({ kind: 'gate', cr: 'add-fleet-comms', gate: 'impl', verdict: 'approve', by: 'agent' }),
			].join('\n'),
		)
		writeFileSync(join(work, '.agents', 'specs', project, 'spec.md'), '---\nstatus: implemented\n---\n')
		// The fleet registry has no worktree-writing verb exercised here, so hand-write the record
		// with a worktree.branch matching the ledger's cr (the ship↔CR join key).
		cf(['register', '--handle', 'alice', '--harness', 'codex'], { CYBERFLEET_AGENT_ID: 'alice1' })
		const rec = JSON.parse(readFileSync(join(root, 'agents', 'alice1.json'), 'utf8'))
		rec.worktree = { root: join(work, 'worktree'), branch: 'add-fleet-comms' }
		writeFileSync(join(root, 'agents', 'alice1.json'), JSON.stringify(rec))
		const out = cf(['missions', '--json', '--agents-root', work], { CYBERFLEET_AGENT_ID: 'alice1' })
		const rows = JSON.parse(out)
		expect(rows[0]).toMatchObject({
			handle: 'alice',
			cr: 'add-fleet-comms',
			spec: { status: 'implemented' },
			leash: 'auto-spec',
			gate: { spec: { verdict: 'approve', by: 'agent' }, impl: { verdict: 'approve', by: 'agent' } },
			needsCouncil: true,
			hal: true,
		})
	})
})
