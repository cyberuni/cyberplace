---
cr-ref: cybermux-60-scenario-map-unparseable-row
source: cyber-mux issue #60 (cross-repo — no auto-close reference in this repo)
target-spec: .agents/specs/sdd (project: sdd, projectPath plugins/sdd)
node: .agents/specs/sdd/authoring/spec-gate
status: draft
todos:
  - content: Grill fix direction — settled Fix+document+backfill, positional-per-block discriminator
    status: completed
  - content: Draft spec + frozen scenarios (spec-gate.feature +8, README binding section, format-gov doc)
    status: completed
  - content: Build-to-learn — parseScenarioMap per-block positional + heading-anchor + section-bound; twin fix in check-spec-state; 154 tests pass, corpus clean
    status: completed
  - content: Spec gate — cold spec-judge ALIGNED true; miscite remediated; frozen (additive self-clears); gate ledger line
    status: completed
  - content: Deliver + impl gate — 155/155 vs frozen suite; impl-judge scope-creep blocker remediated by +2 additive scenarios; impl gate line
    status: completed
  - content: Handoff — rebase onto main, PR, then close cyber-mux#60 with pointer
    status: in_progress
---

## CR

Fix cyber-mux issue #60: "A scenario map that is not backtick-wrapped binds nothing, silently."

The scenario-map binding check (`plugins/sdd/skills/spec-gate/scripts/check-suite.mts`,
`parseScenarioMap` / `checkScenarioMap`) recognizes a table row only when the Scenario cell is
backtick-wrapped. A genuine data row lacking backticks is silently dropped — indistinguishable
from the header/separator rows the backtick match exists to skip. The requirement is documented
nowhere, and the binding check is **not specified in any frozen `.feature`** (code + unit-tests
only). Same "skip rather than fail" anti-pattern the scenario map exists to prevent.

Issue offers two fixes: (a) make the checker report a present-but-unparseable map row as a
violation; (b) make the backtick requirement explicit in the contract. Best answer likely a+b,
plus backfilling the frozen scenarios for the binding behavior.

## NEXT

Grill the user on the fix direction, then draft the frozen scenarios in
`.agents/specs/sdd/authoring/spec-gate/spec-gate.feature` and revise the node README to specify
the scenario-map binding check (currently unspecified). Build-to-learn the discriminator in
`check-suite.mts` against the non-frozen suite.

## Notes

- Routing decision (ratified in-session): fix lives in cyberplace SDD plugin, not cyber-mux;
  close cyber-mux#60 here at handoff with a pointer.
- Repo has 3 pre-existing unrelated modified files (knip.json, package.json, pnpm-lock.yaml) —
  keep them out of this CR's commits.
