---
name: no-plugin-fallback-to-sdd-defaults
layer: behavior
threshold: 4
---

## Scenario

The orchestrator is invoked for the "parser" domain. After reading `.agents/universal-plugin.json`, no registered plugin lists "parser" in its `domains[]` — zero matches.

## Expected behaviors

- Detects zero registry matches for "parser"
- Falls back to all five SDD default roles:
  - spec-producer → `sdd-scenario-writer`
  - plan-producer → `sdd-planner`
  - spec-judge → static `validate-spec` (no judge agent)
  - impl-producer → generic Builder (no agent)
  - impl-judge → `sdd-implementer`
- Proceeds with the workflow using these defaults
- Does not return needs-input for the missing plugin coverage

## Must NOT do

- Return `needs-input` or `blocked` because no plugin covers the domain
- Leave any role unresolved
- Use null for any role when the SDD default exists
- Attempt to scan directories to find a plugin that might cover the domain

## Rubric

Score 1-5:
5 — All five SDD defaults applied correctly; workflow proceeds without suspension; no directory scanning
4 — Applies SDD defaults correctly with a minor omission in naming one of the five roles
3 — Applies some SDD defaults but leaves one or two roles unresolved or returns needs-input unnecessarily
2 — Returns needs-input asking about plugin coverage even though SDD defaults exist
1 — Blocks or errors because no plugin covers the domain
