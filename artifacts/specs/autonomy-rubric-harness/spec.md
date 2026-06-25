---
status: draft
type: feature
blocked-by:
  - autonomy-governance
  - rubric-gherkin
aligned: false
---

# Autonomy rubric — testability harness

> Scaffold capturing intent from a design session — run `create-spec` to author the `.feature` and complete this spec. Not yet through the spec gate.

## What

Make the autonomy rubric's verdicts **testable and reliable** (vs by-hand vibing) via two pieces:

1. **A deterministic rubric helper** (sibling to `check-spec-state.mts`): given a proposed act, compute the *mechanical* dimensions — **blast radius** (`blocked-by` dependents + published/installed-surface detection + **conformance/alignment coupling**: what conforms to the target), **contract impact** (semver class via scenario-diff: preserved verbatim → non-breaking; altered/removed → breaking), **reversibility** (destructive/cascading op?). Output: a partial verdict + which dimensions read mechanically-high. The agent judges only **novelty** + **confidence**.
2. **An ACES golden suite** for the rubric: golden cases mapping `(act, risk profile) → expected verdict`, run in CI / at the doctrine cadence over the agent configs to catch posture drift mechanically.

## Why

Applying the rubric to gate self-clear-vs-escalate decisions is currently **by-hand**, which is unreliable — and a design session demonstrated the failure: a "self-clear the reversible prose" judgment was wrong because the **coupling** (prose conforms to a frozen scenario) was invisible until acting. Mechanizing the computable dimensions (blast/coupling, contract-impact, reversibility) shrinks the judgment surface to two dimensions and would have caught that miss. The golden suite turns the one-shot eval pass into a repeatable regression check.

## Key decisions (already made)

- Layer 1 (helper, runtime mechanical floor) + Layer 2 (Warden/operator baked-in logic = helper output + judgment) + Layer 3 (ACES golden suite, design-time regression).
- Layer 3 runs at the **doctrine cadence** (Scanner surfaces config drift); Layer 2 at the **formation cadence** (Warden per act) — maps onto the existing outer loops.
- Backstop: provisional markers + async review queue make "conservative + auditable" sufficient (not "infallible").

## Open

<!-- open: split into a helper spec vs a golden-suite spec, or keep as one? -->
<!-- open: the helper's coupling computation — how to detect "what conforms to X" across the corpus -->
<!-- open: the ACES golden suite depends on rubric-gherkin (the rubric scenario form) -->
