# doc-envelope (arc42) — docs-heavy / domain-flat

**Input** (a system with no clean domain decomposition; documentation-heavy):
```
platform/
  docs/   (lots)   src/ (thin, infra-shaped)
```
**Detected:** no clear capability decomposition; documentation-first.
**Choice:** strategy `doc-envelope`, location `colocated`.
**Expected:** arc42 sections map by spec-type — context/building-blocks/constraints are **descriptive**;
decisions → the ADR log; **only runtime + quality scenarios are behavioral** (carry a `.feature`).
