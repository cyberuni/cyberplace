// The query-first fleet view (ADR-0022 decision 10): derive, per ship, its mission/gate/leash/HAL
// state from SDD's durable filesystem state — nothing here is tracked as mutable view state.

import { resolvePrimaryRoot } from './console/worktree.ts'
import type { AgentRecord, AgentStatus, Exec } from './identity.ts'
import { projectRoot } from './paths.ts'
import { computeNeedsCouncil, inferHal } from './sdd/hal.ts'
import { hasHalt, readLedgerState, readPlanBrief, readSpecStatus } from './sdd/read.ts'

/**
 * Resolve the root under which `.agents/` lives — the primary checkout (so `missions` sees the
 * whole fleet's SDD state regardless of which ship's worktree it is invoked from), falling back to
 * this project root when not inside a git repository at all.
 */
export function resolveAgentsRoot(exec: Exec, cwd?: string): string {
	try {
		return resolvePrimaryRoot(exec)
	} catch {
		return projectRoot(cwd)
	}
}

export interface MissionGate {
	verdict: string
	by: string
}

export interface MissionInfo {
	status: string
	completed: number
	total: number
	next: string
}

export interface SpecInfo {
	status: string
}

export interface MissionRow {
	handle: string
	id: string
	worktreeRoot: string | null
	/** The ship's worktree branch — the join key to its SDD `<cr-ref>` (see resolveShip). */
	branch: string | null
	status: AgentStatus
	/** The resolved CR ref (== `branch` by this repo's convention); null when the ship carries no
	 * worktree/branch to join on. */
	cr: string | null
	mission: MissionInfo | null
	spec: SpecInfo | null
	gate: { spec: MissionGate | null; impl: MissionGate | null }
	leash: string | null
	needsCouncil: boolean
	hal: boolean
}

/**
 * Derive one ship's mission row. The ship↔CR join key is `AgentRecord.worktree.branch` — this
 * repo's convention is that a ship's worktree branch equals the `<cr-ref>` its plan brief and
 * ledger shards are filed under (e.g. branch `add-fleet-comms` ↔ `add-fleet-comms.plan.md` ↔
 * ledger shard prefix `add-fleet-comms.*`). A ship with no worktree/branch (not yet spawned into
 * one, or standalone) joins to nothing — every SDD-derived field is null, never thrown.
 */
export function buildMissionRow(agentsRoot: string, agent: AgentRecord): MissionRow {
	const branch = agent.worktree?.branch ?? null
	const base: Pick<MissionRow, 'handle' | 'id' | 'worktreeRoot' | 'branch' | 'status'> = {
		handle: agent.handle,
		id: agent.id,
		worktreeRoot: agent.worktree?.root ?? null,
		branch,
		status: agent.status,
	}
	if (!branch) {
		return {
			...base,
			cr: null,
			mission: null,
			spec: null,
			gate: { spec: null, impl: null },
			leash: null,
			needsCouncil: false,
			hal: false,
		}
	}
	const cr = branch
	const ledger = readLedgerState(agentsRoot, cr)
	const plan = readPlanBrief(agentsRoot, cr)
	const specStatus = ledger.project ? readSpecStatus(agentsRoot, ledger.project) : null
	const halt = hasHalt(agentsRoot, cr)
	return {
		...base,
		cr,
		mission: plan ? { status: plan.status, completed: plan.completed, total: plan.total, next: plan.next } : null,
		spec: specStatus ? { status: specStatus } : null,
		gate: {
			spec: ledger.gates.spec ? { verdict: ledger.gates.spec.verdict, by: ledger.gates.spec.by } : null,
			impl: ledger.gates.impl ? { verdict: ledger.gates.impl.verdict, by: ledger.gates.impl.by } : null,
		},
		leash: ledger.leash?.leash ?? null,
		needsCouncil: computeNeedsCouncil(ledger, halt),
		hal: inferHal(ledger),
	}
}

/** Derive the mission row set for every ship in the fleet registry. */
export function buildMissions(agentsRoot: string, agents: AgentRecord[]): MissionRow[] {
	return agents.map((a) => buildMissionRow(agentsRoot, a))
}
