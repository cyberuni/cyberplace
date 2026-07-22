---
cr-ref: 304-m3-eval-artifact-migration
source: https://github.com/cyberuni/cyberplace/issues/304
status: draft
todos:
  - content: "[SETTLED by owner] DESIGN DECISION (todo 1). (1) Population = external subjects + self-dogfood ACED skill nodes, delivered ONE NODE AT A TIME (304-M2 cadence). (2) Run output at .agents/aced/results/<target>/ — OUT of the spec tree, git-ignored, ignore rule written idempotently by init-aced (issue #356 a). (3) Discovery reuses SDD spec-location conventions (ADR-0019 anchors) + eval.md marker; no ACED-specific path constant (issue #356 b). Recorded in ledger 304-m3-eval-artifact-migration.7935ff.jsonl."
    status: completed
  - content: "Gap A — colocate eval.md per eval-target node: create .agents/specs/<project>/…/<node>/eval.md (subject = the target config's path; run policy = eval.layers / judge.model / judge.default_threshold / trigger.{activation_threshold,runs}). Default run-policy template from the two legacy targets: layers [trigger, behavior], judge sonnet, default_threshold 4, trigger.runs 3 — confirm per node."
    status: pending
  - content: "[REFRAMED — subjects DELETED, owner chose PORT-ALL (B)] Gap B is RETIRE-not-migrate. Unit 2 = sdd-orchestrator: port 6 uncovered behaviors (002 missing-key fallback, 003 explicit-null degeneration, 005 MODE-from-freeze, 007-reframe domain-plugin write-boundary, 009 observation aggregation, 010 zero-domain-match) into FROZEN .agents/specs/sdd/mission/conductor/conductor.feature via SDD spec gate + impl gate, then retire artifacts/specs/sdd-orchestrator/. Unit 3 = aced-create-spec: port 2 (008 artifact-not-found, 017 multi-file-name-match) into start-mission's frozen SDD suite, then retire artifacts/specs/aced-create-spec/. Impl already conforms (behaviors live in sdd-automaton.md / start-mission SKILL) → impl gate is a conformance close. SDD chain, NOT ACED."
    status: in_progress
  - content: "Vocabulary/glossary cleanup: .agents/specs/aced/glossary.md still defines 'eval suite' as eval.md + golden-set/ (rewrite to the .feature model). Frozen suites carrying golden-set near-miss vocab (define-agent:36, define-skill:52/58, define-governance:31, scenario-writer:29/91, skillify:27/37, contribute-skill:29/48, improve:22, workflows/eval-loop:8) — each a Clearance-bound re-open."
    status: pending
  - content: "Docs + fixtures (Quill domain): ~140 golden-set/*.md fixtures + website/docs advertising the retired 1-5 scalar contract (apps/website .../aced/{run,report,overview,add-scenario}.md, docs/specs/aced/design.md, artifacts/specs/aced-plugin/spec.md) — tracked in github-263-op6-m3; likely a Quill node."
    status: pending
  - content: "Retire artifacts/specs/: once every target's eval.md + .feature live in project-spec nodes, remove the artifacts/specs/*/ dirs (legacy golden-set/, trigger/, eval.md). Confirm nothing in the ACED runtime still reads that tree."
    status: pending
---

# CR 304-M3 — ACED eval-artifact migration to the project-spec model

