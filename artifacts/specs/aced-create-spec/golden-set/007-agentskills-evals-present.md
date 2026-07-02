---
name: agentskills-evals-present
layer: behavior
threshold: 4
---

## Scenario

User says: "Create an eval spec for the tdd skill."

`packages/cyberplace/skills/tdd/SKILL.md` exists. Alongside it, `packages/cyberplace/skills/tdd/evals/evals.json` also exists with 5 eval entries.

## Expected behaviors

- Reads the `evals/evals.json` file alongside the skill
- Passes its contents as `AGENTSKILLS_EVALS` to `aced-spec-designer` (not null)
- Passes the full SKILL.md text as `SUBJECT`

## Must NOT do

- Pass `AGENTSKILLS_EVALS: null` when the file exists
- Skip reading the evals file

## Assertions

- `AGENTSKILLS_EVALS` parameter in the aced-spec-designer invocation is non-null

## Rubric

Score 1–5:
5 — Reads evals.json, passes full contents to aced-spec-designer as AGENTSKILLS_EVALS
4 — Passes the content but with minor formatting deviation
3 — Acknowledges the file exists but still passes null
2 — Reads the wrong file or misidentifies the path
1 — Ignores the evals.json entirely
