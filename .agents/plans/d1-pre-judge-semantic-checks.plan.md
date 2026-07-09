---
name: d1-pre-judge-semantic-checks
status: active
todos:
  - content: "explore: author spec-format link convention + spec-gate coverage & sibling scenarios (additive)"
    status: completed
  - content: "spec gate: cold sdd-spec-judge over touched spec-gate.feature + spec-format README; freeze on approve"
    status: completed
  - content: "deliver: build use-case-row->scenario check + broaden sibling --files in check-spec-state.mts; one verification per frozen scenario"
    status: completed
  - content: "impl gate: cold sdd-impl-judge; advance status:implemented on all-pass"
    status: completed
  - content: "handoff: root pnpm verify, land, keep combat log, nudge formation"
    status: completed
---

# D1 — pre-judge semantic checks (use-case coverage + sibling-prose sweep)

Ratified doctrine strategy **D1**. Extends the SDD spec-gate deterministic pre-filter.
Target spec: `sdd` (`plugins/sdd`). Evidence: ledger `0000-legacy` seq42, `strategy.317dd8` seq1,
`strategy.ba6a39` seq1, `strategy.acaa41` seq1 (6 captures / 3 retro batches).

## Scope (locked in explore with the Council)

Part (a) referenced-artifact-exists is **already done** (frozen scenarios + `check-spec-state.mts`) — out of scope.

Two additive, deterministic, fail-closed-before-the-cold-judge checks:

1. **Use-Cases-row → scenario link** — new convention in `authoring/spec-format/README.md` (reference node):
   a `## Use Cases` table row names its covering `Scenario:` (a Scenario cell / shared tag). Pre-filter
   checks each touched behavioral `spec.md`'s Use-Cases rows resolve to a real `Scenario:` in the sibling
   `.feature`. Fails closed.
2. **Sibling-prose sweep** — broaden the existing broken-ref pre-filter from hardcoded `spec.md`/`README.md`
   to **every touched prose `.md` under the spec tree** (`design/*.md`, nested node docs). Still `--files`-scoped
   (touched only), never tree-wide `--root`. No contradiction detection (that stays a judge concern).

## Touched nodes
- `.agents/specs/sdd/authoring/spec-format/README.md` — reference edit: the row→scenario link convention.
- `.agents/specs/sdd/authoring/spec-gate/` (`spec-gate.feature` + README) — additive scenarios for both checks.
- impl: `plugins/sdd/skills/spec-gate/scripts/check-spec-state.mts` (+ test) — the coverage check + broadened --files.

## Freeze note
All `.feature` edits are **additive** (new scenarios) → self-clear, stay `@frozen`, no re-open. Existing
referenced-artifact scenarios stay true (the sweep only widens which files are passed).

## Progress
- Draft authored: 9 additive scenarios on `spec-gate.feature` + `spec-gate/README.md` docs + `spec-format/README.md` link convention.
- Cold spec-judge round 1: FAIL — caught a frozen-scenario narrowing (an insert Edit orphaned `And the gate spawns the cold judge`). Fixed: restored the assertion, removed the orphan, added a boundary scenario, synced the README Use Cases row. Logged as a discrete `correction` (cause: spec-feature-contradiction) in the combat log.
- Cold spec-judge round 2: **re-verifying in background** (blocking items only; scope/coverage/placement passed round 1).

## Open follow-ups (routed, not acted on — new CR candidates)
1. **scenario-step-level additive detection** (spec-judge architect OBS): the additive-self-clear classifier keys on
   raw git line-diff and can be fooled by context-line reassignment (a trailing step orphaned onto a new scenario
   shows as no `-` line — this CR's own round-1 bug). Diff at the **scenario-step level** (per named Scenario), not raw
   lines. Touches the freeze/additive machinery (gherkin-cli diff consumers).
2. **backfill Scenario-column Use Cases tables** (impl-judge architect OBS): the new use-case-coverage check is currently
   dead against the live corpus — no node README today uses a `Scenario`-column table, so only the `--files` unit tests
   exercise the failure path. Backfill the convention into behavioral node Use Cases tables to give the check teeth.

## Status: LANDED (f1a1eda0 on main). Both gates passed (by:agent, auto-all leash). Keep brief until doctrine-distilled.

## NEXT
On judge round-2 ALIGNED: self-assert the spec gate within auto-all leash — freeze `spec-gate.feature`,
write `gate` line to shard `d1a7c3`, set spec-gate node in sync. Then deliver (spawn builder for the
check-spec-state.mts engine + verification per frozen scenario) → impl gate → handoff.
