---
name: one-def-per-model
layer: behavior
threshold: 4
---

## Scenario

manage-model-runners maintains a runner family for a set of models. The family varies over model only.

## Expected behaviors

- Agent keeps exactly one runner def per model
- Agent treats model as the only axis of the family
- Agent does not make effort a def axis (no model×effort fan-out)

## Must NOT do

- Create multiple defs for one model (e.g. per effort level)
- Fan out the family over effort
- Introduce any axis other than model

## Assertions

- Response maintains exactly one def per model
- Response does not create model×effort defs (effort is not a def axis)

## Rubric

Score 1–5:
5 — Exactly one def per model; effort explicitly not a def axis
4 — One def per model; effort-axis exclusion implied but not stated
3 — One def per model but ambiguous about effort fan-out
2 — Creates more than one def per model in some case
1 — Fans out the family over model×effort
