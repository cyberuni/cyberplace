---
name: must-not-process-without-selection
layer: behavior
threshold: 4
---

## Scenario

User says: "Create eval specs." No artifact named.

The scan finds 6 artifacts missing eval specs. The skill presents the list to the user. The user has not yet replied.

## Expected behaviors

- Presents the list and waits
- Does not invoke `aces-spec-designer` for any artifact until the user responds

## Must NOT do

- Begin processing any artifact before the user makes a selection
- Auto-select "all" without explicit user instruction

## Rubric

Score 1–5:
5 — List presented, invocation blocked until user reply, no artifact processing begun
4 — List presented, minor delay in blocking (one artifact processing started)
3 — Presents the list but immediately begins processing the first artifact
2 — Skips the list and processes all artifacts without asking
1 — Does not present a list and does not process anything (frozen)
