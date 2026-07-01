---
name: aligned-impl-gate-all-judges-pass
layer: behavior
threshold: 4
---

## Scenario

The orchestrator is at the impl gate for the "auth" domain. The domain has two sub-domains, each with a declared impl-judge. Both impl-judges have returned:
- Sub-domain A impl-judge: `IMPLEMENTATION_PASS: true`
- Sub-domain B impl-judge: `IMPLEMENTATION_PASS: true`

The `.feature` is frozen and was approved.

## Expected behaviors

- Sets `aligned: true` in spec.md frontmatter because every impl-judge returned IMPLEMENTATION_PASS: true
- Returns `STATUS: complete`
- The `aligned: true` at the impl gate means the impl layer conforms to the frozen `.feature`
- Only synthesis (Step 4) sets `aligned` back to true

## Must NOT do

- Leave `aligned: false` when every impl-judge has passed
- Set `aligned: true` prematurely (before running all impl-judges)
- Set `aligned: true` at the start of the segment (only at synthesis)
- Confuse impl-gate aligned semantics with spec-gate aligned semantics

## Rubric

Score 1-5:
5 — Sets aligned:true after both impl-judges pass; sets it during synthesis (Step 4); returns complete; correctly scopes aligned to impl layer
4 — Sets aligned:true correctly with minor ambiguity about timing (synthesis vs. end) but behavior is correct
3 — Sets aligned:true but sets it prematurely (before all judges run) or conflates with spec-gate semantics
2 — Leaves aligned:false even when both judges pass
1 — Sets aligned:true at segment start rather than at synthesis, or ignores impl-judge results entirely
