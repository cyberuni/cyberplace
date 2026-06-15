# Spec-Driven Development

**Status:** Draft

---

## What

Spec-driven development (SDD) is a practice where a behavioral spec is written and approved _before_ any implementation begins. The spec is the authoritative description of what a feature does and why it exists. Implementation must satisfy the spec; the spec is not reverse-engineered from the implementation.

A spec consists of two artifacts:

1. **Narrative spec** (`spec.md`) — human-readable description covering what the feature does, why it exists, key design decisions, and the command surface or public API.
2. **Behavioral scenarios** (`.feature`) — Gherkin Given/When/Then scenarios that express the spec as concrete, executable examples.

Both artifacts live in a `specs/<domain>/` folder alongside or near the implementation.

---

## Why

Implementation-first development produces solutions to problems that were never clearly stated. The implementation becomes the de-facto spec, which means:

- Contributors cannot tell whether behavior is intentional or accidental.
- Reviewers assess _how_ not _what_ — bugs in requirements pass review.
- Tests verify the implementation, not the requirements.
- Changing behavior requires archaeology: reading code to infer intent.

SDD forces the "what" and "why" to be explicit before the "how" is written. This shifts review upstream — to the point where changes are cheapest — and creates a durable record of intent that survives refactors.

---

## Spec lifecycle

| Status | Meaning |
|---|---|
| `Draft` | Being written; not yet approved for implementation |
| `Approved` | Reviewed and approved; implementation may begin |
| `Implemented` | All scenarios satisfied by passing tests |
| `Deprecated` | Feature removed or superseded; spec retained for history |

A spec transitions from Draft → Approved via explicit review (PR approval, pair review, or recorded acknowledgment). Implementation begins only after Approved. The status field in the spec frontmatter tracks this.

---

## What a spec must contain

Every `spec.md` must have:

| Section | Required | Content |
|---|---|---|
| `Status` | Yes | One of: Draft, Approved, Implemented, Deprecated |
| `What` | Yes | What the feature does — behavior, not implementation |
| `Why` | Yes | The problem it solves; why it is needed now |
| `Design decisions` | Yes (if any choices were made) | Key choices with rationale; what was rejected and why |
| `Command surface / API` | Yes | The public interface: CLI syntax, function signatures, events |
| Link to `.feature` | Yes | Reference to the Gherkin scenario file |

Sections may be omitted only if genuinely not applicable (e.g. a pure config change has no command surface). Omitting "Why" is never acceptable.

---

## What a .feature file must contain

Every `.feature` file must:

- Cover the happy path for every operation in the command surface
- Cover the primary error cases (not-found, invalid input, permission denied where relevant)
- Use BDD language: Given (precondition), When (action), Then (observable outcome)
- Not reference implementation internals — only observable behavior
- Be named after the domain it specifies (e.g. `governance.feature`, `build.feature`)

---

## Folder structure

```
specs/
  <domain>/
    spec.md          # narrative spec
    <domain>.feature # Gherkin scenarios
```

For a package with multiple domains:

```
specs/
  README.md          # index of all domains and their status
  governance/
    spec.md
    governance.feature
  build/
    spec.md
    build.feature
```

---

## Process

SDD operates in two modes separated by a single gate.

**Exploration mode** (spec Status: Draft): all artifacts co-evolve freely. Code, plan, tasks, and scenarios may be created in any order and may change as understanding deepens. Goal: rapid understanding and test case discovery.

**Implementation mode** (spec Status: Approved): validation bar rises. The `.feature` file is frozen. All scenarios must pass before the spec can be marked Implemented.

**The single gate** is `spec.md → Approved`, enforced by `validate-spec` passing and a peer review.

Steps:

1. **Write the spec** — fill in What, Why, Design decisions, Command surface, and `.feature` scenarios. Code and other artifacts may already exist; that is fine.
2. **Review the spec** — at least one other contributor (or the `validate-spec` skill) checks completeness.
3. **Approve** — change status to `Approved`. The `.feature` file is now frozen.
4. **Implement** — write code to satisfy the frozen scenarios. Do not change the spec to match the implementation; change the implementation to match the spec (or revise the spec via a new Draft → Approved cycle if requirements genuinely changed).
5. **Mark Implemented** — once all scenarios pass, update status to `Implemented`.

---

## Governances

- [`sdd-principles`](../governances/sdd-principles.md) — the core rules of SDD in brief
- [`spec-template`](../governances/spec-template.md) — canonical `spec.md` template
