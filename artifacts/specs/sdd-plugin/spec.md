---
status: draft
priority: 1
blocked-by: []
---

# Spec-Driven Development

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

A spec transitions from Draft → Approved via explicit review (PR approval, pair review, or recorded acknowledgment). The status field in the spec frontmatter tracks this.

---

## What a spec must contain

Every `spec.md` must have YAML frontmatter and required body sections.

**Frontmatter fields:**

| Field | Required | Values |
|---|---|---|
| `status` | Yes | `draft`, `approved`, `implemented`, `deprecated` |
| `priority` | Yes | Integer; `1` = highest. Used to sequence implementation across a set of specs. |
| `blocked-by` | No | List of spec slugs (directory names) that must be implemented first. Omit or leave empty if none. |

**Body sections:**

| Section | Required | Content |
|---|---|---|
| `What` | Yes | What the feature does — behavior, not implementation |
| `Why` | Yes | The problem it solves; why it is needed now |
| `Design decisions` | Yes (if any choices were made) | Key choices with rationale; what was rejected and why |
| `Command surface / API` | Yes | The public interface: CLI syntax, function signatures, events |
| Link to `.feature` | Yes | Reference to the Gherkin scenario file |

Sections may be omitted only if genuinely not applicable (e.g. a pure config change has no command surface). Omitting "Why" is never acceptable.

`blocked-by` is single-direction only. The "what does this spec block?" view is derived by scanning all specs for references to a given slug — do not maintain a `blocks` field.

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

SDD operates in two modes separated by a single gate: **Exploration** (status: `draft`) and **Implementation** (status: `approved`).

---

### Exploration mode

The goal of exploration is understanding — not completeness, not correctness. All artifacts co-evolve freely. The spec may be incomplete. The `.feature` file may not exist yet. Exploratory code may be written to test assumptions. None of this is premature; it is how understanding is built.

**Exploration is iterative.** A typical loop:

1. Draft or refine the `What` and `Why` sections as understanding develops.
2. Sketch scenarios in the `.feature` file — even partial, even wrong. Scenarios make assumptions explicit.
3. Write exploratory code or prototypes to test whether the design is buildable.
4. Revise the spec to reflect what the exploration revealed. Discard approaches that do not hold up.
5. Repeat until the spec is stable enough to survive review.

There is no fixed order. Writing code first, then writing the spec to match — that is fine in exploration. The spec does not need to precede the code during exploration; it needs to precede the _commitment_ to implement.

**Multiple actors contribute at different times.** A spec for a React component requires different expertise:

- **PM** — defines the problem, the user need, and the "Why". Validates scope.
- **Designer** — shapes interaction, visual behavior, and accessibility requirements. Contributes to `What` and `.feature` scenarios.
- **Engineer** — identifies technical constraints, proposes the API surface, flags what is infeasible.

Each expert contributes to the spec in their area. The spec accumulates their inputs. No single actor owns all sections. The **author** (driver) is responsible for pulling the spec forward — initiating conversations, incorporating inputs, resolving contradictions — but not for supplying all the answers.

The same pattern applies across domains. A book involves author, editor, and subject-matter reviewers. A YouTube video involves creator, collaborators, and sometimes sponsors. The form differs; the pattern is the same: multiple voices, one spec that synthesizes them.

**Open questions.** When an actor's input is still missing, mark the gap explicitly in the spec:

```markdown
<!-- open: needs designer input on empty-state behavior -->
```

This signals to reviewers where their expertise is being solicited and prevents the spec from appearing complete when it is not.

**Deferred and async contributions.** Not all contributors are available at the start. An open-source contributor may develop a spec and exploratory implementation on their own fork before any maintainer sees the work. The maintainer cannot contribute earlier — they do not know the contributor yet. The contributor drives exploration forward, treating the eventual PR as the moment to collect the maintainer's expertise.

In this model:

- The contributor writes the spec and explores on their fork.
- When the spec is stable enough for review, they open a PR.
- The maintainer's review is how the maintainer's expertise enters the spec.
- The PR itself is the approval gate.

This is valid. The gate is not about who writes the spec; it is about ensuring every required voice has been heard before implementation is locked.

---

### The gate: approval

A spec moves from `draft` to `approved` when:

1. All required sections are present and complete (`validate-spec` passes).
2. The `.feature` file covers the happy path and primary error cases.
3. Every actor whose expertise is required for this spec has reviewed and acknowledged it.

"Acknowledged" means different things in different contexts:

- A PR approval from each required reviewer.
- A recorded comment ("LGTM from design perspective").
- An explicit in-person or async acknowledgment noted in the spec or PR.

The requirement is not ceremonial sign-off. It is that the spec reflects each contributor's expertise. If the designer never reviewed interaction behavior, the spec is not approved — regardless of whether a checkbox is ticked.

**The author is responsible for getting the spec approved**, not for getting it right alone. They must identify who needs to review, solicit input, incorporate it, and resolve disagreements before requesting approval.

Once approved, change status to `approved`. The `.feature` file is now frozen.

---

### Implementation mode

Once the spec is `approved`:

- The `.feature` file is **frozen**. Scenarios are not changed to match the implementation.
- All scenarios must pass before status moves to `implemented`.
- Exploratory code written during exploration is cleaned up, restructured, or replaced — whatever is needed to satisfy the frozen scenarios.

**Implementation is also iterative.** A typical loop:

1. Pick the next unimplemented scenario.
2. Write or adapt code to satisfy it.
3. Run the scenario. Fix failures.
4. Repeat for the next scenario.

During implementation, gaps in the spec may surface — cases the scenarios did not cover, edge conditions that were missed. These are handled one of two ways:

- **Minor gap** — the scenario is clearly implied by the spec; add it to the `.feature` file without reopening the spec. Get a quick review from another contributor.
- **Requirements change** — the spec needs to change, not the code. Revert status to `draft`, revise, and run a new approval cycle before continuing.

The rule is: **change the implementation to match the spec; change the spec only through a new Draft → Approved cycle.**

Once all scenarios pass, update status to `implemented`.

---

### End-to-end summary

```
Exploration (draft)
  ├── Author drafts What, Why, Design decisions
  ├── Experts contribute to their sections (async, over time)
  ├── Open questions marked; inputs solicited
  ├── Scenarios sketched, tested, revised
  ├── Exploratory code written to validate assumptions
  └── Loop until spec is stable

      ↓ gate: validate-spec passes + all required reviewers acknowledge

Approval
  └── Status → approved; .feature frozen

Implementation (approved)
  ├── Code written to satisfy frozen scenarios, scenario by scenario
  ├── Minor gap → add scenario, quick review
  ├── Requirements change → revert to draft, new approval cycle
  └── All scenarios pass

      ↓

Status → implemented
```

---

**Gherkin scenarios:** [spec-driven-development.feature](./spec-driven-development.feature)

---

## Governances

- [`sdd-principles`](./governances/sdd-principles.md) — the core rules of SDD in brief
- [`spec-template`](./governances/spec-template.md) — canonical `spec.md` template
