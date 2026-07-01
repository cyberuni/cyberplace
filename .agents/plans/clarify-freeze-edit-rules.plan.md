---
cr: clarify-freeze-edit-rules
what: fix the overbroad "no edits to a frozen .feature without a ratified re-open" wording + add a testable move-preserves-freeze scenario
status: in-progress
todos:
  - content: "spec-gate/README.md 'The three verbs and freeze' — replace the overbroad re-open clause with the three edit-classes (additive self-clears / narrowing re-opens+Clearance / pure move preserves), referencing design/lifecycle-model.md"
    status: pending
  - content: "start-mission/SKILL.md Freeze re-open guard — reword: re-open only for narrowing/rewriting; additive self-clears; pure move/rename preserves freeze"
    status: pending
  - content: "Add an additive scenario to spec-gate.feature: a pure move/rename of a frozen file preserves its freeze (stays @frozen, not gate-able); sync the README use-case row"
    status: pending
  - content: "Spec gate (cold sdd-spec-judge; additive stays @frozen); check-feature + check-spec-state + verify:specs-new + pnpm verify green"
    status: pending
---

# CR: clarify the freeze-edit-rules wording

**Finding:** two places overstate the freeze re-open rule as if **any** edit to a frozen `.feature`
needs a ratified re-open:
- `authoring/spec-gate/README.md` "The three verbs and freeze" — "no scenario edits to a frozen file
  without a ratified re-open", contradicted by the very next sentence (additive self-clears).
- `plugins/sdd-new/skills/start-mission/SKILL.md` Freeze re-open guard — "Never edit a frozen
  `.feature` without the ratified re-open." (This overbroad framing made the `wire-check-feature-runtime`
  mission over-cautiously ask the user to authorize a re-open that additive edits never required.)

**Canonical rule** (`design/lifecycle-model.md:165-166`, `design/spec-layout.md:206-210`): the unfreeze
trigger is **risk, not phase**. Three edit-classes on a frozen `.feature`:
1. **additive** scenario → self-clears, stays `@frozen`, no re-open;
2. **narrowing / rewriting** → unfreezes, fires **Clearance**, needs a ratified re-open;
3. **pure move / rename** (`git mv`, zero content delta) → stays `@frozen`, not a gate-able edit.

**Value:** accurate, non-contradictory wording so conductors stop over-asking for a re-open on additive
edits; the move-preserves-freeze rule (which handoff placement + `name-spec-levels` rely on) becomes
testable at the unit level, not only asserted in `design/`.

**Freeze exposure:** the README + SKILL edits are **aligned prose** (never frozen). The one gated
artifact is a new **additive** scenario on the frozen `spec-gate.feature` → self-clears, stays
`@frozen`, no re-open, no Clearance. The CR dogfoods the very rule it clarifies. Leash `auto-all`,
low blast, reversible.

## NEXT

Run in worktree `sdd/clarify-freeze-edit-rules` (branched from `next`). Reword the two spots, add the
additive move scenario + README use-case row, spec-gate (additive → stays `@frozen`), verify green.
No impl, no changeset. Leave push + PR to the user.
