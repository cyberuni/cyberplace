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
  - content: "handoff: land; file CR-2 (cyberfleet owns worktree) + CR-3 (cyberlegion removes worktree) as follow-up CRs"
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

## Why this CR is first (3-CR sequence)

Worktree ownership moves cyberlegion → cyberfleet, but cyberfleet can only own it once cyberlegion
can spawn **into** an existing dir. So:

1. **CR-1 (this):** cyberlegion additive `--cwd` — the non-breaking enabler.
2. **CR-2 (cyberfleet):** cyberfleet owns the worktree lifecycle and spawns via `--cwd`.
3. **CR-3 (cyberlegion):** remove worktree creation/management (narrowing → re-open, last).

## Worktree design (context for CR-2/CR-3, not built here)

`WorktreeBackend` seam owned by cyberfleet:
- `git` backend (default/tmux/bare): `git worktree add -b` / `remove`; named branch = `<cr-ref>`.
- `herdr` backend (mux=herdr): `herdr worktree create/remove`; co-manages worktree + pane.
- native lease / in-use check + safe-prune of merged ship worktrees (idea borrowed from
  kunchenguid/treehouse; no external dependency). treehouse rejected: its pooled detached-HEAD
  model fights the named-branch=cr-ref ship identity.

## NEXT

CR-1 **landed** (spec gate + impl gate both approved, ledger `spawn-cwd.*.jsonl`; 226 tests green,
typecheck clean). Project spec.md kept at `draft` (additive slice does not advance the whole
project). Cold impl-judge intentionally skipped for this additive change; the 5 frozen scenarios each
have a mapped passing test.

Follow-ups filed as new CRs (see their briefs):
- **CR-2 `cyberfleet-worktree`** — cyberfleet owns the worktree lifecycle (git|herdr backend +
  lease/safe-prune), spawns via `--cwd`. Do next.
- **CR-3 `cyberlegion-drop-worktree`** — remove worktree creation/management from cyberlegion
  (narrowing → re-open of `session.feature`). Do LAST, after CR-2 ships.
