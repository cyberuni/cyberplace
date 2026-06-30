---
name: "sdd-aces-rejudge: ACES re-judge + add tests for the agent-behavior SDD units"
overview: "Re-judge the SDD project spec's agent-behavior suites with the ACES squad (not the default bars they were bootstrapped with), then re-open each frozen .feature and add the near-miss / concrete-trigger / must-not scenarios ACES surfaces, re-judge to ALIGNED with the ACES bars, and re-freeze. Scope is the ~10 agent-behavior units only — the deterministic .mts engine units stay on SDD-default + script harness (ACES is the wrong squad for them; proof-batch finding). Revise CR against .agents/specs/sdd/ (status approved, all 28 .feature @frozen)."
todos:
  - id: intake
    content: "Step 1 — open the CR, scaffold this plan, emit the run-level strategy. DONE."
    status: completed
  - id: conductor-bugfix
    content: "Quick win — fix the stale-rename bug in conductor.feature: 'a Director-lens revert' → 'an Oracle-lens revert' (lens triad is Oracle/Builder/Architect). DONE (870620c, ledger seq 9)."
    status: completed
  - id: rejudge-sweep
    content: "Re-judge — cold ACES spec-validator over all 10 agent-behavior units. DONE: full gap inventory in the body. 2 stale bugs found + fixed (conductor Director→Oracle 870620c; impl-judge retired 'aligned' 37a7ba1)."
    status: completed
  - id: add-tests
    content: "Deliver — per unit: ratified re-open → additive ACES scenarios → cold re-judge ALIGNED → re-freeze → ledger line → one commit. DONE: all 10 agent-behavior units, each cold-judged ALIGNED 3/3 (ledger seq 11–20). +43 scenarios total."
    status: completed
  - id: spec-gate
    content: "Spec gate — per re-frozen unit gate line recorded (ledger seq 11–20); root stays approved. check-spec-state + check-feature green. NOTE: concept-index --check reports a pre-existing, unrelated (rule→index) drift in design/* facets, NOT caused by this CR — left untouched."
    status: completed
  - id: handoff
    content: "Handoff — commits landed on next (waves 1–3 + 2 bug fixes); update this ## NEXT; the next→main PR carries it alongside #34/#38 (owner's call). pnpm verify is the owner's pre-push step."
    status: in_progress
isProject: false
---

# Plan — sdd-aces-rejudge: ACES re-judge + add tests for the agent-behavior SDD units

> Mission plan (portable handoff brief). Tracked, per-worktree.
> CR: general change request — "review all skills in sdd and use ACES to add test and re-judge."
> Target: `.agents/specs/sdd/` (project-path `plugins/sdd-new`), `status: approved`, all 28
> `.feature` `@frozen`, originally judged with the SDD **default** bars (not ACES).
> Runs on branch `next`.

## What we are doing

Dogfood ACES over the SDD project's own agent-config suites. The suites were bootstrapped/judged
with the default `sdd-spec-judge` bars, which check testability + coverage but **not trigger
realism**. ACES (the squad for `skill`/`subagent` artifact-types) re-judges them with the
agent-scenario lens (trigger context, near-miss balance, rule coverage, edge cases) and we add the
scenarios it surfaces. Adding scenarios edits a frozen `.feature` → ratified re-open per node;
additions are **additive only** (no narrowing of an acceptance scenario → no Clearance floor).

## Scope — agent-behavior units only (proof-batch finding)

ACES is the **wrong squad for the deterministic `.mts` engine units** — on `corpus/discovery` only
~2 of 15 scenarios were agent-shaped; the rest belong to SDD-default builder-spec + a script
harness. So this CR re-judges **only the agent-behavior half**:

| # | Unit | ACES status | Notes |
|---|---|---|---|
| 1 | `gateway` | judged: ALIGNED false | classifier near-misses, abstract triggers, uncovered must-not rules |
| 2 | `mission/conductor` | judged: ALIGNED true (3 gaps) | + the Director→Oracle bug |
| 3 | `mission/handoff` | pending re-judge | |
| 4 | `mission/impl-judge` | pending re-judge | |
| 5 | `mission/impl-producer` | pending re-judge | |
| 6 | `mission/solution-producer` | pending re-judge | |
| 7 | `authoring/spec-producer` | pending re-judge | |
| 8 | `authoring/backfill-project-spec` | pending re-judge | |
| 9 | `doctrine/scanner` | pending re-judge | the Warden's twin — agent delegate |
| 10 | `formation` | pending re-judge | the Warden — agent delegate |

**Excluded (engines — keep SDD-default + script harness):** `corpus/discovery`, `corpus/concept-index`,
`corpus/place-node`, `intake/plan-discovery`, `doctrine/plan-retirement`, `mission/resolution`.
**Borderline (decide on reach):** `corpus/align-specs`, `corpus/dedupe-specs`, `corpus/split-spec`,
`corpus/digest`, `authoring/validate-spec` (mixed script+agent), `plugin/plugin`, the `acceptance/*`
e2e suites (cross-cutting, not per-skill).

## The loop (per unit)

1. Cold-spawn `aces:aces-spec-validator` over the unit's README + frozen `.feature` (+ impl for
   context). Bars: union `sdd:builder-spec-governance` + `aces:aces-builder-spec`, plus oracle +
   architect. Read-only — collect the gap list.
2. Ratify the re-open in-session (user holds the channel; re-open pre-authorized for this CR scope).
3. Add ONLY additive ACES-surfaced scenarios (near-miss, concrete-trigger, must-not). Never weaken
   or delete an existing scenario. Keep boolean form; respect the `@rubric` exception.
