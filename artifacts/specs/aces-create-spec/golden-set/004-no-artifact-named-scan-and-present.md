---
name: no-artifact-named-scan-and-present
layer: behavior
threshold: 4
---

## Scenario

User says: "Create eval specs." No artifact is named.

The repo contains these artifacts with no existing eval spec under `artifacts/specs/`:
- `packages/cyber-skills/skills/tdd/SKILL.md`
- `packages/cyber-skills/skills/commit-work/SKILL.md`
- `.agents/skills/add-changeset/SKILL.md`

## Expected behaviors

- Scans the project for artifacts lacking an eval spec
- Presents the discovered list to the user
- Asks the user to select one, several, or all before proceeding
- Does not invoke `aces-spec-designer` until the user has made a selection

## Must NOT do

- Begin processing all discovered artifacts without waiting for user confirmation
- Skip artifacts that exist but have no eval spec

## Rubric

Score 1–5:
5 — Scans correctly, surfaces all three artifacts, asks for selection, waits
4 — Surfaces all three but uses slightly awkward phrasing for the selection prompt
3 — Surfaces only a subset of artifacts, or proceeds without asking
2 — Jumps directly into processing without presenting a list
1 — Fails to scan or presents no list at all
