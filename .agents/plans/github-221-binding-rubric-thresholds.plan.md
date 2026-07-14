---
cr: https://github.com/cyberuni/cyberplace/issues/221
status: active
todos:
  - content: "Explore: audit all 11 @rubric scenarios, derive the discrimination property"
    status: completed
  - content: "Explore: rework dimensions+thresholds via aced-scenario-writer"
    status: completed
  - content: "Explore: confirm edit path — Clearance does NOT fire (#215 left node unfrozen)"
    status: completed
  - content: "Spec gate: cold aced-spec-validator ALIGNED, HITL-ratified, suite re-frozen (d6e38e1b)"
    status: completed
  - content: "Deliver: fix doctrine's stale self-description of its eval (b9c35510)"
    status: completed
  - content: "Impl gate: cold aced-impl-judge on real doctrine — must pass"
    status: in_progress
  - content: "Measure discrimination: mutants A/B/C must fail NEW rubric where OLD passed"
    status: in_progress
  - content: "Handoff: PR Closes #221; file 3 follow-ups (fail-open, 5 unparseable suites, ACED bar)"
    status: pending
---

# github-221 — make the ssa-lowering @rubric thresholds binding

CR: [#221](https://github.com/cyberuni/cyberplace/issues/221) (Refs #211). Precondition for #222.

## The defect

The `sdd/ssa-lowering` `@rubric` scenarios cannot fail a doctrine that follows its own step order.
Most points grade **presence**, **restatement**, **deductive entailment**, or **step ordering** — not
judgment. Measured 9/9 runs at ceiling, zero variance.

Issue named 3 scenarios; **all 11 share the defect** — one authoring template repeated:
`[live 3] + [restatement/procedural 3] + [presence 2]`, threshold = max − 2. So the free floor sits
one point under the threshold and a single point of the one live dimension clears every gate. The
effective bar is "gesture at it", not "get it right".

## The property to spec

> A doctrine that follows every step but reaches the **wrong verdict** must score **below threshold**.

Free floor → ~0; threshold → a high fraction of the live points. Zero variance against the *correct*
doctrine is expected and is NOT the defect — the defect is the floor.

## Scope

- **In:** all 11 `@rubric` scenarios' dimensions + thresholds on the `ssa-lowering` node.
- **Out — #222** (ambiguous-Oracle probe): blocked by this; do not absorb.
- **Out — #220** (Givens-are-test-vectors): SHIPPED (PR #240). This raises the bar against a *sloppy*
  agent, not a *memorizing* one. Necessary, not sufficient.
- **Out — ACED bar:** `aced-builder-spec` validates rubric *shape* only and never *discrimination*
  (the root cause of this defect class). Different spec-node + different project → file as a
  follow-up CR at handoff, per the doctrine's own one-owning-mission-per-node rule.
- **Proven dead end:** Given surgery. Each rewrite closes one defect and leaks a free cue into
  another (one cycle drove `catches-misalignment` from a discriminating 2.33/3 to a ceiling 3.00).
  This is dimension/threshold surgery.

## Hazards

- **Clearance.** Dimensions + thresholds are frozen contract; this is a **narrowing/rewriting** edit
  across 11 scenarios → a re-open, a hard floor, HITL ratification. Not additive.
- **#226** — `aced:add-scenario` has no edit path; routing a rework through the additive path would
  silently skip Clearance. Confirm the edit path structurally
  (`classify-edit-class.mts` / `gherkin-cli diff`), escalate rather than exempt.
- The judgment is not unit-testable; the discrimination claim must be **measured** (mutant run), not
  asserted.

## Landed so far

- `d6e38e1b` — the rework: all 11 rubrics re-dimensioned, thresholds `max-2` → `sum(max)-1`, parse fixed.
- `b9c35510` — doctrine's stale self-description of its eval dropped (drift caused by the rework).
- `e5953e6c` — Oracle-lens revert: `fleet-rebase-reasoned` → boolean guard (it graded an unstated rule).

Follow-ups filed: **#243** fail-open + 6 unparseable suites · **#244** ACED loseable-dimension bar
· **#245** `aced-case-judge` scalar output contract.

## Findings that outlived the CR

- **The suite had never parsed** (EPARSE line 8, since creation). Every mechanical check failed OPEN:
  `check-suite` exit 0 "OK", `gherkin-cli diff` `addOnly:true`, `classify-edit-class`
  `NO-CONTENT-CHANGE` — on a rewrite of every graded scenario. A check that cannot parse its input
  must escalate, not exempt (#243). This is why #189's gate could sincerely record the thresholds as
  "genuinely discriminating": no mechanical check has ever run here.
- **Clearance never fired**: #215 removed `@frozen` and never restored it.
- **The calibration anchor does not replicate**: `catches-misalignment` measured 2.33/3 then 3.00/3,
  both against a *correct* doctrine. `sum-1` retained (the floor is what must be ~0), but the slack is
  no longer reported as evidence-backed.

## NEXT

Measurement in flight (do not interrupt — a prior round returned partial and had to be redone):
1. Full impl gate — all 11 `@rubric` at N=3 + `@trigger` + 7 boolean guards.
2. Discrimination matrix — mutants A/B/C/D × OLD-vs-NEW rubric + real-doctrine controls.
   **Cells C and D are decisive**: they are the only rubric-level discrimination (A and B prove only
   boolean-guard-level). A CR titled "thresholds are non-binding" is judged on C and D.

Then: verdict, impl gate, PR (`Closes #221`). If C/D refute the claim, say so — do not ship on
inspection.
