---
name: suite-token-opt
status: active
todos:
  - content: "Mechanize additive-self-clear via gherkin-cli diff --addOnly (skip judge round on pure adds) — the lead behavioral win"
    status: completed
  - content: "Wire conductor + spec-gate + judges to consume gherkin-cli parse manifest instead of raw .feature (prose guidance)"
    status: completed
  - content: "Judge defs (sdd-spec-judge, sdd-impl-judge): lazy-load bar bodies (propagate the conductor's digest discipline)"
    status: completed
  - content: "Pin gherkin-cli via build-resolve-pins + a reference note on the dependency"
    status: completed
  - content: "Spec gate (freeze touched .feature) → deliver → impl gate → handoff"
    status: in_progress
---
<!-- DROPPED: resolve-governances --compose — fights the frozen 'matcher not composer' resolution node + smallest win (removes precedence reasoning, not the dominant body-read). -->


# CR-B — SDD suite token reduction

Reduce token usage consuming `.feature` suites by delegating parse/diff to the published **gherkin-cli** (pinned npx) and mechanizing the additive-self-clear + governance-compose the LLM re-derives. Project spec: `.agents/specs/sdd` (approved). Design: `suite-token-opt.design.md` (sibling, re-scoped for the gherkin-cli pivot).

Depends on **gherkin-cli 0.0.1** (published, verified). Independent of CR-A (relax S4).

## NEXT
Unit 1 (mechanical additive-detection) LANDED (commit dbd2dbc). Next: unit 2 — wire the conductor / spec-gate / judges to consume `gherkin-cli parse` manifest instead of reading raw `.feature` into LLM context (prose guidance, mostly not a new behavioral scenario). Then unit 3 (judge-def lazy-load), unit 4 (pin via build-resolve-pins).
