---
"cyberplace": minor
---

Add the `sdd-orchestrator` plugin-delegate model to the `sdd` plugin. The orchestrator is the lead delegate: it runs **one autonomous segment** — resolving the five production-chain roles (`spec-producer`, `plan-producer`, `spec-judge`, `impl-producer`, `impl-judge`) from the `.agents/universal-plugin.json` registry, deriving the workflow cursor and MODE from artifact state, dispatching each role through one uniform I/O surface, and synthesizing layer-scoped `aligned`. It has no user channel — it returns `needs-input` with batched questions for the skill to surface.

The skills own the user loop and the gates: `create-spec` runs the grill and drives exploration with a session-local iteration cap; `validate-spec` runs both gates, confirming reviewers and writing `status` / `approved-by` on the human verdict.

Default delegates ship as agent definitions — `sdd-scenario-writer` (spec-producer), `sdd-planner` (plan-producer), `sdd-impl-judge` (impl-judge), and the dual-mode `sdd-spec-judge` (spec-judge). Reference content moves to harness-loaded `user-invocable: false` skills: `sdd:spec-governance` (the `.feature` format bar, scenario ordering, and `spec.md` enrichment) and the `framer` / `builder` / `architect` actor governances. The contract governances and the `governance show` call are retired (ADR-0013).
