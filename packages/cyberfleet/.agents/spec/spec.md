---
status: draft
project-path: packages/cyberfleet
approval:
  spec:
    verdict: approve
    by: unional
    cause: dimension
    why:
      blast: low — new opt-in marker + mode re-base on an unpublished (v0) CLI; first two behavioral nodes on a previously descriptive-only spec
      basis: ratified in-session; final cold spec-judge ALIGNED (oracle/builder/architect); mechanical state/suite/gherkin/structure green; init reshaped to a minimal marker per review
      cr: cyberfleet-mode-init
  impl:
    verdict: approve
    by: unional
    cause: dimension
    why:
      blast: low — deterministic detectMode re-base + a new parameterless `init` command on a v0 CLI; no behavior changed elsewhere
      basis: cold impl-judge PASS — all 8 frozen scenarios independently re-derived and verified; no scope creep; plugin persona sweep correct; 58 cyberfleet tests + root pnpm verify 19/19 green
      cr: cyberfleet-mode-init
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

A **ship** is a working session an agent runs a mission in. It is **not** a marked directory: there
is no on-disk ship marker and no mode detection (#225 — `init`/`mode` deleted; the marker gated no
capability and its only reader was the command that reported it). A session's fleet membership is its
`cyberlegion unit register` record, which is what `missions` actually enumerates — the registry is
the only membership fact, and there is no second one on disk. **Command-center** survives only as the
Operator persona's seat, asserted by invoking that skill; it is not a detectable state of a folder.
**Fleet** (a group of ships) is a deferred concept — undefined until an operation needs to act on one.

The dependency is **by intent** (ADR-0021): cyberfleet imports `cyberlegion` as a workspace library
for its own verbs, and a fleet persona runs the mechanism verbs against the `cyberlegion` CLI
directly (`cyberlegion unit register`, `cyberlegion mail send`, `cyberlegion unit spawn`, …).
cyberfleet does **not** re-expose those mechanism verbs — that duplication is exactly what the
extraction removed.

## What cyberfleet owns (fleet verbs)

Only the verbs with genuine fleet logic live here — everything else is `cyberlegion`'s:

| Verb | What |
|---|---|
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

- **a ship-commissioning or mode-detection operation** → **nowhere — the concept is retired** (#225).
  There is no ship marker to write or read and no ship-vs-command-center state to report. A session
  joins the fleet by registering with `cyberlegion unit register`; that record is the only membership
  fact. Do not reintroduce an on-disk marker without a consumer that genuinely gates on it.
- **a new Council/mission-view operation** (joining ships to SDD mission/gate/leash state) → the
  `missions` surface — the only place cyberfleet reads SDD.
- **a new ship-navigation operation** (focus a pane, resolve a worktree path) → the `jump` surface.
- **a new mechanism operation** (unit, mail, unit spawn/close, surfacing, dispatch, wake)
  → **not here** — that is `cyberlegion` (`packages/cyberlegion`). cyberfleet depends up on it.
- **a new persona / crew behavior** (when to spawn, message etiquette, recruit or tune a crew) →
  **not here** — that is the `cyberfleet-plugin` project (`plugins/cyberfleet`).
- **a fleet-level operation over a group of ships** (act on a particular fleet) → **deferred** — the
  **fleet** grouping (which ships form a fleet) is not defined until the first such verb needs it.

## Behavioral nodes

**None.** This spec is descriptive-only. The `init/` and `mode/` nodes were deleted by #225 along
with the verbs they specified; the remaining verbs are the backfill gap below.

## Backfill gap (known)

Every fleet verb — `missions` / `jump` / `pause` / `gate approve` — is **implemented** (in
`src/cli.ts`, `src/missions.ts`, with smoke coverage in `src/cli.test.ts`) but **not captured as a
behavioral node**. Backfilling them (with `.feature` suites) is a future change request; `pause` and
`gate approve` carry open design questions (dissolve-vs-bridge, the relayed-ratification seam) to
settle at that time. `missions` is the highest-value backfill: it is now the CLI's whole reason to
exist, and the `hal` field it derives is load-bearing for the Pod persona.

