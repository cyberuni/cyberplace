---
status: implemented
project-path: packages/cyberfleet
approval:
  spec:
    verdict: approve
    by: unional
    cause: dimension
    why:
      blast: medium — deletes the `init` and `mode` verbs from a v0 (unpublished) CLI, and with them the only two behavioral nodes this spec had. **Clearance hard floor**: the `@frozen` `init/` (4 scenarios) and `mode/` (4 scenarios) nodes are deleted outright from a `status: implemented` spec whose spec *and* impl gates were both ratified by unional personally under `cyberfleet-mode-init`. Justified (#225) because the capability gates nothing: `init` wrote `.agents/cyberfleet/ship.json` holding only `{version:1}`; its sole reader was `detectMode`; `detectMode`'s sole caller was the `mode` command itself; that command's sole callers were the two persona mode guards, deleted alongside. `missions`/`jump`/`pause`/`gate` never consulted mode, nor did any hook or statusline. Membership already lives in `cyberlegion unit register` → `AgentRecord` — the marker was a shadow registry with no readers. This spec becomes descriptive-only; the `missions`/`jump`/`pause`/`gate` backfill gap is declared and unchanged.
      basis: cold ACED spec-judge confirmed `mode`/`init` genuinely gone from the live CLI `--help`, zero `detectMode`/`initShip`/`ship.json` references left in any `.ts`/`.mts`, and no dangling pointer at the deleted node paths. 43 cyberfleet tests + root `pnpm verify` 21/21 green. Companion shard on the sibling `cyberfleet-plugin` spec — one CR, two touched specs.
      cr: cyberfleet-mode-pod-precondition
  impl:
    verdict: approve
    by: unional
    cause: dimension
    why:
      blast: medium — the implementation is a deletion. `src/{mode,init}.ts`, their tests, and the `mode`/`init` CLI verbs are gone; `BREAKING CHANGE` on a v0 (unpublished) CLI whose only consumers were the two persona mode guards removed in the same CR. No behavior changed elsewhere — `missions`/`jump`/`pause`/`gate` untouched.
      basis: cold ACED impl-judge verified against source that `mode`/`init` are absent from the live CLI `--help` (only `missions`/`jump`/`pause`/`gate` remain), that zero `detectMode`/`initShip`/`ship.json` references survive in any `.ts`/`.mts`, and that nothing in either persona, the marketplace readme, or the website docs still invokes them. No dangling pointer at the deleted node paths. 43 cyberfleet tests + root `pnpm verify` 21/21 green. This spec has no behavioral nodes to grade — descriptive-only by design; `missions` flagged as the highest-value backfill.
      cr: cyberfleet-mode-pod-precondition
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

<!-- BEGIN generated: by-concept (project-spec/concept-index) -->

## By concept

> Generated from `concept:` frontmatter by `project-spec/concept-index` — do not edit by hand.

| Concept | Facets |
|---|---|

<!-- END generated: by-concept -->
