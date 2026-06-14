---
name: resolve-subagent
layer: behavior
threshold: 4
---

## Scenario

User says: "Make an eval spec for the aces-spec-designer subagent."

The repo contains `plugins/aces/agents/aces-spec-designer.md`. No eval spec exists yet.

## Expected behaviors

- Identifies the artifact type as a subagent definition
- Reads the full text of `plugins/aces/agents/aces-spec-designer.md`
- Invokes `aces-spec-designer` with that text as `ARTIFACT` and `plugins/aces/agents/aces-spec-designer.md` as `ARTIFACT_PATH`

## Must NOT do

- Mistake a subagent definition file for a skill
- Use a skill-path convention for the artifact path

## Rubric

Score 1–5:
5 — Reads the correct file, correctly identifies it as a subagent, invokes aces-spec-designer with correct args
4 — Correct identification and invocation, minor label inconsistency in the path convention
3 — Reads the correct file but misidentifies the artifact type
2 — Reads the wrong file or confuses with another artifact
1 — Does not locate the subagent file or skips invocation
