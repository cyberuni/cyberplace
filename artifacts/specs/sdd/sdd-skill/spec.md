---
status: draft
aligned: true
---

# SDD Context Skill

---

## What

`sdd` is the context skill for Spec-Driven Development feature work. It loads the SDD governance, lifecycle rules, and workflow surfaces into the active agent context, then routes the current user request to the correct SDD path. It applies when a user wants to add, change, backfill, validate, implement, or deprecate a software feature under SDD. The skill reads existing SDD artifacts when present, determines the current lifecycle state, preserves approved `.feature` files as frozen contracts, and reports the next SDD action without mutating project guidance.

---

## Why

SDD feature work depends on rules that must be present before an agent writes specs, scenarios, plans, tasks, or implementation. A dedicated context skill makes that workflow explicit at the moment the user starts feature work, so agents consistently load the governance bar, respect lifecycle state, route gate work correctly, and avoid treating setup or hook installation as part of feature execution.

---

## Design decisions

### The skill is context only

`sdd` loads workflow context and routing rules. It must not edit `AGENTS.md`, register SessionStart hooks, install packages, or require the `cyber-skills` CLI.

### Trigger language is feature-work oriented

The skill triggers when the user asks to work on a software feature with SDD, including new feature creation, backfill, draft revision, contract approval, implementation, implementation approval, behavior change after approval, deprecation, or SDD graph refresh. It does not trigger for general SDD explanation unless the user asks to apply the workflow to feature work.

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

This spec lives at `artifacts/specs/sdd/sdd-skill/`. `render-spec-graph` must discover nested `spec.md` files under `artifacts/specs/**/spec.md` and use the relative folder path as the node slug, for example `sdd/sdd-skill`.

---

## Trigger surface

The skill description uses this trigger contract:

```text
Use this skill when the user wants to work on a software feature with Spec-Driven Development.
```

Examples that trigger the skill:

| User intent | Expected route |
|---|---|
| "Create an SDD spec for auth" | `create-spec` |
| "Backfill SDD for this existing parser" | `create-spec` in backfill mode |
| "Approve this draft spec" | `validate-spec --target spec` |
| "Implement the approved auth spec" | frozen-feature implementation, then `validate-spec --target impl` |
| "Change this approved behavior" | draft re-open path before scenario edits |
| "Refresh the SDD graph" | `render-spec-graph` |

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
- `plugins/sdd/skills/sdd/SKILL.md` — the context skill specified here.

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
