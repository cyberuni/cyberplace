---
name: 135-reconcile-cull
status: active
todos:
  - content: "explore: draft registry.feature additions (listPanes contract, reconcile cull, mux-scoped/standing/pane-null guards, who --reconcile wiring)"
    status: completed
  - content: "spec gate: freeze additive scenarios on unit/registry"
    status: completed
  - content: "deliver: listPanes on SessionAdapter (herdr+tmux), reconcile(ctx) in identity.ts, wire who --reconcile + prune"
    status: completed
  - content: "impl gate: cold impl-judge pass per frozen scenario (9/9 PASS)"
    status: completed
  - content: "handoff: pnpm verify, commit, push, PR"
    status: in_progress
---

# CR 135-reconcile-cull — cull half of reconcile-against-mux

Target spec: `packages/cyberlegion/.agents/spec` — **`unit/registry` node** (additions, not a new
node: reconcile is an extension of `prune`'s guards and `who`'s listing, same file).

Source: https://github.com/cyberuni/cyberplace/issues/135

## Scope (cull half only)

1. `listPanes(exec) → LivePane[]` on `SessionAdapter` — herdr (`herdr pane list` JSON, drop scaffold
   panes with no `agent`), tmux (`tmux list-panes -a -F '#{pane_id} #{pane_current_command} #{pane_current_path}'`).
2. `reconcile(ctx)` in `identity.ts` — mark any non-`standing` record whose pane is absent from the
   current mux's live set as `exited`; return the changes.
3. Guards: mux-scoped (never cull the other mux's records), never touch `kind: 'standing'`, a
   `pane: null` record can't be pane-culled (stale-timer only, already in `prune`).
4. Wire behind `who --reconcile` (mirrors `--all`) and let `prune` reconcile-cull too.

## Explicitly OUT of scope

- Adopt (live pane, no record) → CR-2, issue #136.
- Exited-record retention/GC → issue #137.

## NEXT

Start explore: grill scenarios against `registry.feature` (currently `@frozen`, additive edit only —
new scenarios, no narrowing of existing ones, self-clears per `sdd:lifecycle-governance`).
