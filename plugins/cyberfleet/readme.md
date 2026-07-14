# cyberfleet

A harness-agnostic, MCP-free way to direct a fleet of AI-agents across your projects.

You're the **Council** — the human. You give directions and make decisions; the fleet is
autonomous and carries them out.

## Pod

The **Pod** is the bridge-companion automaton of a ship. A ship is a workspace: a folder, a
repository, or a worktree; your fleet is all the ships you've enlisted, across one project or many.
Pod greets you, clears the inbox, and runs the mission. When the work should fan out, it tells you
that spawning a sister ship is the Operator's job, which you invoke directly — Pod never spawns.

## Operator

The **Operator** is the dispatcher automaton of the **fleet** — it spawns every ship (your first, a
new peer session, or a parallel worktree-ship on a project already in flight),
lists who's out there, routes messages between ships, and sweeps away the dead ones.
It's where you survey the fleet and decide what sails next.

## Crimp

Crew don't come bundled — the **Crimp** recruits them from the **Tavern**, the storefront of
installable **crews**, each a specialist you command through its own persona. Browse the roster,
pick the hands you need, and the Crimp signs them on.

## Mechanic _(coming soon)_

The **Mechanic** works the bench — it stamps a fresh automaton when the fleet needs one, and once a
crew is aboard it adjusts how that crew runs: the guidance it follows, the model it uses, how hard it
thinks, and how much leash it has before it checks back with you.

## The console

Under the automatons sits the `cyberfleet` **console** — the CLI. It's cold and deterministic:
identity, messaging, spawning sessions, worktrees, and nothing more. The plugin (this one) adds the
**automaton** layer on top — Pod, Operator, and the crew are the agents that reason about the
situation and reach for the right `cyberfleet` command underneath. Two artifacts, one name: the
console is the mechanics, the automatons are the agency that drives them.

## The control panel

Each ship runs live in its own terminal pane, and cyberfleet drives your multiplexer to manage them
— opening a pane per ship, reading what's happening inside, and closing it when the work is done. The
whole fleet lays out as panes you can see and jump between, like a control panel of running ships.
Two multiplexers work today: **tmux**, and **herdr** — an agent-aware one that also reports whether
each ship is working, idle, or blocked. cyberfleet detects which you're running and drives it.

## Why no MCP

The usual way to wire agents together is MCP — which means running a server: a process to start, a
port to hold open, config to add to every harness. cyberfleet needs none of it.

- **Nothing to run.** No server, no port, no daemon to keep alive or secure — coordination lives in
  the project itself and rides each harness's own session-start hook.
- **Harness-agnostic by construction.** No vendor-specific protocol, so Claude Code, Cursor, and
  Codex all join the same fleet with no per-harness glue.
- **Portable and inspectable.** It's one `cyberfleet` command end to end — easy to script, log, and
  debug, with nothing extra to stand up per project.

## Installation

Install the plugin:

```bash
npx skills add cyberuni/cyberplace --plugin cyberfleet --global
```

Optionally, install the `cyberfleet` CLI globally if you want to run it from the command line:

```bash
npm install -g cyberfleet

pnpm add -g cyberfleet

bun add -g cyberfleet

yarn add -g cyberfleet
```
