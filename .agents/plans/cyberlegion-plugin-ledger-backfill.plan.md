---
name: cyberlegion-plugin-ledger-backfill
status: active
todos:
  - content: "confirm the historical gap: CR cyberlegion-plugin-init-skill's spec gate passed (plan todos completed, ALIGNED) and froze init/init-cyberlegion.feature, but .agents/specs/cyberlegion-plugin has no ledger/ directory at all — cross-check against every other spec in the corpus (all carry a matching ledger/*.jsonl gate shard for any CR that passed a gate or froze a file)"
    status: completed
  - content: "decide remediation: either the in-session conductor/spec-gate skill backfills a gate ledger line for cyberlegion-plugin-init-skill (cr, gate: spec, verdict: approve, frozen: [init/init-cyberlegion.feature]) under a fresh hash shard, or the Council accepts the historical gap as-is and only requires ledger writes going forward"
    status: pending
  - content: "if backfilling: mint ledger/<hash>.jsonl and append the gate line per sdd:combat-log-governance shape; verify no other gate events (gateway/dispatch not yet gated) are owed a line"
    status: pending
  - content: "root pnpm verify; commit by unit of work; handoff"
    status: pending
---

# CR cyberlegion-plugin-ledger-backfill — missing durable gate floor

Target spec: `.agents/specs/cyberlegion-plugin` (no node narrowed — this is a provenance-structure
gap, not a content change).

## Origin

Filed by the sdd-warden formation pass following `cyberlegion-plugin-init-skill` (post-mission,
corpus-wide structure audit). The mission's own plan brief (`cyberlegion-plugin-init-skill.plan.md`)
records the spec gate as passed (`aced spec-judge ALIGNED`) and the root spec.md's `init/` node
carries `@frozen` on `init-cyberlegion.feature` — reaching a spec-gate approve is what freezes a
file (`sdd:lifecycle-governance`). But `.agents/specs/cyberlegion-plugin/ledger/` does not exist.

Structural cross-check against the rest of the corpus: every other spec that has ever frozen a
`.feature` or passed any gate carries a `ledger/` directory with at least one matching
`gate`-kind shard (`aced` ×1, `cyberfleet-plugin` ×2, `cyberplace` ×3, `cyberspace` ×2, `sdd` ×4,
`packages/cyberfleet/.agents/spec` ×2 — reference-only, no frozen `.feature`, but still carries a
ledger — `packages/cyberlegion/.agents/spec` ×3, `packages/universal-plugin/.agents/spec` ×1).
`cyberlegion-plugin` is the sole outlier: a frozen file with no ledger at all.

## Why this escalates rather than self-clears

Per `sdd:combat-log-governance`'s write-ownership table, a `gate` ledger line may be appended only
by the conductor (self-asserted, `by: agent`) or the spec-gate skill in-session (human-ratified,
`by: <name>`). The Warden is neither — it cannot fabricate a retroactive gate line for a run it did
not witness, so this cannot self-clear under a provisional marker the way a placement/split can. It
is filed as a CR so a positional actor (a future mission's conductor, or the Council directly)
decides whether to backfill the historical line or accept the gap as a known, non-recurring
one-off — either way the decision needs the ledger-write authority the Warden lacks.

## NEXT

Not yet started. If a fresh session runs the spec gate again for any future CR against
`cyberlegion-plugin` (e.g. gating `gateway/` or `dispatch/`), consider backfilling the missed
`init-cyberlegion.feature` gate line in the same pass rather than a standalone mission — cheapest
place to close the gap is the next time this spec's `ledger/` directory is created anyway.
