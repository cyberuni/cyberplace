---
name: cyberlegion-drop-worktree
status: active
todos:
  - content: "explore: narrow session spawn to drop worktree creation (--branch/--worktree-path removed)"
    status: pending
  - content: "re-open frozen session.feature (narrowing → ratified re-open); rewrite worktree scenarios"
    status: pending
  - content: "close drops worktree removal; AgentRecord worktree fields removed (cwd only)"
    status: pending
  - content: "spec gate + deliver + impl gate + handoff"
    status: pending
---

# CR-3 — remove worktree creation/management from cyberlegion

Target project spec: `packages/cyberlegion/.agents/spec`. **Do LAST — only after CR-2 ships**, so
cyberfleet already owns worktrees before users lose cyberlegion's.

## CR

Remove the worktree-creating path from cyberlegion `session spawn` (no more `--branch` /
`--worktree-path`; spawn requires `--cwd` or current dir). `close` no longer removes any worktree.
`AgentRecord.worktree` fields drop; the record carries only `cwd`. cyberlegion becomes purely a
session/pane mechanism — no git worktree knowledge.

## Freeze / edit class

This is a **narrowing / rewrite** of frozen `session.feature` scenarios (the worktree-creating and
worktree-removing scenarios) → a **re-open** requiring ratification (`sdd:lifecycle-governance`).
Unlike CR-1 (additive, self-clearing), this one reopens the feature, returns it to draft, rewrites,
re-freezes at the spec gate.

Watch the ship↔CR join key: cyberfleet reads `AgentRecord.worktree.branch`. Removing that field
means CR-2 must already carry the branch identity on the cyberfleet side (its own record/marker), or
the join key moves. Confirm CR-2 landed that before dropping the field here.

## NEXT

Blocked on CR-2. When CR-2 has shipped: confirm nothing still reads `AgentRecord.worktree`, then
start the narrowing mission (ratified re-open of `session.feature`).
