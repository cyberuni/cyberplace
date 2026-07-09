---
name: cyberlegion-init-legate
status: active
todos:
  - content: "author init/ node (spec.md + init.feature); identity/ additive scenarios (bind-main/main + durable legate); surfacing/ rewrite (main-pane gate + nudge)"
    status: done
  - content: "spec gate: cold spec-judge over 3 units; surfacing narrowing needs ratified re-open; freeze + ledger gate line + status approved"
    status: done
  - content: "impl: init verb + shared harness resolver; identity bind-main/--clear/main + mainPane Store pointer + paths.mainPaneFile; injectInbox gate+nudge"
    status: done
  - content: "impl: one verification per frozen scenario; impl gate (cold impl-judge)"
    status: done
  - content: "root pnpm verify; commit by unit of work; file plugin-side follow-up CR; handoff"
    status: done
---

# CR cyberlegion-init-legate — init front door + legate main-pane binding

Target spec: `packages/cyberlegion/.agents/spec` (nodes `init/` NEW, `identity/`, `surfacing/`).
Design: `cyberlegion-init-legate.design.md`.

## CR

Add a `cyberlegion init` front door that auto-detects the harness (or `--agent`) and registers the
SessionStart surfacing hook via existing `install()`. Add a durable `legate` standing owner inbox +
a hub-level `mainPane` pointer with `identity bind-main`/`--clear`/`main`. Rewrite the A2 surfacing
gate so standing-owner mail surfaces only in the bound main pane (falls back to `!spawnedBy` when
unbound), and add a SessionStart "Legion setup" nudge for an unbound root pane. Non-mux root sessions
get the durable inbox + nudge without the exclusive pointer.

## NEXT

DONE on branch `cyberlegion-init-legate` (not pushed). Spec gate + impl gate both APPROVED (ledger
seq 2/3); impl-judge 31/31; pkg 313 tests + root pnpm verify green. Committed by unit of work.
Follow-up CR filed: `cyberlegion-plugin-init-skill` (plugin-side `init-cyberlegion` skill + legate
classification row + top-level init companion) against the `cyberlegion-plugin` spec. Post-mission
Warden spawned detached. Remaining: open a PR when the user asks (repo is PR-flow).
