---
title: Spec-Driven Development
description: What spec-driven development is, its core principles, and how a spec moves from Draft to Implemented.
---

Most teams have lived this: a requirements doc written before a sprint, followed by code that diverges from it within a week. The doc becomes an artifact of intent, not behavior. Nobody has time to keep it current. Eventually the code becomes the spec — which means the spec is wherever the implementation happens to land, not where anyone agreed it should be.

Spec-driven development (SDD) is a practice built around one insight: **a spec that isn't verified against running behavior will lie to you**. So instead of separating specification from implementation, you keep them together — same artifact, same lifecycle, same merge request.

## What spec-driven development is

SDD describes software behavior from the outside — inputs, outputs, observable side effects. Not how the internals work; what the system does from a caller's perspective.

That distinction is the whole game. Implementation details change constantly. Observable behavior changes far less often. A spec that describes internal behavior goes stale with every refactor. A spec that describes observable behavior stays accurate across them.

The practice has roots in BDD (Behavior-Driven Development), which introduced executable scenarios — Gherkin syntax verified against a running system. SDD extends that idea: specs aren't just test scaffolding. They're structured documents that capture *why* a feature exists, *what* it does, the command surface, and explicit success and failure scenarios. They live in the repo, version with the code, and follow a defined lifecycle from Draft to Implemented.

### What a spec describes

A spec covers one coherent domain — one feature or command group. It answers four questions:

- **Why** — the problem being solved; if you can't articulate this, the feature may not be needed
- **What** — the observable behavior
- **Command surface** — CLI syntax or API signature; a behavioral contract, not an implementation detail
- **Scenarios** — Gherkin scenarios covering success paths and primary failure cases

The scenarios are the contract. They describe what a user or caller observes: exit codes, stdout, return values, side effects. Not function calls, not internal state, not how the result was computed.

### What a spec is not

- A design document for implementation internals
- A complete upfront specification written before coding begins
- A substitute for code review
- A test file — though every scenario maps to a test

### Principles

**The spec owns the behavior.** If the implementation disagrees with the spec, the implementation is wrong — unless the spec is revised through a review cycle. This keeps the spec authoritative rather than decorative.

**Scenarios are observable.** A scenario that says "function X returns Y" is describing an implementation detail. A scenario that says "the command exits with code 0 and prints the summary to stdout" is describing behavior. Write the second kind.

**Specs survive refactors.** If you restructure the internals and have to update the spec, the spec was describing the wrong thing. The spec changes only when behavior changes — and behavior changes require a new review cycle.

**Why is not optional.** A spec without a "Why" section is incomplete. It documents what the system does but not why anyone cared — which makes it impossible to judge whether a proposed change is in scope or whether the feature is still needed at all.

**Happy path and error cases.** Every spec must cover at least one success scenario and the primary failure scenarios for each operation. A spec that only describes the happy path is half a contract.

**Status must be accurate.** Marking a spec Implemented when scenarios aren't passing is a violation. Marking it Approved before review is a violation. Status fields that can't be trusted are worse than no status fields.

**One spec per domain.** If a spec covers two unrelated concerns, split it. A spec that sprawls becomes a spec nobody reads.

---

## Our spin: the co-delivery model

SDD is a practice. How you integrate it into your workflow is a choice. Here is ours.

We don't write specs upfront and hand them to implementers. We don't write them after the fact to document what shipped. We co-deliver: spec and code arrive in the same merge request, written by the same builder working from their angle of expertise.

A builder working on a CLI command writes the spec and the implementation together. A builder focused on security contributes their angle — threat scenarios, error cases around auth — before or after the MR, not in a separate planning phase. No single person owns the full spec. No single phase owns specification.

This means:

- The spec and the implementation are always in sync
- Reviewers can verify behavior by reading the spec, not by reverse-engineering the code
- Refactoring the implementation does not change the spec — only behavior changes do
- Every angle of expertise (product, design, engineering, security) contributes to the spec from its own perspective

### Spec lifecycle

Every spec has a `Status` field. Valid statuses and their transitions:

```
Draft → Approved → Implemented → Deprecated
```

#### Draft

The spec is being written. All artifacts — code, plan, tasks, and scenarios — may co-evolve freely in any order. Goal is rapid understanding and test case discovery.

**Rules:**
- Code, plan, tasks, and `.feature` scenarios may all exist and change
- Exploration code is valid; it need not be at full implementation quality yet
- Scenarios do not need to pass yet

#### Approved

The spec has been reviewed and accepted as describing the intended behavior.

**Rules:**
- Spec has been reviewed — PR approval or a recorded acknowledgment
- All required sections are present and non-empty
- No placeholder text ("TBD", "TODO", empty sections)
- `validate-spec` passes

**Transition gate:** Run `validate-spec` and confirm all checks pass before marking Approved.

#### Implemented

The spec accurately describes the shipped implementation. Scenarios are passing.

**Rules:**
- Passing tests exist for every scenario in the `.feature` file
- The implementation matches the spec — if they disagree, the implementation is wrong
- Marking Implemented without passing tests is a violation

**Transition gate:** Confirm passing tests exist for all scenarios before marking Implemented.

#### Deprecated

The feature has been removed or superseded. The spec is kept for historical reference.

**Rules:**
- Do not delete deprecated specs — they document why a decision was made
- A replacement spec (if any) should reference this one
