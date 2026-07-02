---
name: plugin-skill-path-convention
layer: behavior
threshold: 4
---

## Scenario

User says: "Create an eval spec for the create-spec skill in the aced plugin."

The skill lives at `plugins/aced/skills/create-spec/SKILL.md`.

## Expected behaviors

- Passes `SUBJECT_PATH` as `plugins/aced/skills/create-spec/SKILL.md`
- The eval directory (created by aced-spec-designer) uses the plugin-prefix convention: `artifacts/specs/aced-create-spec/`
- Does not use a flat, unprefixed path for plugin skills

## Must NOT do

- Use a path like `artifacts/specs/create-spec/` without the plugin prefix
- Mistake the plugin skill for a standalone (non-plugin) skill

## Rubric

Score 1–5:
5 — Correct plugin-prefixed path in SUBJECT_PATH and expected eval directory
4 — Correct plugin prefix but minor path separator inconsistency
3 — Uses the correct skill name but wrong parent directory or missing plugin prefix
2 — Flattens to non-prefixed path, losing the plugin namespace
1 — Cannot locate the skill or uses completely wrong path
