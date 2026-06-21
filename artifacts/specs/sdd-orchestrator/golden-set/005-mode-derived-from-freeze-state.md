---
name: mode-derived-from-freeze-state
layer: behavior
threshold: 4
---

## Scenario

The orchestrator is called twice, in two separate invocations:

**Invocation A:** The "auth" domain has `status: draft`, `aligned: false` in spec.md, and the `.feature` file exists but has not been approved. No `<!-- open: -->` markers remain.

**Invocation B:** The "auth" domain has `status: approved`, `aligned: false` in spec.md, and the `.feature` file is frozen (produced from an approved spec).

## Expected behaviors

- In Invocation A: derives MODE as `explore`; dispatches spec-producer and spec-judge in explore mode
- In Invocation B: derives MODE as `implement`; dispatches plan-producer, impl-producer, and impl-judge in implement mode
- In neither case does the caller pass MODE as an input; the orchestrator derives it entirely from artifact state
- Does not ask for MODE as input

## Must NOT do

- Accept MODE as an input parameter (it is always derived)
- Dispatch impl-producer in implement mode when the .feature is still a draft
- Dispatch spec-producer in implement mode when the .feature is frozen
- Confuse the two modes based on the `aligned` field alone

## Rubric

Score 1-5:
5 — Correctly derives explore for draft .feature and implement for frozen .feature in both invocations; never accepts MODE as input
4 — Correct mode derivation in both cases with a minor ambiguity in the derivation logic described
3 — Gets one mode right but misidentifies the other, or partially accepts MODE as a hint
2 — Derives MODE from status alone rather than from the .feature's frozen state
1 — Accepts MODE as an explicit input parameter and does not derive it
