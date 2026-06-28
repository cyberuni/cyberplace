---
status: draft
spec-layout:
  strategy: capability-first
  location: colocated
  placement-map: "#placement-map"
aligned: false
---

# repo — the outer project spec

> Expected backfilled root (fixture). Envelope (design/, acceptance/, tooling) is the shared
> envelope from spec-layout.md; this fixture shows the strategy-distinctive body + glossary.

## Placement map

- a repo-wide concern (tooling, CI, release) → its folder; packages have their own hoisted specs
