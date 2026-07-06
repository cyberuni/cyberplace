import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { AgentRecord } from 'cyberlegion'
import { beforeEach, describe, expect, it } from 'vitest'
import { buildMissionRow, buildMissions } from './missions.ts'

let agentsRoot: string
beforeEach(() => {
	agentsRoot = mkdtempSync(join(tmpdir(), 'cf-missions-'))
})

function agent(overrides: Partial<AgentRecord> = {}): AgentRecord {
	return {
		id: 'a1',
		handle: 'alice',
		harness: 'claude',
		cwd: '/work',
		status: 'active',
		createdAt: '2026-01-01T00:00:00.000Z',
		lastSeen: '2026-01-01T00:00:00.000Z',
		...overrides,
	}
}

function seedMission(cr: string, project: string) {
	mkdirSync(join(agentsRoot, '.agents', 'specs', project, 'ledger'), { recursive: true })
	writeFileSync(
		join(agentsRoot, '.agents', 'specs', project, 'ledger', `${cr}.abc123.jsonl`),
		[
			JSON.stringify({ kind: 'leash', cr, leash: 'auto-spec', by: 'derived' }),
			JSON.stringify({ kind: 'gate', cr, gate: 'spec', verdict: 'approve', by: 'agent' }),
			JSON.stringify({ kind: 'gate', cr, gate: 'impl', verdict: 'approve', by: 'agent' }),
		].join('\n'),
	)
	writeFileSync(join(agentsRoot, '.agents', 'specs', project, 'spec.md'), '---\nstatus: implemented\n---\n')
	mkdirSync(join(agentsRoot, '.agents', 'plans'), { recursive: true })
	writeFileSync(
		join(agentsRoot, '.agents', 'plans', `${cr}.plan.md`),
		[
			'---',
			`name: ${cr}`,
			'status: active',
			'todos:',
			'  - status: completed',
			'  - status: in_progress',
			'---',
			'',
			'## NEXT',
			'',
			'- push and open the PR',
			'',
		].join('\n'),
	)
}

describe('buildMissionRow — ship→CR join', () => {
	it('joins on worktree.branch and derives mission/spec/gate/leash/hal/needsCouncil', () => {
		seedMission('add-fleet-comms', 'cyberspace')
		const row = buildMissionRow(
			agentsRoot,
			agent({ worktree: { root: '/w/add-fleet-comms', branch: 'add-fleet-comms' } }),
		)
		expect(row.cr).toBe('add-fleet-comms')
		expect(row.mission).toEqual({ status: 'active', completed: 1, total: 2, next: 'push and open the PR' })
		expect(row.spec).toEqual({ status: 'implemented' })
		expect(row.gate.spec).toEqual({ verdict: 'approve', by: 'agent' })
		expect(row.gate.impl).toEqual({ verdict: 'approve', by: 'agent' })
		expect(row.leash).toBe('auto-spec')
		// auto-spec + impl by:agent → above leash
		expect(row.hal).toBe(true)
		// any by:agent gate → awaiting ratification
		expect(row.needsCouncil).toBe(true)
	})

	it('never throws and returns all-null SDD fields for a ship with no worktree/branch', () => {
		const row = buildMissionRow(agentsRoot, agent({ worktree: null }))
		expect(row.cr).toBeNull()
		expect(row.mission).toBeNull()
		expect(row.spec).toBeNull()
		expect(row.gate).toEqual({ spec: null, impl: null })
		expect(row.leash).toBeNull()
		expect(row.needsCouncil).toBe(false)
		expect(row.hal).toBe(false)
	})

	it('is defensive when .agents/ does not exist at all (cyberfleet used standalone)', () => {
		const bareRoot = mkdtempSync(join(tmpdir(), 'cf-bare-'))
		expect(() => buildMissionRow(bareRoot, agent({ worktree: { root: '/w/x', branch: 'some-branch' } }))).not.toThrow()
		const row = buildMissionRow(bareRoot, agent({ worktree: { root: '/w/x', branch: 'some-branch' } }))
		expect(row.cr).toBe('some-branch')
		expect(row.mission).toBeNull()
		expect(row.gate).toEqual({ spec: null, impl: null })
	})
})

describe('buildMissions', () => {
	it('maps the whole fleet registry to mission rows', () => {
		seedMission('add-fleet-comms', 'cyberspace')
		const agents = [
			agent({ id: 'a1', handle: 'alice', worktree: { root: '/w/1', branch: 'add-fleet-comms' } }),
			agent({ id: 'a2', handle: 'bob', worktree: null }),
		]
		const rows = buildMissions(agentsRoot, agents)
		expect(rows).toHaveLength(2)
		expect(rows[0].handle).toBe('alice')
		expect(rows[0].cr).toBe('add-fleet-comms')
		expect(rows[1].handle).toBe('bob')
		expect(rows[1].cr).toBeNull()
	})
})
