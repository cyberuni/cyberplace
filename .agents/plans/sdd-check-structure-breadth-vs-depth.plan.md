---
name: sdd-check-structure-breadth-vs-depth
status: done
todos:
  - content: "revise check-spec-structure: oversized finding carries a deterministic SHAPE PROFILE (plain/tagged counts + soft section-cluster count across both header styles), not a flat split-prescription — breadth-vs-depth is NOT reliably deterministic (0/63 features use Rule:, section headers cosmetic)"
    status: completed
  - content: "route via a Warden @rubric arm, NOT engine code: breadth-overflow → SPLIT; depth-overflow on a DETERMINISTIC type → DOWN-LEVEL to tests via verify-scenarios; depth-overflow on agent-behavior → redesign/accept"
    status: completed
  - content: "engine ships the profile only; both routing + contradiction are Warden judgment arms (placement-drift precedent: judgment stays judgment)"
    status: completed
  - content: "spec+gate the revised node in .agents/specs/sdd/; engine+tests (21/21); root pnpm verify green; both gates self-asserted within auto-all leash"
    status: completed
---

# CR sdd-check-structure-breadth-vs-depth — teach the oversized check to discriminate

Target spec: `.agents/specs/sdd/` (the `check-spec-structure` node) + engine at
`plugins/sdd/skills/check-spec-structure/`.

## Origin

The Warden's oversized finding (identity node, 46>40) fires on a **flat scenario count**, which
conflates two different signals:

- **breadth** — how many distinct behaviors/verbs live in the node = responsibility count = the real
  SOLID/split signal.
- **depth** — how many edge-cases per behavior = spec granularity, **not** a responsibility.

A flat threshold can't tell them apart; it got *lucky* that the identity overflow was breadth (two
whole clusters). On a single verb with 46 edge cases it would wrongly say "split."

## Fix

Route by kind, per artifact-type:
- breadth-overflow → **split** (new capability node).
- depth-overflow + **deterministic** type → **down-level** the edge cases to tests via the
  scenario→test bridge (`verify-scenarios`), shrinking the frozen suite instead of splitting.
- depth-overflow + **agent-behavior** type → redesign or accept (no node-test target).

## Relation

Complements the bridge arc (`sdd-verify-scenarios-spec`, `sdd-impl-judge-consume-bridge`) — the
down-level route only pays off once deterministic scenarios can bind to runnable tests. Independent
enough to land in either order, but most valuable after the bridge is wired.

## NEXT

DONE — mission landed on branch `sdd-check-structure-breadth-vs-depth`. The oversized-node finding
now carries a deterministic shape profile (plain/tagged + section-cluster count, both `# ──` and
`# ----` styles) and prescribes no route; a Warden `@rubric` breadth-vs-depth routing arm was added.
Both gates self-asserted (`by: agent`, auto-all leash) — **flagged agent-asserted, awaits Council
ratify-or-kick-back**. Retire this plan once merged + doctrine-distilled.
