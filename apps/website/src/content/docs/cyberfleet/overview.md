---
title: cyberfleet Overview
description: A harness-agnostic, MCP-free way to direct a fleet of AI agents across your projects — Pod, Operator, Crimp, and Mechanic over the cyberfleet console.
---

**cyberfleet** is a harness-agnostic, MCP-free way to direct a fleet of AI agents across your projects. It is the fleet-persona layer on top of [cyberlegion](/cyberlegion/overview/) — it carries only fleet-specific logic (ships, missions, and the Council view, derived from [SDD](/sdd/overview/) state), while the mechanism verbs (register, send, spawn, prune, …) run through the `cyberlegion` console underneath.

You're the **Council** — the human. You give directions and make decisions; the fleet is autonomous and carries them out.

## The automatons

A **ship** is a workspace: a folder, a repository, or a worktree. Your fleet is all the ships you've enlisted, across one project or many.

| Automaton | Where it runs | What it does |
|---|---|---|
| [**Pod**](/cyberfleet/pod/) | Inside a ship (has `.agents/cyberlegion/`) | The bridge-companion of a ship — greets you, clears the inbox, runs the mission, and launches a sister ship when the work should fan out |
| [**Operator**](/cyberfleet/operator/) | Outside a ship, over the fleet | The dispatcher — commissions your first ship, lists who's out there, routes messages between ships, and sweeps away the dead ones |
| [**Crimp**](/cyberfleet/crimp/) | The Tavern storefront | Recruits **crews** — installable specialist personas — signs them on, and discharges them |
| [**Mechanic**](/cyberfleet/mechanic/) *(coming soon)* | The bench, over any automaton | Builds a new automaton and reconfigures existing ones — guidance, model, effort, loadout, and leash |

## The console

Under the automatons sits the `cyberfleet` **console** — the CLI. It's cold and deterministic: identity, messaging, spawning sessions, worktrees, and nothing more. The plugin adds the **automaton** layer on top — Pod, Operator, and the crew are the agents that reason about the situation and reach for the right `cyberfleet` command underneath. Two artifacts, one name: the console is the mechanics, the automatons are the agency that drives them.

| Command | What it does |
|---|---|
| `cyberfleet mode` | Report ship vs command-center, and the shared fleet root |
| `cyberfleet missions` | Who needs the Council's hands — ships × mission × gate × leash, derived from SDD state |
| `cyberfleet jump <peer>` | Select/focus a ship's session, or print its worktree path to `cd` into |
| `cyberfleet pause <peer>` | Flip a ship's status marker (**not** the SDD `pause-mission` checkpoint) |
| `cyberfleet gate approve <cr> <gate>` | Council ratification — **stubbed**; a human-attributed gate write can't be safely relayed via CLI |

## The control panel

Each ship runs live in its own terminal pane, and cyberfleet drives your multiplexer to manage them — opening a pane per ship, reading what's happening inside, and closing it when the work is done. The whole fleet lays out as panes you can see and jump between. Two multiplexers work today: **tmux**, and **herdr** — an agent-aware one that also reports whether each ship is working, idle, or blocked. cyberfleet detects which you're running and drives it.

## Why no MCP

The usual way to wire agents together is MCP — which means running a server: a process to start, a port to hold open, config to add to every harness. cyberfleet needs none of it.

- **Nothing to run.** Coordination lives in the project itself and rides each harness's own session-start hook — no server, port, or daemon.
- **Harness-agnostic by construction.** No vendor-specific protocol, so Claude Code, Cursor, and Codex all join the same fleet with no per-harness glue.
- **Portable and inspectable.** One `cyberfleet` command end to end — easy to script, log, and debug.

## Installation

```bash
npx skills add cyberuni/cyberplace --plugin cyberfleet --global
```

Optionally install the `cyberfleet` CLI globally to run it from the command line:

```bash
npm install -g cyberfleet
```

## Related

- [cyberlegion Overview](/cyberlegion/overview/) — the mechanism layer cyberfleet builds on
- [Tavern](/tavern/) — the storefront of installable crews the Crimp recruits from
- [SDD Overview](/sdd/overview/) — the mission state the Council view is derived from
