---
name: persona-pattern-metadata
layer: behavior
threshold: 4
---

## Scenario

The user says: "Create a user-global persona skill called senior-security-engineer. When loaded, I want the agent to adopt the mindset of a senior security engineer focused on threat modeling and secure-by-default design."

The user has specified the Persona pattern explicitly.

## Expected behaviors

- Agent adds `metadata.persona: "true"` to the SKILL.md frontmatter
- Agent writes a description that starts with `"Use this skill when"` (persona skills are user-facing, not sub-skills)
- The body describes the persona stance, focus areas, and how the agent should approach problems — not a step-by-step workflow
- Agent does NOT add `metadata.internal: true` (user-global persona skills are not project-private)

## Must NOT do

- Omit `metadata.persona: "true"` for a persona skill
- Write a step-by-step process workflow body for a persona skill
- Add `metadata.internal: true` just because it is a persona

## Rubric

Score 1–5:
5 — Adds `metadata.persona: "true"`; description starts with `"Use this skill when"`; body is persona-appropriate (stance and focus, not steps)
4 — Correct metadata; body has some procedural steps mixed in but is primarily persona-framed
3 — Adds `metadata.persona: "true"` but description uses `"Internal skill:"` prefix
2 — Writes a persona skill body but omits `metadata.persona: "true"`
1 — Drafts a process workflow with numbered steps and no persona framing or metadata
