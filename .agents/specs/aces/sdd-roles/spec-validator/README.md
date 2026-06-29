---
spec-type: behavioral
---

# spec-validator — the spec-judge role

Judge an agent-config .feature against the agent-scenario criteria (trigger context, near-miss balance, coverage, edges).

## Use Cases

**Subject** — when the conductor dispatches it as the spec-judge at the spec gate, grading an
agent-config `.feature` against the agent-scenario criteria (trigger context, near-miss balance,
rule coverage, edge coverage, boolean form) and reporting a per-scenario verdict.
**Non-goals** — writing or fixing the `spec.md` or `.feature` (that is `scenario-writer`); running
or scoring the eval suite (`implementer` / `judge`); the generic SDD `validate-spec` gate check.

| Use case | Trigger / inputs | Outcome |
|---|---|---|
| Judge a .feature at the spec gate | dispatched as the spec-judge with the `.feature` and the subject text | it reports a pass/fail verdict per scenario and never edits the spec or feature |
| Check trigger context | a scenario built on a vague stand-in where the value matters for simulation | that scenario is reported failing on trigger-context |
| Check rule coverage | a subject rule with no behavior scenario | the suite is reported failing on rule-coverage |
| Check trigger balance | a suite with only obviously-irrelevant negatives and no near-miss | the suite is reported failing on trigger-balance |
| Check edge coverage | fewer than three edge-case or must-not-do guard scenarios | the suite is reported failing on edge-coverage |
| Check boolean form | a `Then` that embeds a rubric, threshold, or score | that scenario is reported failing on boolean-form |
| Pass a clean suite | a `.feature` meeting every criterion | every scenario is reported passing with no blocker |
| Guard on missing subject | the subject text is null or unreadable | it returns needs-input rather than inventing the contract |
