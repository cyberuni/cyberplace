---
name: "reconcile-forward-footprint: guarantee a durable gate line survives when a CR is reconciled forward"
overview: "Ratifies doctrine strategy ledger seq 2 (shard strategy.317dd8.jsonl), narrowed in scope. The escape hatch in start-mission ('a non-CR writes no record') stays as-is — investigation-only missions correctly leave no ledger trace by design. The real gap: a mission that DID open a real CR and reach approved/implemented, but gets reconciled forward in a later session (work already merged elsewhere, no live gate run this session) has no guarantee its durable gate ledger line actually exists before the plan is marked retirement-ready. Extends the mission/checkpoint unit (pause-mission) with a reconcile-forward verification step + additive scenarios."
todos:
  - id: intake
    content: "Step 1 — open the local CR, scaffold this brief. Source: doctrine strategy seq 2 ratification, scoped per user decision (narrow, not the non-CR escape hatch)."
    status: completed
  - id: explore
    content: "Locate node (mission/checkpoint, @frozen, additive-only), classify the change, write additive scenarios + README use-case row. DONE: 3 additive scenarios in checkpoint.feature + README use-case row + Reconcile-forward checkpoint section."
    status: completed
  - id: spec-gate
    content: "Hand-run spec gate over checkpoint.feature's additive scenarios (self-run in-session; additive stays @frozen, no re-open). DONE: verify:specs-new green (264/264); ledger seq 1 gate line in ledger/reconcile-forward-footprint.dc7d86.jsonl, ratified by unional."
    status: completed
  - id: deliver
    content: "Update pause-mission SKILL.md with the reconcile-forward verification step. DONE: new '## Reconcile-forward checkpoint' section citing checkGateFloor."
    status: completed
  - id: handoff
    content: "Commit, update this plan's ## NEXT, doctrine-distill note (this CR itself is the ratification record for strategy seq 2). DONE."
    status: completed
isProject: false
---

# Plan — reconcile-forward-footprint

> Mission plan (portable handoff brief). Tracked, per-worktree.
> CR: local CR, ratifying doctrine strategy ledger seq 2 (`strategy.317dd8.jsonl`), narrowed.
> Target: `.agents/specs/sdd/mission/checkpoint/` (project-path `plugins/sdd-new`).
> Runs on branch `main` (this repo's current working branch).

## What we are doing

Doctrine's Scanner drafted (seq 2) that hand-run/reconciled missions can leave zero durable
trace. Grilled live: the non-CR escape hatch (`start-mission` step 1 — "a non-CR writes no
record") is correct as designed and stays untouched. The real, narrower gap: a mission that DID
open a real CR and reach `approved`/`implemented` should not be markable retirement-ready by a
later reconciling session without confirming its `gate` ledger line actually exists. Today
nothing guarantees that check happens — a reconciling session (like this one, minutes ago, for
`github-34` and `sdd-aces-rejudge`) could mark a plan complete on git evidence alone without ever
looking at the ledger.

## Resolved decisions

- **Narrow scope** (user decision): the non-CR escape hatch is untouched; only CR-bearing
  missions get the new guarantee.
- **Home: `mission/checkpoint`.** The `pause-mission` skill already owns "write mission state
  into the plan brief" — reconciling a plan forward is a variant of that, not a new unit.
- **Additive-only.** `checkpoint.feature` is `@frozen`; new scenarios only, nothing narrowed —
  self-clears, no re-open per `lifecycle-governance`.

## NEXT — resume here

▶ MISSION COMPLETE (2026-07-01). Ratifies doctrine strategy seq 2, narrowed. Landed:
`.agents/specs/sdd/mission/checkpoint/checkpoint.feature` (+3 additive scenarios, stays
`@frozen`), its `README.md` (use-case row + Reconcile-forward checkpoint section),
`plugins/sdd-new/skills/pause-mission/SKILL.md` (the concrete `checkGateFloor` step).
`verify:specs-new` green (264/264). Ledger gate line: `ledger/reconcile-forward-footprint.dc7d86.jsonl`
seq 1, ratified by unional. Nothing left to resume; retire this plan on the next doctrine-loop
pass.
