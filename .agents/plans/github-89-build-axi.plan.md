---
status: active
cr: github-89-build-axi
project: universal-plugin
source: https://github.com/cyberuni/cyberplace/issues/89
todos:
  - content: Extend BuildResult with per-vendor rows + summary; status built/skipped/failed
    status: pending
  - content: Rewrite build/cli.ts output to default TOON table + aggregate + stderr next-step
    status: pending
  - content: Add e2e scenarios mirroring the frozen AXI build.feature scenarios
    status: pending
  - content: pnpm verify; impl gate (cold sdd-impl-judge); advance project spec approved->implemented
    status: pending
---

# github-89 — implement plugin build's AXI output surface

Deliver-only. `build.feature` is frozen (approved). Implement its AXI-output scenarios:
TOON default + per-vendor status + `built N, skipped M, failed K` aggregate + stderr
`→ universal-plugin plugin validate` next-step. Model on `plugin bundle` (#85).

Contract: `packages/universal-plugin/.agents/spec/plugin/build/build.feature` (`## AXI output contract`).
Reference impl: `packages/universal-plugin/src/bundle/cli.ts`.

## NEXT
Implement build.ts row/summary model, then cli.ts TOON surface, then mirror e2e tests.
