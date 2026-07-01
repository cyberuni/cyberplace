---
cr: wire-check-feature-runtime
what: promote check-feature from CI-only to authoring + spec-gate runtime guardrail
status: in-progress
todos:
  - content: "Add --files mode to check-feature.mts so the gate scopes to a CR's touched .feature, not tree-wide"
    status: completed
  - content: "spec-producer-governance: producer self-runs check-feature after authoring the .feature (self-align, pre-judge)"
    status: completed
  - content: "spec-gate step 1: run check-feature over touched .feature as a fail-closed pre-filter BEFORE spawning the cold judge"
    status: completed
  - content: "Reflect the new touchpoints in suite-format-governance + the frozen .feature nodes — additive scenarios self-clear, stay @frozen (no re-open)"
    status: completed
  - content: "Tests for --files mode; verify:specs-new + pnpm verify green"
    status: completed
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

**Freeze exposure (resolved):** the edits to the frozen `spec-gate` + `spec-producer` `.feature` nodes
are **additive scenarios only** — per `lifecycle-governance` they **self-clear and stay `@frozen`**, no
re-open/draft transition (the CR brief's "ratified re-open" was over-cautious; that mechanism is for
narrowing/rewriting, not additions). `suite-format` is a `reference` node (no `.feature`) → aligned
prose edit. Leash `auto-all`.

## NEXT

**Mission near-complete on `next`.** Spec gate passed (ledger seq 36, additive, stays `@frozen`);
deliver landed the `--files` engine + tests + the producer/gate/suite-format SKILL wirings. Commits:
`81bb949` (spec) `34d827b` (engine+tests) `25e9c57` (SKILL wirings). `pnpm verify` + `verify:specs-new`
green. **Remaining:** impl gate (cold impl-judge over the 5 frozen scenarios → append impl gate line),
then handoff PR (`next → main`, human-approved — outward-facing). No changeset (`plugins/sdd-new` is not
a published package). One follow-up CR to file: spec-gate/README.md line 66 overstates "no scenario edits
without a ratified re-open" — contradicts the additive-self-clear rule below it (`lifecycle-governance`).
