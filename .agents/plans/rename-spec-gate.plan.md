---
cr: rename-spec-gate
what: rename the validate-spec skill + spec node to spec-gate; document check-feature
status: draft
todos:
  - content: "Ratify re-open of 3 frozen .feature (validate-spec, backfill, spec-producer) — description/cross-ref text only, no scenario change"
    status: pending
  - content: "git mv impl skill plugins/sdd-new/skills/validate-spec → spec-gate; update SKILL name+heading"
    status: pending
  - content: "git mv spec node .agents/specs/sdd/authoring/validate-spec → spec-gate; rename its .feature"
    status: pending
  - content: "Update package.json verify:specs-new script paths (NOT the baseline verify:specs)"
    status: pending
  - content: "Replace ~40 textual refs validate-spec→spec-gate in sdd-new + aces + quill + sdd spec corpus (skip plugins/sdd baseline + historical plans; do NOT touch aces spec-validator)"
    status: pending
  - content: "Add a line to the spec-gate SKILL body: check-feature.mts runs in verify:specs-new (the .feature form check), not just the judge"
    status: pending
  - content: "Re-freeze the 3 reopened features at the spec gate; check-spec-state + check-feature + check-spec-structure + concept-index --check + pnpm verify green"
    status: pending
  - content: "Changeset; commit as coherent units (impl rename, spec rename, doc)"
    status: pending
---

# CR: rename `validate-spec` → `spec-gate`

**Why now:** the concept is already named `spec-gate` everywhere in the design
(`design/lifecycle-model.md`, `acceptance/freeze.feature`, plans); only the skill + spec-node folder
still say `validate-spec`. Reconcile the lagging name to the source of truth. Pairs the check-feature
doc gap (same node) into the same CR.

**Scope:** ~40 refs / ~28 files across `plugins/sdd-new`, `plugins/aces`, `plugins/quill`,
`.agents/specs/sdd`, `package.json`. **Excludes** the `plugins/sdd` baseline (superseded, never
hand-edited) and historical `.agents/plans/*`.

**Freeze exposure:** reopens 3 frozen `.feature` files — but only their **description / cross-ref
comment text** changes, no scenario is added, narrowed, or deleted (cosmetic → self-clear candidate,
not a Clearance floor). Needs the ratified re-open before editing frozen content; re-freeze at the
gate after.

**Care:** `validate-spec` (the gate skill) is a distinct string from `spec-validator` /
`aces-spec-validator` (ACES's own agent) — rename the former, never the latter. Per-file Edits, not a
blind sed.

## NEXT

Awaiting the user's ratification to re-open the 3 frozen features (or a decision to defer/drop the
rename). On ratify: execute todos 2→8 in order.
