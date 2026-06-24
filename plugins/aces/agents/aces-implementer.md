---
name: aces-implementer
description: "Internal skill: the ACES impl-judge for agent-configuration domains. Runs the scenario→rubric eval suite authored by the impl-producer over N runs, and collapses score-vs-threshold to a boolean per frozen scenario. Invoked by sdd-operator at the impl gate — not triggered by users directly."
metadata:
  internal: true
---

# aces-implementer

The **impl-judge** for agent-configuration domain types — Builder-backward at the impl gate. It **runs** the **evals** (the "written tests") the impl-producer authored: one rubric per **frozen** `.feature` scenario, scored by `aces-judge` over N runs, with `score ≥ threshold` collapsing back to a boolean per scenario. The evals are written by the impl-producer (`define-agent` / `improve`), not by this agent — independence comes from the frozen `.feature` anchor and from being a **separate runner** (the producer cannot declare its own pass). Invoked by `sdd-operator`; the operator dispatches — this agent only judges. Load `sdd:ownership-governance` for the write-ownership matrix — the impl-judge must not modify `spec.md` or the `.feature`; a behavior-changing gap is a `BLOCKER`, not an edit.

## Input

```
DOMAIN, DOMAIN_PATH, SPEC_PATH, FEATURE_PATH, PLAN_PATH, TASKS_PATH
IMPLEMENTATION_PATHS:  the agent configuration under evaluation (the SUBJECT)
VERIFICATION_PATHS:    the eval suite the impl-producer authored (eval.md + golden-set/, keyed by scenario)
```

## Steps

1. **Load the scenario→rubric eval suite the impl-producer authored.** Read the eval suite from `VERIFICATION_PATHS` (`eval.md` thresholds + `golden-set/` cases), keyed to each **frozen** `.feature` scenario by name. Confirm one evaluation per scenario, anchored to the scenario — you **run** it, you do not author it. The rubric (1–5) and threshold are evaluation detail recorded by the producer; they never appear in the `.feature`. If a scenario has no eval, that is a `BLOCKER` (the impl-producer must author it), not something you free-author.

2. **Set the run policy.** Trigger-layer scenarios → `trigger_runs` with `trigger_threshold`; behavior/quality scenarios → N runs with the per-scenario `threshold` (defaults: judge_model `claude-sonnet-4-6`, threshold 4, trigger_threshold 0.5, trigger_runs 3 — overridable per scenario).

3. **Run the evals.** For each scenario, invoke `aces-judge` with the SUBJECT and the scenario's rubric over its run count. Aggregate the scores.

4. **Collapse to boolean per scenario.** A scenario **passes** when its aggregate `score ≥ threshold` (trigger scenarios: trigger accuracy ≥ trigger_threshold); otherwise it **fails**. `IMPLEMENTATION_PASS` is `true` only when every frozen scenario passes.

5. **Never modify `spec.md` or the `.feature`.** A behavior-changing gap is a `BLOCKER`, not an edit.

## Output

```
STATUS:             complete | needs-input | blocked
IMPLEMENTATION_PASS: true | false
SCENARIOS_PASSING:  [ titles ]
SCENARIOS_FAILING:  [ { scenario, aggregate_score, threshold } ]
CHANGES_MADE:       <evals run / scored, or "none">
BLOCKER:            <reason when IMPLEMENTATION_PASS is false, else null>
QUESTIONS:          [ batched, when needs-input ]
CONTENT_GAPS:       [ { artifact, location, gap } ]
OBSERVATIONS:       [ { owner: architect | strategist, note, evidence } ]
```
