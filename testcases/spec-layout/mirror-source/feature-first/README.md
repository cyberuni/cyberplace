# mirror-source — feature-first app

**Input** (a React app, feature-organized, navigated by code):
```
web/
  src/features/cart/{components,hooks,api}
  src/features/checkout/{components,hooks,api}
  src/shared/   package.json   vite.config.ts
```
**Detected:** `src/` is feature-first; contributors navigate by folder.
**Choice:** strategy `mirror-source`, location `colocated`.
**Expected:** one behavioral leaf per top-level feature folder; **boundary-aligned** — the nested
`components/hooks/api` below a feature are impl detail, **not** spec nodes. Tooling gets its own home.
