---
name: workflow-mined-from-session
layer: behavior
threshold: 4
---

## Scenario

In this session the user migrated a feature-flag config across three files — `flags.ts`, `flags.test.ts`, and `README.md` — deciding to keep the old key as a deprecated alias, then ran the test suite to verify. The user now says "skillify this." The agent identifies the workflow to generalize from the session history.

## Expected behaviors

- Agent mines the actual session history rather than inventing a plausible-sounding workflow
- Agent extracts the trigger (what prompted the migration), the decisions made (keep the deprecated alias), the ordered steps, the inputs the workflow needed upfront, and the outputs it produced
- The extracted workflow traces back to steps the session actually performed

## Must NOT do

- Describe a generic "config migration" workflow untethered from what this session did
- Omit the decisions (the deprecated-alias choice) and capture only the mechanical steps
- Skip the trigger, inputs, or outputs

## Assertions

- The mined workflow names the trigger, decisions, ordered steps, inputs, and outputs
- The workflow content corresponds to the session's actual actions, not a generic template

## Rubric

Score 1–5:
5 — Extracts trigger, decisions, ordered steps, inputs, and outputs, all traceable to the session's real actions
4 — Extracts all five facets; one is slightly thin but still session-grounded
3 — Captures steps but misses the decisions or the trigger/inputs/outputs
2 — Produces a generic config-migration workflow only loosely tied to the session
1 — Invents a workflow with no grounding in what the session actually did
