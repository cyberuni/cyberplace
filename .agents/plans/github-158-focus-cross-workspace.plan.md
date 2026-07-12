---
cr: github-158-focus-cross-workspace
target-spec: packages/cyberlegion/.agents/spec
target-suite: packages/cyberlegion/.agents/spec/unit/lifecycle/lifecycle.feature
source: https://github.com/cyberuni/cyberplace/issues/158
status: active
todos:
  - content: "intake + locate spec (cyberlegion unit/lifecycle); confirm additive edit-class"
    status: completed
  - content: "explore: draft beaming scenario(s) for focus crossing workspace/tab; grill + cold spec-judge"
    status: completed
  - content: "spec gate: cold spec-judge, freeze self-clears (additive), record gate line"
    status: completed
  - content: "deliver: impl-producer makes focus resolve workspace+tab and drive ws->tab->pane (herdr + tmux)"
    status: pending
  - content: "impl gate: cold impl-judge; root pnpm verify; advance to implemented"
    status: pending
  - content: "handoff: PR with Closes #158, mail legate"
    status: pending
---

# github-158 — unit focus beams across workspace/tab, not just the current pane

## CR

Issue: https://github.com/cyberuni/cyberplace/issues/158

`cyberlegion unit focus <ref>` is meant to move the human's terminal view to a peer
unit's pane, but today it only attempts a single pane-level focus and silently
no-ops across workspace/tab boundaries. Root cause: herdr `pane focus` has no
focus-by-id form (only `--direction`), so `herdr pane focus <id>` errors to null;
and even a valid pane focus never switches the attached client's active
workspace/tab.

Fix (cyberlegion mechanism only): `SessionAdapter.focus` resolves the target
pane's `workspace_id` + `tab_id` and drives the full beam —
herdr `workspace focus <ws>` -> `tab focus <tab>` -> pane-active; tmux
`switch-client` -> `select-window` -> `select-pane`. Best-effort within, but
fail-loud on unresolvable ref / no known pane (already enforced by `resolveTarget`
before the adapter runs, per #138/#128).

Additive to the frozen `lifecycle.feature` focus block — new beaming scenario(s),
freeze self-clears, no re-open. This is a REAL production code change (unlike #128
which was test-only), so deliver builds code in both adapters + likely extends
`LivePane` to carry workspace/tab.

## NEXT

Spec gate PASSED (cold sdd-spec-judge ALIGNED; addOnly:true freeze self-cleared;
status: approved). Deliver: dispatch impl-producer to make `SessionAdapter.focus`
resolve the target pane's workspace_id+tab_id and drive ws->tab->pane (herdr:
`workspace focus`/`tab focus`; tmux: `switch-client`/`select-window`/`select-pane`),
with fail-loud when the recorded pane no longer resolves in the backend. Add one
verification per new frozen scenario. Then rebase onto origin/main, run the impl
gate (cold impl-judge), root `pnpm verify`.
