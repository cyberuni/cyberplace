---
status: implemented
project-path: packages/cyberfleet
---

# cyberfleet — the fleet layer over cyberlegion

> Root project spec — the **descriptive** top index for the `cyberfleet` **CLI** (the npm package
> at `packages/cyberfleet`). This project is a thin **fleet layer** built on top of the
> `cyberlegion` mechanism package. It carries only the fleet-specific verbs; the agent-behavior half
> — the `fleet` persona gateway and the `crew` personas — lives in the sibling `cyberfleet-plugin`
> project (`../../.agents/specs/cyberfleet-plugin`, source `plugins/cyberfleet`).

## What this is

The `cyberfleet` CLI turns the metaphor-free `cyberlegion` mechanism (spawn a session, carry mail,
identify peers) into a **fleet** view: ships, missions, and the Council. It **depends up** on
`cyberlegion` — the harness-agnostic, MCP-free primitive that owns session lifecycle, the file
mailbox, identity/registry, and hook surfacing. cyberfleet adds nothing to that mechanism; it wraps
it in the fleet's own operations.

The dependency is **by intent** (ADR-0021): cyberfleet imports `cyberlegion` as a workspace library
for its own verbs, and a fleet persona runs the mechanism verbs against the `cyberlegion` CLI
directly (`cyberlegion identity register`, `cyberlegion mail send`, `cyberlegion session spawn`, …).
cyberfleet does **not** re-expose those mechanism verbs — that duplication is exactly what the
extraction removed.

## What cyberfleet owns (fleet verbs)

Only the verbs with genuine fleet logic live here — everything else is `cyberlegion`'s:

| Verb | What |
|---|---|
| `cyberfleet mode` | report **ship** (a spawned unit worktree) vs **command-center**, and the shared fleet root |
| `cyberfleet missions` | the Council view — ships × mission × gate × leash, **derived from SDD state** (the one place cyberfleet reads SDD) |
| `cyberfleet jump <peer>` | select/focus a ship's session (tmux pane), or print its worktree path to `cd` into |
| `cyberfleet pause <peer>` | flip a ship record to `status: paused` — a marker only (**not** a bridge to SDD's `pause-mission` checkpoint; that gap is flagged, never papered over) |
| `cyberfleet gate approve` | **stubbed** — a human ratification cannot be safely relayed through this CLI (the relayed-ratification seam); it prints what it would write and exits non-zero |

## Where the mechanism went

The identity / messaging / session-spawn / decommission / surfacing behaviors were **extracted into
`cyberlegion`** (`packages/cyberlegion/.agents/spec/` — nodes `identity`/`mail`/`session`/
`surfacing`, plus `dispatch`/`wake`/`agent`). Those are the canonical, frozen behavioral scenarios
now; cyberfleet no longer owns or re-describes them.

## Placement map

Where a new concept lives — slot here, do not invent placement:

- **a new fleet-status / mode operation** (ship vs command-center, the shared root) → the `mode`
  surface.
- **a new Council/mission-view operation** (joining ships to SDD mission/gate/leash state) → the
  `missions` surface — the only place cyberfleet reads SDD.
- **a new ship-navigation operation** (focus a pane, resolve a worktree path) → the `jump` surface.
- **a new mechanism operation** (identity, mail, session spawn/teardown, surfacing, dispatch, wake)
  → **not here** — that is `cyberlegion` (`packages/cyberlegion`). cyberfleet depends up on it.
- **a new persona / mode-switch / crew behavior** (when to spawn, message etiquette, recruit or tune
  a crew) → **not here** — that is the `cyberfleet-plugin` project (`plugins/cyberfleet`).

## Backfill gap (known)

The fleet verbs above are **implemented** (in `src/cli.ts`, `src/missions.ts`, `src/mode.ts`, with
smoke coverage in `src/cli.test.ts`) but are **not yet captured as behavioral spec nodes** — this
root index is descriptive only. Backfilling `mode` / `missions` / `jump` / `pause` as behavioral
nodes (with `.feature` suites) is a future change request; it was out of scope for the reconciliation
that removed the extracted mechanism nodes.
</content>
</invoke>
