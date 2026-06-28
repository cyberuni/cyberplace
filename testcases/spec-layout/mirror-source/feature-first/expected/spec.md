---
status: draft
spec-layout:
  strategy: mirror-source
  location: colocated
  placement-map: "#placement-map"
aligned: false
---

# web — mirror-source (feature-first)

> Expected backfilled root (fixture). Envelope (design/, acceptance/, tooling) is the shared
> envelope from spec-layout.md; this fixture shows the strategy-distinctive body + glossary.

## Placement map

- a feature under `src/features/X` → `X/` (one node; its nested folders are impl detail)
- build/CI/deps (no `src/` home) → `tooling/`
- a cross-feature outcome → `acceptance/`
