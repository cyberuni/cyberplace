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
  - content: "run: same method"
    status: pending
  - content: "add-scenario: same method"
    status: pending
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

**config-authoring 5/5 DONE + eval-run 2/3 DONE** (define-agent both gates; improve-skill docs-only;
list-skills 39caafda; manage-skill-dirs 3445ac34; repair-private-skills b6275195; compare 19876610;
**report d97df408**). **7 of 16 nodes swept.**

Start **node 8 = run** (`.agents/specs/aced/eval-run/run/`) — last of the eval-run 3. Same method:
read the node's README + `.feature` + the real ACED skill it specs (`plugins/aced/skills/run/SKILL.md`
+ any bundled script) for control flow, draw CFG, re-derive scenarios per edge, additive-only unless a
stale frozen scenario forces a re-open, rebuild README to the 4-section shape (What / Use Cases +
**Fit:** line / Control Flow with mermaid CFG / Scenario map). Run check:spec. Then cold spec-judge →
self-assert spec gate → if scenarios changed, cold impl-judge → self-assert impl gate if clean
(auto-all). Then suite-authoring 2 (add-scenario, improve), sdd-roles 5 (extract-situation, impl-judge,
judge, scenario-writer, spec-validator), registry 1. One at a time.

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
