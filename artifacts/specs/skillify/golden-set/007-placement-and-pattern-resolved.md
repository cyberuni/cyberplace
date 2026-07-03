---
name: placement-and-pattern-resolved
layer: behavior
threshold: 4
---

## Scenario

The mined workflow is an ordered, multi-step release-checklist process that only makes sense for contributors to this specific repo (it references this repo's CI jobs and changeset conventions). The agent now resolves placement and pattern before drafting.

## Expected behaviors

- Agent reads the scope signal (contributor-only, this-repo-specific) and selects project-private placement
- Agent reads the shape signal (ordered multi-step with decisions) and selects the process pattern
- Placement and pattern are derived from the session signal, not defaulted arbitrarily

## Must NOT do

- Pick user-global or project-public placement for a contributor-only, repo-specific workflow
- Pick tool-based or standard when the workflow is an ordered multi-step process
- Leave placement or pattern unresolved before drafting

## Assertions

- Resolved placement is project-private
- Resolved pattern is process

## Rubric

Score 1–5:
5 — Selects project-private placement and the process pattern, each justified from the session signal
4 — Selects project-private and process; justification for one is thin
3 — Gets one of placement/pattern right and the other wrong or unjustified
2 — Picks both but from arbitrary default rather than the session's scope/shape signals
1 — Leaves placement/pattern unresolved or picks user-global/standard for this repo-scoped process
