---
name: revise-spec
description: Use this skill when revising an existing SDD spec — re-open a draft and grill spec.md tighter and bring the .feature back into line, in-session. The smaller, no-scaffolding twin of create-spec.
---

# revise-spec

The user-facing **entry skill** for an **existing** spec node: run the explore producer chain
**in-session** to grill and tighten what is already written — **no scaffolding**. revise-spec runs
in the **main session** as the conductor (`automaton` is the headless fallback only): it loads the
spec-producer governance and **grills the human live**, spawning the **cold spec-judge** each round.
The node exists, so there is nothing to lay down; the work is to pressure-test the prose, bring the
suite back into line, and leave the node at `status: draft`, ready for the spec gate
(`validate-spec`). A **new** node is `create-spec`, not this skill.

> **On entry, advise the user that a capable model (e.g. Opus) is recommended.** The grill runs in
> the main session, so its quality tracks the session model; surface this before the live grill
> begins so the user can switch if needed.

Load `sdd:lifecycle-governance` (the status enum and the freeze re-open transition),
`sdd:ownership-governance` (which fields a producer may write vs. the conductor and the gate), and
`sdd:spec-producer-governance` (the grilling procedure run inline).

## Precondition — the node must be writable

- `status: draft` → proceed; the suite is not frozen.
- `status: approved` or `implemented` → the `.feature` is **frozen**. Re-opening is a freeze
  transition and a `status` write you do **not** own — confirm the re-open was ratified (the
  lightweight async re-open flag) before proceeding. **Never edit a frozen `.feature` without the
  ratified re-open.**

## Collect the seed intent

Collect the revise intent up front: what the change is and why, and the parts of the spec it
touches. Where the right answer is a judgment call, surface it as a question, not a guess.

## Run the grill in-session (the user loop)

You **are** the conductor (main session). Run the spec-producer **inline** in **revise** mode (load
`sdd:spec-producer-governance`, or persona-load a plugin specialist) and **spawn the cold
spec-judge** each round. Set an **iteration cap** (default **3**; override if the user named one),
then loop:

1. Grill the user **live** with the node path and the revise intent (signal **revise**, not
   scaffold); tighten the prose, then bring the `.feature` back into line.
2. Spawn the cold spec-judge; incorporate its verdict and any open markers.
3. On convergence → exit.
4. On `blocked`, or the cap hit without converging → **do not auto-accept**. Present the failing
   scenarios / open items and ask the user to **accept as-is**, **keep grilling** (reset the
   count), or **change direction**.

The skill leaves the node at `status: draft`; it advances no status — the spec gate does.

## Route observations

The spec-producer surfaces typed `OBSERVATIONS` (`architect` | `strategist`); the conductor never
acts on them silently. Surface them. A granularity/split observation becomes a **new node** (or a
`corpus` operation) — **never** a marker grown into this node. Decline = drop it.

## Report

- Spec revised; what changed in the README and the `.feature`
- `ALIGNED: true | false`; if false, what is out of sync
- Open markers remaining (should be zero)
- Whether a split was recommended, and its disposition
- Next step: run `validate-spec` to take Draft → Approved
