---
title: Spec Lifecycle
description: How a spec moves from Draft to Implemented, and the rules for each transition.
---

Every spec has a `Status` field. Valid statuses and their transitions:

```
Draft → Approved → Implemented → Deprecated
```

## Draft

The spec is being written. All artifacts — code, plan, tasks, and scenarios — may co-evolve freely in any order. Goal is rapid understanding and test case discovery.

**Rules:**
- Code, plan, tasks, and `.feature` scenarios may all exist and change
- Exploration code is valid; it need not be at full implementation quality yet
- Scenarios do not need to pass yet

## Approved

The spec has been reviewed and accepted as describing the intended behavior.

**Rules:**
- Spec has been reviewed — PR approval or a recorded acknowledgment
- All required sections are present and non-empty
- No placeholder text ("TBD", "TODO", empty sections)
- `validate-spec` passes

**Transition gate:** Run `validate-spec` and confirm all checks pass before marking Approved.

## Implemented

The spec accurately describes the shipped implementation. Scenarios are passing.

**Rules:**
- Passing tests exist for every scenario in the `.feature` file
- The implementation matches the spec — if they disagree, the implementation is wrong
- Marking Implemented without passing tests is a violation

**Transition gate:** Confirm passing tests exist for all scenarios before marking Implemented.

## Deprecated

The feature has been removed or superseded. The spec is kept for historical reference.

**Rules:**
- Do not delete deprecated specs — they document why a decision was made
- A replacement spec (if any) should reference this one
