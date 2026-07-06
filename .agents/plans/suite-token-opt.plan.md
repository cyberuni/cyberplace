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
    status: completed
---
<!-- DROPPED: resolve-governances --compose — fights the frozen 'matcher not composer' resolution node + smallest win (removes precedence reasoning, not the dominant body-read). -->


# CR-B — SDD suite token reduction

Reduce token usage consuming `.feature` suites by delegating parse/diff to the published **gherkin-cli** (pinned npx) and mechanizing the additive-self-clear + governance-compose the LLM re-derives. Project spec: `.agents/specs/sdd` (approved). Design: `suite-token-opt.design.md` (sibling, re-scoped for the gherkin-cli pivot).

Depends on **gherkin-cli 0.0.1** (published, verified). Independent of CR-A (relax S4).

## DONE — CR-B complete on branch worktree/lucky-field-5054 (not pushed)
- dbd2dbc — unit 1: mechanical additive-detection via `gherkin-cli diff` (additive scenario self-cleared, spec-gate.feature stays @frozen)
- 314e1ea — unit 3: judge-def lazy-load of governance bar bodies
- f1031bb — units 2+4: new-suite listing via `gherkin-cli parse` + the gherkin-cli dependency design note
- compose DROPPED (fought the frozen matcher-not-composer node)

All units verified (`pnpm verify` green, pre-commit suites green). Depends on gherkin-cli 0.0.1 (pinned via `@0.0.1` npx refs; build-resolve-pins maintains).

## NEXT (follow-ups)
- Open the PR when ready (not pushed).
- Post-mission `sdd:sdd-warden` formation pass (detached) — deferred, run anytime.
- CR-A (relax S4) — independent, still queued as a full SDD backfill.
