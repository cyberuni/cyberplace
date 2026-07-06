---
title: Pod
description: The bridge-companion automaton of a ship — mission entry, inbox, and crew from inside a workspace.
---

Part of the [cyberfleet plugin](/cyberfleet/overview/) — see that page for install instructions.

**Trigger:** invoked when you're **inside a ship** (a workspace with `.agents/cyberlegion/`) — mission entry, checking the inbox, working with the crew. Not for cross-ship routing (that's the [Operator](/cyberfleet/operator/)).

The **Pod** is the bridge-companion of a ship. It greets you when you board, clears the inbox, and runs the mission. When the work should fan out, it launches a sister ship to run a mission in parallel.

## What it does

- Reports the ship's `mode` and surfaces the mission state derived from [SDD](/sdd/overview/).
- Clears the ship's inbox — reads and acknowledges pending mail from other ships.
- Drives the mission forward in-ship, and spawns a sister ship (its own worktree + pane) when the work parallelizes.

## Related

- [Operator](/cyberfleet/operator/) — the fleet-level counterpart, run from outside a ship
- [cyberfleet Overview](/cyberfleet/overview/)
