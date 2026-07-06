---
title: Gateway Skill
description: What gateway skills are — user-invoked workflow entrypoints that activate and route opt-in agent workflows.
---

**Gateway skills** are user-invoked workflow entrypoints. They activate an opt-in workflow, gather missing intent, load the workflow's rules, and route the request to the right next skill or action.

They are for workflows that should not be always on, but need more than a single narrow command once invoked.

## What gateway skills do

A gateway skill owns the front door of a workflow:

- **Activation** — the user explicitly invokes the workflow, such as `$sdd` or "use SDD for this feature"
- **Intake** — when the request is underspecified, the skill asks what kind of work the user wants to do
- **Context loading** — the skill loads the rules, constraints, and terms needed for the workflow
- **Routing** — the skill sends the work to a narrower skill, tool, or implementation path

The gateway may continue to shape the current work after routing. It is still scoped to the user's requested workflow, not global agent behavior.

A gateway skill should stay at the user-facing boundary. It should not own the workflow's internal delegate selection, detailed lifecycle transitions, or artifact-specific correctness rules unless those are themselves part of the user-facing intake surface.

## Why not use always-on configuration

Always-on [agent configuration](/concepts/agent-configuration/) is appropriate when a rule should apply to every task in a repo. A gateway skill is appropriate when the workflow is optional.

Spec-Driven Development is a good example: not every edit in a repository needs SDD, but once the user opts in, the SDD workflow beneath the gateway needs the lifecycle, gate, and freeze rules in context.

## Gateway Skill vs Other Concepts

| Concept | When active | Purpose |
|---|---|---|
| Gateway skill | User-invoked, per workflow | Open, guide, and route an opt-in workflow |
| Skill | On demand when triggered | Perform a reusable workflow or task |
| Governance | Loaded on demand | Define what is correct for a domain |
| Discipline | Always on | Shape habitual behavior across work |

## Example: SDD

`$sdd` is the gateway skill for Spec-Driven Development.

With enough detail, it routes directly:

```text
use SDD to create a spec for auth
```

With no detail, it conducts intake:

```text
$sdd
```

The agent should ask what SDD work the user wants to do: create a new feature, backfill an existing feature, validate a spec, implement an approved spec, or manage existing specs.

## Related

- [Skills](/concepts/skills/) — on-demand workflows
- [Governances](/concepts/governances/) — domain rules loaded on demand
- [Disciplines](/concepts/disciplines/) — always-on behavioral habits
- [Spec-Driven Development](/concepts/spec-driven-development/) — the workflow `$sdd` activates
