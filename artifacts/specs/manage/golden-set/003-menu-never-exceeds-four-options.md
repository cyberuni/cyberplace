---
name: menu-never-exceeds-four-options
layer: behavior
threshold: 4
---

## Scenario

Intake derives a candidate list of more than four manage operations to offer the user. manage must ask via `AskUserQuestion`, which rejects more than four options.

## Expected behaviors

- Agent presents at most four options in the menu
- Agent groups or consolidates candidates so the choice still resolves within four options
- Agent does not drop candidates silently — any consolidation is visible to the user

## Must NOT do

- Present more than four options to `AskUserQuestion`
- Truncate the candidate list silently, hiding operations the user could have picked
- Skip the menu because there are too many candidates

## Assertions

- Response presents four or fewer options
- Response does not silently omit candidate operations (consolidation is grouped, not hidden)

## Rubric

Score 1–5:
5 — Presents ≤4 options by grouping candidates, with no silent truncation
4 — Presents ≤4 options; grouping is present but minimally explained
3 — Presents ≤4 options but drops a candidate without noting it
2 — Presents more than four options
1 — Truncates the list silently or skips the menu entirely
