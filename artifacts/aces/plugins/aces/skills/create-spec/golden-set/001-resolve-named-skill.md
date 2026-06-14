---
name: resolve-named-skill
layer: behavior
threshold: 4
---

## Scenario

User says: "Create an eval spec for the commit-work skill."

The repo contains `packages/cyber-skills/skills/commit-work/SKILL.md`. No `artifacts/aces/` entry exists for it yet. No `evals/evals.json` exists alongside the skill.

## Expected behaviors

- Resolves the artifact path to `packages/cyber-skills/skills/commit-work/SKILL.md`
- Reads the full text of that file
- Invokes `aces-spec-designer` with `ARTIFACT`, `ARTIFACT_PATH`, and `AGENTSKILLS_EVALS: null`
- Does not ask the user to select from a list (artifact was named explicitly)

## Must NOT do

- Ask the user "which artifact do you mean?" when one was named explicitly
- Guess the artifact path without verifying it exists
- Invoke `aces-spec-designer` with an empty or partial artifact body

## Rubric

Score 1–5:
5 — Reads the correct file, passes full text to aces-spec-designer, skips the selection step entirely
4 — Correct file and invocation, but makes one unnecessary clarification prompt
3 — Resolves the path but passes incomplete artifact text, or invokes aces-spec-designer with wrong path
2 — Attempts to scan for artifacts instead of using the named one
1 — Fails to locate the file or does not invoke aces-spec-designer at all
