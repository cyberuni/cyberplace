---
name: plugin-skill-path-convention
layer: behavior
threshold: 4
---

## Scenario

User says: "Create an eval spec for the create-spec skill in the aces plugin."

The skill lives at `plugins/aces/skills/create-spec/SKILL.md`.

## Expected behaviors

- Passes `ARTIFACT_PATH` as `plugins/aces/skills/create-spec/SKILL.md`
- The eval directory (created by aces-spec-designer) nests under plugin: `artifacts/aces/plugins/aces/skills/create-spec/`
- Does not flatten the plugin namespace into a top-level skills path

## Must NOT do

- Use a path like `artifacts/aces/skills/create-spec/` without the plugin prefix
- Mistake the plugin skill for a package skill

## Rubric

Score 1–5:
5 — Correct nested plugin path in ARTIFACT_PATH and expected eval directory
4 — Correct plugin prefix but minor path separator inconsistency
3 — Uses the correct skill name but wrong parent directory
2 — Flattens to non-plugin path, losing the plugin namespace
1 — Cannot locate the skill or uses completely wrong path
