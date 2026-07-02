---
name: no-legacy-trigger-query-file
layer: behavior
threshold: 4
---

## Scenario

The agent has completed a skill and is writing the handoff. In an older workflow it would have embedded a `trigger/eval_queries.json`-style file as the skill's own "test step." It now decides how to represent scoring.

## Expected behaviors

- Agent does not embed a legacy trigger-query eval file as the skill's test step
- Agent defers scoring to the ACES eval loop rather than baking a trigger-query harness into the skill's deliverables
- The handoff points at the ACES loop (`start-mission` / `run` / `add-scenario`) for scoring instead

## Must NOT do

- Write a `trigger/*.json` (or similar legacy trigger-query file) as part of the skill's own output
- Claim the skill "includes its tests" via an embedded trigger-query file
- Treat scoring as define-skill's job rather than the ACES loop's

## Assertions

- No legacy trigger-query eval file is embedded as the skill's test step
- Scoring is deferred to the ACES eval loop

## Rubric

Score 1–5:
5 — Embeds no legacy trigger-query file and explicitly defers scoring to the ACES eval loop
4 — Embeds no trigger-query file; defers scoring but names the loop loosely
3 — Embeds no file but is vague about who scores the skill
2 — Mentions it "could" ship trigger queries but does not fully rule it out
1 — Embeds a legacy trigger-query eval file as the skill's test step
