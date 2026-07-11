---
name: verify-scenarios-path-resolution
status: active
todos:
  - content: "Intake: sdd verify-scenarios node, plan + leash shard"
    status: completed
  - content: "Explore: add absolute-honored + relative-under-root path scenarios (additive, self-clear); cold sdd spec-judge"
    status: pending
  - content: "Spec gate: freeze new scenarios, gate line"
    status: pending
  - content: "Deliver: underRoot() isAbsolute guard at the 3 join sites; tests; sdd impl-judge"
    status: pending
  - content: "Impl gate; pnpm verify; handoff branch + PR (fixes #108)"
    status: pending
---

# verify-scenarios-path-resolution — honor absolute path args, don't double-prefix

Fixes #108. CR against `.agents/specs/sdd/mission/verify-scenarios`. The engine blindly does
`join(root, p)` at three sites, so an **absolute** `--feature` / `--report` / `--config` (or TOML
reportPath) double-prefixes under `--root` and the file is never found — the scenario→test bridge is
unusable for any project rooted outside cwd (surfaced on cyberlegion).

## The fix (deterministic .mts engine — SDD-default squad, node:test)
Add `underRoot(root, p) = isAbsolute(p) ? p : join(root, p)`; apply at:
- `getScenarioKeys` line ~110 (`--feature`)
- `runJunitSource` line ~217 (`source.reportPath` — TOML-relative stays joined; absolute --report no-ops)
- `resolveSources` line ~332 (`--config` default)
Import `isAbsolute` from `node:path`. Convention (already in the usage string): relative paths resolve
under `--root` (default cwd); absolute paths are used verbatim. No cwd-vs-root per-flag divergence.

## Spec (additive — self-clears, stays @frozen)
Two scenarios under a `# ── Path resolution ──` group:
- an absolute path argument is used verbatim, not double-prefixed under --root
- a relative path argument resolves under --root

## NEXT
Add scenarios, cold sdd spec-judge, spec gate (freeze), then deliver the guard + tests.
