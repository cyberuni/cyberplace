---
status: draft
type: feature
blocked-by: []
aligned: false
---

# Rubric-style Gherkin scenarios (judged by-hand)

> Scaffold capturing intent from a design session — run `create-spec` / `revise-spec` to author the `.feature` and complete this spec. Not yet through the spec gate.

## What

Allow `.feature` scenarios to take a **rubric form** — an embedded rubric (scoring criteria across dimensions) plus a **threshold that collapses the score back to a boolean** (the ACES transform) — as a legal scenario shape **alongside** pure-boolean Gherkin. `spec-governance` (today mandates pure-boolean) admits the rubric form; `sdd-spec-judge` evaluates a rubric scenario **by-hand** (reads the rubric, scores, applies the threshold, emits pass/fail).

## Why

A gradient judgment cannot be faithfully encoded in pure-boolean Gherkin: a boolean like "spec.md frozen firmest" is too coarse to express "spec.md editable when the change is reversible + preserves alignment + non-breaking." A boolean rule is also **un-self-modifiable** (you cannot edit a frozen thing); a rubric rule is self-modifiable (a safe edit self-clears). Supporting rubric Gherkin is what lets SDD carry gradient rules and safely change its own rules.

## Key decisions (already made)

- Rubric lingo is allowed in **all** SDD Gherkins, judged **by-hand** by `sdd-spec-judge`. ACES is the better automated *tester* (scored harness, regression), **not** a prerequisite for *using* rubrics.
- Rubric form = embedded rubric (dimensions + scoring) + threshold→boolean. Pure-boolean stays legal; rubric is additive.
- Trade-off: by-hand has no regression net and judge-to-judge variance — the gap ACES fills when worth it.

## Open

<!-- open: exact rubric-scenario syntax/convention in the .feature (how rubric + threshold are written in Gherkin) -->
<!-- open: how sdd-spec-judge's "valid boolean Gherkin" bar changes to admit + validate rubric scenarios -->
<!-- open: which spec-governance sections change -->
