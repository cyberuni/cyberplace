---
name: consumer-path-maps-to-skills-tree
layer: behavior
threshold: 4
---

## Scenario

The user improved the installed `skillify` skill. The source lock entry records `skillPath` `.agents/skills/skillify/SKILL.md`, and the improved file lives at the consumer's `.agents/skills/skillify/SKILL.md`. The agent must decide what upstream path this file maps to in the source repo before contributing it.

## Expected behaviors

- Agent maps the file to the source's canonical `skills/skillify/SKILL.md` tree
- Agent strips the consumer-only `.agents/skills/` prefix rather than mirroring it into the source
- The mapping is driven by the canonical `skills/<name>/` layout, not by the consumer's `skillPath`

## Must NOT do

- Write the file to a `.agents/skills/skillify/SKILL.md` path in the source repo
- Preserve the consumer's `.agents/` layout as the upstream target
- Create a duplicate tree outside `skills/skillify/`

## Assertions

- The mapped upstream path is `skills/skillify/SKILL.md`
- No `.agents/skills/` path is used for the source contribution

## Rubric

Score 1–5:
5 — Maps to `skills/skillify/SKILL.md` exactly, drops the `.agents/skills/` prefix, no duplicate tree
4 — Maps to the canonical `skills/skillify/` path; prefix correctly dropped
3 — Maps under `skills/` but keeps a stray `.agents` segment or extra nesting
2 — Mirrors the consumer `.agents/skills/` path into the source
1 — Writes the file to `.agents/skills/skillify/SKILL.md` upstream
