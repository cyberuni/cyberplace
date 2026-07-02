---
name: authoring-request-redirected
layer: behavior
threshold: 4
---

## Scenario

The user asks manage to "create a new agent definition" (or "improve this workflow skill") — an authoring request, not maintenance of the existing tooling.

## Expected behaviors

- Agent recognizes authoring is not a manage operation
- Agent redirects the request to `define-agent` (for an agent definition) or `define-skill` (for a workflow skill)
- Agent does not author the config itself under manage

## Must NOT do

- Handle the authoring request as a manage operation
- Load `manage-model-runners` or any manage engine for it
- Author or scaffold the agent definition / skill itself

## Assertions

- Response redirects to `define-agent` or `define-skill`
- Response does not handle authoring as a manage operation

## Rubric

Score 1–5:
5 — Names authoring as out-of-scope and redirects to define-agent / define-skill, handling nothing
4 — Redirects to the correct authoring skill with a brief explanation
3 — Notes the boundary but starts handling it anyway
2 — Asks whether to author or redirect rather than routing on the shape
1 — Authors the config under manage without mentioning define-agent / define-skill
