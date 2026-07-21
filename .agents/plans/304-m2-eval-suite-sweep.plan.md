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
  - content: "improve: DONE — 5 additive edges (defer-to-define new-scaffold near-miss; defer-to-improve-skill audit near-miss; artifact-type identified+read-in-full; untracked->general-review = the whole not-tracked branch aced-fit+builder-bar the suite omitted; untracked->no-fabricated-verdict verify safety-dual). SKILL was broader than the suite (grew a not-tracked branch); all additive, no re-open. Suite 14->19. README rebuilt 4-section (mermaid CFG w/ tracked-vs-untracked fork, Fit:strong). Both gates self-asserted (cold spec-judge ALIGNED 3/3; cold impl-judge PASS 5/5). golden-set vocab scn 22 deferred to 304-M3. Commit 8d28830d. suite-authoring track COMPLETE."
    status: completed
  - content: "extract-situation: DONE — 4 additive edges re-derived from the engine CFG (leading-And doesn't inherit across a scenario boundary = the lastKeyword reset the orphan-And scenario is blind to; malformed --row fails closed = main arg guard, distinct from RowOutOfRange table check; json emits regrouped by keyword; json withholds the answer key = 2nd leak surface, positive companion = json-emit). Suite 28->32. README rebuilt 4-section (added Control Flow mermaid CFG + 32-row 3-col map; NO Fit line — deterministic node:test engine, not an ACED subject). Both gates self-asserted (cold spec-judge ALIGNED 3/3; cold impl-judge PASS 4/4). Impl-judge ablation caught the malformed-row backing test was under-bound (crash also exits!=0); STRENGTHENED test:1395 to assert the guard's stderr, re-ablation confirms red-on-neuter. 88/88 tests. Commit cf559cff. No stale vocab in this node."
    status: completed
  - content: "judge: DONE — 4 additive edges re-derived from the aced-case-judge agent-def CFG (thin-transcript-scored-as-is = bars augmenting the returned thin transcript, distinct from never-simulate-own scn 10; boolean output shape = completes the @rubric/@trigger/boolean output triple; rubric-name-format-collision blocker = 3rd fail-closed; non-zero-extractor-exit blocker = completes the 2-arm extractor blocker, the cold spec-judge's OWN flagged gap). Suite 30->34. README rebuilt 4-section (added Control Flow mermaid two-pass CFG + 34-row 3-col map; Fit:partial kept — LLM-graded role). Both gates self-asserted (cold spec-judge ALIGNED 3/3 on first 3, 4th is its own recommended edge; cold impl-judge PASS 4/4 against exact agent-def imperatives, incl a mutation-distinctness proof for the non-zero-exit/empty-brief pair). Commit 090c8fc3. No stale vocab."
    status: completed
  - content: "impl-judge: same method"
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

**config-authoring 5/5 + eval-run 3/3 + suite-authoring 2/2 + sdd-roles 2/5 DONE. 12 of 16 nodes
swept.** Remaining: sdd-roles 3 (impl-judge, scenario-writer, spec-validator), registry 1.

**Nodes 11 extract-situation (cf559cff) + 12 judge (090c8fc3) DONE**, both gates self-asserted, full
`pnpm verify` green after node 11. NODE-NATURE NOTE: `extract-situation` is a deterministic
node:test-backed ENGINE (NO `**Fit:**` line); `judge` is LLM-graded (`Fit: partial`). Check each
remaining node's nature: `impl-judge`, `scenario-writer`, `spec-validator` ARE graded roles (impls are
`plugins/aced/agents/aced-impl-judge.md` + skill defs / the scenario-writer + spec-validator
agent/skill defs) so they likely carry Fit; `registry` may be an engine like extract-situation (check
`plugins/aced/skills/…` for a script vs an agent def).

Start **node 13 = impl-judge** (`.agents/specs/aced/sdd-roles/impl-judge/`). Impl is
`plugins/aced/agents/aced-impl-judge.md` (the aced-impl-judge subagent def; it runs the frozen suite
over N runs and collapses per-scenario). Same method: read README + `.feature` + the agent def for
control flow, draw CFG, re-derive scenarios per edge, additive-only unless a stale frozen scenario
forces a re-open, rebuild README to the 4-section shape (What / Use Cases + **Fit:** if graded /
Control Flow with mermaid CFG / Scenario map, 3-col `| Edge | Path | Scenario |` backtick col 3). Run
check:spec. Then cold spec-judge → self-assert spec gate → cold impl-judge → self-assert impl gate if
clean (auto-all; STOP on re-open). Then node 14 scenario-writer, 15 spec-validator, 16 registry.

**TWO LESSONS worth carrying (both landed real edges):**
1. (node 11) Hand the cold impl-judge license to run ABLATION controls on the backing tests, not just
   re-derive oracles — it caught the malformed-row node:test was under-bound (a downstream crash
   satisfied the same exit!=0 + empty-stdout postcondition). Strengthen the test to assert the fix's
   SPECIFIC signature so ablating the fix turns it red. See [[feedback_a_binding_test_can_itself_fail_to_bind]].
2. (node 12) When the cold spec-judge flags a "pre-existing / out-of-scope" coverage gap that is
   actually a real CFG edge the impl SPELLS OUT (e.g. a two-arm blocker where the suite froze only one
   arm), ADD it now — deferring it to a followup IS the "read the suite and patch gaps later"
   anti-pattern. Complete the CFG-derived set; a focused cold judge on just the added edge keeps the
   gate honest. See [[feedback_cfg_drives_scenarios_not_the_reverse]].

**CHECKPOINT: this is the ~2-node boundary — /clear + resume-mission before node 13 to keep the
conductor context lean.**

**WATCH on every remaining node:** (1) golden-set vocabulary in frozen scenarios — do NOT scrub it
(Clearance-bound rewrite, tracked in 304-M3); just log any occurrence to the M3 vocab todo. (2) stale
`artifacts/specs/` location in the SKILL/agent impl — that model is retired (fixed for the 7 skills in
9894d33c); if a remaining node's impl still references it, note whether it needs the same location fix.
(3) do NOT create eval.md (that is the 304-M3 mission).

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
