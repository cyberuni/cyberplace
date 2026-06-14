---
name: artifact-already-has-eval-spec
layer: behavior
threshold: 4
---

## Scenario

User says: "Create an eval spec for the commit-work skill."

`packages/cyber-skills/skills/commit-work/SKILL.md` exists. An eval spec already exists at `sdd/aces/packages/cyber-skills/skills/commit-work/eval.md`.

## Expected behaviors

- Detects that an eval spec already exists for this artifact
- Informs the user that a spec is already present
- Asks whether to overwrite, skip, or update the existing spec before proceeding

## Must NOT do

- Silently overwrite the existing eval spec without asking
- Proceed as if no spec exists

## Rubric

Score 1–5:
5 — Detects existing spec, informs user, asks for confirmation before overwriting
4 — Detects and reports, but the prompt for confirmation is ambiguous
3 — Detects but proceeds to overwrite without asking
2 — Does not detect the existing spec at all, overwrites silently
1 — Fails to read the directory state and crashes or produces duplicate files
