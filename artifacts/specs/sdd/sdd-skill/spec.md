---
status: draft
aligned: true
---

# SDD Gateway Skill

---

## What

`sdd` is the gateway skill for Spec-Driven Development work. It is the explicit user-invoked entrypoint that activates SDD for the current work, gathers missing intent, classifies the requested SDD action, and invokes the SDD system entrypoint for that action. It applies when a user wants to add, change, backfill, validate, implement, deprecate, or inspect a creation artifact under SDD. SDD is not limited to software features; it is a formal process for creation work wherever the actor needs to direct expertise outside their own angle through delegates and explicit artifacts. The skill reports the next user-visible SDD step without mutating global project guidance or owning the workflow's internal control logic.

---

## Why

SDD work is optional and user-invoked, but once activated it needs a clear entrypoint. A gateway skill makes that workflow explicit at the moment the user opts in, so agents consistently gather missing workflow intent, classify the requested action at the right abstraction level, and avoid treating setup or hook installation as part of execution. This broader framing also aligns SDD with the motive model: the actor stays accountable for the work, while specs, plans, tasks, and governances become the delegation surface that lets delegates carry expert creation work beyond the actor's native discipline.

---

## Design decisions

### The skill is the SDD workflow gateway

`sdd` owns the front door for opt-in SDD work. It activates SDD for the current request, conducts brief intake when the user invokes `$sdd` without enough detail, classifies the requested SDD action, and invokes the SDD system entrypoint. It must not edit `AGENTS.md`, register SessionStart hooks, install packages, or require the `cyber-skills` CLI.

### Trigger language is explicit and workflow-oriented

The skill triggers when the user explicitly invokes `$sdd`, says to use SDD, or asks to work on a creation artifact with Spec-Driven Development. Triggered work includes new artifact creation, backfill, draft revision, contract approval, implementation, implementation approval, behavior change after approval, deprecation, or SDD graph refresh. It does not trigger for general SDD explanation unless the user asks to apply the workflow to a concrete piece of creation work.

### Empty invocation conducts intake

When the user invokes `$sdd` with no work item, artifact, or action, the skill should not guess. It should ask what SDD work the user wants to do, offering the main routes: create a new artifact, backfill an existing artifact, revise or validate an existing spec, implement an approved spec, manage or deprecate specs, or refresh the spec graph.

### The gateway owns intent, not internal workflow control

The gateway skill does not choose producer or judge roles, interpret lifecycle transitions, or enforce freeze policy. It loads the SDD gateway context, including `sdd:spec-governance`, then hands detailed authoring and validation control to the narrower skills beneath it. The gateway only needs enough knowledge to identify the user's requested SDD action and invoke the correct SDD entrypoint for that action.

### User questions stay at gateway and skill boundaries

`sdd-orchestrator` has no user channel. The `sdd` skill handles gateway intake and user-facing clarification, then hands off into the SDD workflow. Deeper workflow questions belong to the narrower skills beneath the gateway.

---

## Trigger surface

The skill description uses this trigger contract:

```text
Use this skill when the user explicitly invokes SDD or wants to work on a creation artifact with Spec-Driven Development.
```

Examples that trigger the skill:

| User intent | Expected route |
|---|---|
| "$sdd" | Intake prompt for the desired SDD work |
| "Use SDD for auth" | Intake or invoke SDD with the user's coarse intent |
| "Create an SDD spec for this onboarding flow" | Invoke SDD for spec creation |
| "Backfill SDD for this existing parser" | Invoke SDD for backfill |
| "Use SDD to formalize this hiring workflow" | Invoke SDD for non-software creation work |
| "Approve this draft spec" | Invoke SDD for spec approval |
| "Implement the approved auth spec" | Invoke SDD for implementation |
| "Change this approved behavior" | Invoke SDD for behavior-change handling |
| "Refresh the SDD graph" | Invoke SDD for graph refresh |

---

## Skill surface

No CLI surface is required. The public surface is the user-invoked `sdd` gateway skill.

```text
sdd
  in: explicit SDD invocation or user intent to work on a creation artifact under SDD
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
- `artifacts/specs/sdd-spec-graph/spec.md` — defines the derived graph view for SDD specs.
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
