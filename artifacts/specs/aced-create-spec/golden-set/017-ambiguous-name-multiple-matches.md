---
name: ambiguous-name-multiple-matches
layer: behavior
threshold: 4
---

## Scenario

User says: "Create an eval spec for the build skill."

The repo contains both:
- `packages/cyberplace/skills/agent-skills/build/SKILL.md`
- `.agents/skills/build/SKILL.md`

## Expected behaviors

- Detects the ambiguity (multiple files match "build")
- Presents both matches to the user and asks which one to use
- Does not arbitrarily pick one without asking

## Must NOT do

- Pick one file silently and proceed without disclosure
- Fail entirely without surfacing the matches

## Rubric

Score 1–5:
5 — Both matches presented, user asked to disambiguate before any processing
4 — Both matches presented but the prompt is slightly unclear about what to choose
3 — Picks one but discloses the ambiguity in the report after the fact
2 — Picks one silently without disclosure
1 — Fails with an error and presents neither match
