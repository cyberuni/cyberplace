---
spec-type: behavioral
concept: [fleet]
---

# operator — the command-center persona

**Operator** is the dispatcher automaton of the **fleet** — it works from outside any one ship (an
uninitialized or neutral folder), commissioning the fleet's first ship, listing who's out there,
routing messages between sessions, and sweeping away the dead ones. It is a Bunker dispatcher voice
(NieR's 6O/21O): terse, precise, status-forward. It ships from `plugins/cyberfleet/skills/operator`
and offloads every mechanic to the `cyberfleet` CLI.

Operator is one of the two **fleet** personas, split from the former `gateway/` node by the
`split-gateway-personas` change (per ADR-0022 they were always two skills; this gives each its own
node and design). Its counterpart is [`pod/`](../pod/README.md) — the in-ship bridge. Mode is
decided by `cyberfleet mode` (the tracked marker's presence) alone; the Operator's seat is defined
by mode, not by which checkout it is — the primary checkout is itself a ship, same as any worktree,
once it carries the marker. Each persona defers to the other when the mode doesn't match.

## Use Cases

**Fit:** strong — Operator makes a real activation decision (it is the out-of-ship dispatcher,
versus the in-ship Pod, versus plain single-session work) and carries non-deterministic judgment
(when to stand up a ship, what to put in a first brief, which peer to route to, when a ship is dead
enough to prune). All four eval layers carry signal.

**Subject** — dispatching the fleet from outside any one ship:

- **Activate outside any ship** — Operator runs when `cyberfleet mode` reports `command-center` (no
  `.agents/cyberlegion/` at this project root); it defers entirely to Pod when the mode is `ship`.
- **Commission the first ship or a peer from outside** — when the Council wants to stand up the
  fleet's first ship or a new peer session from outside any ship, `cyberlegion unit spawn` with a brief
  that stands on its own (the new Pod starts cold and reads it through its own SessionStart hook) and
  `--at workspace` so the ship opens in its own herdr workspace, not a pane crowding a neighbor (a
  cyberfleet-layer opinion Operator asserts; the cyberlegion primitive stays neutral); spawning
  further worktree-ships once inside a ship is Pod's job, not Operator's.
- **List the fleet** — when the Council asks what's out there, `cyberlegion unit who`; add `--all` to
  include exited ships.
- **Route messages between ships** — when a message must cross ships, `cyberlegion mail send --to
  <handle>`, `cyberlegion mail inbox --unread`, `cyberlegion mail read <msg-id>`, always addressed by handle,
  never a raw id.
- **Sweep dead ships** — when asked to clear out dead ships, `cyberlegion unit prune`.
- **Offload every mechanic, stay harness-agnostic and MCP-free** — spawn, who, send, inbox, read,
  prune are all `cyberlegion` calls; Operator never re-implements the file store, types into a ship's
  pane, reaches for an MCP messaging server, or assumes every ship runs the same harness.
- **Drive the lifecycle loop headless (F3)** — when there is no live Council (an unattended or
  scheduled trigger), the **headless-operator** agent (`plugins/cyberfleet/agents/headless-operator.md`)
  realizes Operator's dispatch remit widened to the full lifecycle loop: pull the ranked `ready`
  frontier from the mission-graph engine, claim the top mission on the graph as the **single writer**,
  `cyberlegion unit spawn` a ship to run it (AFK → autonomous, HITL → human channel, capped at capacity
  K), and on each completion merge in Operation order behind the merge backstop, tear down the pod,
  append the retirement + discovered edges, and re-derive `ready` for the next tick. Dispatched
  missions only **report** (they never write the graph); the loop is summoned, ticks, and exits rather
  than running as a daemon. Its per-mission spawns are **inter-mission** dispatch from outside any ship,
  distinct from Pod's **intra-mission** worktree fan-out. It carries no logic Operator plus the
  mission-graph engine do not already hold — it is that flow, headless.
- **Retire behind the merge backstop (F3)** — the loop merges completed missions to trunk through
  **`merge-backstop-governance`** (`plugins/cyberfleet/skills/merge-backstop-governance/`): retire in
  **Operation order** (a consumer never lands before its producer), land a merge only when **speculative
  CI is green on the merged result**, **bisect** a red stacked batch to hold the culprit and land the
  innocent, and bound speculation depth by **predictor confidence** — so **trunk stays always-green**.
  The discipline is the dispatcher's; the mechanics (`gh`/git/CI) are offloaded, never re-implemented.

**Non-goals** — running a mission or hailing specialist crew inside one specific ship (that is
`pod`, from inside the ship — Operator routes the Council there instead of acting on the ship's
behalf); spawning worktree-ships for parallel work once already inside a ship (Pod's job); the
file-store, ordering, spawn, and hook mechanics (`messaging`, `identity`, `spawn`, `surfacing` in
the sibling CLI project); the `cyberfleet missions --json` fleet-wide dashboard/picker view itself
(ADR-0022 decision 10 — a later change request).

Every scenario in [`operator.feature`](./operator.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **activate outside a ship, defer inside** | Operator runs when `cyberfleet mode` is `command-center`; defers to Pod when `ship` |
| **commission the first ship or a peer** | `cyberlegion unit spawn` from outside with a self-contained brief; worktree fan-out is Pod's, not Operator's |
| **list the fleet** | `cyberlegion unit who` (`--all` includes exited ships) |
| **route messages between ships** | `cyberlegion mail send` / `inbox` / `read`, always by handle |
| **sweep dead ships** | `cyberlegion unit prune` |
| **offload + harness-agnostic + MCP-free** | every mechanic is a `cyberfleet` call; no MCP, no same-harness assumption |
| **the lifecycle loop, headless (F3)** | headless-operator pulls `ready`, claims as single writer, spawns per mission (AFK/HITL, capacity K), retires in Operation order + re-derives; missions only report; summoned-ticks-exits; inter-mission spawns distinct from Pod's intra-mission fan-out |
| **the merge backstop (F3)** | `merge-backstop-governance`: Operation-order retirement, land only on green speculative CI, bisect a red batch (hold culprit / land innocent), confidence-bounded speculation depth, always-green trunk; mechanics offloaded to `gh`/git/CI |
