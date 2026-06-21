---
status: draft
blocked-by:
  - sdd-plugin
  - sdd-spec-graph
aligned: true
---

# SDD Skill Context Workflow

---

## What

Improve `plugins/sdd/skills/sdd/SKILL.md` into the authoritative context skill for Spec-Driven Development feature work. When a user wants to add, change, backfill, validate, implement, or deprecate a feature under SDD, the skill loads the SDD governance and workflow into context, determines the current lifecycle state from existing artifacts, and routes the agent to the correct SDD skill without mutating project guidance.

---

## Why

The current `sdd` skill is a thin context loader. It names the main surfaces, but it does not yet give agents enough decision-complete workflow guidance to consistently follow SDD across new features, backfills, draft revisions, spec gates, implementation gates, graph refreshes, and behavior changes after approval.

---

## Design decisions

### The skill is context only

`sdd` loads workflow context and routing rules. It must not edit `AGENTS.md`, register SessionStart hooks, install packages, or require the `cyber-skills` CLI.

### SDD governance is loaded before authoring or judging

Before writing or judging `spec.md` or `.feature` content, the agent loads `sdd:spec-governance` as the universal format and enrichment bar. Runtime SDD work must not call `governance show`.

### Lifecycle state controls routing

The skill routes by artifact state:

| State | Route |
|---|---|
| No spec exists | `create-spec` in new-feature or backfill mode |
| `draft` | `create-spec` for contract revision or `validate-spec --target spec` for approval |
| `approved` | implementation against frozen `.feature`, then `validate-spec --target impl` |
| `implemented` | new behavior changes require reverting to `draft` through the gate path |
| `deprecated` | no implementation work; keep the spec for graph history |

### The `.feature` freeze is always enforced

When `spec.md` is `approved`, the skill must not add, remove, or rewrite scenarios. Any behavior change after approval requires returning the spec to `draft` and passing the spec gate again.

### User questions stay at skill boundaries

`sdd-orchestrator` has no user channel. The `sdd` skill routes work to `create-spec` or `validate-spec`, and those skills ask batched user questions when needed.

### The spec graph must include nested specs

This workflow lives at `artifacts/specs/sdd/sdd-skill/`. `render-spec-graph` must discover nested `spec.md` files under `artifacts/specs/**/spec.md` and use the relative folder path as the node slug, for example `sdd/sdd-skill`.

---

## Skill surface

No CLI surface is required. The public surface is the user-invoked `sdd` skill.

```text
sdd
  in: user intent to work on a software feature under SDD
  reads: existing spec.md, .feature, plan.md, tasks.md when present
  loads: sdd:spec-governance and SDD lifecycle rules
  routes: create-spec, validate-spec, render-spec-graph, or frozen-feature implementation path
  out: next SDD action and loaded workflow constraints
```

**Scenarios:** [sdd-skill.feature](./sdd-skill.feature)

---

## Related

- `artifacts/specs/sdd-plugin/spec.md` — defines the SDD plugin skill surface and lifecycle.
- `artifacts/specs/sdd-spec-graph/spec.md` — defines the derived graph view that must learn nested specs.
- `plugins/sdd/skills/sdd/SKILL.md` — the skill being improved.

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd/sdd-skill/spec.md` |
| Scenarios | `artifacts/specs/sdd/sdd-skill/sdd-skill.feature` |
| Plan | `artifacts/specs/sdd/sdd-skill/plan.md` |
| Tasks | `artifacts/specs/sdd/sdd-skill/tasks.md` |
| Skill | `plugins/sdd/skills/sdd/SKILL.md` |
| Graph renderer | `plugins/sdd/skills/render-spec-graph/scripts/render-spec-graph.mts` |
