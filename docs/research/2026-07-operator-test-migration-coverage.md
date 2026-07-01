# Operator test suite migration: coverage gap audit

Audits `plugins/sdd/agents/sdd-operator.test.mts` (73 functional scenarios anchored to the
old operator's frozen `.feature` titles, plus 8 structural coexistence checks — 81 total)
against the new `plugins/sdd-new` corpus (`.agents/specs/sdd/`, conductor + `sdd-automaton`),
to find genuine behavior gaps and reusable test patterns before deciding on a follow-up CR.

## Method

Read the old test file in full; read the new corpus's `.feature` files (`mission/resolution`,
`mission/conductor`, `mission/impl-producer`, `mission/impl-judge`, `mission/handoff`,
`mission/solution-producer`, `mission/checkpoint`, `acceptance/freeze`,
`acceptance/escalation-floor`, `acceptance/resolve-squad`, `acceptance/gate-verdicts`,
`authoring/spec-gate`, `doctrine/scanner`, `formation/formation`, `plugin/plugin`) plus their
READMEs/solutions, and the `plugins/sdd-new` `node:test` files. Verdicts are based on actual
Given/When/Then text, not scenario-count inference.

## Design shifts that reclassify old scenarios

- **Spec-producer is never spawned**, even when named — always runs in-session in the
  conductor (`conductor/README.md`). Reverses several old dispatch/explore "named producer
  spawned at own model" scenarios to OBSOLETE for the spec-producer half.
- **Impl-producer is now always spawned**, never inline — even the SDD-default case
  (`impl-producer.feature`). Exactly the inverse of the old operator's inline-by-default rule.
- **Governance tiers changed**: `user-global/project-global/project-local` →
  `project/project-root/plugin/sdd` (`resolution.solution.md`).
- **Plan model changed**: `tasks.md` dependency DAG → flat frontmatter `todos` list +
  `## NEXT` anchor (`checkpoint.feature`). No DAG concept survives.
- Producer identity `sdd:sdd-operator` → `sdd:automaton`.
- `plan-producer` role folded into `solution-producer`.

## Coverage-gap map

### Resolution (8) — 6 COVERED, 1 PARTIAL/OBSOLETE-split, 1 OBSOLETE

All role-resolution mechanics (registry-only, naming-convention fallback, hard-fail on no
delegate, judge-always-cold, actor-governance-default, two-plugin disambiguation) are COVERED,
mostly in `conductor.feature` and `acceptance/resolve-squad.feature`. "Named producer spawned
at own model" splits: impl-producer half COVERED (`impl-producer.feature`), spec-producer half
**OBSOLETE** (spec-producer is never spawned now).

### Dispatch (16) — 8 COVERED, 2 PARTIAL, 1 GAP, 3 OBSOLETE (+2 dup COVERED)

Producer/judge write-boundary, verification co-production, and impl-judge independence are all
COVERED (`authoring/spec-producer.feature`, `impl-producer.feature`, `impl-judge.feature`).
**OBSOLETE (reversed)**: unnamed impl-producer inline (now always spawned); named spec-producer
spawned (now never spawned); "product/test split is private" framing (no longer ambiguous — one
verification set is always co-produced directly). **GAP**: "the loop runs without a
governance-show call" has no equivalent scenario — the harness-load-only mechanic isn't
Gherkin-tested in the new corpus.

### Explore (20) — 12 COVERED, 3 PARTIAL, 3 GAP, 1 OBSOLETE (+1 dup)

Explore/deliver mode derivation, discovery-must-be-judged, content-gap-as-marker, and spec-gate
mechanics are COVERED (`impl-producer.feature`, `conductor.feature`, `spec-gate.feature`).
**GAP** (genuine, no old equivalent anywhere in new corpus): (1) scenarios ordered top-to-bottom
by workflow stage — governed only by `suite-format-governance` prose, untested; (2) spec-producer
enriches `spec.md` for human consumption (diagrams, plain boolean Gherkin split) — same, prose
only; (3) `validate-spec` runs without NodeJS when `npx` is unavailable — no fallback scenario
found.

### Deliver (11) — 6 COVERED, 3 PARTIAL, 1 GAP-adjacent, 1 OBSOLETE (reversed)

Impl-judge independence, no-rubric-in-.feature, and aligned-gating scenarios are COVERED
(`gate-verdicts.feature`, `impl-producer.feature`). **OBSOLETE (reversed)**: unnamed
impl-producer built inline (now always spawned). **PARTIAL**: "deliver loop blocks when
impl-producer returns no artifacts" has no scenario titled around the producer-returns-nothing
case directly — only the downstream "frozen scenario with no verification blocks the gate" is
covered; the threshold-collapse scenarios (graded subject at/below threshold) are generic in
`impl-judge.feature` but the explicit `≥ threshold` framing now lives in ACES-specific governance,
not the SDD-default suite.

### Freeze (6) — 3 COVERED, 1 PARTIAL, 2 OBSOLETE (reversed)

"Approved with no impl", "reversible on deal-breaker", and ".feature is object-then-bar" are
COVERED (`acceptance/freeze.feature`, near-verbatim titles in one case). **OBSOLETE (reversed)**:
"plan change ripples to .feature expression, regenerated" and "tasks.md is a dependency DAG" —
the plan model is now flat `todos`, no DAG or regeneration concept survives; confirmed
intentional via `checkpoint.feature`.

