---
name: "migrate-operator-test-learnings: what to learn + migrate from the 73 sdd-operator.test.mts scenarios"
overview: "Investigate-then-decide mission. The old plugins/sdd/agents/sdd-operator.test.mts carried 73 functional scenarios (8 resolution + 16 dispatch + 20 explore + 11 deliver + 6 freeze + 12 segment) anchored to frozen .feature scenario titles, plus structural coexistence / registry-well-formedness checks. The operator folded into the in-session conductor (start-mission) + the headless sdd-automaton, NEITHER of which has agent-level test coverage; new coverage is spec-level node:test (verify:specs-new). Determine EXACTLY which of the 73 scenarios encode behavior NOT already covered by the new sdd-new spec .feature suites and their node:tests, and which testing PATTERNS (anchor-to-frozen-title, structural coexistence, registry well-formedness, inline-producer/cold-judge invariants) are worth re-homing onto the new conductor/automaton. Output: a coverage-gap map + a recommendation per scenario (migrate as conductor/automaton .feature scenario, fold into an existing suite, or drop as obsolete under the new design). The recommendation may itself spawn a follow-up CR to add the missing suites."
todos:
  - id: intake
    content: "Step 1 — open local CR `migrate-operator-test-learnings`, scaffold this brief. Source: user request (this session). This is an INVESTIGATION mission; whether a behavior-changing CR follows is decided by the `recommend` step."
    status: pending
  - id: inventory
    content: "Read plugins/sdd/agents/sdd-operator.test.mts in full. Enumerate all 73 scenarios grouped by area (resolution/dispatch/explore/deliver/freeze/segment) + the structural coexistence checks; for each, capture what it asserts and which old .feature title it anchored to."
    status: pending
  - id: map-coverage
    content: "For each scenario, find the corresponding behavior in the NEW sdd-new corpus (.agents/specs/sdd — conductor, deliver/impl-judge, handoff, resolve-squad, gate-verdicts, freeze, escalation-floor, plugin) and its node:test. Mark each: COVERED / PARTIAL / GAP / OBSOLETE-under-new-design (e.g. operator-as-agent specifics that no longer exist now the conductor is in-session)."
    status: pending
  - id: pattern-extract
    content: "Identify reusable TEST PATTERNS worth keeping regardless of scenario: anchoring tests to frozen .feature titles, structural coexistence (retired-agents-gone, registry well-formedness), the inline-producer / cold-judge / conductor-writes invariants. Note where the new design should assert these (start-mission, sdd-automaton, plugin registry)."
    status: pending
  - id: recommend
    content: "Produce the coverage-gap map + a per-scenario recommendation (migrate / fold / drop). Decide whether the GAPs warrant a follow-up CR adding conductor + automaton .feature suites (with node:tests), or whether spec-level coverage already suffices. Write the decision and rationale."
    status: pending
  - id: handoff
    content: "Handoff: write the gap map + recommendation to a durable doc (docs/research or an ADR if it changes test strategy); update this ## NEXT; update memory. Commit. If a follow-up CR is warranted, file it as its own mission brief."
    status: pending
isProject: false
---

# Plan — migrate-operator-test-learnings

> Mission plan (portable handoff brief). Tracked, per-worktree.
> Local CR `migrate-operator-test-learnings`. Source: user request (this session).
> Runs on branch `next`.

## What we are doing

The old `sdd-operator.test.mts` (73 scenarios) was the only agent-level functional guard on the
conductor's behavior. The operator folded into `start-mission` (in-session) + `sdd-automaton`
(headless), and that test suite did NOT come along — current guarding is spec-level node:test.
This mission audits the 73 scenarios against the new corpus to find genuine coverage gaps and the
test patterns worth re-homing, then recommends migrate / fold / drop per scenario.

## NEXT — resume here

▶ NOT STARTED. Begin at `inventory`: read `plugins/sdd/agents/sdd-operator.test.mts` and list the
73 scenarios by area, then map each against `.agents/specs/sdd` in `map-coverage`. Keep it an
investigation — do not write conductor/automaton suites until `recommend` says a follow-up CR is
warranted.

## CR

Local CR `migrate-operator-test-learnings`. Source: user request (this session). Investigation
first; produces a coverage-gap map + recommendation. A behavior-changing CR (new conductor /
automaton suites) is conditional on the `recommend` step and would be filed as its own mission.
