---
title: Spec-Driven Development
description: What spec-driven development is, its core principles, and how we apply it with the co-delivery model.
---

Tell an AI to "build a dashboard." It will build one. It will look plausible. It will also invent APIs that don't exist, miss half the edge cases, and produce architecture that fights your existing system. Two weeks later, the code is working but nobody can explain *why* it does what it does, and changing anything breaks three things.

This is vibe coding — prompt-first, intention-loose development. It gets you to a prototype fast and to a mess faster.

Spec-driven development (SDD) is the structured alternative. The spec — not the prompt, not the code — is the primary source of truth. You define intent precisely before code is generated, and the spec stays authoritative as the system evolves.

## What spec-driven development is

SDD is a methodology where a **structured specification is written before coding begins**, and that spec anchors everything generated from it.

The key move: treat the spec as the source, the code as a derivative. When requirements change, you update the spec and regenerate. When a reviewer wants to understand behavior, they read the spec — not the code. When an AI generates an implementation, it works from a precise artifact rather than a loose prompt.

This isn't a new idea. It has roots in **Design by Contract** (Bertrand Meyer, 1986 — preconditions, postconditions, and invariants as first-class citizens), formal specification methods (Z notation, VDM), **API-design-first** (OpenAPI's contract-first model), and **BDD** (Behavior-Driven Development), which introduced executable Gherkin scenarios verified against running systems. What's new is the context: AI coding assistants make spec-first discipline *more* important, not less. A precise spec prevents the hallucination, drift, and architectural inconsistency that show up when AI works from ambiguous input.

### What a spec is

A spec is:

- **Structured** — consistent sections, machine-readable format
- **Behavior-oriented** — describes what the system does from the outside, not how it works internally
- **Testable** — every claim can be verified against a running system
- **Persistent** — lives in the repo, versions with the code, survives the team member who wrote it

A spec is not a design doc for implementation internals. It doesn't describe function signatures, class hierarchies, or database schemas. Those are implementation details. Observable behavior — what a user or caller sees — is what the spec pins down.

### How SDD works

Most SDD workflows follow a four-phase loop:

1. **Specify** — write the structured spec: requirements, constraints, edge cases, acceptance criteria
2. **Plan** — derive the architecture and task breakdown from the spec
3. **Task** — create atomic implementation tasks from the plan
4. **Implement** — generate or write code from the tasks

Each phase has a human checkpoint. The spec doesn't auto-generate the plan; a person reviews and adjusts. The plan doesn't auto-generate tasks; a person refines scope. This is what keeps the system aligned with intent instead of drifting toward whatever an AI finds easiest to produce.

This loop is not waterfall. Waterfall has months-long feedback cycles between phases; the SDD loop can run in hours with AI assistance. The difference is that each phase is short and verifiable, not a long handoff between teams.

### SDD vs. related practices

**Vibe coding** starts with a prompt and iterates by feel. SDD starts with a spec and iterates against it. The difference isn't speed — it's what you're held accountable to.

**TDD** (Test-Driven Development) writes tests before code. SDD writes full feature specifications before code. A spec captures *why* a feature exists, the command surface, architecture constraints, and non-functional requirements — context that a test suite alone doesn't carry. For human developers, TDD and SDD compose naturally: the spec establishes intent at the feature level, TDD drives the unit implementation beneath it.

For AI agents the relationship is more complex. Research (TDAD, 2025) shows that naive TDD prompting — instructing an agent to "write a failing test first, then implement" — can make things *worse*: the procedural instructions consume context window space, crowding out repository context the model needs, and agents tend to game tests rather than derive intent from them. Tests work well for agents as *verification gates* (run the suite to confirm correctness) but poorly as the *specification interface* (derive what to build from a failing test). See [Test-Driven Development](./test-driven-development) for the full picture.

**API-first / contract-first** is SDD applied to APIs: the OpenAPI definition is the spec, client and server are generated from it, and the contract is the source of truth. SDD generalizes this pattern beyond APIs to any software behavior.

### Why it matters

Early reports from teams adopting SDD with AI tooling show 3–10× improvement in first-pass success rates — implementations that match intent without requiring extensive rework cycles. The gains come from eliminating the ambiguity that causes AI drift, not from the AI working harder.

Tools supporting SDD as of 2025–2026 include AWS Kiro, GitHub Spec Kit, Cursor Plan Mode, Tessl, and Claude Code's spec workflow.

