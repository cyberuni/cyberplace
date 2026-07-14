---
title: Operator
description: The dispatcher automaton of the fleet — spawn ships, list who's out there, route messages, sweep the dead.
---

Part of the [cyberfleet plugin](/cyberfleet/overview/) — see that page for install instructions.

**Trigger:** invoked for fleet-level dispatch — spawning, listing, and pruning ships, and routing messages between sessions. Invoking the skill is what seats Operator; it holds the seat wherever you invoke it, including inside a project you're already working in. Not for in-ship mission work (that's the [Pod](/cyberfleet/pod/)).

The **Operator** is the dispatcher of the fleet. It's where you survey what's out there and decide what sails next.

## What it does

- Spawns every ship — your first, a new peer session, or a parallel worktree-ship on a project that's already a ship. All spawning is Operator's; Pod never spawns.
- Lists the live ships and, via `cyberfleet missions`, which need the Council's hands — ships × mission × gate × leash, derived from [SDD](/sdd/overview/) state.
- Routes messages between ships and sweeps away the dead ones.

## Related

- [Pod](/cyberfleet/pod/) — the in-ship counterpart
- [cyberfleet Overview](/cyberfleet/overview/)
