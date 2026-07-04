import { describe, expect, it } from 'vitest'
import { computeNeedsCouncil, inferHal, renderHalTell } from './hal.ts'
import type { SddLedgerState } from './read.ts'

function ledger(opts: {
	leash?: string | null
	specBy?: string | null
	implBy?: string | null
	specVerdict?: string
	implVerdict?: string
}): SddLedgerState {
	return {
		project: 'cyberspace',
		leash: opts.leash != null ? { leash: opts.leash, by: 'derived' } : null,
		gates: {
			spec: opts.specBy != null ? { gate: 'spec', verdict: opts.specVerdict ?? 'approve', by: opts.specBy } : null,
			impl: opts.implBy != null ? { gate: 'impl', verdict: opts.implVerdict ?? 'approve', by: opts.implBy } : null,
		},
	}
}

describe('inferHal — the leash × self-assert truth table', () => {
	it('no leash line recorded at all → false (cannot infer)', () => {
		expect(inferHal(ledger({ leash: null }))).toBe(false)
		expect(inferHal(ledger({ leash: null, specBy: 'agent' }))).toBe(false)
	})

	it('auto-none + no self-asserted gate → false', () => {
		expect(inferHal(ledger({ leash: 'auto-none' }))).toBe(false)
	})
	it('auto-none + a self-asserted spec gate → true (leash covers nothing)', () => {
		expect(inferHal(ledger({ leash: 'auto-none', specBy: 'agent' }))).toBe(true)
	})
	it('auto-none + a self-asserted impl gate → true', () => {
		expect(inferHal(ledger({ leash: 'auto-none', implBy: 'agent' }))).toBe(true)
	})
	it('auto-none + a HUMAN-ratified gate only → false (not a self-assert)', () => {
		expect(inferHal(ledger({ leash: 'auto-none', specBy: 'unional' }))).toBe(false)
	})

	it('auto-spec + a self-asserted spec gate → false (within leash)', () => {
		expect(inferHal(ledger({ leash: 'auto-spec', specBy: 'agent' }))).toBe(false)
	})
	it('auto-spec + a self-asserted impl gate → true (leash covers spec only)', () => {
		expect(inferHal(ledger({ leash: 'auto-spec', implBy: 'agent' }))).toBe(true)
	})
	it('auto-spec + both self-asserted → true (impl alone is enough to trip it)', () => {
		expect(inferHal(ledger({ leash: 'auto-spec', specBy: 'agent', implBy: 'agent' }))).toBe(true)
	})

	it('auto-all + both self-asserted → false (leash covers everything)', () => {
		expect(inferHal(ledger({ leash: 'auto-all', specBy: 'agent', implBy: 'agent' }))).toBe(false)
	})
	it('auto-all + no gates at all → false', () => {
		expect(inferHal(ledger({ leash: 'auto-all' }))).toBe(false)
	})

	it('matches the real add-fleet-comms ledger shape: auto-spec + impl by:agent → true', () => {
		expect(inferHal(ledger({ leash: 'auto-spec', specBy: 'agent', implBy: 'agent' }))).toBe(true)
	})
})

describe('computeNeedsCouncil', () => {
	it('false when there are no gates, no halt, and no leash', () => {
		expect(computeNeedsCouncil(ledger({}), false)).toBe(false)
	})

	it('true when a halt line is present, regardless of gate state', () => {
		expect(computeNeedsCouncil(ledger({}), true)).toBe(true)
	})

	it('true when any gate verdict is "pause"', () => {
		expect(computeNeedsCouncil(ledger({ specBy: 'unional', specVerdict: 'pause' }), false)).toBe(true)
	})

	it('true when any gate is still self-asserted (provisional, awaiting ratification)', () => {
		expect(computeNeedsCouncil(ledger({ implBy: 'agent' }), false)).toBe(true)
	})

	it('false once every recorded gate is human-ratified and no pause/halt', () => {
		expect(computeNeedsCouncil(ledger({ specBy: 'unional', implBy: 'unional' }), false)).toBe(false)
	})
})

describe('renderHalTell', () => {
	it('renders a one-line HAL-flavored string off handle + cr', () => {
		expect(renderHalTell('pod-1', 'add-fleet-comms')).toContain('add-fleet-comms')
		expect(renderHalTell('pod-1', 'add-fleet-comms')).toContain('pod-1')
	})
})
