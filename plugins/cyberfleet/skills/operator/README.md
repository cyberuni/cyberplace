# operator

The command-center automaton — a persona skill seated by invocation, not by probing where the
Council stands (ADR-0022, amended). Loading the skill asserts the seat; Operator keeps it wherever
the Council invokes it, including inside a project an agent is already working in.

## When to use

- You need to spawn a ship — the fleet's first, a new peer session, or a parallel worktree-ship on
  a project that is already a ship.
- Listing the fleet, or checking who needs the Council's hands.
- Routing messages between running ships.

Not for running a mission or hailing crew inside one specific ship — that is `pod`, routed to by
topic, never by a probed location.

## What it does

- `cyberlegion unit spawn` — spawns every ship: the fleet's first, a new peer session, or a
  parallel worktree-ship on a project that is already a ship, with a self-contained brief the new
  Pod reads cold. All spawning is Operator's; Pod never spawns.
- `cyberlegion unit who` / `mail send` / `mail inbox` / `mail read` / `unit prune` — lists,
  messages, and sweeps the fleet.
- Routes in-ship mission and crew work to `pod`, by topic — never by probing this working
  directory.

Every mechanic is a `cyberlegion` CLI call — harness-agnostic, MCP-free. Cyberlegion is the
mechanism; Operator is the fleet-layer persona on top of it.
