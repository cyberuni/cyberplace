// ADR-0022 decision 6 — the HAL tell. HAL is an easter egg, never the persona's face: when a Pod
// self-asserts above its run-level leash, this module derives the honest "the agent acted on its
// own, above the normal bar" signal from persisted SDD ledger state. There is NO first-class
// above-leash event anywhere in the SDD ledger schema (combat-log-governance defines `leash` as a
// run-start block and `gate` as a per-gate verdict — neither is itself an "I just crossed my
// leash" marker) — this is the strongest available INFERENCE, not a recorded fact. It is detection
// only: rendering a live flash in a session is the Pod gateway skill/hook's job, not this CLI's
// (a cold cyberfleet stays mechanical, per ADR-0022 decision 5).

import type { SddLedgerState } from './read.ts'

/**
 * Infer whether a CR's persisted gate lines show a self-assertion the run-level leash did not
 * cover.
 *
 * Truth table (leash × any self-asserted `by: "agent"` gate):
 *
 * | leash        | spec gate by:agent | impl gate by:agent | aboveLeash |
 * |--------------|---------------------|----------------------|------------|
 * | auto-none    | —                   | —                    | false      |
 * | auto-none    | yes                 | —                    | **true**   |
 * | auto-none    | —                   | yes                  | **true**   |
 * | auto-spec    | yes                 | —                    | false      |
 * | auto-spec    | —                   | yes                  | **true**   |
 * | auto-all     | yes                 | yes                  | false      |
 * | (no leash line recorded) | —/yes    | —/yes                | false (cannot infer) |
 *
 * `auto-none` covers no gate, so ANY self-assert is above leash. `auto-spec` covers only the spec
 * gate, so a self-asserted impl gate is above leash (a spec-gate self-assert is within). `auto-all`
 * covers both, so self-assertion is never above leash. With no leash line at all there is nothing
 * to compare against — this returns false rather than guessing (an unearned HAL flash would be
 * worse than a missed one, per the ADR's "rare, earned signal" framing).
 */
export function inferHal(ledger: SddLedgerState): boolean {
	if (!ledger.leash) return false
	const specSelfAsserted = ledger.gates.spec?.by === 'agent'
	const implSelfAsserted = ledger.gates.impl?.by === 'agent'
	switch (ledger.leash.leash) {
		case 'auto-none':
			return specSelfAsserted || implSelfAsserted
		case 'auto-spec':
			return implSelfAsserted
		case 'auto-all':
			return false
		default:
			// An unrecognized leash value — no known coverage to compare against, so no inference.
			return false
	}
}

/**
 * "Who needs the Council's hands" (ADR-0022 decision 10) — true when any of:
 *   - a gate line's verdict is `"pause"` (the conductor stopped and is waiting), or
 *   - the CR's combat log has a `halt` line (a mid-flight stop, not at a gate), or
 *   - any gate line is still self-asserted (`by: "agent"`) — provisional, awaiting a human's
 *     ratification into the ledger (the relayed-ratification seam — see `gate approve`).
 */
export function computeNeedsCouncil(ledger: SddLedgerState, hasHaltLine: boolean): boolean {
	if (hasHaltLine) return true
	for (const gate of [ledger.gates.spec, ledger.gates.impl]) {
		if (!gate) continue
		if (gate.verdict === 'pause') return true
		if (gate.by === 'agent') return true
	}
	return false
}

/**
 * A one-line HAL-flavored string for a Pod gateway skill/hook to surface later (the live flash is
 * explicitly deferred to that skill, not wired here — see ADR-0022 decision 6 + implementation
 * notes). Renders off exactly the `hal` field `missions --json` emits.
 */
export function renderHalTell(handle: string, cr: string): string {
	return `HAL: ${handle} self-asserted above its leash on "${cr}" — I did that on my own.`
}
