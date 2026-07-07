---
name: cyberfleet-worktree
status: active
todos:
  - content: "explore: spec cyberfleet owning the worktree lifecycle (create on mission/ship start, remove on teardown)"
    status: pending
  - content: "design the WorktreeBackend seam: git backend (default) + herdr backend (mux=herdr)"
    status: pending
  - content: "native lease/in-use check + safe-prune of merged ship worktrees (idea from treehouse, no dep)"
    status: pending
  - content: "cyberfleet spawns via `cyberlegion session spawn --cwd <worktree>` (from CR-1)"
    status: pending
  - content: "deliver + impl gate + handoff"
    status: pending
---

# CR-2 — cyberfleet owns the worktree lifecycle

Target project spec: `packages/cyberfleet/.agents/spec`. **Do after CR-1 (`spawn-cwd`), before CR-3.**

## CR

Move worktree ownership INTO cyberfleet. When a mission/ship starts, cyberfleet creates the worktree
(branch = `<cr-ref>`, preserving the ship↔CR join key), then spawns the session via
`cyberlegion session spawn --cwd <worktree>` (the additive path CR-1 added). cyberfleet owns removal
on teardown.

## Design (settled with user)

`WorktreeBackend` seam owned by cyberfleet:
- **`git` backend** (default / tmux / bare): `git worktree add -b <cr-ref>` / `remove`. Named branch =
  `<cr-ref>` — matches ship identity.
- **`herdr` backend** (mux=herdr): `herdr worktree create/remove` — co-manages worktree + pane.
- **native lease / in-use check** (process-scan or lease file) so a live worktree is never torn down,
  plus **safe-prune** (dry-run default) of merged ship worktrees. Idea borrowed from
  kunchenguid/treehouse; **no external dependency**. treehouse itself rejected — its pooled
  detached-HEAD model fights the named-branch=cr-ref ship identity.

Branch-collision note (found live): the current default `cyberlegion/unit-<id>` collides with a
`cyberlegion` branch (git D/F ref conflict). cyberfleet's branch = `<cr-ref>` sidesteps this; keep
cyberfleet's created branches out of any existing branch's namespace.

## NEXT

Start CR-2: locate the cyberfleet mission/ship spawn path (`packages/cyberfleet/src/missions.ts`,
`mode.ts`, `cli.ts`), spec the worktree-ownership behavior + the WorktreeBackend seam, then the
mission loop. cyberlegion `--cwd` is already available (CR-1 landed).