### Maturity levels

SDD isn't a single mode — it's a spectrum:

- **Spec-First** — the spec guides initial development but may drift afterward as code changes accumulate
- **Spec-Anchored** — the spec evolves with the code; automated tests enforce the contract; spec and code are always in sync
- **Spec-as-Source** — humans never edit code directly; the spec is the only artifact maintained and code is fully generated, like a compiled binary

Most teams start at Spec-First and move toward Spec-Anchored as tooling matures. Spec-as-Source is viable today only in domains with stable, well-understood generation tooling (AWS Kiro targets this end of the spectrum).

### When SDD doesn't work

SDD adds overhead. It's worth knowing where that overhead doesn't pay off:

- **Exploratory and research work** — when you don't know what you're building yet, writing a spec first is premature; vibe coding or prototyping is the right tool for discovery
- **Rapidly changing requirements** — if requirements shift weekly, maintaining a precise spec becomes documentation debt faster than it becomes value
- **Novel algorithms** — when the solution isn't known upfront, the spec can't meaningfully precede the code
- **Spec quality risk** — a wrong spec faithfully implemented produces wrong software; garbage in, garbage out. If the spec authors don't deeply understand the domain, SDD amplifies misunderstanding rather than preventing it

---

## Our take: the co-delivery model

SDD prescribes spec-first. That's the right default when AI is doing most of the implementation. Our situation is different: humans and AI are collaborating, multiple builders contribute across multiple angles (product, design, engineering, security), and specs need to stay current through active development — not just seed it.

BDD failed many teams not because of its methodology but because of how it was adopted: QA engineers wrote `.feature` files alone, product managers rarely reviewed them, and developers treated them as "QA stuff." The spec became a document owned by one role instead of a shared contract. SDD faces the exact same risk.

So we adapt. We don't write complete specs upfront and hand them to implementers. We **co-deliver**: spec and code arrive in the same merge request, written by the same builder from their angle of expertise.

A builder implementing a CLI command writes the spec and the implementation together. A builder focused on security contributes threat scenarios and auth failure cases — before or after the MR, not in a separate planning phase. No single person owns the full spec. No single phase owns specification.

This is also where we sit on the maturity spectrum: **Spec-Anchored**. The spec lives in the repo, versions with the code, and stays authoritative — but it co-evolves with implementation rather than fully preceding it.

This preserves what matters about SDD — the spec is authoritative, behavior-oriented, and persistent — while fitting the reality of team collaboration.

### What our spec contains

A spec covers one coherent domain — one feature or command group. It answers four questions:

- **Why** — the problem being solved; if you can't articulate this, the feature may not be needed
- **What** — the observable behavior
- **Command surface** — CLI syntax or API signature; a behavioral contract, not an implementation detail
- **Scenarios** — Gherkin scenarios covering success paths and primary failure cases

The scenarios are the contract. They describe what a user or caller observes: exit codes, stdout, return values, side effects. Not function calls, not internal state, not how the result was computed.

### What a spec is not

- A design document for implementation internals
- A complete upfront specification (we co-deliver, not waterfall)
- A substitute for code review
- A test file — though every scenario maps to a test

### Principles

**The spec owns the behavior.** If the implementation disagrees with the spec, the implementation is wrong — unless the spec is revised through a review cycle. This keeps the spec authoritative rather than decorative.

**Scenarios are observable.** A scenario that says "function X returns Y" describes an implementation detail. A scenario that says "the command exits with code 0 and prints the summary to stdout" describes behavior. Write the second kind.

**Specs survive refactors.** If you restructure the internals and have to update the spec, the spec was describing the wrong thing. It changes only when behavior changes — and behavior changes require a new review cycle.

**Why is not optional.** A spec without a "Why" section is incomplete. It documents what the system does but not why anyone cared — which makes it impossible to judge whether a proposed change is in scope or whether the feature is still needed at all.

**Happy path and error cases.** Every spec must cover at least one success scenario and the primary failure scenarios for each operation. A spec that only describes the happy path is half a contract.

**Status must be accurate.** Marking a spec Implemented when scenarios aren't passing is a violation. Marking it Approved before review is a violation. Status fields that can't be trusted are worse than no status fields.

**One spec per domain.** If a spec covers two unrelated concerns, split it. A spec that sprawls becomes a spec nobody reads.

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
