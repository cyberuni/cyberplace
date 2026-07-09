---
name: d2-correction-line-durability
status: active
todos:
  - content: "explore: spec the gate-time discrete correction-line emission + no-log minimum-footprint line"
    status: completed
  - content: "spec gate: cold sdd-spec-judge over touched combat-log / conductor / spec-gate nodes; freeze on approve"
    status: completed
  - content: "deliver: build the correction-line emission into the self-assert/gate path + verification per scenario"
    status: completed
  - content: "impl gate: cold sdd-impl-judge; advance status:implemented on all-pass"
    status: completed
  - content: "handoff: root pnpm verify, land, keep combat log, nudge formation"
    status: completed
---

# D2+D3 — correction-line durability

Ratified doctrine strategy **D2+D3 (one combined CR)**. Target spec: `sdd` (`plugins/sdd`).
Evidence: ledger `strategy.317dd8` seq2, `strategy.7668d1` seq1, `strategy.ba6a39` seq2, `strategy.acaa41` seq2.

## Scope (Council ruling: one CR)

The underlying gap is **durable correction provenance** — the doctrine loop's Recurring-pattern use case
reads distilled `cause` recurrence and is blind to corrections that live only in gate `why` prose or in
missions that wrote no combat log.

1. **Gate-time discrete correction line** — when a gate `why` narrates a fix-then-pass shape (judge FAIL →
   reconciled → pass), the conductor/spec-gate self-assert path also emits a discrete `correction` line
   (`correction-kind: judge-iteration`, a matchable `cause` from the enum) to the combat log — not only the
   prose summary on the ledger `gate` line. Observed even on live conductor runs that DID write a combat log.
2. **Minimum durable footprint** — a mission that concludes with zero combat log lands at least one lightweight
   durable ledger line (outcome class + whether a CR/gate cycle ran) so the loop's PRIMARY input is never
   structurally absent for an entire mission class.

## Likely touched nodes (confirm in explore)
- `common-governances/combat-log` — the `correction` line contract / the `disposition`-adjacent shape.
- `mission/conductor` (+ `authoring/spec-gate`) — the self-assert path that must emit the line.
- Possibly `mission/checkpoint` / handoff — the minimum-footprint line for no-log missions.

## Progress (uncommitted draft in the working tree)
- Explore + authoring done: 5 additive scenarios on `mission/conductor/conductor.feature` (67→72), a contract-surface
  note on `common-governances/combat-log/README.md`, and the conductor README's 10th concern row + prose section.
- Cold spec-judge: oracle+builder PASS, architect FAIL on a missing concern-table mapping (the totalizing "every
  scenario maps" claim) — **fixed** (added the correction-line-durability concern row + Stop-provenance prose).
- **BLOCKED at the mechanical spec gate:** the referenced-artifact pre-filter (D1 part a) false-blocks the touched
  `conductor/README.md` on its legitimate pre-existing `.agents/sdd/artifact-types.toml` opt-in ref. This is a real
  D1 defect (must-vs-can), now its own prerequisite CR **[[referenced-artifact-escalation]]**.

## NEXT
LANDED — full mission complete (commits `154aff3b` spec transition, `5f69f2f2` impl). Both gates self-asserted within
auto-all leash; cold spec-judge ALIGNED after one judge-iteration correction, cold impl-judge IMPLEMENTATION_PASS
(5/5, invariants held). Root `pnpm verify` green. Ledger shard `d2-correction-line-durability.d2b4e1.jsonl`
(seq1 leash / seq2 spec / seq3 impl); combat log `d2-correction-line-durability.log.jsonl` (dogfooded the finalize
backstop with this mission's own spec-gate judge iteration). Mission complete — awaiting doctrine-loop retirement.

**Follow-ups (unfiled):**
- Sync `design/provenance-model.md` with the correction-line durability discipline (both judges flagged it as the
  doc that owns the record/entry-shape model + rationale; untouched this CR → a Warden reconcile / small doc CR).
- Formation pass is due (both this CR and `referenced-artifact-escalation` touched the spec tree) — run on-demand
  via `sdd:manage` ("audit the corpus structure").
