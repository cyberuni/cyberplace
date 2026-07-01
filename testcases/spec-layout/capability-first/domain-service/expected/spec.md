---
status: draft
spec-layout:
  strategy: capability-first
  location: colocated
  placement-map: "#placement-map"
aligned: false
---

# orders-service — capability-first

> Expected backfilled root (fixture). Envelope (design/, acceptance/, tooling) is the shared
> envelope from spec-layout.md; this fixture shows the strategy-distinctive body + glossary.

## Placement map

- order capability → `orders/`
- billing capability → `billing/`
- a rule/model → `design/`; a cross-capability outcome → `acceptance/`; a term → `glossary/`
