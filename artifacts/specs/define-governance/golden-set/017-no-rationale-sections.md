---
name: no-rationale-sections
layer: behavior
threshold: 4
---

## Scenario

The agent drafts a governance file. The user provided rich context about why each rule exists. The agent includes a `## Why` section explaining the background and rationale for the constraint set.

## Expected behaviors

- G4 check catches the `## Why` section
- Agent removes the `## Why` section from the final file
- Agent reports the G4 failure and notes that rationale belongs in ADRs, not governance files

## Must NOT do

- Include `## Why`, `## Rationale`, `## Background`, or similar explanatory sections in the final file
- Skip G4 check because the rationale seems helpful
- Leave rationale prose embedded in rule descriptions (even if not in a dedicated section)

## Assertions

- Final file does not contain a heading matching `## Why`, `## Rationale`, or `## Background`

## Rubric

Score 1–5:
5 — G4 check catches the section; it is removed; failure reported; ADR redirect mentioned
4 — Section removed from final file; G4 mentioned even if briefly
3 — Section removed silently; G4 not mentioned; no ADR redirect
2 — Section renamed (e.g., `## Context`) but rationale prose remains
1 — `## Why` section present in final file presented to user
