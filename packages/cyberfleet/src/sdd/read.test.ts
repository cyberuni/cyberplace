import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeEach, describe, expect, it } from 'vitest'
import { hasHalt, readLedgerState, readPlanBrief, readSpecStatus } from './read.ts'

let root: string
beforeEach(() => {
	root = mkdtempSync(join(tmpdir(), 'cf-sdd-'))
})

function writeLedgerShard(project: string, shard: string, lines: object[]): void {
	const dir = join(root, '.agents', 'specs', project, 'ledger')
	mkdirSync(dir, { recursive: true })
	writeFileSync(join(dir, shard), `${lines.map((l) => JSON.stringify(l)).join('\n')}\n`)
}

function writeLegacyLedger(project: string, lines: object[]): void {
	const dir = join(root, '.agents', 'specs', project)
	mkdirSync(dir, { recursive: true })
	writeFileSync(join(dir, 'ledger.jsonl'), `${lines.map((l) => JSON.stringify(l)).join('\n')}\n`)
}

describe('readLedgerState', () => {
	it('returns all-null with an unresolved project when there is no .agents at all', () => {
		const state = readLedgerState(root, 'nope')
		expect(state).toEqual({ project: null, gates: { spec: null, impl: null }, leash: null })
	})

	it('reads leash + gate lines from a sharded ledger dir', () => {
		writeLedgerShard('cyberspace', 'add-fleet-comms.f1e2d3.jsonl', [
			{ kind: 'leash', cr: 'add-fleet-comms', leash: 'auto-spec', by: 'derived' },
			{ kind: 'gate', cr: 'add-fleet-comms', gate: 'spec', verdict: 'approve', by: 'agent' },
			{ kind: 'gate', cr: 'add-fleet-comms', gate: 'impl', verdict: 'approve', by: 'agent' },
		])
		const state = readLedgerState(root, 'add-fleet-comms')
		expect(state.project).toBe('cyberspace')
		expect(state.leash).toEqual({ leash: 'auto-spec', by: 'derived' })
		expect(state.gates.spec).toEqual({ gate: 'spec', verdict: 'approve', by: 'agent' })
		expect(state.gates.impl).toEqual({ gate: 'impl', verdict: 'approve', by: 'agent' })
	})

	it('concatenates the legacy single-file ledger alongside sharded files', () => {
		writeLegacyLedger('sdd', [{ kind: 'gate', cr: 'old-cr', gate: 'spec', verdict: 'approve', by: 'unional' }])
		const state = readLedgerState(root, 'old-cr')
		expect(state.project).toBe('sdd')
		expect(state.gates.spec?.by).toBe('unional')
	})

	it('supports the single-project convention (.agents/spec), named "repo"', () => {
		const dir = join(root, '.agents', 'spec', 'ledger')
		mkdirSync(dir, { recursive: true })
		writeFileSync(
			join(dir, 'foo.abcdef.jsonl'),
			`${JSON.stringify({ kind: 'gate', cr: 'foo', gate: 'impl', verdict: 'reject', by: 'agent' })}\n`,
		)
		const state = readLedgerState(root, 'foo')
		expect(state.project).toBe('repo')
		expect(state.gates.impl?.verdict).toBe('reject')
	})

	it('takes the latest matching gate line when a shard has more than one for the same gate', () => {
		writeLedgerShard('cyberspace', 'x.aaaaaa.jsonl', [
			{ kind: 'gate', cr: 'x', gate: 'spec', verdict: 'pause', by: 'agent' },
			{ kind: 'gate', cr: 'x', gate: 'spec', verdict: 'approve', by: 'unional' },
		])
		const state = readLedgerState(root, 'x')
		expect(state.gates.spec).toEqual({ gate: 'spec', verdict: 'approve', by: 'unional' })
	})

	it('skips malformed lines defensively, never throws', () => {
		writeLedgerShard('cyberspace', 'y.bbbbbb.jsonl', [])
		writeFileSync(
			join(root, '.agents', 'specs', 'cyberspace', 'ledger', 'y.bbbbbb.jsonl'),
			'not json\n{"kind":"gate","cr":"y","gate":"spec","verdict":"approve","by":"agent"}\n',
		)
		expect(() => readLedgerState(root, 'y')).not.toThrow()
		expect(readLedgerState(root, 'y').gates.spec?.verdict).toBe('approve')
	})
})

