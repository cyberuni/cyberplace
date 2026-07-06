---
title: Operator
description: The dispatcher automaton of the fleet — commission ships, list who's out there, route messages, sweep the dead.
---

Part of the [cyberfleet plugin](/cyberfleet/overview/) — see that page for install instructions.

**Trigger:** invoked when you're **outside a ship** — surveying the fleet and deciding what sails next. Not for in-ship mission work (that's the [Pod](/cyberfleet/pod/)).

The **Operator** is the dispatcher of the fleet. It's where you survey what's out there and decide what sails next.

## What it does

- Commissions your first ship and spawns new ones on demand.
- Lists the live ships and, via `cyberfleet missions`, which need the Council's hands — ships × mission × gate × leash, derived from [SDD](/sdd/overview/) state.
- Routes messages between ships and sweeps away the dead ones.

## Related

- [Pod](/cyberfleet/pod/) — the in-ship counterpart
- [cyberfleet Overview](/cyberfleet/overview/)
