---
name: aces-builder-spec
description: "Internal skill: the ACES Builder bar at the spec gate — the agent-configuration contract criteria (trigger context, near-miss balance, rule coverage, edge coverage, boolean form). Unions onto sdd:builder-spec-governance. Loaded by the ACES spec-producer to self-align and by the spec-judge to grade. Not triggered by users directly."
user-invocable: false
metadata:
  actor: builder
  gate: spec
  compose: union
---

# ACES Builder-Spec Governance — the agent-config contract bar

The **Builder** bar at the **spec gate**, specialized for agent-configuration artifact-types
(`skill`, `subagent`, `command`, `agents-section`). It **unions onto** `sdd:builder-spec-governance`
— the generic testability/coverage bar still applies; this adds what makes an *agent-config*
`.feature` a complete, simulable contract. One merged bar loaded by **both** faces — the ACES
spec-producer (`aces-scenario-writer`) reads it forward, the cold spec-judge (`aces-spec-validator`)
reads it backward. `producer ≠ judge` holds at the agent level.

## The bar (per scenario, against the `.feature`)

- **Trigger context.** Every scenario carries a concrete trigger situation — who the user is, what
  they said, the state of the tree/files. A scenario that uses a vague stand-in ("a file", "some
  input", "a skill") where the value matters for simulation fails.
- **Rule coverage.** Every major rule/step in the subject has at least one behavior scenario. A rule
  with zero scenarios fails.
- **Trigger balance.** Both should-trigger scenarios **and near-miss should-not-trigger** scenarios
  are present (same domain keywords, different intent) — not only obviously-irrelevant negatives. A
  suite with no near-miss fails.
- **Edge coverage.** At least three edge-case or must-not-do guard scenarios.
- **Boolean form.** Every `Then` is a boolean assertion; no rubric, threshold, or score appears in
  the `.feature` — that detail belongs to the impl-judge's eval suite (`aces-builder-impl`), surfaced
  only as a judge-only `@rubric` scenario per `sdd:suite-format-governance`.
