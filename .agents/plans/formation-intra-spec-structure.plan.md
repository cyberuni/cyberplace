---
name: "formation-intra-spec-structure: the formation loop detects structural issues WITHIN a spec"
overview: "CR against the sdd project spec. Retire the fleet-era cross-spec corpus tools (dedupe-specs, split-spec) and retarget the corpus to intra-spec structural maintenance now that one project = one spec. Reuse align-specs (renamed align-spec) for prose↔suite drift; add a new check-spec-structure node + .mts engine (untagged-node blocking + oversized-node advisory; intra-spec contradiction as a Warden @rubric arm; placement-drift deliberately deferred — concepts legitimately scatter). Rewrite the formation station table (spec + formation-loop skill + sdd-warden) and retarget the frozen formation.feature under the same Clearance umbrella. Both gates self-asserted (internal tooling, pre-authorized Clearance); cold sdd-spec-judge builder+architect PASS, oracle blocker fixed."
todos:
  - id: intake
    content: "Open local CR; locate sdd spec; pre-authorize the Clearance narrowings (delete dedupe/split, narrow align #3, retarget formation.feature). DONE."
    status: completed
  - id: explore
    content: "Confirm corpus/ home via place-node; set granularity threshold (40, advisory); reclassify placement-drift deterministic→Warden judgment after self-host data showed concept scatter is legitimate. DONE."
    status: completed
  - id: spec-new-node
    content: "Author corpus/check-spec-structure/{README,.feature} — Use Cases, severity, 13 scenarios (12 boolean + 1 @rubric). DONE."
    status: completed
  - id: spec-retarget-align
    content: "git mv align-specs→align-spec; reword #3 to project-spec; Director→Oracle fix; drop cross-spec README framing. DONE."
    status: completed
  - id: spec-retire
    content: "git rm dedupe-specs + split-spec; fix sibling cross-refs; rewrite corpus/README (units table + tiers + History); spec.md prose. DONE."
    status: completed
  - id: spec-formation
    content: "Retarget frozen formation.feature to intra-spec acts; rewrite station table in formation/README, formation-loop SKILL+README, sdd-warden, gateway README, sdd SKILL, plugins README. DONE."
    status: completed
  - id: spec-gate
    content: "Regen by-concept (concept-index --write); check-spec-state + check-feature green; cold sdd-spec-judge (builder+architect PASS, oracle fixed); ledger seq 24 spec gate; frozen 3 features. DONE."
    status: completed
  - id: deliver-engine
    content: "Build check-spec-structure.mts + .test.mts (16 tests, 1:1 to deterministic scenarios); skill SKILL+README; wire verify:specs-new (test + self-host --check). DONE."
    status: completed
  - id: impl-gate
    content: "Self-host --check exits 0; verify:specs-new green; ledger seq 25 impl gate. DONE."
    status: completed
  - id: handoff
    content: "pnpm verify green; commit per unit (feat: new node+engine; refactor: retire+retarget); PR. IN PROGRESS."
    status: in_progress
isProject: false
---

# Plan — formation-intra-spec-structure

> Mission plan (portable handoff brief). Tracked, per-worktree.
> Local CR `formation-intra-spec-structure`. Source: user request (this session).
> Runs on branch `next` (the sdd-new line).

## NEXT — resume here

▶ MISSION COMPLETE (2026-06-30) pending final commit + PR. Both gates self-asserted in-session
(ledger seq 24 spec, seq 25 impl) under the plan's pre-authorized Clearance; cold sdd-spec-judge
returned builder+architect PASS with one oracle blocker (non-goals inline) which was fixed per the
judge's instruction with no scenario change. `pnpm verify` green; self-host
`check-spec-structure --check` exits 0 on the sdd corpus.

Remaining: land the two commits (feat: check-spec-structure node + engine + wiring; refactor:
retire dedupe/split + retarget align-spec + formation). Flag to the Council as **agent-asserted —
ratify or kick back**. Then doctrine-distill + plan-retirement once merged.

## CR

Local CR `formation-intra-spec-structure`. Source: user request (this session). Pre-authorized
Clearance narrowings (ratified by plan approval): delete frozen `corpus/dedupe-specs` +
`corpus/split-spec`; reword/narrow `align-spec` detect-scope; retarget frozen `formation.feature`
to intra-spec acts.

## Resolved decisions

- **align-specs retargeted, not retired** — it already did intra-spec prose↔suite drift.
- **Two skills, not one blob** — `align-spec` (alignment) + `check-spec-structure` (node-shape).
- **placement-drift is Warden judgment, not deterministic** — concepts legitimately scatter across
  folders (concept-index re-unifies that); a concept-vs-folder scan false-positives on `formation/`
  and `backfill-project-spec` which correctly carry `corpus-structure`. Deferred from the engine.
- **Severity split** — untagged-node blocking (drives `--check`), oversized-node advisory (surfaces
  `conductor` 59-scenario monolith without blocking CI).
- **formation.feature retarget folded in** (D-1) — else the station-table prose would ship the exact
  drift `align-spec` detects, against a retired station.
