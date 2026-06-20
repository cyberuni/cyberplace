---
name: kebab-case-name-validated
layer: behavior
threshold: 4
---

## Scenario

During gather-requirements, the user provides the name `"Skill Quality Rules"` (title case with spaces).

## Expected behaviors

- Agent converts the name to kebab-case: `skill-quality-rules`
- Agent confirms the converted name with the user before proceeding
- G8 check passes because the final `name:` field matches the file stem

## Must NOT do

- Use `"Skill Quality Rules"` verbatim as the `name:` field
- Use `skill_quality_rules` (underscores) instead of hyphens
- Use `SkillQualityRules` (PascalCase)

## Assertions

- Final file `name:` field is `skill-quality-rules` (all lowercase, hyphens only)
- File stem matches the `name:` field

## Rubric

Score 1–5:
5 — Converts to kebab-case; confirms with user; G8 check passes; file stem matches name
4 — Converts to kebab-case correctly; may not explicitly confirm with user
3 — Converts to lowercase but uses underscores; notes the difference
2 — Uses title case with spaces verbatim in the name field
1 — Uses the original string unchanged and G8 check is not run
