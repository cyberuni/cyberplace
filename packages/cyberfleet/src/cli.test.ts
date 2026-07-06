import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeEach, describe, expect, it } from 'vitest'

// Exercises the actual built CLI entrypoint (bin → dist/cli.mjs) end-to-end. Mechanism-verb
// behavior (register/who/send/inbox/read/ack/spawn/decommission/install/prune) now lives in — and
// is tested by — cyberlegion; this file keeps smoke coverage for cyberfleet's own fleet-layer verbs
// (mode/missions/jump/pause/gate approve) plus a basic wiring check.

const BIN = fileURLToPath(new URL('../bin/cyberfleet.mjs', import.meta.url))

let work: string
let root: string
beforeEach(() => {
	work = mkdtempSync(join(tmpdir(), 'cf-'))
	root = join(work, '.agents', 'cyberlegion')
})

function cf(args: string[], env: Record<string, string> = {}, cwd?: string): string {
	return execFileSync('node', [BIN, ...args, '--root', root], {
		encoding: 'utf8',
		env: { ...process.env, CYBERLEGION_AGENT_ID: '', ...env },
		...(cwd ? { cwd } : {}),
	})
}

describe('cli wiring', () => {
	it('--help lists the fleet verb surface', () => {
		const out = execFileSync('node', [BIN, '--help'], { encoding: 'utf8' })
		for (const verb of ['register', 'who', 'mode', 'send', 'inbox', 'read', 'spawn', 'missions', 'jump', 'pause']) {
			expect(out).toContain(verb)
		}
	})
})

describe('mode', () => {
	it('reports command-center with the shared fleet root (TOON output)', () => {
		const out = cf(['mode'], {}, work)
		expect(out).toContain('mode: command-center')
		expect(out).toContain(`fleetRoot: ${root}`)
	})
})

describe('fleet verbs', () => {
	it('pause flips the ship record to status:paused and flags the SDD-bridge gap', () => {
		cf(['register', '--handle', 'alice', '--harness', 'codex'], { CYBERLEGION_AGENT_ID: 'alice1' })
		const out = cf(['pause', 'alice'])
		expect(out).toContain('paused: alice')
		expect(out).toContain('status: paused')
	})

	it("jump prints the ship's cwd when there is no live tmux pane to select", () => {
		cf(['register', '--handle', 'alice', '--harness', 'codex'], { CYBERLEGION_AGENT_ID: 'alice1' }, work)
		const out = cf(['jump', 'alice'], {}, work)
		expect(out.trim()).toBe(work)
	})

	it('gate approve is a stub that prints what it would write and exits non-zero', () => {
		expect(() => cf(['gate', 'approve', 'some-cr', 'spec'])).toThrow()
	})

	it('missions --json emits an array shaped by the mission row schema', () => {
		cf(['register', '--handle', 'alice', '--harness', 'codex'], { CYBERLEGION_AGENT_ID: 'alice1' }, work)
		const out = cf(['missions', '--format', 'json', '--agents-root', work])
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
		cf(['register', '--handle', 'alice', '--harness', 'codex'], { CYBERLEGION_AGENT_ID: 'alice1' })
		const rec = JSON.parse(readFileSync(join(root, 'agents', 'alice1.json'), 'utf8'))
		rec.worktree = { root: join(work, 'worktree'), branch: 'add-fleet-comms' }
		writeFileSync(join(root, 'agents', 'alice1.json'), JSON.stringify(rec))
		const out = cf(['missions', '--format', 'json', '--agents-root', work], { CYBERLEGION_AGENT_ID: 'alice1' })
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
