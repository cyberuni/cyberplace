---
name: revise-spec
description: Use this skill when revising an existing SDD spec — re-open a draft and dispatch the producer to grill and tighten spec.md and bring the .feature back into line. The smaller, no-scaffolding twin of create-spec.
---

# revise-spec

The user-facing **entry skill** for an **existing** spec node: dispatch the explore producer chain
(`sdd-operator`) to grill and tighten what is already written — **no scaffolding**. The node exists,
so there is nothing to lay down; the work is to pressure-test the prose, bring the suite back into
line, and leave the node at `status: draft`, ready for the spec gate (`validate-spec`). A **new**
node is `create-spec`, not this skill.

Load `sdd:lifecycle-governance` (the status enum and the freeze re-open transition) and
`sdd:ownership-governance` (which fields a producer may write vs. the operator and the gate).

## Precondition — the node must be writable

- `status: draft` → proceed; the suite is not frozen.
- `status: approved` or `implemented` → the `.feature` is **frozen**. Re-opening is a freeze
  transition and a `status` write you do **not** own — confirm the re-open was ratified (the
  lightweight async re-open flag) before proceeding. **Never edit a frozen `.feature` without the
  ratified re-open.**

## Grill the user

The operator has **no user channel**, so collect the revise intent here **before** the first
dispatch: what the change is and why, and the parts of the spec it touches. Where the right answer
is a judgment call, surface it as a batched question, not a guess.

## Drive the operator (the user loop)

Set an **iteration cap** (default **3**; override if the user named one), then loop:

1. Dispatch `sdd-operator` with the node path, the revise intent (signal **revise**, not scaffold),
   and any `USER_ANSWERS` from the previous wave.
2. On `complete` → exit.
3. On `needs-input` → ask the **batched** questions, re-dispatch with the answers, count the
   iteration.
4. On `blocked`, or the cap hit without converging → **do not auto-accept**. Present the failing
   scenarios / open items and ask the user to **accept as-is**, **keep grilling** (reset the
   count), or **change direction**.

The skill leaves the node at `status: draft`; it advances no status — the spec gate does.

## Route observations

The operator bubbles typed `OBSERVATIONS` (`architect` | `strategist`) but never acts on them.
Surface them. A granularity/split observation becomes a **new node** (or a `corpus` operation) —
**never** a marker grown into this node. Decline = drop it.

## Report

- Spec revised; what changed in the README and the `.feature`
- `ALIGNED: true | false`; if false, what is out of sync
- Open markers remaining (should be zero)
- Whether a split was recommended, and its disposition
- Next step: run `validate-spec` to take Draft → Approved
