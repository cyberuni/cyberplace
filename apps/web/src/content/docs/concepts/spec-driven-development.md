---
title: Spec-Driven Development
description: What spec-driven development is, its core principles, and how a spec moves from Draft to Implemented.
---

Spec-driven development (SDD) is a practice where behavioral specs and implementation are **co-delivered** — written, reviewed, and shipped together, not in sequence.

## The co-delivery model

A spec is not a requirements document written before coding begins. It is a living artifact that describes observable behavior. It evolves alongside the code.

A builder works from their angle of expertise — product, design, engineering, security — and submits spec + code together in the same merge request. Other builders contribute their angle before and after the MR. No single person writes the full spec upfront.

This means:

- The spec and the implementation are always in sync
- Reviewers can verify behavior by reading the spec, not by reverse-engineering the code
- Refactoring the implementation does not change the spec — only behavior changes do

## What a spec contains

A spec covers one domain (one feature or command group). It answers:

- **Why** — the problem being solved
- **What** — the observable behavior
- **Command surface** — the CLI syntax or API signature; a behavioral contract, not an implementation detail
- **Scenarios** — Gherkin scenarios describing success and failure cases

## What a spec is not

- A design document for implementation internals
- A complete upfront specification
- A substitute for code review

## Principles

### 1. Spec alongside code

Spec, code, and product are co-delivered — not sequential. A builder works from their angle of expertise (product, design, engineering, security, etc.) and submits spec + code together. A feature has multiple angles; no single builder completes the full spec upfront. Builders from other angles contribute before and after the MR to improve the spec, code, and product.

### 2. The spec owns the behavior

If the implementation disagrees with the spec, the implementation is wrong — unless the spec is revised through a review cycle.

### 3. Why is not optional

A spec without a "Why" section is incomplete. If you cannot articulate why the feature is needed, the feature may not be needed.

### 4. Scenarios are observable

Gherkin scenarios describe what a user or caller observes — exit codes, stdout, return values, side effects. They do not describe internal state, function calls, or implementation details.

### 5. Happy path + error cases

Every spec must cover at least one success scenario and the primary failure scenarios for each operation.

### 6. Status must be accurate

Marking a spec Implemented when scenarios are not passing is a violation. Marking it Approved before review is a violation.

### 7. Specs survive refactors

The spec does not change when the implementation is restructured. It changes only when behavior changes — and behavior changes require a new review cycle.

### 8. One spec per domain

A spec covers one coherent feature or command group. If a spec covers two unrelated concerns, split it.

## Spec lifecycle

Every spec has a `Status` field. Valid statuses and their transitions:

```
Draft → Approved → Implemented → Deprecated
```

### Draft

The spec is being written. All artifacts — code, plan, tasks, and scenarios — may co-evolve freely in any order. Goal is rapid understanding and test case discovery.

**Rules:**
- Code, plan, tasks, and `.feature` scenarios may all exist and change
- Exploration code is valid; it need not be at full implementation quality yet
- Scenarios do not need to pass yet

### Approved

The spec has been reviewed and accepted as describing the intended behavior.

**Rules:**
- Spec has been reviewed — PR approval or a recorded acknowledgment
- All required sections are present and non-empty
- No placeholder text ("TBD", "TODO", empty sections)
- `validate-spec` passes

**Transition gate:** Run `validate-spec` and confirm all checks pass before marking Approved.

### Implemented

The spec accurately describes the shipped implementation. Scenarios are passing.

**Rules:**
- Passing tests exist for every scenario in the `.feature` file
- The implementation matches the spec — if they disagree, the implementation is wrong
- Marking Implemented without passing tests is a violation

**Transition gate:** Confirm passing tests exist for all scenarios before marking Implemented.

### Deprecated

The feature has been removed or superseded. The spec is kept for historical reference.

**Rules:**
- Do not delete deprecated specs — they document why a decision was made
- A replacement spec (if any) should reference this one
