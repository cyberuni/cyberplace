# pause-mission

Project-private workflow skill for **checkpointing an in-progress SDD mission into its plan
brief** (`.agents/plans/<cr-ref>.plan.md`). Invoke it when stopping mid-mission ("pause",
"checkpoint", "save state to the plan", "stop here") to update the todo statuses and rewrite
the `## NEXT — resume here` anchor, then commit — so the working tree is clean and the next
session resumes without rediscovery.

The inverse of [`resume-mission`](../resume-mission/README.md): `pause-mission` **writes** the
checkpoint, `resume-mission` **reads** it. Modeled after the handoff-skill pattern (reference
artifacts instead of restating, keep it commit-message-grade, suggest the pickup skill) but
targeted at the plan rather than a temp file. `internal: true` — contributor tooling.
