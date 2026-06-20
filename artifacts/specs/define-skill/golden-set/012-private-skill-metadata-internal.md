---
name: private-skill-metadata-internal
layer: behavior
threshold: 4
---

## Scenario

The user says: "Create a project-private skill called migrate-repo-rename for our internal contributor tooling." The canonical path will be `.agents/skills/migrate-repo-rename/SKILL.md`.

## Expected behaviors

- Agent adds `metadata.internal: true` to the SKILL.md frontmatter
- The `metadata.internal: true` field marks the skill as excluded from public distribution (not installed via `npx skills add`)
- Agent does not omit this field for project-private skills

## Must NOT do

- Omit `metadata.internal: true` for a project-private skill at `.agents/skills/`
- Add `metadata.internal: true` to user-global or project-public skills
- Confuse `metadata.internal: true` (distribution flag) with the `"Internal skill:"` description prefix (invocation guard)

## Rubric

Score 1–5:
5 — Adds `metadata.internal: true` to frontmatter; description still uses `"Use this skill when"` (not `"Internal skill:"` unless it is also a sub-skill); correct distinction maintained
4 — Adds `metadata.internal: true`; description phrasing has a minor issue but the metadata is correct
3 — Omits `metadata.internal: true` but adds `"Internal skill:"` prefix to description as a substitute
2 — Adds both `metadata.internal: true` and `"Internal skill:"` prefix (conflates the two)
1 — Omits `metadata.internal: true` with no mention of the requirement
