# cyberfleet — the fleet persona layer

Two gateway skills that give the `cyberfleet` CLI a face, split by where you are (ADR-0022):
**Pod** (the ship's bridge) when you're inside an initialized ship, **Operator** (the command
center) when you're not. The CLI itself stays cold and mechanical — every mechanic either persona
speaks through is a `cyberfleet` call; the warmth lives only in these skills.

## Naming collision, intentional

`cyberfleet` names two different artifacts on purpose: the **CLI** (`packages/cyberfleet`, the
cold console — identity, messaging, spawn, worktrees) and this **plugin** (the warm layer — Pod
and Operator). Mirrors `universal-plugin` (npm package) vs. the skills that ride on it.

## Skills

| Skill | When it activates |
|---|---|
| `pod` | Working directory is a **ship** (a project root carrying `.cyberfleet/`) — runs the mission, checks the inbox, hails specialist crew. |
| `operator` | Working directory is **not** a ship — spawns/lists ships, routes messages across the fleet. |

Mode is decided by `.cyberfleet/`-dir presence alone (`cyberfleet mode`), never by any SDD state.
Each skill defers to the other when the mode doesn't match.

## What's not here

HAL (the above-leash self-assertion tell) and the `cyberfleet missions --json` query view are a
later change request (see `artifacts/adr/0022-cyberfleet-persona.md`, decisions 6 and 10).

## Installation

```bash
npx skills add cyberuni/cyberplace --plugin cyberfleet
```

Requires the `cyberfleet` CLI on PATH (or invoked via pinned `npx cyberfleet@<version>`).
