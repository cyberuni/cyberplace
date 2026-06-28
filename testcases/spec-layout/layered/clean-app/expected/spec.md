---
status: draft
spec-layout:
  strategy: layered
  location: colocated
  placement-map: "#placement-map"
aligned: false
---

# svc — layered (behavior nests inside)

> Expected backfilled root (fixture). Envelope (design/, acceptance/, tooling) is the shared
> envelope from spec-layout.md; this fixture shows the strategy-distinctive body + glossary.

## Placement map

- a domain rule → `domain/` (descriptive)
- a use case → `application/<use-case>/` (behavioral leaf, nested)
- an external adapter → `adapters/` (descriptive)
- NOTE: a layer is never a behavioral node
