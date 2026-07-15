---
cr-ref: 263-op6-m2
status: implemented
todos:
  - content: "explore: verify premise — no bar carries discrimination or pairwise consistency"
    status: completed
  - content: "author suite-format bar — discrimination (miss test, 3 anti-patterns) + pairwise consistency"
    status: completed
  - content: "author aced-builder-spec — memorizer default, rubric vocabulary, well-formed not sufficient"
    status: completed
  - content: "additive scenarios: spec-producer, aced spec-validator (spec-gate needed none)"
    status: completed
  - content: "spec gate — cold spec-judge ALIGNED after 2 rounds; 2 Clearances granted"
    status: completed
  - content: "deliver: lower bars into both judges + both producers; pnpm verify green"
    status: completed
  - content: "impl gate — cold impl-judge IMPLEMENTATION_PASS after 2 rounds"
    status: completed
  - content: "handoff: PR referencing #263, completes op6-m2"
    status: pending
---

# op6-m2 — close the authoring bars against the eval-cannot-fail class

CR: https://github.com/cyberuni/cyberplace/issues/263 (master plan, node `op6-m2`; folds #244 + #258).
Depends on `op6-m1` (#243 parse guard, merged).

## Scope

The **bars only**. Do not re-author the `ssa-lowering` suite — that is `op6-m5`.

## The defect

The authoring bar checks a scenario's **shape**, never its **discrimination**. A well-formed
`@rubric` is accepted (#244); a well-formed boolean scenario is accepted (#258). Nothing requires
either to be able to register a miss. Nothing checks scenario-vs-scenario inside one suite.

## Premise verification (done)

Confirmed: no bar, judge, or engine carries a loseability requirement, an intra-suite
Given-consistency check, or presence/restatement/procedural anti-patterns.

**One brief correction:** the brief claims intra-suite contradiction language does not exist. It
does — the **`Conflict` hard floor** (`design/autonomy-rubric.md`, `acceptance/escalation-floor.feature`).
But it fires at the **impl gate**, post-freeze, with **no detector**, and covers *logical*
contradiction with no intended winner. The new rule is the **authoring-time detector** that feeds it,
not a competing concept — position it as such, do not restate the floor.

## Design

**suite-format-governance (universal)**
- Discrimination: every scenario and every `@rubric` dimension must be able to register a miss.
- The **miss test** — name a *plausible* wrong subject; check it loses. Plausible, not strawman.
  Canonical wrong subjects: memorizer, copier, procedure-follower, single-brancher.
- Anti-patterns: **presence**, **restatement**, **procedural**.
- Arithmetic clause: loseable-somewhere is not enough — each named wrong subject's summed score
  must sit under threshold, not by one point of one dimension.
- Judged, not linted (mirrors the probe-independence precedent). `check-suite` is untouched.
- Pairwise consistency: no two scenarios demand opposite verdicts on one constructible snapshot.
  Givens need not be disjoint; overlap yielding contradictory outcomes is the defect. Scoped by
  a shared `When`.

**aced-builder-spec (ACED-specific)**
- Well-formed `@rubric` is necessary, never sufficient.
- The subject is a config document the case-judge also reads → the **memorizer** is the default
  wrong subject; rubric vocabulary drawn from the subject's own prose grades recall.

## Floors

- **Clearance — FIRED TWICE; both granted by the owner in-session, recorded in the ledger.**
  1. `spec-validator.feature` "a clean suite passes every criterion" — `Given` widened from six
     criteria to eight. Left frozen, it certifies a suite clean without checking either new
     criterion.
  2. `spec-producer.feature` "the producer reports complete when the self-check finds no violation" —
     `Given` qualified to exclude an entangled `Given` and an unregisterable miss. **This resolves a
     contradiction that predates the CR**: the frozen entangled-Given scenario already gave the
     opposite verdict on one snapshot. The new pairwise rule is what surfaced it.

  The frozen `a well-formed @rubric scenario passes rubric-structure` needed **no** edit — its `When`
  genuinely scopes it to the rubric-structure check, and structure/discrimination are named as
  distinct checks.
- **Compatibility** — strengthening the bar makes existing conforming suites non-conforming
  (breaking). **Pre-authorized by #263**: Phase 3 exists to repair the suites the strengthened bars
  light up.

## Judge round 1 (needs-input) — what it caught

- Both narrowings were in flight with **no ledger record**. The grants were real (owner, in-session)
  but unrecorded, so the artifacts did not show them. Recorded.
- The conductor had cleared the `:109`/`:126` pair by reading two identically-scoped `When` steps as
  different operations. **Wrong** — same operation, real contradiction. Fixed under Clearance #2.
- `procedural` and `single-brancher` were stated in prose with **no scenario** exercising either.
  Added to both suites, plus a negative guard that an already-loseable dimension is left alone.

## Impl gate — cold impl-judge

Round 1 `IMPLEMENTATION_PASS: false` on a real defect: the default spec-judge's two new checks sat
**outside the lens taxonomy** its own `SCENARIOS_FAILING: [{ scenario, lens, ... }]` contract requires
a lens from. Both attributed to **Builder** (a self-contradicting suite is the sharpest testability
failure; Architect's "contradiction" language means *cross*-spec) — which also keeps the default judge
aligned with the ACED validator's existing Builder attribution. Round 2 `IMPLEMENTATION_PASS: true`,
26/26 scenarios, no absorption findings, no scope creep.

## Follow-ups (recorded in the ledger, both `backlog`)

1. `combat-log-governance` documents the gate-line `cause` enum as `dimension | ceiling`, but corpus
   precedent establishes `clearance` as a routine third value. Doc stale against practice.
2. The **escalate-on-unclassifiable** duty both new bars carry has no frozen scenario. Mirrors an
   identical pre-existing gap for probe-independence, so not a regression — but a judge that silently
   passes what it cannot classify is the same fail-open shape #263 exists to close.

## NEXT

Push and open the PR (`Refs #263`, completes node `op6-m2`; `Closes #244`, `Closes #258`). Then drain
the two follow-ups to issues. Downstream `op6-m5` repairs the suites this bar now lights up.
