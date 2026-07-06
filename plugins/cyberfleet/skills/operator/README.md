# operator

The command-center automaton — a persona skill that activates when the working directory is
**not** a ship (no tracked `.cyberfleet/config.json` marker at this project root, per ADR-0022).
Seated outside any ship — an uninitialized or neutral folder, never "the primary checkout" as such
(the primary checkout is itself a ship once it carries the marker, same as any worktree).

## When to use

- You are outside any ship (no `.cyberfleet/` marker here) and need to init or spawn a first ship.
- Listing the fleet, or checking who needs the Council's hands.
- Routing messages between running ships.

Not for running a mission or hailing crew inside an already-initialized ship — that is `pod`.

## What it does

- `cyberlegion session spawn` — from outside any ship, launches the fleet's first ship with a
  self-contained brief the new Pod reads cold (once inside a ship, spawning further worktree-ships
  for parallel work is Pod's job).
- `cyberlegion identity who` / `mail send` / `mail inbox` / `mail read` / `identity prune` — lists,
  messages, and sweeps the fleet.
- Defers to `pod` when this working directory carries the `.cyberfleet/config.json` marker.

Every mechanic is a `cyberlegion` CLI call — harness-agnostic, MCP-free. Cyberlegion is the
mechanism; Operator is the fleet-layer persona on top of it.
