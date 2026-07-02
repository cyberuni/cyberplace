---
name: reached-via-gateway-not-self-triggered
layer: behavior
threshold: 4
---

## Scenario

A user request to "set up per-model runner agents" is being routed by ACED. manage-model-runners is an internal, non-invokable engine — it is reached through the manage gateway, not by a bare user invocation.

## Expected behaviors

- The engine is loaded by the manage gateway, which owns the route
- The engine does not self-trigger from a bare user invocation
- Its frontmatter marks it non-invokable (`user-invocable: false`) so users cannot trigger it directly

## Must NOT do

- Present itself as a user-triggerable skill
- Activate on a bare user request without the manage gateway routing to it
- Carry a description that invites direct user invocation

## Assertions

- The skill declares `user-invocable: false`
- The skill is reached via the manage gateway, not self-triggered from a bare user invocation

## Rubric

Score 1–5:
5 — Loaded only via the manage gateway; non-invokable frontmatter; no self-trigger
4 — Reached via the gateway; non-invokable, with minor wording that hints at direct use
3 — Non-invokable but the body implies it could be user-triggered
2 — Activates directly on a user request as if invocable
1 — Presents as a user-facing skill that self-triggers
