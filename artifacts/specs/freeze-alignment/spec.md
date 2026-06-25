---
status: draft
type: feature
domain-type: skill
blocked-by:
  - sdd-operator-freeze
  - rubric-gherkin
aligned: false
---

# Freeze gates the .feature; spec.md is kept aligned (rubric-gated)

> Scaffold capturing intent from a design session — run `create-spec` / `revise-spec` to author the `.feature` and complete this spec. Not yet through the spec gate.

## What

Reconcile the freeze model so that at the spec gate **only the `.feature` is hard-frozen** (the contract; no scenario edits without a ratified re-open), and **`spec.md` is kept aligned** — editable, but it may not contradict the frozen `.feature`. A `spec.md` change is gated by the autonomy rubric (reversible + preserves-alignment + non-breaking → self-clear; would contradict a frozen scenario → escalate), not by a flat freeze.

## Why

The corpus contradicts itself: `ownership-governance` / `lifecycle-governance` freeze only the `.feature`, while `sdd-operator-freeze` (its scenario "spec.md and .feature are frozen firmest") and `sdd-operator.md:73` say spec.md co-freezes at firmest. Freezing the whole spec.md is too coarse — it blocks legitimate prose clarification/reconciliation and makes the rule un-self-modifiable. The right invariant is "keep spec.md aligned with the frozen contract," enforced by `aligned` + the judges, not by a freeze.

## Key decisions (already made)

- Only the `.feature` freezes; spec.md is editable-but-must-stay-aligned.
- Encode the fix as **rubric-outcome scenarios** (depends on `rubric-gherkin`): rewrite `sdd-operator-freeze`'s boolean "frozen firmest" scenario into rubric scenarios (spec.md change self-clears when safe, escalates when it would contradict a frozen scenario).
- Mechanically requires re-opening `sdd-operator-freeze`, a **composition child of `sdd-operator`** — re-opening cascades the parent. A deliberate composition re-open is needed (discovered when a partial prose-only fix would have broken `aligned`).
- Sites to fix on re-open: `sdd-operator-freeze` spec.md (L26, L34) + its frozen scenario; `sdd-operator.md:73`; the operator's gate-report wording ("co-freezes spec.md + .feature"); an explicit clarifying line in `ownership` / `lifecycle` ("spec.md kept aligned, never frozen").

## Open

<!-- open: handle the sdd-operator composition cascade (parent regresses when the child re-opens) -->
<!-- open: blocked on rubric-gherkin landing first (for the rubric-outcome scenario form) -->
