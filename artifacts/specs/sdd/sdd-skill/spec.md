---
status: draft
aligned: true
---

# SDD Gateway Skill

---

## What

`sdd` is the gateway skill for Spec-Driven Development feature work. It is the explicit user-invoked entrypoint that activates SDD for the current work, gathers missing intent, classifies the requested SDD action, and invokes the SDD system entrypoint for that action. It applies when a user wants to add, change, backfill, validate, implement, deprecate, or inspect a software feature under SDD. The skill reports the next user-visible SDD step without mutating global project guidance or owning the workflow's internal control logic.

---

## Why

SDD feature work is optional and user-invoked, but once activated it needs a clear entrypoint. A gateway skill makes that workflow explicit at the moment the user opts in, so agents consistently gather missing workflow intent, classify the requested action at the right abstraction level, and avoid treating setup or hook installation as part of feature execution.

---

## Design decisions

### The skill is the SDD workflow gateway

`sdd` owns the front door for opt-in SDD work. It activates SDD for the current request, conducts brief intake when the user invokes `$sdd` without enough detail, classifies the requested SDD action, and invokes the SDD system entrypoint. It must not edit `AGENTS.md`, register SessionStart hooks, install packages, or require the `cyber-skills` CLI.

### Trigger language is explicit and workflow-oriented

The skill triggers when the user explicitly invokes `$sdd`, says to use SDD, or asks to work on a software feature with Spec-Driven Development. Triggered work includes new feature creation, backfill, draft revision, contract approval, implementation, implementation approval, behavior change after approval, deprecation, or SDD graph refresh. It does not trigger for general SDD explanation unless the user asks to apply the workflow to feature work.

### Empty invocation conducts intake

When the user invokes `$sdd` with no feature, artifact, or action, the skill should not guess. It should ask what SDD work the user wants to do, offering the main routes: create a new feature, backfill an existing feature, revise or validate an existing spec, implement an approved spec, manage or deprecate specs, or refresh the spec graph.

### The gateway owns intent, not internal workflow control

The gateway skill does not choose producer or judge roles, load artifact authoring governances, interpret lifecycle transitions, or enforce freeze policy. Those concerns belong to the orchestrator and the narrower authoring or validation skills beneath it. The gateway only needs enough knowledge to identify the user's requested SDD action and invoke the correct SDD entrypoint for that action.

### User questions stay at gateway and skill boundaries

`sdd-orchestrator` has no user channel. The `sdd` skill handles gateway intake and user-facing clarification, then hands off into the SDD workflow. Deeper workflow questions belong to the narrower skills beneath the gateway.

### The spec graph must include nested specs

This spec lives at `artifacts/specs/sdd/sdd-skill/`. `render-spec-graph` must discover nested `spec.md` files under `artifacts/specs/**/spec.md` and use the relative folder path as the node slug, for example `sdd/sdd-skill`.

---

## Trigger surface

The skill description uses this trigger contract:

```text
Use this skill when the user explicitly invokes SDD or wants to work on a software feature with Spec-Driven Development.
```

Examples that trigger the skill:

| User intent | Expected route |
|---|---|
| "$sdd" | Intake prompt for the desired SDD work |
| "Use SDD for auth" | Intake or invoke SDD with the user's coarse intent |
| "Create an SDD spec for auth" | Invoke SDD for spec creation |
| "Backfill SDD for this existing parser" | Invoke SDD for backfill |
| "Approve this draft spec" | Invoke SDD for spec approval |
| "Implement the approved auth spec" | Invoke SDD for implementation |
| "Change this approved behavior" | Invoke SDD for behavior-change handling |
| "Refresh the SDD graph" | Invoke SDD for graph refresh |

---

## Skill surface

No CLI surface is required. The public surface is the user-invoked `sdd` gateway skill.

```text
sdd
  in: explicit SDD invocation or user intent to work on a software feature under SDD
  intake: asks for the desired SDD route when intent is missing
  reads: only enough user and local context to classify the requested SDD action
  loads: the SDD gateway surface and action vocabulary
  invokes: the SDD system entrypoint for the classified action
  out: next user-visible SDD step and the invoked action class
```

**Scenarios:** [sdd-skill.feature](./sdd-skill.feature)

---

## Related

- `artifacts/specs/sdd-plugin/spec.md` — defines the SDD plugin skill surface and lifecycle.
- `artifacts/specs/sdd-spec-graph/spec.md` — defines the derived graph view that must learn nested specs.
- `apps/website/src/content/docs/concepts/gateway-skill.md` — defines the gateway skill concept.
- `plugins/sdd/skills/sdd/SKILL.md` — the gateway skill specified here.

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
