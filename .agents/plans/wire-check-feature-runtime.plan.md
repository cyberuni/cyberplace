---
cr: wire-check-feature-runtime
what: promote check-feature from CI-only to authoring + spec-gate runtime guardrail
status: draft
todos:
  - content: "Add --files mode to check-feature.mts so the gate scopes to a CR's touched .feature, not tree-wide"
    status: pending
  - content: "spec-producer-governance: producer self-runs check-feature after authoring the .feature (self-align, pre-judge)"
    status: pending
  - content: "spec-gate step 1: run check-feature over touched .feature as a fail-closed pre-filter BEFORE spawning the cold judge"
    status: pending
  - content: "Reflect the new touchpoints in suite-format-governance (the rule check-feature enforces) + the frozen .feature nodes — ratified re-open"
    status: pending
  - content: "Tests for --files mode; verify:specs-new + pnpm verify green; changeset"
    status: pending
---

# CR: wire check-feature into the SDD runtime

**Finding:** `check-feature.mts` is a deterministic Gherkin/boolean-form linter (Feature/Given-When-Then
validity, hedge-adverb + leaked-rubric detection, section-comment ordering) — the executable form of
`suite-format-governance`. Today it runs **only** in `verify:specs-new` (CI, tree-wide, post-hoc), its
weakest position.

**Value:** move it to two per-CR runtime touchpoints:
1. **spec-producer** self-runs it after authoring → fixes form without spending a cold-judge round.
2. **spec-gate** runs it as a fail-closed pre-filter → the LLM judge only sees well-formed suites; a
   mechanical check never misses a hedge word.

**Benefit:** fewer judge rounds, uniform boolean-form enforcement across the quill/aces/sdd producers,
deterministic reliability on a hard bar. Keep the CI run as the tree-wide backstop.

**Freeze exposure:** touches `spec-producer-governance` + `spec-gate` skills and their frozen `.feature`
nodes (+ `suite-format-governance`) → needs a ratified re-open, like the spec-gate rename.

## NEXT

Awaiting a decision to open this mission. On start: add `--files` to the engine first (no freeze), then
the two governance/skill wirings (ratified re-open for the frozen nodes).
