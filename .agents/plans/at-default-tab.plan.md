---
name: at-default-tab
status: active
todos:
  - content: "explore: grill scope — DONE. Decisions: default->tab, herdr honors tab via herdr tab create --no-focus, DROP window (align to canonical Session/Workspace/Tab/Pane vocab), capture concept table in spec+readme+website"
    status: completed
  - content: "spike herdr tab create output shape — DONE (.result.root_pane.pane_id, same as workspace)"
    status: completed
  - content: "revise mux.feature — DONE: default->tab (re-open) + 3 additive (tab-not-split outline, no-focus-steal, allowed-set); README default+drop-window+concept-table"
    status: completed
  - content: "spec gate — DONE: sdd-spec-judge ALIGNED; status implemented->approved; ledger seq2 by:unional; mux.feature re-frozen"
    status: completed
  - content: "deliver — DONE: SessionPlacement drop window; tmux/herdr open at??tab; herdr tab create --no-focus; cli default tab; tmux tab -d (focus fix); 300 tests pass"
    status: completed
  - content: "docs — DONE: concept table in mux/README (spec+readme) + website architecture.md; overview.md enumeration drop window+default tab"
    status: completed
  - content: "impl gate — DONE: re-judge IMPLEMENTATION_PASS true (both blockers fixed); status implemented; ledger seq3 by:unional"
    status: completed
  - content: "handoff — DONE: root verify 19/19; commit 211de720 (feat!, changeset cyberlegion minor+BREAKING); PR #125; combat log kept"
    status: completed
---

# CR at-default-tab — cyberlegion `--at` defaults to `tab`

Target spec: `packages/cyberlegion/.agents/spec` (node `mux/`). Revise the default session
placement from `pane:right` to `tab`.

## Key finding (explore)

The default lives in two layers, both landing on `pane:right` today:
- `src/cli.ts` commander `.default('pane:right')` (CLI-observable default)
- adapter `open()` else-branch (tmux `split-window -h`, herdr `pane split --direction right`)

**herdr does not honor `tab`.** `src/console/session.herdr.ts` routes anything that isn't
`workspace`/`pane:down` (so `tab` AND `window`) to a right split. herdr *has* a real primitive:
`herdr tab create --cwd PATH --no-focus`. So flipping the default to `tab` without teaching the
herdr adapter would still open a right-split pane on herdr (this repo runs in herdr). tmux already
maps `tab`/`window` -> `new-window` correctly.

## Scope

1. herdr adapter honors `tab` (and `window`, as an alias — matches tmux) via `herdr tab create`.
2. Default flips `pane:right` -> `tab` at the CLI default (and the adapter/JSDoc-documented default).
3. Frozen scenario `omitting --at defaults to pane:right` -> `tab` (re-open, ratified in-session).
4. Docs: `mux/README.md` (lines ~22,44), `spec.md` mux row if needed, JSDoc in `session.ts` +
   `console/session.ts`.

## NEXT

Mission COMPLETE — landed as PR #125 (commit 211de720). Both gates ratified by:unional
(ledger seq2 spec / seq3 impl). status: implemented. Retire this plan once #125 merges and
doctrine-distills. Formation pass (corpus structure) is due on-demand via `sdd:manage` — not
run here (mux was a revise of an existing node, no relocation).
