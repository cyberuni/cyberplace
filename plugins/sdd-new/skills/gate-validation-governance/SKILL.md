---
name: gate-validation-governance
description: "Internal skill: the SDD gate-legality contract — legal frontmatter-state tuples, per-node spec-type checks, aligned layer-scoping, approval attribution, and the no-resolvable-producer fail-closed rule. Loaded by validate-spec, the conductor, and the spec-judge. Not triggered by users directly."
user-invocable: false
---

# SDD Gate-Validation Governance

What makes a spec's state legal, and how a gate records its verdict. The field schema and transitions
are in `sdd:lifecycle-governance`; this skill is the legality layer on top of them. It carries **no
leash** — the self-clear-vs-escalate bar that derives how far an agent may self-assert lives in the
autonomy rubric (`design/autonomy-rubric.md`), a hard floor + a three-dimension gradient.

## Legal-state tuples

The mechanical authority is `validate-spec/scripts/check-spec-state.mts` — run it
(`node <skill>/scripts/check-spec-state.mts`) to enforce; if `node` is unavailable, apply the same
rules by reading frontmatter. The `(status, aligned, markers, .feature, approval)` tuple of the root
`spec.md` is **illegal** when:

- `status: approved` with no `.feature` — a spec requires a frozen `.feature` to be approved.
- `status: implemented` with `aligned` not `true` — implemented requires `aligned: true`.
- `status: approved` or `implemented` with any `<!-- open: -->` markers — markers block the gate.
- `approval` names a gate other than `spec` or `impl`.
- an `approval.<gate>` has a `verdict` other than `approve`, `pause`, or `reject`.
- an `approval.<gate>` is `verdict: pause` carrying a `by` — a pause is always the agent's act and omits `by`.
- an `approval.<gate>` is `verdict: approve` with no `by` — an approve must record its approver.
- an `approval.<gate>` is `by: agent` with no `why` block — a self-assertion must record its derivation.
- an `approval.<gate>` has a `cause` other than `dimension` or `ceiling` — the stop cause is a closed enum.
- an `approval.<gate>` is `verdict: pause` on a gate the spec has already passed (spec once `approved`/`implemented`, impl once `implemented`).
- `status: approved` or `implemented` with no `approval.spec` `verdict: approve` + `by` — the spec gate has no recorded ratification.
- `status: implemented` with no `approval.impl` `verdict: approve` + `by` — the impl gate has no recorded ratification.

`status: draft` with `aligned: true` is **legal** — `aligned` is layer-scoped, so a synced contract
may hold `aligned: true` while still draft, ready for the spec gate. Open markers at `draft` are
permitted (they block only the *gate*, not the draft state).

Reject illegal tuples **before** any other gate work. If `check-spec-state.mts` changes, this list
follows it — the script is the source of truth, this prose is the readable mirror.

## Per-node `spec-type` checks

Same fail-closed class, enforced by the same helper. A capability node README's `spec-type` marker
must agree with its shape (`sdd:spec-format-governance`):

- `spec-type: reference` with a sibling `.feature` — illegal (a reference artifact is suite-less by design).
- `spec-type: reference` with no `## Subject` section — illegal (the reference descriptor is required).
- `spec-type: behavioral` with no `## Use Cases` section — illegal (a behavioral spec maps use cases to scenarios).

## The two gates

| Gate | Transition | Object judged |
|---|---|---|
| spec gate | Draft → Approved | `spec.md` + the `.feature` (no implementation required) |
| impl gate | Approved → Implemented | the implementation vs the frozen `.feature` |

`producer ≠ judge` survives the gate fold: even though gates are no longer a fixed station, the judge
stays a distinct actor from the producer, and never patches what it grades.

## `aligned` is layer-scoped

`aligned` means *the current layer's artifacts are synced* — which layer depends on the gate:

- **At the spec gate**, `aligned: true` means the **contract layer** (`spec.md` ↔ `.feature`) is in
  sync. Implementation is **not** required; exploratory spike code is excluded as scaffolding.
- **At the impl gate**, `aligned: true` means the **impl layer** conforms to the frozen `.feature`.
  Set it only when **every** impl-judge returns a pass; if any fails, leave `aligned: false` and
  surface the blocker.

`aligned: true` never on its own means "implemented." The conductor sets `aligned: false` at the
start of a segment and only synthesis sets it back to `true` (`sdd:ownership-governance`).

## No-resolvable-producer fails closed

A required production role **always** resolves to a real producer — a plugin agent or the SDD default
for that role. When a gate runs and a required role has **no resolvable producer** (not a plugin
agent and not even an SDD default), the gate **fails closed** with a blocker; it advances nothing.
This is a **structural** error, the same fail-closed class as a malformed `produced-by` entry or an
off-enum `cause` (defined in `sdd:combat-log-governance`). Distinct from availability: a recorded
producer whose plugin is merely uninstalled is **flagged**, not blocked.
