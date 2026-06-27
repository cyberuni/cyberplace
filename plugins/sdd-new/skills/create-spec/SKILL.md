---
name: create-spec
description: Use this skill when the user wants to create a spec for a new or existing capability — scaffold a new spec node under the project tree and dispatch the producer to grill it to draft.
---

# create-spec

The user-facing **entry skill** for **new** capability content: scaffold a new spec node under the
project tree (`.agents/specs/<project>/`), then dispatch the explore producer chain (`sdd-operator`)
over it. create-spec owns the **user channel** the operator lacks — the up-front grill and the
iteration loop — and leaves the node at `status: draft`, ready for the spec gate (`validate-spec`).
An **existing** node is `revise-spec`, not this skill.

Load `sdd:lifecycle-governance` (the status enum and what `draft` means) and
`sdd:ownership-governance` (which fields a producer may write vs. the operator and the gate).

## Locate the node

If the user named a capability, use its folder under `.agents/specs/<project>/`. Otherwise propose
the folder from the CR and confirm. **If a `spec.md`/`README.md` already exists at the target,
route to `revise-spec`** — there is nothing to scaffold.

## Classify the node

Declare the **spec-type** (`sdd:lifecycle-governance` + the spec-types taxonomy); never leave it to
be inferred:

- **behavioral** (a testable unit — the common case) → `spec-type: behavioral`, a `## Use Cases`
  section, and an initial `<unit>.feature`.
- **reference** (a shipped non-testable artifact, e.g. a governance) → `spec-type: reference`, a
  `## Subject` section, **no** `.feature`.
- **descriptive** (a capability overview / index) → **no** marker, no subject, no `.feature`.

Also classify `artifact-types` — the squad key the operator matches plugins against. An
agent-configuration artifact names its type (`skill` / `subagent` / `command` / `agents-section`);
plain product code omits it (the operator resolves the SDD defaults). Infer from the implementation
path when unclear and **confirm with the user**; it is set once here and never rewritten by a
producer. When the type or artifact-types cannot be settled, **ask** — do not guess.

## Scaffold the skeleton

Write the node README skeleton matching the declared type (sections per `sdd:spec-format-governance`;
the `.feature` form per `sdd:suite-format-governance`). Write **no** control frontmatter
(`status` / `aligned` / `approval` / `produced-by`) — those live on the root `spec.md` and belong to
the operator and the gate.

## Grill the user (new feature only)

The operator has **no user channel**, so collect intent here **before** the first dispatch. For a
new feature with missing What / Why / interface, ask 3–5 targeted questions: the core problem and
who experiences it; observable behavior from the user's view; the public interface (commands,
signatures, events); known edge cases or explicit non-goals; which reviewers must be heard. For
**backfill** (behavior already in code), skip the grill and signal backfill to the operator.

## Drive the operator (the user loop)

Set an **iteration cap** (default **3**; override if the user named one), then loop:

1. Dispatch `sdd-operator` with the node path, `artifact-types`, the collected intent (or
   `backfill`), and any `USER_ANSWERS` from the previous wave.
2. On `complete` → exit.
3. On `needs-input` → ask the **batched** questions, re-dispatch with the answers, count the
   iteration.
4. On `blocked`, or the cap hit without converging → **do not auto-accept**. Present the failing
   scenarios and ask the user to **accept as-is**, **keep looping** (reset the count), or **change
   the spec**.

The skill leaves the node at `status: draft`; it advances no status past draft — the spec gate does.

## Report

- Node scaffolded; its spec-type + `artifact-types`
- What the producer wrote in the README and the `.feature`
- `ALIGNED: true | false`; if false, what is out of sync
- Open markers remaining
- Next step: run `validate-spec` to take Draft → Approved
