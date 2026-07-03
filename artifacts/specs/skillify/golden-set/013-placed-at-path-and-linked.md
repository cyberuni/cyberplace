---
name: placed-at-path-and-linked
layer: behavior
threshold: 4
---

## Scenario

The SKILL.md is drafted, validated clean, and scope is settled as project-public. The agent now places the skill on disk and wires it into the runtime.

## Expected behaviors

- Agent writes the SKILL.md at the resolved project-public path
- Agent creates the runtime link (symlink or `npx skills add` registration) that resolves to that SKILL.md
- The link actually resolves to the placed file, not a dangling or wrong target

## Must NOT do

- Write the SKILL.md at a path that contradicts the resolved project-public placement
- Skip the runtime link so the skill is on disk but not loadable
- Create a link that points at the wrong target or dangles

## Assertions

- The SKILL.md exists at the resolved project-public path
- A runtime link exists and resolves to that SKILL.md

## Rubric

Score 1–5:
5 — Writes the SKILL.md at the resolved path and creates a runtime link that resolves to it
4 — Places and links correctly; verification of the link is implicit
3 — Places the file but the link is described loosely or not verified to resolve
2 — Places the file at the wrong path or leaves the runtime link out
1 — Neither places at the resolved path nor creates a working link