describe('hasHalt', () => {
	it('is false when the combat log is absent', () => {
		expect(hasHalt(root, 'nope')).toBe(false)
	})

	it('is true when a halt line is present', () => {
		const dir = join(root, '.agents', 'plans')
		mkdirSync(dir, { recursive: true })
		writeFileSync(
			join(dir, 'foo.log.jsonl'),
			`${JSON.stringify({ kind: 'report', outcome: 'pass' })}\n${JSON.stringify({ kind: 'halt', phase: 'explore' })}\n`,
		)
		expect(hasHalt(root, 'foo')).toBe(true)
	})

	it('is false when the combat log has entries but no halt', () => {
		const dir = join(root, '.agents', 'plans')
		mkdirSync(dir, { recursive: true })
		writeFileSync(join(dir, 'bar.log.jsonl'), `${JSON.stringify({ kind: 'report', outcome: 'pass' })}\n`)
		expect(hasHalt(root, 'bar')).toBe(false)
	})
})

describe('readPlanBrief', () => {
	it('returns null when the plan brief is absent', () => {
		expect(readPlanBrief(root, 'nope')).toBeNull()
	})

	it('parses status, todo tally, and the NEXT lead', () => {
		const dir = join(root, '.agents', 'plans')
		mkdirSync(dir, { recursive: true })
		writeFileSync(
			join(dir, 'add-fleet-comms.plan.md'),
			[
				'---',
				'name: add-fleet-comms',
				'status: active',
				'todos:',
				'  - content: "one"',
				'    status: completed',
				'  - content: "two"',
				'    status: in_progress',
				'  - content: "three"',
				'    status: pending',
				'---',
				'',
				'# add-fleet-comms',
				'',
				'## NEXT',
				'',
				'- **Push the branch and open a PR.**',
				'',
			].join('\n'),
		)
		const brief = readPlanBrief(root, 'add-fleet-comms')
		expect(brief).toEqual({ status: 'active', total: 3, completed: 1, next: 'Push the branch and open a PR.' })
	})

	it('defaults status to active when unset', () => {
		const dir = join(root, '.agents', 'plans')
		mkdirSync(dir, { recursive: true })
		writeFileSync(join(dir, 'x.plan.md'), '---\nname: x\ntodos:\n  - status: completed\n---\n')
		expect(readPlanBrief(root, 'x')?.status).toBe('active')
	})

	it('returns null for a stray .plan.md with no frontmatter block', () => {
		const dir = join(root, '.agents', 'plans')
		mkdirSync(dir, { recursive: true })
		writeFileSync(join(dir, 'stray.plan.md'), 'just some text, no frontmatter\n')
		expect(readPlanBrief(root, 'stray')).toBeNull()
	})
})

describe('readSpecStatus', () => {
	it('returns null when the spec.md is absent', () => {
		expect(readSpecStatus(root, 'cyberspace')).toBeNull()
	})

	it('reads a multi-project spec.md status', () => {
		const dir = join(root, '.agents', 'specs', 'cyberspace')
		mkdirSync(dir, { recursive: true })
		writeFileSync(join(dir, 'spec.md'), '---\nstatus: implemented\nproject-path: plugins/cyberspace\n---\n\n# x\n')
		expect(readSpecStatus(root, 'cyberspace')).toBe('implemented')
	})

	it('reads the single-project spec.md status for "repo"', () => {
		const dir = join(root, '.agents', 'spec')
		mkdirSync(dir, { recursive: true })
		writeFileSync(join(dir, 'spec.md'), '---\nstatus: draft\n---\n')
		expect(readSpecStatus(root, 'repo')).toBe('draft')
	})
})
