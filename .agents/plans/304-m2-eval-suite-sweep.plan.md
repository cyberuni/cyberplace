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
  - content: "compare: same method"
    status: pending
  - content: "report: same method"
    status: pending
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

**Node 1 define-agent DONE + committed.** Impl-gate cadence set by owner: **auto-all** — self-assert
the impl gate on a cold impl-judge PASS with clean scope + no frozen rewrite; STOP for owner ratification
only on a Clearance/re-open or a CHANGE verdict.

**config-authoring 5/5 DONE + committed** (define-agent both gates; improve-skill docs-only;
list-skills +1 additive 39caafda; manage-skill-dirs +3 additive 3445ac34; repair-private-skills
+4 additive b6275195). **All 5 config-authoring leaves swept.**

Start **node 6 = compare** (`.agents/specs/aced/eval-run/compare/`) — first of the eval-run 3
(compare, report, run). Same method: read the node's README + `.feature` + the real ACED skill it
specs (`plugins/aced/skills/compare/SKILL.md` + any bundled script) for control flow, draw CFG,
re-derive scenarios per edge, additive-only unless a stale frozen scenario forces a re-open, rebuild
README to the 4-section shape (What / Use Cases / Control Flow with mermaid CFG / Scenario map 1:1),
run check:spec. Then cold spec-judge → self-assert spec gate → if scenarios changed, cold impl-judge →
self-assert impl gate if clean (auto-all: additive PASS self-asserts; stop only on Clearance/re-open/
CHANGE). Then node 7 = report, node 8 = run, then suite-authoring 2 (add-scenario, improve), sdd-roles
5 (extract-situation, impl-judge, judge, scenario-writer, spec-validator), registry 1. One at a time.

**Method note (nodes 1-5):** authoring the CFG + reconciliation INLINE (conductor) then dispatching
only the two COLD judges works well and keeps derivation quality under conductor control — judges MUST
stay cold/independent regardless. When a node has an impl script + test file, ADD a node:test for any
new deterministic scenario that lacks one (mirrors existing test style) so the frozen scenario is
node:test-backed. The cold spec-judge has twice caught real README/CFG asymmetries (manage-skill-dirs
mermaid edge; repair-private-skills repair-absent twin) — resolve them in-node.

**Next resume should `/clear` + resume-mission first** (5 nodes since session start) to keep the
conductor context lean before the eval-run track. Also run `pnpm verify` (full gate) at the next
natural checkpoint — impl test files were touched in nodes 4-5.

Order: config-authoring 5 (define-agent, improve-skill, list-skills, manage-skill-dirs,
repair-private-skills) → eval-run 3 (compare, report, run) → suite-authoring 2 (add-scenario, improve) →
sdd-roles 5 (extract-situation, impl-judge, judge, scenario-writer, spec-validator) → registry 1.

Leash: `auto-spec` (self-assert spec gates within leash; surface impl gates to owner). Ledger shard:
`.agents/specs/aced/ledger/304-m2-eval-suite-sweep.c38aa5.jsonl`.
