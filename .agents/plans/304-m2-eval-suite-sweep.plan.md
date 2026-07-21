---
cr-ref: 304-m2-eval-suite-sweep
source: https://github.com/cyberuni/cyberplace/issues/304
status: draft
ledger-hash: c38aa5
todos:
  - content: "define-agent: DONE — 4 additive scenarios + 1 owner-cleared re-open (scn 24 stale eval-suite), README 4-section, SKILL B9 broadened to positive form; both gates green (impl owner-ratified)"
    status: completed
  - content: "improve-skill: DONE — docs-only (59 scenarios already CFG-complete, 1:1, no additive/re-open); README rebuilt; cold judge ALIGNED CFG faithful. 2 pre-existing SKILL.md drifts filed as backlog followups. Spec gate self-asserted, no impl gate."
    status: completed
  - content: "list-skills: DONE — 1 additive scenario (absent-source tolerance, the !existsSync(dir) guard; positive companions = the 4 source scans), README rebuilt 4-section; both gates self-asserted (cold spec-judge ALIGNED 3/3, cold impl-judge PASS at list-skills.mts:121). 1 backlog followup (malformed skill.json tolerance, subsumed by scn 14). Commit 39caafda."
    status: completed
  - content: "manage-skill-dirs: DONE — 3 additive guard-edge scenarios (induce ..-escape; induce single-segment→literal-only; edit-to-fixed-root reject) + 1 new node:test; README rebuilt 4-section (28-row map, edit-old-fixed edge added); both gates self-asserted (cold spec-judge ALIGNED 3/3, cold impl-judge PASS all 3, 29/29 tests). 1 backlog followup (@rubric A_and_B dim name, needs re-open). Commit 3445ac34."
    status: completed
  - content: "repair-private-skills: DONE — 4 additive scenarios (validate absent-dir; repair absent-dir twin; repair skipped_missing_skill; repair existing-metadata-block insert) + 3 new node:tests; README rebuilt 4-section (18-row map, shared terminals back validate+repair each); both gates self-asserted (cold spec-judge ALIGNED 3/3, cold impl-judge PASS, 24/24 tests). Spec-judge's flagged repair-absent asymmetry closed in-node. Commit b6275195."
    status: completed
  - content: "compare: DONE — 3 additive edges (defer to add-scenario completes the trigger near-miss bucket; report never averages raw totals across scenarios = safety-dual of net-change; regression gate fires on a dimension drop while case still passes = the SKILL's central branch, suite had only the pass->fail flip). README rebuilt 4-section (18-row map, mermaid CFG) + Fit:strong (cold spec-judge caught the missing Fit decl). Both gates self-asserted (cold spec-judge ALIGNED 3/3 lenses; cold impl-judge PASS 3/3 additive). Commit 19876610."
    status: completed
  - content: "report: DONE — 5 additive edges (mean normalizes per scenario %max never raw-total avg SKILL 28-32; no-rubric suite renders mean --; full-detail mode lists a named suite's failing cases; degraded->run for detail SKILL 72 the 5-class map bound only 4; needs-attention names the worst failing case SKILL 24/58-59). README rebuilt 4-section (18-row map, mermaid CFG, Fit:strong). Both gates self-asserted (cold spec-judge ALIGNED 3/3; cold impl-judge PASS 5/5, 5th judged in a focused round). 1 backlog followup: trending-down modeled as exclusive class vs SKILL's overlay-flag example — needs re-open, deferred. Commit d97df408."
    status: completed
  - content: "run: DONE — 7 additive edges (untagged->behavior layer default; blind-judge pass path+name never body; trigger outline once per Examples row; trigger layer over eval.trigger.runs; totals vs own max never raw-mean; inline pass bar overrides default; behavior judged once unless N). Last two close the cold spec-judge's 1:1 asymmetry (trigger side had 2 run-count scenarios, non-trigger once-branch had 0). README rebuilt 4-section (23-row map, mermaid CFG w/ threshold node, Fit:strong). Both gates self-asserted (cold spec-judge ALIGNED 3/3; cold impl-judge PASS 7/7). 1 backlog followup (per-shape collect distinction). Commit 1633e25b. eval-run track COMPLETE."
    status: completed
  - content: "add-scenario: SPEC DONE + committed (923af59f) — RE-OPEN under owner Clearance: frozen suite specced the RETIRED golden-set-dir model but SKILL.md was migrated to the .feature-append model (commit 9f515205). Rewrote 4 stale scenarios to append-model + scrubbed golden-set vocab; added 6 additive edges (3 scaffold shapes + check-suite + behavior/quality layer inference). Suite 17->24. Cold spec-judge ALIGNED (after fixing 2 flagged gaps: half-migrated header, unbound layer edges); cold impl-judge PASS 10/10 (SKILL.md unchanged, already conforms). check:spec green post-commit (align-spec re-open flag cleared vs HEAD). IMPL GATE SURFACED — awaiting owner ratification (re-open stops per auto-all leash)."
    status: completed
  - content: "improve: same method"
    status: pending
  - content: "extract-situation: same method"
    status: pending
  - content: "impl-judge: same method"
    status: pending
  - content: "judge: same method"
    status: pending
  - content: "scenario-writer: same method"
    status: pending
  - content: "spec-validator: same method"
    status: pending
  - content: "registry: same method"
    status: pending
