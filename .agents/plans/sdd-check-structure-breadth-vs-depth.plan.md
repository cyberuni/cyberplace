---
name: sdd-check-structure-breadth-vs-depth
status: active
todos:
  - content: "revise check-spec-structure: replace the flat scenario-count threshold with a breadth-vs-depth read — breadth = count of distinct behaviors/verbs (responsibility, SOLID); depth = edge-cases per behavior (granularity)"
    status: pending
  - content: "route the finding: breadth-overflow → SPLIT advisory (new capability node, Warden CR); depth-overflow on a DETERMINISTIC artifact-type → DOWN-LEVEL advisory (move edge cases to tests via the scenario→test bridge)"
    status: pending
  - content: "depth-overflow on an agent-behavior type → keep as-is or redesign advisory (no node-test target); never a silent split"
    status: pending
  - content: "spec + gate the revised check-spec-structure behavior in .agents/specs/sdd/; root pnpm verify; commit; handoff"
    status: pending
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

Not yet started. Run `start-mission` against `.agents/specs/sdd/` for the `check-spec-structure` node.