### Segment (12) — 6 COVERED, 3 PARTIAL, 1 GAP, (+2 counted in PARTIAL)

Checkpoint-suspend, artifact-derived cursor, content-gap-as-marker, iteration-cap, and
non-blocking-observation mechanics are COVERED (`conductor.feature`, near-verbatim in two
titles). Strategist-boundary dedupe is COVERED (`doctrine/scanner.feature`). **GAP**: "a
workflow-procedural question is not persisted (used for this run only)" — no scenario
distinguishes ephemeral procedural questions from durable content questions in the new corpus.
**PARTIAL**: "observations bubble up, only the skill surfaces them" (the "do not spawn specs
outside your own" constraint isn't directly re-asserted, only routing is); "strategist lesson
spawns spec targeting sibling monorepo project" and "accepted structural observation spawns new
spec with priority/blocked-by" both have adjacent `formation.feature` routing scenarios but not
the exact old framing (the `priority`/`blocked-by` fields were explicitly removed from the new
schema per `github-34`'s Phase-0 cleanup — this is intentional, not a gap).

### Structural / coexistence (8) — 0 COVERED, 3 PARTIAL, 3 GAP, 2 OBSOLETE

This is where the real gaps concentrate. **OBSOLETE (moot)**: operator-spawnable check (operator
retired, replaced by in-session conductor + `sdd-automaton.md`); "retired model framing gone"
(referred to old prompt text specifically). **GAP** (need re-homing, not yet built): (1) no test
asserts `plugins/sdd/agents/sdd-orchestrator.md` / `sdd-scenario-writer.md` / `sdd-planner.md`
are removed at cutover — currently true only by absence, no forward-looking guard; (2) no test
asserts the new cross-cutting agents (`sdd-automaton.md`, `sdd-impl-judge.md`,
`sdd-spec-judge.md`, `sdd-scanner.md`, `sdd-warden.md`) exist with correct `name:` frontmatter;
(3) "conductor writes, cold judges grade" / producer≠judge is Gherkin-spec'd
(`conductor.feature`, `impl-judge.feature`) but never mechanically re-verified against the
conductor's actual prompt surface (`start-mission` skill), the way the old test grepped
`sdd-operator.md`. **PARTIAL**: "three producer-governance skills are the inline interface" —
only 2 of 3 are inline now (`impl-producer-governance` loads in a spawned builder); "registry
well-formed" — `resolve-governances.test.mts` unit-tests the parser against fixtures, but no
test validates the *live* `.agents/universal-plugin.json` file itself.

## Test patterns worth re-homing

1. **Anchoring functional tests to frozen `.feature` scenario titles.** Fully realized and
   *stronger* in the new design — `plugins/sdd-new/skills/*/scripts/*.test.mts` are real
   `node:test` unit tests against functions (`matchBar`, `resolveAgent`, `checkGateFloor`, …)
   rather than prose substring assertions. No gap; strict upgrade.
2. **Structural coexistence checks** (old agent files retired post-cutover; new agent files
   exist and are correctly shaped; the live registry parses). **GAP** — nothing under
   `plugins/sdd-new` verifies any of the three. Worth one new `node:test` file once the
   `plugins/sdd` → `plugins/sdd-new` cutover is scheduled (not yet, since `plugins/sdd` is still
   the intentional reference baseline — see `project_sdd_shot_before_aim` / D-B in
   `github-34.plan.md`).
3. **Invariant checks** ("conductor writes, cold judges grade" / producer ≠ judge). Spec'd in
   Gherkin but not mechanically re-verified against the live conductor prompt surface. **GAP.**

## Summary counts (81 total)

| Verdict | Count |
| --- | --- |
| COVERED | 46 |
| PARTIAL | 18 |
| GAP | 9 |
| OBSOLETE | 8 |

## Recommendation

**No follow-up CR needed right now.** The core producer/judge/gate semantics are re-homed and,
at the engine level, more rigorously tested than before (real `node:test` unit tests replacing
prose substring checks). The 8 OBSOLETE entries are confirmed-intentional design reversals
(impl-producer always spawns, spec-producer never spawns, plan is flat `todos` not a DAG,
`priority`/`blocked-by` dropped from the spec schema) — no backfill required.

The 9 GAP entries cluster in two places, neither urgent:

1. **Structural/coexistence guards** (3 of the 9) — deferred by design: they only matter once
   the `plugins/sdd` → `plugins/sdd-new` cutover is scheduled, and `plugins/sdd` is the
   intentional untouched reference baseline until then (`github-34.plan.md` resolved decision
   D-B). Revisit this file when cutover is scheduled; add the coexistence `node:test` then, not
   now.
2. **A handful of explore/segment/deliver mechanics** (6 of the 9: scenario ordering,
   `spec.md` human-enrichment, `validate-spec` no-NodeJS fallback, procedural-vs-durable
   question persistence, no-governance-show-call, impl-producer-returns-no-artifacts) — all are
   either prose-only conventions never meant to be Gherkin-tested, or thin enough that adding a
   scenario for each is not worth a dedicated CR. If any surfaces as a real bug later, add its
   scenario to the relevant unit's `.feature` at that point (additive, no CR needed per SDD's
   additive-scenario self-clear rule).

The 18 PARTIAL entries are acceptable as-is — each has a real (if not exactly named) equivalent;
none block correctness.
