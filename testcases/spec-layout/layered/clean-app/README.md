# layered (clean/hexagonal) — the nesting rule

**Input** (a clean-architecture service whose mental model IS its rings):
```
svc/
  src/domain/  src/application/  src/adapters/  src/ports/
```
**Detected:** strongly layered; the team thinks in layers.
**Choice:** strategy `layered`, location `colocated` — offered **with the warning**.
**Expected:** layer folders are **descriptive indexes** (no testable surface → no `.feature`); the
behavior is a **use-case behavioral leaf nested inside** a layer — never a layer as a behavioral node.
