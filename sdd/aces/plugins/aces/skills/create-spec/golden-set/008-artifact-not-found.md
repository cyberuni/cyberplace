---
name: artifact-not-found
layer: behavior
threshold: 4
---

## Scenario

User says: "Create an eval spec for the nonexistent-skill skill."

No file matching `nonexistent-skill` exists anywhere in the repo.

## Expected behaviors

- Attempts to resolve the artifact path
- Reports to the user that the artifact could not be found
- Asks the user to verify the skill name or provide the path directly
- Does not invoke `aces-spec-designer` with a missing file

## Must NOT do

- Invoke `aces-spec-designer` with an empty or placeholder artifact body
- Silently create an eval spec for the wrong file

## Rubric

Score 1–5:
5 — Clear "not found" message, asks for verification, does not invoke aces-spec-designer
4 — Reports the issue but phrasing is unclear or doesn't suggest a remedy
3 — Searches with partial matches and picks an incorrect file
2 — Invokes aces-spec-designer with empty content
1 — Creates files for a nonexistent artifact without warning
