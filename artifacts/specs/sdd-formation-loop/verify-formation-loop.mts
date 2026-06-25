#!/usr/bin/env node
// Verification for the SDD Formation loop realization.
// One named check per FROZEN scenario in sdd-formation-loop.feature (14 total).
// Each check asserts an OBSERVABLE fact about the built artifacts.
// Run: node verify-formation-loop.mts   (exits non-zero if any check fails)

import { readFileSync } from 'node:fs'

const ROOT = '/home/user/code/cyberuni/cyber-skills'
const SKILL = readFileSync(`${ROOT}/plugins/sdd/skills/formation-loop/SKILL.md`, 'utf8')
const WARDEN = readFileSync(`${ROOT}/plugins/sdd/agents/sdd-warden.md`, 'utf8')
const DEDUPE = readFileSync(`${ROOT}/plugins/sdd/skills/dedupe-specs/SKILL.md`, 'utf8')

// Lowercase and strip markdown emphasis (*, _, `) so bold/italic markers
// inside a phrase do not break substring matching.
const norm = (s: string) => s.toLowerCase().replace(/[*_`]/g, '')
const all = norm(SKILL + '\n' + WARDEN + '\n' + DEDUPE)

type Check = { scenario: string; ok: () => boolean }

const has = (hay: string, ...needles: string[]) => needles.every((n) => norm(hay).includes(norm(n)))

const checks: Check[] = [
	{
		scenario: 'the Formation loop acts across the whole corpus',
		ok: () => has(SKILL, 'finding set', 'every spec') && has(WARDEN, 'finding set covering every spec'),
	},
	{
		scenario: 'the Formation loop does not fire as the per-spec gate structural check',
		ok: () =>
			has(SKILL, 'does not fire', 'per-spec structural check') && has(WARDEN, 'do not run as the per-spec gate'),
	},
	{
		scenario: 'the per-spec gate judgment is not the Formation loop',
		ok: () => has(SKILL, 'is not', 'Formation loop') && has(SKILL, 'advances only', 'one spec'),
	},
	{
		scenario: 'an oversized spec triggers a split',
		ok: () =>
			has(SKILL, 'spec-granularity heuristic', 'split-spec') &&
			has(WARDEN, 'trips the spec-granularity heuristic', 'split-spec'),
	},
	{
		scenario: 'a split produces a project spec with feature children',
		ok: () => has(SKILL, 'project spec', 'feature children') && has(WARDEN, 'project spec and its feature children'),
	},
	{
		scenario: 'a spec within the heuristic is not split',
		ok: () => has(SKILL, 'within', 'heuristic', 'left alone') && has(SKILL, 'within-heuristic', 'not split'),
	},
	{
		scenario: 'a stale graph triggers a re-render',
		ok: () => has(SKILL, 'stale', 'render-spec-graph') && has(WARDEN, 'stale', 'render-spec-graph'),
	},
	{
		scenario: 'a re-render brings the graph back in sync',
		ok: () => has(SKILL, 'back in sync', 'matches the `blocked-by` edges') && has(WARDEN, 'matches', 'blocked-by'),
	},
	{
		scenario: 'a dependency cycle is surfaced',
		ok: () => has(SKILL, 'cycle', 'surfaced') && has(WARDEN, 'surface the cycle'),
	},
	{
		scenario: 'overlapping specs trigger a dedupe',
		ok: () =>
			has(SKILL, 'overlap', 'dedupe proposal naming the overlapping specs') &&
			has(DEDUPE, 'name the overlapping specs', 'proposal'),
	},
	{
		scenario: 'contradicting artifacts trigger a reconciliation',
		ok: () =>
			has(SKILL, 'reconciliation proposal naming the contradicting artifacts') &&
			has(DEDUPE, 'contradicting artifacts', 'reconciliation'),
	},
	{
		scenario: 'the Formation loop does not decide what to build (routed to Campaign)',
		ok: () =>
			has(SKILL, 'no build-or-deprecate decision', 'Campaign loop') &&
			has(WARDEN, 'no', 'build-or-deprecate decision', 'Campaign loop'),
	},
	{
		scenario: 'the Formation loop does not grow the process (routed to Doctrine)',
		ok: () =>
			has(SKILL, 'no governance or process edit', 'Doctrine loop') &&
			has(WARDEN, 'no', 'governance or process edit', 'Doctrine loop'),
	},
	{
		// Composite frozen-contract guard: dedupe-specs station exists, names artifacts,
		// and mirrors split-spec's confirm-plan-and-result discipline (two checkpoints).
		scenario: 'dedupe-specs station produces a proposal naming artifacts with plan+result confirmation',
		ok: () =>
			has(DEDUPE, 'proposal that names the artifacts') &&
			has(DEDUPE, 'Checkpoint 1 — Council confirms the plan') &&
			has(DEDUPE, 'Checkpoint 2 — Council confirms the result') &&
			has(DEDUPE, 'one home') &&
			has(DEDUPE, 'no contradiction stands'),
	},
]

let failed = 0
for (const c of checks) {
	let pass = false
	try {
		pass = c.ok()
	} catch {
		pass = false
	}
	if (!pass) failed++
	process.stdout.write(`${pass ? 'PASS' : 'FAIL'}  ${c.scenario}\n`)
}

process.stdout.write(`\n${checks.length - failed}/${checks.length} checks passed\n`)
// sanity: keep `all` referenced for future cross-artifact checks
void all
if (failed > 0) process.exit(1)
