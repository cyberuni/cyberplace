---
name: suite-token-opt
status: active
todos:
  - content: "resolve-governances --compose mode (mission/resolution) — emit ordered, replace-applied load-list"
    status: pending
  - content: "Wire conductor + spec-gate to consume gherkin-cli parse manifest instead of raw .feature (mission/conductor, authoring/spec-gate)"
    status: pending
  - content: "Mechanize additive-self-clear via gherkin-cli diff --addOnly (skip judge round on pure adds)"
    status: pending
  - content: "Judge defs (sdd-spec-judge, sdd-impl-judge): lazy-load bar bodies + consume composed set/manifest"
    status: pending
  - content: "Pin gherkin-cli via build-resolve-pins + a reference note on the dependency"
    status: pending
  - content: "Spec gate (freeze touched .feature) → deliver → impl gate → handoff"
    status: pending
---

# CR-B — SDD suite token reduction

Reduce token usage consuming `.feature` suites by delegating parse/diff to the published **gherkin-cli** (pinned npx) and mechanizing the additive-self-clear + governance-compose the LLM re-derives. Project spec: `.agents/specs/sdd` (approved). Design: `suite-token-opt.design.md` (sibling, re-scoped for the gherkin-cli pivot).

Depends on **gherkin-cli 0.0.1** (published, verified). Independent of CR-A (relax S4).

## NEXT
Begin explore on todo 1 — `resolve-governances --compose` (the most self-contained, SDD-side engine change; no gherkin). Then the wiring units (conductor/gate/judges consuming the gherkin-cli manifest + `diff --addOnly`).
