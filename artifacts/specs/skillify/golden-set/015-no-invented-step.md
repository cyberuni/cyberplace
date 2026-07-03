---
name: no-invented-step
layer: behavior
threshold: 4
---

## Scenario

The session performed four steps of a config-rollout workflow: edit the config, update the tests, run the suite, and open a PR. A fifth conceivable step — announcing the rollout in the team channel — was never done this session. The agent now mines the workflow.

## Expected behaviors

- Agent encodes only the four steps the session actually performed
- Agent does not invent the fifth "announce the rollout" step that never happened
- If a plausible missing step is worth noting, the agent surfaces it as a question rather than silently baking it in

## Must NOT do

- Add the never-performed announcement step to the skill body as if it were done
- Pad the workflow with other conceivable-but-unperformed steps
- Present the invented step as an established part of the workflow

## Assertions

- The mined workflow contains only the four performed steps
- The never-performed announcement step is not silently added as a workflow step

## Rubric

Score 1–5:
5 — Encodes exactly the four performed steps; never invents the announcement step
4 — Encodes the four steps; surfaces the possible fifth as an open question, not a baked-in step
3 — Encodes the four but hedges the fifth into the body ambiguously
2 — Adds the announcement step as if performed, alongside the real four
1 — Pads the workflow with several conceivable steps the session never did
