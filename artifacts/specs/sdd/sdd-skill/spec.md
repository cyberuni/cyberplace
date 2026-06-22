---
status: draft
aligned: false
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

The gateway skill does not choose producer or judge roles, load artifact authoring governances, interpret lifecycle transitions, or enforce freeze policy. Those concerns belong to the orchestrator and the narrower authoring or validation skills beneath it. The gateway loads `sdd:lifecycle-governance` to recognize status meanings and route the work correctly, but does not own the state machine — it only needs enough knowledge to identify the user's requested SDD action and invoke the correct SDD entrypoint for that action.

### The gateway is lightweight

As a routing skill, `sdd` does only intake, lifecycle-state inspection, and route selection — no document authoring, no orchestrator invocations. This work requires minimal reasoning: it reads at most a small number of files conditionally, applies a routing table, and reports one next action. The skill should run on a small/fast model at low effort. Authoring and judging work happens in the skills invoked downstream.

### Gateway delegates downstream work to a subagent

When the gateway resolves a route, it spawns a subagent to carry out the downstream SDD work (create-spec, validate-spec, render-spec-graph) rather than loading those skills into the current session. The gateway's context remains bounded to intake, spec.md frontmatter, the inlined routing table, and the route report. All authoring, validation, and orchestration context lives in the spawned subagent session. The subagent receives the resolved route, domain, and any relevant file paths as its prompt context.

### Gateway inlines the routing table instead of loading lifecycle-governance

The gateway only needs the status enum (five values) and the routing table (status → workflow action). It does not need the full schema, open-marker format rules, or freeze state-machine details that lifecycle-governance documents for producers and judges. Those five values and their routes are inlined directly in the SKILL.md. If lifecycle status values change, the SKILL.md routing table must be updated alongside the governance doc.

### Gateway reads spec.md frontmatter first, then reads conditionally

When a domain is named, the gateway reads spec.md to extract its frontmatter status. It does not read .feature, plan.md, or the spec.md body for routing purposes. If and only if status is `draft`, it reads tasks.md to check for unchecked items. If tasks are all checked, it scans spec.md and the .feature for `<!-- open: ... -->` markers. The gateway never reads plan.md; it is not needed for route selection.

### Routes are named as workflow actions, not skill or CLI names

User-facing output names the SDD action by what it does in the workflow, not by the skill or CLI that performs it. The routing table and the report use **Draft spec**, **Revise spec**, **Backfill spec**, **Review at the spec gate**, **Review at the impl gate**, and **Refresh spec graph**. The gateway still invokes the underlying skills internally, but the user never sees `create-spec` or `validate-spec --target spec`. "Review at the spec gate" names the draft→approved step as a review the human performs, avoiding both the unclear word "contract" and a bare "spec" that hides that the `.feature` is reviewed too.

### A complete draft defaults to the spec gate without asking

When `spec.md` is `draft`, the gateway inspects completion signals before offering routes. If `tasks.md` has all items checked and no `<!-- open: ... -->` markers remain in `spec.md` or the `.feature`, the gateway routes straight to **Review at the spec gate** and does not present the revise option as an alternative. This is safe to automate because the spec gate still takes the human verdict — routing only submits the draft to the gate. If any task is unchecked or any open marker remains, the gateway routes to **Revise spec** and names the open items. If signals are inconclusive (no `tasks.md`, no markers), it presents both routes. The gateway does not generate the review digest itself — `validate-spec` surfaces that at the gate.

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
| "Create an SDD spec for this onboarding flow" | Draft spec |
| "Backfill SDD for this existing parser" | Backfill spec |
| "Use SDD to formalize this hiring workflow" | Draft spec for non-software creation work |
| "Approve this draft spec" | Review at the spec gate |
| "Implement the approved auth spec" | Implement, then Review at the impl gate |
| "Change this approved behavior" | Route through the draft re-open path |
| "Deprecate the auth spec" | Spec management (deprecation) |
| "Refresh the SDD graph" | Refresh spec graph |

A nonempty request that resolves to no known SDD action is reported as unroutable; the skill invokes no SDD action in that case.

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
- `artifacts/specs/sdd/spec-digest/spec.md` — the digest the spec gate shows after this skill routes there.
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