Sibling track to 304-M2 under the same CR (#304). M2 re-derives each ACED behavioral-leaf node's
frozen `.feature` + README from its CFG. **M3 makes the "everything in the project spec" artifact
model physically real** — the model the owner decided during M2 (see the M2 ledger `correction` entry,
`304-m2-eval-suite-sweep.c38aa5.jsonl`).

## The decided model (target end state)

A target's ACED eval lives entirely in its project-spec node, `.agents/specs/<project>/…/<node>/`:

- `README.md` — the 4-section node spec (M2 delivers this)
- `<node>.feature` — the frozen suite = the single eval source (boolean + `@rubric` inline + `@trigger`
  Examples), frozen at the spec gate (M2 delivers this)
- `eval.md` — colocated eval binding: **subject + run policy only** (M3 creates this)
- `results/` — timestamped run records (created at first `run`)

`artifacts/specs/` is retired. ACED discovers a node through the SDD spec tree (the node's `eval.md`
names the subject). The ACED skills already point at this model (M2 commit `9894d33c` swept the
location wording across `run` / `compare` / `report` / `improve` / `add-scenario` / `aced-impl-producer`).

## Why this is a SEPARATE mission from M2 (not folded in)

Owner call: continue the M2 sweep as-is (README + `.feature` per node) and track the eval-artifact
work here. The two are disjoint populations today:

- **M2 nodes** = ACED's own skill SDD specs (`.agents/specs/aced/…`) — README + `.feature`, **never had
  an `eval.md`**.
- **The eval targets** = the 2 dirs under `artifacts/specs/` that carry an `eval.md`
  (`aced-create-spec`, `sdd-orchestrator`) — **not in the project-spec tree at all**.

So `eval.md` is not created "along the way" by M2; M3 owns it.

## Unit sequence (each its own explore → spec gate → deliver → impl gate; ONE at a time)

1. **results-location infra** — `run` node (`.agents/specs/aced/eval-run/run`) revise output path from
   `results/<ts>.json` in the node dir → `.agents/aced/results/<target>/`; `init-aced` gains the
   idempotent `.gitignore` write. NOTE: `init-aced` has NO spec node yet — explore decides scaffold vs
   not-behaviorally-spec'd.
2. **Gap B: migrate `aced-create-spec`** — eval.md colocated in project-spec node; golden-set/ + trigger/
   → frozen `.feature` (@rubric inline + @trigger Examples); retire `artifacts/specs/aced-create-spec/`.
3. **Gap B: migrate `sdd-orchestrator`** — same shape.
4. **Gap A: colocate eval.md** on the chosen self-dogfood ACED skill nodes (population per decision).
5. **vocab/glossary cleanup** → retire `artifacts/specs/`.

Gap-B migrations and frozen-suite vocab rewrites are Clearance-bound re-opens; surface each to the owner.

## Progress

- **Unit 1 (results-location infra) — DONE & RATIFIED.** `setup/ignore-run-output/` deterministic node
  (append-last-wins engine + colocated node:test, 248/248 in plugin glob) + `run` additive scenario for the
  shared `.agents/aced/results/<target>/` location. Spec gate + impl gate both ratified (`by: unional`).
  Commits `991b526c`..`804c64a7`. ADR-0030 landed (multi-capability skill doctrine, refined with the
  deterministic-node test-colocation rule). Issue #358 (SDD-governance follow-up) filed.

## FINDING (2026-07-21) — BOTH Gap-B subjects are DELETED; "migrate to a node" premise is false

The plan (todo Gap B, unit sequence 2–3) assumes each legacy eval target has a live subject to bind a
project-spec node to. **Neither does** — both subjects were deleted in refactors months ago:

- **`aced-create-spec`** — subject `plugins/aced/skills/create-spec/SKILL.md` DELETED in commit `2714e650`
  ("delete aces:create-spec"); its spec-creation work was absorbed by `sdd:start-mission` + the ACED
  `define-*` family (`define-agent`/`define-skill`/`define-governance`), which M2 already delivered as
  project-spec nodes (each has `README.md` + `.feature`).
- **`sdd-orchestrator`** — subject `plugins/sdd/agents/sdd-orchestrator.md` DELETED (renamed conductor/
  automaton). Repo records it as dead: `.agents/specs/sdd/DESIGN-NOTES.md:246` "Dead: sdd-orchestrator";
  `artifacts/specs/graph.md:124` "deprecated". Behaviors decomposed into `sdd-operator`/automaton specs.

You cannot ACED-grade a config file that doesn't exist. So Units 2 & 3 are not "migrate" — the real
operation is **retire the orphaned target** (optionally porting any genuinely-uncovered behavioral
coverage into a surviving node first). No live external references to either dir remain (only the plan,
ledger followups, and dead-marker docs). This collapses units 2+3+6 into a retirement + coverage-audit.

## COVERAGE AUDIT RESULTS (2026-07-21) — both targets audited

Owner call: `sdd-orchestrator` intent re-binds to `plugins/sdd/agents/sdd-automaton.md` (live successor;
its behaviors live in the SDD project-spec node `.agents/specs/sdd/mission/conductor/`). Audit both, then
retire. NOTE: the surviving coverage targets are **SDD** specs (`conductor.feature`, `start-mission` SKILL),
NOT ACED-graded nodes — so ports go through the SDD chain, not the ACED chain the old plan assumed.

**aced-create-spec (21 golden + 3 trigger):** COVERED 10 · OBSOLETE 9 · UNCOVERED-worth-porting **2**.
- Obsolete (bulk scan/select/sequential-process orchestration + old designer wire contract): 004,005,006,
  007,011,012,014,016 — plus **010 reclassified OBSOLETE** (it asserts the retired `artifacts/specs/aced-<name>/`
  plugin-prefixed eval-dir path — exactly what M3 retires; porting re-enshrines the killed convention).
- Covered: 001,002,003,009,013,015,018,019,020,021 (start-mission Step 2 + improve.feature + define-*.feature).
- Trigger fixtures: DISSOLVED into start-mission's coarse trigger; negative/near-miss discrimination already
  mirrored by run/add-scenario/improve routing scenarios. Not ported.
- **PORT candidates (2):** 008 artifact-not-found (zero-match branch, distinct from ambiguity) → start-mission
  Step 2 resolution. 017 ambiguous-name-multiple-matches (two files share one name — distinct axis from type
  ambiguity) → start-mission Step 2 resolution.

**sdd-orchestrator (11 golden):** COVERED 5 (001,004,006,008,011) · UNCOVERED **5 clean + 1 reframe**.
- **PORT candidates (5 clean):** 002 missing-key→convention-name fallback; 003 explicit-`null`→no-agent
  degeneration (distinct from missing key); 005 MODE derived only from `.feature` freeze-state, never an input;
  009 multi-delegate OBSERVATIONS aggregation (no spawn/filter); 010 zero-domain-match resolves to all 5 SDD
  defaults w/o needs-input (distinct from absent-registry). All → `conductor.feature`.
- **007 reframe-only:** the `aligned:` stored-flag + "must not write body" premises are OBSOLETE (ADR-0017;
  conductor now advances `status` directly and authors SDD-default spec-producer bodies inline). Only the
  "does not write `domain-plugin` at synthesis" negative survives — port as a reframed write-boundary
  scenario or fold into the existing "never writes status" scenario. Judgment, not a straight port.

**Net genuinely-uncovered behavior to preserve: 7 scenarios** (aced: 008, 017 → start-mission; sdd: 002, 003,
005, 009, 010 → conductor) + 1 reframe (sdd 007). Each is a Clearance-bound spec-gate re-open of a FROZEN
SDD suite → a mission each. Retiring the two dirs is the clean coherent unit; the ports are separable.

## PORT-SET CORRECTION (2026-07-21) — verified against the CURRENT resolver, not the old fixtures

Owner chose **B (port all)**. Verifying the 6 conductor candidates against the authoritative current impl
(`plugins/sdd/skills/resolve-governances/scripts/resolve-governances.mts` `resolveAgent`, and the conductor
README) corrected the audit (which read only the suites, not the resolver):

- **002 omitted-key → `<plugin>-<role>` convention** — CONFIRMED impl (resolveAgent line 392). PORT (crisp).
- **003 explicit-null** — impl resolves null → **SDD default** (line 390), NOT "no agent." null-vs-omitted
  distinction is real; PORT but **rephrased** (null → SDD default, not the old "degenerate to no agent").
- **010 zero-domain-match → SDD defaults** — CONFIRMED (line 386), but the fixture's 5 NAMED defaults
  (`sdd-scenario-writer`/`sdd-planner`/`sdd-implementer`) are OBSOLETE (today SDD producer defaults are
  `null` = inline/generic). PORT as "present registry, no squad for the type → every role to SDD default,
  no needs-input" (distinct Given from the existing absent-registry scn 43-47), **without dead names**.
- **005 MODE-from-freeze** — soft (partly covered by scn 304-308 position-from-artifacts). PORT a focused
  positive: explore entered from a non-frozen suite, no caller-supplied mode.
- **009 observation aggregation** — scn 326-330 covers single-observation routing; multiplicity is the gap.
  PORT: every producer's observations forwarded, none dropped/filtered, no self-spawn.
- **007 write-boundary (`aligned:true` + don't-write-`domain-plugin`)** — OBSOLETE: `aligned:` retired
  (ADR-0017), `domain-plugin` not a current field, status-negative already scn 141-144. **DROP.**

Net conductor port: **5 scenarios** (002,003,005,009,010) into conductor.feature Resolution/Explore/Segment.
This frozen-suite re-open is Clearance-bound → the spec gate STOPS for owner ratification (leash=auto-spec).
aced-create-spec ports (008,017 → start-mission suite) still pending after the conductor unit.

## SPEC-GATE ROUND 1 (2026-07-21) — cold sdd-spec-judge caught cross-node duplication

The cold judge FAILED the architect lens: scenarios 002 + 003 were VERBATIM duplicates of the sibling
matcher node `.agents/specs/sdd/mission/resolution/resolution.feature:94-97,105-108` (the coverage audit
+ my draft both missed the `resolution` node — only checked conductor.feature). Judge ruling: matcher-branch
behavior (omitted/null/zero-match) is the resolution UNIT's territory; the conductor node owns orchestration
(spawn/provenance/fail-closed), not the branch itself. Corrections applied:
- DROPPED 002, 003 from conductor.feature (covered by resolution.feature) + removed their README paragraph;
  conductor README now cites `../resolution/` by reference.
- RELOCATED 010 (zero-match) → resolution.feature ("a present registry with no squad ... → sdd defaults",
  after the absent-registry scn) + a companion resolution/README clause distinguishing present-no-match from
  absent-registry and from the two-plugins needs-input case. (matchSquad zero-match path, genuinely uncovered.)
- REPOSITIONED 005 to the TOP of the Explore section (judge's non-blocking step-down observation).
- 005, 009 PASSED all three lenses; kept in conductor.feature.

Net additive diff: conductor.feature +2 (005 explore-from-freeze, 009 observations-from-several-producers);
resolution.feature +1 (010 present-no-match). Both parse clean; check:specs green. RE-JUDGE in flight.

## SPEC GATE RATIFIED + IMPL GATE ROUND 1 (2026-07-21)

Spec gate ALIGNED (round 2, all 3 lenses) → committed `beaab080` (additive→self-clears, auto-spec).
Impl gate (cold sdd-impl-judge): scn 1 (explore-from-freeze) PASS, scn 3 (present-no-match, resolution)
PASS with a new binding test in resolve-governances.test.mts (50/50). Scn 2 (observation aggregation)
FAILED — ADR-0016 catch: the frozen scenario's multi-producer/no-loss/no-self-spawn guarantee had NO
executable-config backing (start-mission SKILL only specified single-producer explore-only routing; the
README stated the full guarantee but that's spec-restating-spec). FIX (impl-gate change action, feature
untouched): generalized start-mission/SKILL.md "Route observations" bullet to every producer across a
segment + explicit no-drop/no-filter/no-self-spawn; sdd-automaton inherits. RE-VERIFY of scn 2 in flight.

## NEXT — resume here — AWAIT scn-2 re-verify, then commit impl-gate unit 2

On PASS: commit the impl unit (start-mission config fix + resolve-governances binding test). Then Unit 3:
port aced-create-spec 008 + 017 into start-mission's suite — but FIRST run check-scenario-overlap / scan
ALL sibling nodes (round-1 lesson: the audit missed the resolution node). Then retire
artifacts/specs/{aced-create-spec,sdd-orchestrator}/ + confirm no ACED runtime reads that tree.

On ALIGNED: commit the conductor+resolution spec-gate unit (additive port). Then Unit 3: port aced-create-spec
008 (artifact-not-found/zero-match) + 017 (multi-file-name-match) into start-mission's frozen SDD suite —
FIRST check for a sibling node that already covers them (lesson from round 1: check ALL nodes, not one file;
run check-scenario-overlap). Then retire artifacts/specs/{aced-create-spec,sdd-orchestrator}/ + confirm no
ACED runtime reads that tree. Impl gate on both = conformance close (behaviors already live in the configs).

Ask the owner how to handle the 7 preserved behaviors relative to retiring the dirs. Recommended: **A** —
retire both `artifacts/specs/{aced-create-spec,sdd-orchestrator}/` NOW as the coherent M3 unit, and FILE the
7 (+1 reframe) as a tracked coverage-gap follow-up (ledger followup + backlog issue) to port into the frozen
SDD suites in dedicated missions — keeps M3 scoped, loses no coverage knowledge. Alt **B**: port all 7 into
the frozen suites as part of M3 (expands M3 into multiple SDD spec-gate re-opens). Alt **C**: retire now, port
nothing (drops real edge-case coverage). Do NOT scaffold a node bound to a deleted subject under any option.

Remaining after unit 2: unit 3 (Gap B migrate `sdd-orchestrator`), unit 4 (Gap A eval.md on self-dogfood ACED
skill nodes), unit 5 (vocab/glossary cleanup), unit 6 (retire `artifacts/specs/`).

Landing model: like M2 (PR #355), accumulate all M3 units on this branch, then ONE PR referencing #304 (does NOT
close it — #304 is the M1-M6 umbrella). No PR yet.

Leash: `auto-spec`, by user (ledger `304-m3-eval-artifact-migration.7935ff.jsonl`).
