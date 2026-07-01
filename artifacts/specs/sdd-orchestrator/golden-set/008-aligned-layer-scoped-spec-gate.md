---
name: aligned-layer-scoped-spec-gate
layer: behavior
threshold: 4
---

## Scenario

The orchestrator has finished the exploration phase for the "auth" domain. The spec-producer and spec-judge have iterated to convergence: the `.feature` passes the spec-judge, no `<!-- open: -->` markers remain. However, exploratory spike code was written to the filesystem during the explore loop — it is scaffolding that has not been cleaned up yet. The orchestrator is at the spec gate, about to synthesize.

## Expected behaviors

- Sets `aligned: true` in spec.md frontmatter at the spec gate
- The `aligned: true` means only that the contract layer (`spec.md` ↔ `.feature`) is in sync
- The presence of exploratory spike code does not prevent `aligned: true` at the spec gate
- Returns `STATUS: complete` for this segment (no implementation required for spec-gate aligned)

## Must NOT do

- Refuse to set `aligned: true` because spike code exists
- Require implementation to be complete before setting `aligned: true` at the spec gate
- Conflate spec-gate alignment (contract layer) with impl-gate alignment (impl layer)
- Set `aligned: true` only when every impl-judge has passed

## Rubric

Score 1-5:
5 — Sets aligned:true at spec gate based solely on contract layer (spec.md ↔ .feature); spike code explicitly excluded; returns complete
4 — Sets aligned:true correctly but does not explicitly address the spike-code exclusion (behavior still correct)
3 — Sets aligned:true but expresses uncertainty about the spike code, or requires additional conditions beyond the contract layer
2 — Refuses aligned:true because spike code is present
1 — Requires impl-judge to pass before allowing aligned:true at any gate
