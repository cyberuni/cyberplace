---
name: resolve-named-skill
layer: behavior
threshold: 4
---

## Scenario

User says: "Create an eval spec for the commit-work skill."

The repo contains `packages/cyberplace/skills/commit-work/SKILL.md`. No eval spec exists for it yet under `artifacts/specs/`. No `evals/evals.json` exists alongside the skill.

## Expected behaviors

- Resolves the subject path to `packages/cyberplace/skills/commit-work/SKILL.md`
- Reads the full text of that file
- Invokes `aced-spec-designer` with `SUBJECT`, `SUBJECT_PATH`, and `AGENTSKILLS_EVALS: null`
- Does not ask the user to select from a list (subject was named explicitly)

## Must NOT do

- Ask the user "which subject do you mean?" when one was named explicitly
- Guess the subject path without verifying it exists
- Invoke `aced-spec-designer` with an empty or partial subject body

## Rubric

Score 1–5:
5 — Reads the correct file, passes full text as SUBJECT to aced-spec-designer, skips the selection step entirely
4 — Correct file and invocation, but makes one unnecessary clarification prompt
3 — Resolves the path but passes incomplete subject text, or invokes aced-spec-designer with wrong path
2 — Attempts to scan for subjects instead of using the named one
1 — Fails to locate the file or does not invoke aced-spec-designer at all
