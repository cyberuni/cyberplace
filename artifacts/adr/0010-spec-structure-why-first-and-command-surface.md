# ADR-0010: Spec Structure — Why-First Ordering and Command Surface in Spec

## Status

Accepted

## Context

The SDD spec structure listed "What" before "Why" in the spec contents section. This ordering implied that observable behavior is more important than the problem being solved.

A separate question arose about where "command surface" (CLI syntax or API signature) belongs — in the spec or in the plan.

## Decision Drivers

- Readers need motivation before detail to evaluate whether a feature solves the right problem
- Command surface is user-observable and breaking to change — it is a behavioral contract, not an implementation detail
- The spec/plan boundary should be clear: spec = user-facing contracts and behavior; plan = implementation internals

## Considered Options

### Option 1: Keep What-first, command surface in plan

- **Pros**: Command surface feels technical; plan is where technical artifacts live
- **Cons**: Command surface is a contract that users depend on; hiding it in plan separates it from the behavior it enables

### Option 2: Why-first, command surface in spec (chosen)

- **Pros**: Why grounds the reader before describing behavior; command surface stays with the behavioral contract it defines
- **Cons**: None identified

## Decision

The spec structure is:

1. **Why** — the problem being solved
2. **What** — the observable behavior
3. **Command surface** — the CLI syntax or API signature (behavioral contract, not implementation detail)
4. **Scenarios** — Gherkin scenarios describing success and failure cases

Command surface belongs in the spec, not the plan. It is user-observable and stable; changing it is a breaking change that requires a spec revision.

## Rationale

Why-first ordering grounds the reader in motivation before describing behavior. A reader who understands the problem can evaluate whether the behavior solves it.

Command surface is a behavioral contract — it defines what users can observe and rely on. It belongs with the spec for the same reason scenarios do: both describe observable, testable behavior. The plan describes how the command is implemented internally.

## Consequences

### Positive

- Clearer spec/plan boundary: spec = observable contracts, plan = internals
- Readers encounter motivation before detail
- Command surface changes are visible in spec diffs, not buried in plan

### Negative

- Existing specs with What-before-Why ordering need updating

### Risks

- None significant

## Related Decisions

- [ADR-0009](0009-feature-first-artifact-organization.md) — artifact organization that established spec vs plan separation