4. Re-judge cold with ACES → ALIGNED. Cap 3 rounds; on cap/blocked surface to the user.
5. Re-freeze (`@frozen`), `check-spec-state` + `check-feature` green, ledger gate line, commit.

## Resolved decisions

- **Agent-behavior half only** — engines stay on SDD-default + script harness (proof-batch finding;
  see memory `project_aces_fits_agent_behavior_not_engines`).
- **Additive only** — re-opens add scenarios; no narrowing, so no Clearance floor; re-freeze after.
- **gateway + conductor already cold-judged** in the proof batch — reuse those findings, don't re-run.
- **Branch:** `next` (matches the SDD effort's integration branch).

## Gap inventory (rejudge-sweep — all 10 cold-judged)

Ranked by ACES fit + value. Three systemic patterns the SDD-default judge structurally missed:
(a) **abstract stand-in `Given`s** — all 10 units use "a CR"/"a frozen scenario" not concrete
state; (b) **near-miss imbalance** — many should-fire, few should-not; (c) **uncovered must-not /
load-bearing rules**.

| Unit | ACES | Fit | Add-tests scope |
|---|---|---|---|
| `gateway` | false | **strong** | confusable-trigger near-misses; concrete utterances (in SKILL.md); write-ownership + no-production-logic must-not guards; partial-intake middle case; two-level-menu/exactly-four |
| `impl-judge` | false | **strong** | `judge≠producer model` rule; green-but-fake-check near-miss FAIL; concrete frozen-scenario+check Givens *(`aligned` bug FIXED)* |
| `scanner` | false | **strong** | 4 should-not-fire near-misses (ordinary-correction, count-of-1, convention-still-true, under-bound don't-run); zero/empty edge; status-not-gate near-miss |
| `solution-producer` | false | good | removal-on-revise branch; write-ownership guard; forced-single-choice near-miss; concrete unit Given |
| `backfill` | false | partial | already-has-spec not-run near-miss; `name` user-confirm rule; concrete detect-signal Givens; neither-fits fallback |
| `spec-producer` | false | partial | no-placeholder rule; breadth-first scan; revise suite-sync (add/retire scenarios); concrete CR Givens |
| `impl-producer` | false | partial (mechanical) | edge/boundary (partial-verify, contradicting discovery, non-frozen precondition); MODE mismatch; produced-by alt path *(near-miss N/A — don't force)* |
| `conductor` | true | good | outside-leash STOP near-miss; impl-gate open-marker scenario; concrete classify/resolve Givens *(Director bug FIXED)* |
| `handoff` | true | mostly wrong-squad | **minimal**: unmerged-PR don't-write-back near-miss only |
| `formation` | true | good | 1–2 self-clear-gradient near-misses (low-blast consistency-fix self-clears vs contested escalates); provisional-marker unwind-on-reject |

Two stale-rename bugs already fixed (`conductor` Director→Oracle, `impl-judge` `aligned`).

## NEXT — resume here

**▶ NEXT ACTION — `add-tests`, continue from impl-judge.** Per-unit loop: ratified re-open → add
ACES-surfaced **additive** scenarios (near-miss / concrete-trigger / must-not; never narrow an
existing one) → cold re-judge ALIGNED with union ACES bars → stays @frozen → ledger gate line → one
commit. The **gateway style is the template** (commit c9ccf6d): concrete utterances from the real
SKILL/impl, near-misses paired against existing positives, must-not guards, README behavior table +
prose synced so every scenario maps to a stated rule.

Per-unit progress — **ALL 10 DONE**, each cold-judged ALIGNED 3/3, additive-only, stays @frozen:
- [x] **gateway** +8 (15→23), seq 11, c9ccf6d
- [x] **impl-judge** +3 (14→17), seq 12, 7367f7c
- [x] **scanner** +5 (16→21), seq 13, c818a64
- [x] **solution-producer** +4 (10→14), seq 14, b00111d
- [x] **backfill** +4 (23→27), seq 15, 461f99a
- [x] **spec-producer** +4 (10→14), seq 16, 33a88fb
- [x] **conductor** +2 (57→59), seq 17, dd451a2
- [x] **impl-producer** +4 (13→17), seq 18, b42601c
- [x] **formation** +4 (20→24), seq 19, 4c5b5a0 *(incl. field-correction→forge reconcile of a judge OBSERVATION)*
- [x] **handoff** +1 (18→19), seq 20, 6f31de7
- [x] **2 stale bugs** fixed: conductor Director→Oracle (870620c, seq 9), impl-judge `aligned` (37a7ba1, seq 10)

## NEXT — resume here

**▶ MISSION COMPLETE (in-tree) — handoff is the owner's call.** All 10 agent-behavior SDD suites
re-judged with the ACES squad and brought to ALIGNED 3/3 on the agent-config lens (the default bars
that bootstrapped them couldn't enforce trigger realism); +43 additive scenarios, 2 stale bugs
fixed, ledger seq 8–20 on `next`. `check-feature` + `check-spec-state` green; every touched
`.feature` stayed `@frozen` (additive-only re-opens, ratified in-session). Engines were correctly
excluded (ACES wrong-squad — proof-batch finding).
**REMAINING (owner's call):** (1) the `next → main` PR carrying this alongside #34/#38; (2) run
`pnpm verify` before push. **Pre-existing non-mission flag (NOT this CR):** `concept-index --check`
reports a stale `(rule)→(index)` facet relabel in the root spec.md by-concept block on `design/*`
nodes — predates this session (engine `f9560c3`), left untouched; whoever owns that drift runs
`concept-index --write`.
