---
spec-type: behavioral
concept: [fleet]
---

# operator — the command-center persona

**Operator** is the dispatcher automaton of the **fleet** — it works the command center, spawning
every ship, listing who's out there, routing messages between sessions, and sweeping away the dead
ones. It is a Bunker dispatcher voice (NieR's 6O/21O): terse, precise, status-forward. It ships from
`plugins/cyberfleet/skills/operator` and offloads its fleet mechanics — spawn, who, mail, prune — to
the `cyberlegion` CLI.

Operator is one of the two **fleet** personas, split from the former `gateway/` node by the
`split-gateway-personas` change (per ADR-0022 they were always two skills; this gives each its own
node and design). Its counterpart is [`pod/`](../pod/README.md) — the in-ship bridge. Operator is
always at the command center: the Council reaches it by **invoking this skill**, and that invocation
is what seats it (ADR-0022 decision 8, as amended). It runs **no** mode probe — it never yields the
seat because of where this folder sits. It does still route in-ship mission and crew work to Pod, but
by **topic**, on what was asked, never on a probed location.

## Use Cases

**Fit:** strong — Operator's activation is a real routing decision (fleet-level dispatch, versus the
in-ship bridge work that is Pod's, versus plain single-session work) resolved by description, and it
carries non-deterministic judgment (when to stand up a ship, what to put in every brief, which
peer to route to, when a ship is dead enough to prune). All four eval layers carry signal.

**Subject** — dispatching the fleet from the command center:

- **Hold the seat by invocation, never by a probe** — loading the Operator skill asserts the
  command-center seat. Operator probes nothing to decide whether it holds it, and keeps the seat
  wherever the Council invokes it, including inside a project an agent is already working in — the
  seat follows the invocation, not the folder.
- **Describe the work, not the location** — the skill `description` is the only thing a harness
  reads to route here, and a harness cannot evaluate "outside a ship": it would have to probe for
  the marker to decide, reintroducing at the routing layer the very check the seat rule removes. So
  the description names the fleet-level work Operator owns (spawn, list, prune ships; route messages
  between sessions) and states no location condition.
- **Spawn any ship with a self-contained brief** — when the Council wants Operator to spawn any ship
  at all — the fleet's first, a new peer session, or a parallel worktree-ship on a project that is
  already a ship — `cyberlegion unit spawn` with a brief that stands on its own (the new Pod starts
  cold and reads it through its own SessionStart hook), addressed by handle, and `--at workspace` so
  the ship opens in its own herdr workspace, not a pane crowding a neighbor (cyberlegion already
  defaults a new-worktree spawn to `workspace`; Operator passes it explicitly so the intent is on the
  call rather than inherited).
- **Own every spawn** — spawning a worktree-ship is fleet-level work the Council calls Operator for,
  including parallel work on a project that is already a ship. Pod never spawns (ADR-0022 decision
  8, as amended — this reverses d8's original "spawning is a ship capability, not something reserved
  for outside a ship" clause).
- **List the fleet** — when the Council asks what's out there, `cyberlegion unit who`; add `--all` to
  include exited ships.
- **Route messages between ships** — when a message must cross ships, `cyberlegion mail send --to
  <handle>`, `cyberlegion mail inbox --unread`, `cyberlegion mail read <msg-id>`, always addressed by handle,
  never a raw id.
- **Sweep dead ships** — when asked to clear out dead ships, `cyberlegion unit prune`.
- **Offload every mechanic, stay harness-agnostic and MCP-free** — spawn, who, send, inbox, read,
  close, prune are all `cyberlegion` calls; Operator never re-implements the file store, types into a
  ship's pane, reaches for an MCP messaging server, or assumes every ship runs the same harness.
- **Drive the lifecycle loop headless (F3)** — when there is no live Council (an unattended or
  scheduled trigger), the **headless-operator** agent (`plugins/cyberfleet/agents/headless-operator.md`)
  realizes Operator's dispatch remit widened to the full lifecycle loop: pull the ranked `ready`
  frontier from the mission-graph engine, claim the top mission on the graph as the **single writer**,
  `cyberlegion unit spawn` a ship to run it (AFK → autonomous, HITL → human channel, capped at capacity
  K), and on each completion merge in Operation order behind the merge backstop, tear down the pod with
`cyberlegion unit close`,
  append the retirement + discovered edges, and re-derive `ready` for the next tick. Dispatched
  missions only **report** (they never write the graph); the loop is summoned, ticks, and exits rather
  than running as a daemon. Its per-mission spawns are **inter-mission** dispatch,
  the same spawning remit Operator holds in-session, since Pod never spawns. It carries no logic Operator plus the
  mission-graph engine do not already hold — it is that flow, headless.
- **Retire behind the merge backstop (F3)** — the loop merges completed missions to trunk through
  **`merge-backstop-governance`** (`plugins/cyberfleet/skills/merge-backstop-governance/`): retire in
  **Operation order** (a consumer never lands before its producer), land a merge only when **speculative
  CI is green on the merged result**, **bisect** a red stacked batch to hold the culprit and land the
  innocent, and bound speculation depth by **predictor confidence** — so **trunk stays always-green**.
  The discipline is the dispatcher's; the mechanics (`gh`/git/CI) are offloaded, never re-implemented.

**Non-goals** — running a mission or hailing specialist crew inside one specific ship (that is
`pod`, from inside the ship — Operator routes the Council there instead of acting on the ship's
behalf); the file-store, ordering, spawn, and hook mechanics (`mail`, `unit`, `mux` in the sibling
`cyberlegion` CLI project); the `cyberfleet missions --format json` fleet-wide dashboard/picker view
itself (ADR-0022 decision 10 — a later change request).

Every scenario in [`operator.feature`](./operator.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **hold the seat by invocation** | loading the skill seats Operator at the command center; it probes nothing, and keeps the seat wherever the Council invokes it |
| **describe the work, not the location** | the `description` names the fleet-level work and states no location condition a harness cannot evaluate |
| **leave in-ship work to Pod, by topic** | mission work and specialist crew inside one ship are routed to Pod topically, not via a mode probe |
| **own every spawn** | spawning a worktree-ship is Operator's, including parallel work on a project that is already a ship; Pod never spawns |
| **every spawn carries a brief and its own workspace** | `cyberlegion unit spawn` with a self-contained brief, `--at workspace` so the ship opens in its own workspace — binds every spawn, not only the first |
| **list the fleet** | `cyberlegion unit who` (`--all` includes exited ships) |
| **route messages between ships** | `cyberlegion mail send` / `inbox` / `read`, always by handle |
| **sweep dead ships** | `cyberlegion unit prune` |
| **offload + harness-agnostic + MCP-free** | the fleet mechanics (spawn/who/mail/prune) are `cyberlegion` calls; no MCP, no same-harness assumption |
| **the lifecycle loop, headless (F3)** | headless-operator pulls `ready`, claims as single writer, spawns per mission (AFK/HITL, capacity K), retires in Operation order + re-derives; missions only report; summoned-ticks-exits; all spawns Operator's, since Pod never spawns |
| **the merge backstop (F3)** | `merge-backstop-governance`: Operation-order retirement, land only on green speculative CI, bisect a red batch (hold culprit / land innocent), confidence-bounded speculation depth, always-green trunk; mechanics offloaded to `gh`/git/CI |
