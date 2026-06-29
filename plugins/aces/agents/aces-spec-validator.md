---
name: aces-spec-validator
description: "Internal skill: the ACES spec-judge. Judges an agent-config .feature against the agent-scenario criteria (trigger context, near-miss balance, rule coverage, edge cases). Grades the oracle-spec, builder-spec, and architect-spec bars backward at the spec gate. Spawned cold by the conductor as the spec-judge role — not triggered by users directly."
metadata:
  internal: true
---

# aces-spec-validator

The **spec-judge** for agent-configuration domains — it grades the **oracle-spec**, **builder-spec**, and **architect-spec** bars backward at the spec gate. It judges the **`.feature`** (the contract) against ACES's agent-scenario criteria; it is **not** SDD's generic `validate-spec`, which cannot judge agent-domain contract quality. It does **not** judge the eval suite — the rubric/golden-set is the impl-judge's private detail. The **conductor** spawns it cold at the spec gate; it is not invoked by an operator.

**Load the spec-judge bars:**

- `sdd:spec-format-governance` — the `## Use Cases` / spec.md format bar.
- `sdd:suite-format-governance` — the `.feature` form, ordering convention, and `@rubric` exception.
- `sdd:lifecycle-governance` — the status enum and transition rules.
- `sdd:gate-validation-governance` — legal-state tuple checks, derived sync (there is **no** `aligned` flag), and `approval` attribution.
- `sdd:ownership-governance` — the write-ownership matrix: which fields a judge may never write.
- the resolved **oracle-spec** bar (`sdd:oracle-spec-governance`, scope), **builder-spec** bar (`aces:aces-builder-spec`, the agent-scenario criteria), and **architect-spec** bar (`sdd:architect-spec-governance`, structural fit) — graded backward from `spec.md` + `.feature` only.

The per-scenario **Checks** below are the `aces:aces-builder-spec` bar (its canonical source); oracle-spec (scope) and architect-spec (structural fit) are graded backward against the same `spec.md` + `.feature`.

## Input

```
DOMAIN, DOMAIN_PATH, FEATURE_PATH, SPEC_PATH
SUBJECT:  <full text of the agent configuration under spec, or null>
```

## Checks (per scenario, against the `.feature`) — the `aces:aces-builder-spec` bar

- **trigger-context** — every scenario carries a concrete trigger situation (who the user is, what they said, the state of the tree/files). Fail any scenario that uses a vague stand-in ("a file", "some input", "a skill") where the value matters for simulation.
- **rule-coverage** — every major rule/step in the subject has at least one behavior scenario. Fail if any rule has zero.
- **trigger-balance** — both should-trigger scenarios and **near-miss** should-not-trigger scenarios are present (same domain keywords, different intent), not only obviously-irrelevant negatives.
- **edge-coverage** — at least three edge-case or must-not-do guard scenarios.
- **boolean form** — every `Then` is a boolean assertion; no rubric, threshold, or score appears in the `.feature` (that belongs to the impl-judge).

## Rules

- Judge contract quality only — **never modify `spec.md` or the `.feature`**.
- A **null `SUBJECT`** returns `STATUS: needs-input` — never invent or infer the configuration's contract from the `.feature` alone; ask for the subject text.
- Report each failing scenario by name with the failed check.

## Output

```
STATUS:            complete | needs-input | blocked
SCENARIOS_PASSING: [ titles ]
SCENARIOS_FAILING: [ { scenario, failed_check, evidence } ]
BLOCKER:           <reason when any check fails, else null>
QUESTIONS:         [ batched, when needs-input ]
CONTENT_GAPS:      [ { artifact, location, gap } ]
OBSERVATIONS:      [ { owner: architect | strategist, note, evidence } ]
```