---

# CR 304-M2 — ACED eval-suite corpus sweep (remaining 16 leaves)

The M2 track of issue #304. M1 (PR #348, open) swept 6 nodes; this sweeps the **remaining 16 ACED
behavioral-leaf specs** that still lack `## Control Flow`, one node at a time. Branch off `origin/main`
(independent of M1's #348; disjoint file sets). No per-node golden-set corpora exist for these nodes —
re-derive **purely from the drawn CFG** (golden-set was reference-only; these never had one).

## CORE METHOD (per node, one at a time)

1. Read the node's `README.md` + `<node>.feature` + the actual ACED skill/agent it specs (the source
   of its control flow).
2. Draw the CFG from the node's real logic (each decision → branch).
3. Re-derive the **full** scenario set from the CFG — each edge drives its scenario. Do NOT read the
   suite and patch gaps.
4. Reconcile against the frozen `.feature`: **additive self-clears** (stays `@frozen`, no re-open);
   **narrowing/rewrite** needs a ratified re-open + Clearance floor. A CFG-complete suite → **zero
   scenario changes → docs-only, no impl gate**.
5. Rebuild the README to the four-section shape (What / Use Cases / Logic-with-mermaid-CFG / Scenario
   map, every edge bound 1:1).
6. `pnpm --filter @cyberplace/aced-plugin check:spec`.
7. Self-assert the **spec gate** within leash with a fresh COLD spec-judge.
8. Run a focused COLD impl-judge on any changed/added scenarios (skip if docs-only).
9. Commit `feat(aced)` (or `docs(aced)` if docs-only) per node.
10. Surface the impl gate to the owner for ratification (per M1 pattern).

## Context strategy

Dispatch per-node produce + judges to subagents (fresh context, compact verdict back). Checkpoint this
brief after each node. Hard `/clear` + `resume-mission` every ~2 nodes to keep the conductor context lean.

## NEXT — resume here

**Impl-gate cadence (owner):** **auto-all** — self-assert the impl gate on a cold impl-judge PASS with
clean scope + no frozen rewrite; STOP for owner ratification only on a Clearance/re-open or a CHANGE.

**config-authoring 5/5 + eval-run 3/3 DONE; suite-authoring 1/2 spec-done** (define-agent both gates;
improve-skill docs-only; list-skills 39caafda; manage-skill-dirs 3445ac34; repair-private-skills
b6275195; compare 19876610; report d97df408; run 1633e25b; **add-scenario 923af59f — spec done, IMPL
GATE AWAITING OWNER RATIFICATION**). **9 of 16 nodes swept.**

**Node 9 add-scenario CLOSED** — impl gate ratified (owner directed "continue the sweep as-is" after
the location fix; recorded by:unional). **9 of 16 nodes done.**

**Eval-artifact migration is a SEPARATE mission:** owner call — continue the M2 sweep as-is (README +
`.feature` per node, NO eval.md created here). The eval.md colocation + legacy-target migration + vocab
cleanup are tracked in `304-m3-eval-artifact-migration.plan.md` (same CR, status: draft, blocked on an
owner design decision about which nodes are runnable eval targets). Do NOT create eval.md in M2 nodes.

