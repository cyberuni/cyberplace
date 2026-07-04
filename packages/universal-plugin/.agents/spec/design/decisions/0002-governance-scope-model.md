# 0002 — Governance scope model: freeze the shipped resolution order

**Status:** accepted
**Date:** 2026-07-04

## Context

The legacy `governance/spec.md` described a **4-scope** resolution: `managed → project → user →
package`. The shipped resolver (`src/governance/governance.ts`) actually resolves more:

- For a **plain name** (`governance show plugin-design`): `managed → project → local → user →
  package` — **5 scopes**, adding `local` = `<root>/.agents/governances/` between `project` and
  `user`.
- For a **namespaced lookup** (`governance show <plugin>/<asset>`): the override scopes
  `managed → project → user` are checked, then the **`store`** scope (the local asset-store,
  `<globalStorePath>/…/<plugin>@<version>/governances/<asset>.md`) — the **6th** scope.

Because `governance` is an implemented, chartered capability, the frozen contract must match shipped
behavior or the impl gate fails.

## Decision

Freeze the **shipped** resolution order (5 plain-name scopes + the `store` scope for namespaced
lookups), not the legacy 4-scope model. Extend `governance.feature` to cover the `local` and `store`
scopes so the frozen suite equals shipped behavior. Correct the dead `cli-command` reference in the
old `list` scenario to the real package default `plugin-design`.

## Consequences

- The frozen `governance.feature` gains `local`-scope and namespaced `store`-scope scenarios.
- **Caveat:** the `store` scope resolves from the asset-store, which is part of the sync engine that
  ADR 0001 marks as destined to leave. If/when the asset-store moves, the `store` scope becomes a
  follow-up revision of this node (a freeze re-open, not a silent edit).
