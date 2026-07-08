---
name: spawn-cwd
status: active
todos:
  - content: "explore: grill spec+suite for additive `session spawn --cwd <dir>` (spawn in existing dir, no worktree create/remove)"
    status: done
  - content: "spec gate: additive scenarios on frozen session.feature self-clear (stays @frozen, no re-open)"
    status: done
  - content: "deliver: implement --cwd path in session spawn; AgentRecord records cwd; close unaffected on --cwd units"
    status: done
  - content: "impl gate: verify one check per frozen scenario"
    status: done
  - content: "handoff: land"
    status: done
---

# CR-1 — cyberlegion `session spawn --cwd`

Target project spec: `packages/cyberlegion/.agents/spec` (cyberlegion CLI, status draft; `session.feature` is `@frozen`).

## CR

Add an **additive** spawn mode: `session spawn --cwd <existing dir>` launches a peer session in a
directory that already exists, **creating and removing no git worktree**. The current
worktree-creating path (`--branch` / `--worktree-path`) is unchanged. `AgentRecord` records the cwd
it ran in; `close` on a `--cwd` unit tears down the session/pane but removes no worktree.

Additive to a frozen `.feature` → new scenarios self-clear, stay `@frozen`, no re-open
(edit class read via `gherkin-cli diff --base dc907c2`).

## Why `--cwd` is useful on its own

`--cwd` lets a caller (or `herdr worktree create`) hand spawn an already-existing directory instead
of forcing spawn to cut its own worktree — useful when the caller wants its own worktree lifecycle
(e.g. an already-checked-out herdr worktree) without cyberlegion re-creating one. Worktree ownership
stays with cyberlegion: this is an additive spawn mode, not a step toward moving that ownership
elsewhere.

## NEXT

CR-1 **landed** (spec gate + impl gate both approved, ledger `spawn-cwd.*.jsonl`; 226 tests green,
typecheck clean). Project spec.md kept at `draft` (additive slice does not advance the whole
project). Cold impl-judge intentionally skipped for this additive change; the 5 frozen scenarios each
have a mapped passing test.

No follow-up CRs filed. Worktree lifecycle stays owned by cyberlegion (the cyberfleet-ownership
direction from an earlier draft of this plan was dropped).
