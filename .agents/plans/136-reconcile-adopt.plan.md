---
name: 136-reconcile-adopt
status: active
todos:
  - content: "explore: draft registry.feature adopt scenarios (herdr adopt, handle rule, skip unclassifiable, tmux boundary, idempotency, prune stays cull-only)"
    status: in_progress
  - content: "spec gate: additive scenarios on frozen unit/registry self-clear; cold spec-judge"
    status: pending
  - content: "deliver: adopt branch in reconcile(ctx) (identity.ts), wire who --reconcile adopt, prune cull-only"
    status: pending
  - content: "impl gate: cold impl-judge pass per frozen adopt scenario"
    status: pending
  - content: "handoff: pnpm verify, commit, push, PR linking #136"
    status: pending
---

# CR 136-reconcile-adopt — adopt half of reconcile-against-mux

Target spec: `packages/cyberlegion/.agents/spec` — **`unit/registry` node** (additions on the same
node CR-1 extended; adopt is the other half of the same reconcile operation).

Source: https://github.com/cyberuni/cyberplace/issues/136

## Scope (adopt half only)

1. `reconcile` adopt: for each live pane of the current mux with a **detectable harness** and no
   matching record, mint a record — bind pane→id, derive handle, set harness, `status: active`,
   `lastSeen` now.
2. **Handle derivation rule (frozen):** sanitized basename of the pane's reported `cwd`; when the
   backend reports no cwd, fall back to `id.slice(0, 6)`.
3. **Detectable harness only:** the backend-reported agent string must map to a known harness
   (`claude | cursor | codex`); anything else is unclassifiable — do NOT adopt. herdr's `pane list`
   exposes `agent`; tmux's `list-panes` does not, so tmux adoption is structurally deferred (spec'd
   boundary, not a gap).
4. **Placement:** adopt runs only under `unit who --reconcile` (the reconcile operation); `prune`
   stays cull-only — the reaper never mints records.
5. **Idempotent with cull:** a live pane already bound to a record (pane index or a record's pane
   locator) is never re-adopted; a second reconcile mints no duplicate.

## Explicitly OUT of scope

- Exited-record retention/GC → issue #137.
- Resurrecting an exited record whose pane is still live (adopt skips any bound pane).
- tmux harness inference (pane-command sniffing for adopt) — deferred with the boundary above.

## NEXT

Explore done when: adopt scenarios drafted on `registry.feature` (additive-only, stays `@frozen`,
self-clears), README bullets + mapping table updated, non-goal line about adopt removed; then cold
spec-judge → spec gate.
