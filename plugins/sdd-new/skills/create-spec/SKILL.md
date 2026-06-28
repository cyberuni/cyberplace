---
name: create-spec
description: Use this skill when the user wants to create a spec for a new or existing capability — scaffold a new spec node under the project tree and grill it to draft in-session.
---

# create-spec

The user-facing **entry skill** for **new** capability content: scaffold a new spec node under the
project tree (`.agents/specs/<project>/`), then run the explore producer chain **in-session** over
it. create-spec runs in the **main session** as the conductor (`sdd:automaton` is the headless
fallback only): it loads the spec-producer governance and **grills the human live**, spawns the
**cold spec-judge** each round, and — for build-to-learn — spawns the impl-producer builder. It is
the positional ratifier and leaves the node at `status: draft`, ready for the spec gate
(`validate-spec`). An **existing** node is `revise-spec`, not this skill.

> **On entry, advise the user that a capable model (e.g. Opus) is recommended.** The grill runs in
> the main session, so its quality tracks the session model; surface this before the live grill
> begins so the user can switch if needed.

Load `sdd:lifecycle-governance` (the status enum and what `draft` means),
`sdd:ownership-governance` (which fields a producer may write vs. the conductor and the gate),
`sdd:spec-producer-governance` (the grilling procedure run inline), and
`sdd:spec-format-governance` + `sdd:suite-format-governance` (the skeleton + suite bars).

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

Also classify `artifact-types` — the squad key the conductor matches plugins against. An
agent-configuration artifact names its type (`skill` / `subagent` / `command` / `agents-section`);
plain product code omits it (the conductor resolves the SDD defaults). Infer from the implementation
path when unclear and **confirm with the user**; it is set once here and never rewritten by a
producer. When the type or artifact-types cannot be settled, **ask** — do not guess.

## Scaffold the skeleton

Write the node README skeleton matching the declared type (sections per `sdd:spec-format-governance`;
the `.feature` form per `sdd:suite-format-governance`). Write **no** control frontmatter
(`status` / `aligned` / `approval` / `produced-by`) — those live on the root `spec.md` and belong to
the conductor and the gate.

## Collect the seed intent (new feature only)

Before the grill loop, collect the core intent so the spec-producer has a seed. For a new feature
with missing What / Why / interface, ask 3–5 targeted questions: the core problem and who
experiences it; observable behavior from the user's view; the public interface (commands,
signatures, events); known edge cases or explicit non-goals; which reviewers must be heard. For
**backfill** (behavior already in code), skip this — the producer reads source, tests, and history.

## Run the grill in-session (the user loop)

You **are** the conductor (main session). Run the spec-producer **inline** (load
`sdd:spec-producer-governance`, or persona-load a plugin specialist for the `artifact-types`) and
**spawn the cold spec-judge** each round; for build-to-learn, spawn the impl-producer builder
against the non-frozen suite and fold its learnings into the grill. Set an **iteration cap**
(default **3**; override if the user named one), then loop:

1. Grill the user **live** with the node path, `artifact-types`, and the seed intent (or
   `backfill`); write the draft `spec.md` + `.feature`.
2. Spawn the cold spec-judge; incorporate its verdict and any open markers.
3. On convergence → exit.
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