**Location-model correction (commit 9894d33c) — DONE.** During node-9 ratification the owner caught
that the ACED skills hardcoded the RETIRED suite location `artifacts/specs/<feature-name>/`. Owner
decided the canonical model is EVERYTHING IN THE PROJECT SPEC: a target's node under
`.agents/specs/<project>/…/<node>/` holds the frozen `<node>.feature` + colocated `eval.md` (subject +
run policy) + `results/`; `artifacts/specs/` retired; discovery via the SDD spec tree. Swept 7 skills +
report spec-README (location-only; frozen suites are path-neutral so conformance-preserving, no re-open).
add-scenario's 2 LOCATE scenarios re-judged PASS against the corrected SKILL. This means node 9's impl
is NOW genuinely correct (my first node-9 impl-judge scoped to scaffold/append and missed the stale
locate step — lesson: hand the impl-judge the LOCATE/discovery scenarios too, not just the changed ones).
Broader golden-set migration (glossary, frozen near-miss vocab, legacy artifacts/specs dirs, ~140
fixtures) filed as a corpus-wide backlog followup — a dedicated migration mission after M2.

Start **node 10 = improve** (`.agents/specs/aced/suite-authoring/improve/`) — last of suite-authoring.
Same method: read the node's README + `.feature` + the real ACED skill it specs
(`plugins/aced/skills/improve/SKILL.md` + any bundled script) for control flow, draw CFG, re-derive
scenarios per edge, additive-only unless a stale frozen scenario forces a re-open (WATCH for the same
golden-set-vs-.feature staleness that hit add-scenario — improve diagnoses eval failures, may reference
the retired model), rebuild README to the 4-section shape. Run check:spec. Then cold spec-judge →
self-assert spec gate → cold impl-judge → self-assert impl gate if clean (auto-all; STOP on re-open).
Then sdd-roles 5 (extract-situation, impl-judge, judge, scenario-writer, spec-validator), registry 1.

**Two hard-won mechanics (both cost a cycle):**
1. **README scenario-map MUST be a 3-column table `| Edge | Path (Given) | Scenario |`** with the
   scenario backtick-wrapped in col 3 — check-suite's `parseScenarioMap` skips any row that isn't
   exactly 3 cells (`plugins/sdd/skills/spec-gate/scripts/check-suite.mts:447`). A 2-col map fails
   every scenario as "not on the scenario map."
2. **Every node README needs a `**Fit:**` line** (strong/partial/hybrid) inside Use Cases, between the
   Non-goals prose and the table — the cold spec-judge flags its absence as a CONTENT_GAP.
Also: append gate verdicts + any followups to the ledger shard **as part of each node's commit** (don't
defer — compare's got backfilled a node late).

**Method note (nodes 1-5):** authoring the CFG + reconciliation INLINE (conductor) then dispatching
only the two COLD judges works well and keeps derivation quality under conductor control — judges MUST
stay cold/independent regardless. When a node has an impl script + test file, ADD a node:test for any
new deterministic scenario that lacks one (mirrors existing test style) so the frozen scenario is
node:test-backed. The cold spec-judge has twice caught real README/CFG asymmetries (manage-skill-dirs
mermaid edge; repair-private-skills repair-absent twin) — resolve them in-node.

**Still pending:** run `pnpm verify` (full gate) at the next natural checkpoint — impl test files were
touched in nodes 4-5 (compare added none, so it's still owed). **`/clear` + resume-mission** every
~2 nodes to keep the conductor context lean.

Order: config-authoring 5 (define-agent, improve-skill, list-skills, manage-skill-dirs,
repair-private-skills) → eval-run 3 (compare, report, run) → suite-authoring 2 (add-scenario, improve) →
sdd-roles 5 (extract-situation, impl-judge, judge, scenario-writer, spec-validator) → registry 1.

Leash: `auto-spec` (self-assert spec gates within leash; surface impl gates to owner). Ledger shard:
`.agents/specs/aced/ledger/304-m2-eval-suite-sweep.c38aa5.jsonl`.
