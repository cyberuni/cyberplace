---
status: draft
spec-layout:
  strategy: bounded-context
  location: colocated
  placement-map: "#placement-map"
aligned: false
---

# shop — bounded-context

> Expected backfilled root (fixture). Envelope (design/, acceptance/, tooling) is the shared
> envelope from spec-layout.md; this fixture shows the strategy-distinctive body + glossary.

## Placement map

- a concept in the ordering domain → `ordering/`
- a concept in the inventory domain → `inventory/`
- a cross-context integration seam → `design/context-map/`
- a term (note: meaning is per-context) → `glossary/`
