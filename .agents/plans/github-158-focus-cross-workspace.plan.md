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
    status: completed
  - content: "impl gate: cold impl-judge; root pnpm verify; advance to implemented"
    status: completed
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

Impl gate PASSED (cold sdd-impl-judge IMPLEMENTATION_PASS true; root pnpm verify
green; status: implemented). Handoff: push branch, open PR (Closes #158), mail
legate. FOLLOW-UP (flag to Council, do NOT fold into #158): the general
"SessionAdapter verifies its observable effect or fails loud" rule (cr150 doctrine
sibling) — focus:true read-back+retry on focus WITH the attach-relative
no-attached-client no-op scenario, and the same audit on clear. Recorded in
github-158-focus-cross-workspace.log.jsonl.