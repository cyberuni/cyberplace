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
    status: in_progress
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
UNBLOCKED — `referenced-artifact-escalation` landed (`75b32c49`), the false-block is fixed. The D2+D3 draft edits are
already in the working tree (uncommitted: `combat-log/README.md`, `conductor/README.md`, `conductor.feature`). On
resume: re-run the spec gate against the fixed check (should be clean now — both the concern-table gap and the
false-block are resolved), self-assert, deliver (the governance-skill prose realizing the emit step), impl gate, land.
