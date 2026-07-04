import { execFileSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
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

function cf(args: string[], env: Record<string, string> = {}): string {
	return execFileSync('node', [BIN, ...args, '--root', root], {
		encoding: 'utf8',
		env: { ...process.env, CYBERFLEET_AGENT_ID: '', ...env },
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
})
