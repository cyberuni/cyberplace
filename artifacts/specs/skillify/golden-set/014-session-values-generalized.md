---
name: session-values-generalized
layer: behavior
threshold: 4
---

## Scenario

The session operated on a specific file, `packages/checkout/src/tax.ts`, inside a project named `storefront`. The agent now writes the SKILL.md body for the generalized workflow.

## Expected behaviors

- Agent generalizes the specific path into a workflow parameter (e.g. "the module under change") rather than hard-coding `packages/checkout/src/tax.ts`
- Agent generalizes the specific project name rather than hard-coding `storefront`
- The body reads as reusable across projects and paths

## Must NOT do

- Hard-code `packages/checkout/src/tax.ts` as the path the skill always operates on
- Hard-code the `storefront` project name into the steps
- Over-generalize to the point the workflow loses its concrete shape

## Assertions

- The body does not hard-code the session's specific file path
- The body does not hard-code the session's specific project name

## Rubric

Score 1–5:
5 — Both the path and project name are generalized into parameters; body reads as reusable
4 — Both generalized; one phrasing still hints at the specific session
3 — One of path/project generalized, the other left hard-coded
2 — Body carries the specific path or project name in most steps
1 — Transcribes the session's exact path and project name throughout
