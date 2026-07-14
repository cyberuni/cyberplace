---
name: github-212-standing-council-inbox
status: active
todos:
  - content: "explore: map current state; owner decisions (council / split seat / partition) — DONE"
    status: done
  - content: "spec: draft unit/registry + mail/doorbell additive scenarios; cold spec-judge rounds"
    status: in_progress
  - content: "spec gate: HITL ratification (owner) — freeze suite, status approved"
    status: pending
  - content: "deliver: presence binding + spawn-capability gate; doorbell rings presence unconditionally"
    status: pending
  - content: "impl gate: cold impl-judge vs frozen .feature; pnpm verify green"
    status: pending
  - content: "handoff: PR (does NOT close #212); file sibling CR-B + CR-C; mail owner"
    status: pending
---

# CR github-212 — standing Council mailbox + the active-Operator seat

Source: [cyberuni/cyberplace#212](https://github.com/cyberuni/cyberplace/issues/212). Blocks #137.

Target spec: `packages/cyberlegion/.agents/spec` (project `packages/cyberlegion`, status
`implemented`). **This CR is CR-A only** — see Partition.

## Owner decisions (RATIFIED in-session, explore)

1. **Mailbox handle `legate` -> `council`.** Names the durable principal, not a seat. The CLI stays
   metaphor-free ("standing owner"); `council` is a fleet-layer handle *value*.
2. **Seat is SPLIT from the read-pane.** `attach` main-pane stays the human read-pane (focus-gated,
   per ratified #172). A **distinct seat pointer** names the live unit standing in for the Council:
   gated on **spawn capability** (mux probe), rung **unconditionally**. Reusing `attach` would force
   dropping the focus gate for the tick — but the loop must fire precisely when the human is away.

## What explore found (reshapes the issue's scope)

The issue assumes the standing machinery is missing. It is not:

- `registerStanding` / `standingId` / `kind: 'standing'` exist; prune-exempt AND reconcile-exempt
  (`packages/cyberlegion/src/identity.ts`). `unit register --standing --handle <x>` ships today.
- `init-cyberlegion` already runs `unit register --standing --handle legate`.
- `wakeRecipient` already rings `store.getMainPane()` for a standing recipient
  (`src/console/doorbell.ts:74`), behind a focus gate.
- Live hub state: exactly one standing record (`standing-legate`). **The handle `operator` — what
  every Pod addresses — has no standing record.** That is the incident's whole root cause.

So the CR is **not** "build standing records". It is: point the reporting path at the standing
mailbox, rename it, and add the seat + its spawn-capability gate.

## Freeze / gate

Project spec is `implemented`; touched `.feature` suites are `@frozen`. Additive scenarios
self-clear; any narrowing of an existing frozen scenario needs a ratified re-open — surface, never
narrow silently. Spec gate + impl gate are **HITL** (owner ratifies at the PR; never on a relay).

## NEXT

Explore. Awaiting the consumer-side sweep (who addresses `operator`/`legate`; where the Operator
seat is defined; the metaphor-boundary doctrine). Then decide the **CR partition**: the seat +
gate land in `packages/cyberlegion` (metaphor-free); the `legate`->`council` rename touches
`plugins/cyberlegion` + `plugins/cyberfleet` + `init` + docs — a second project spec. If the rename
cannot ride this CR cleanly, split it and file the sibling CR rather than straddling two specs.

## Partition (RATIFIED by owner)

#212's scope spans **three** project specs. One CR per spec; **this mission is CR-A**.

| CR | Project | Scope | State |
|---|---|---|---|
| **CR-A** | `packages/cyberlegion` | the **neutral** seat mechanism: a standing record gains a bound **presence** (the live unit standing in for it), gated on **spawn capability**; the doorbell rings a bound presence **unconditionally**, read-pane stays focus-gated | **this mission** |
| CR-B | `plugins/cyberlegion` (draft) | `legate` -> `council` rename; `init-cyberlegion` mints `council` | file at handoff |
| CR-C | `plugins/cyberfleet` (implemented) | the Operator **claims** the seat; a delivery summons a tick that pulls `ready` | file at handoff |

**CR-A does not close #212** — #212 closes when CR-C lands. PR body: `Refs #212`, never `Closes`.

**Metaphor floor (hard).** `packages/cyberlegion` is the metaphor-free foundation
(`.agents/spec/spec.md:34-42`). It must **never** learn the words Operator / Council / legate —
that is exactly the leak reverted under #159 (`github-159-doorbell-bunker.log.jsonl:3`, cause
`metaphor-leak-in-metaphor-free-package`). CR-A names only: **standing owner**, **presence**,
**bound main pane**, **spawn capability**. `council` is CR-B's handle *value*, never a package word.

## CR-A design

The split falls out of **already-ratified** doctrine rather than contradicting it. `mail/doorbell`
already says a peer's live pane is rung regardless of focus, because "a peer is an agent expected to
take the turn, not a human whose attention is the scarce resource." A bound presence **is** an agent
-> it inherits the peer rule. The focus gate stays exactly where it was: on the human read-pane.

- **`unit claim <handle>`** binds the caller's unit as that standing owner's **presence** (hub
  singleton per standing record, last-claim-wins). `--clear` unbinds, `--show` reads.
- **Gated on spawn capability, not on "is a subagent"** — a caller whose `probeMultiplexer` reports
  `none` has no ships and may not hold the seat; it throws. `mux`'s probe already exists and already
  honors `CYBERLEGION_MUX=none` as an override.
- **Presence resolves live-only** — an exited presence unit reads as *no presence*, never a corpse
  (the #214 rule, applied to the seat).
- **Doorbell**: standing recipient with a live bound presence -> ring the presence unit's pane
  **unconditionally**; else fall back to the bound main pane, **focus-gated** (unchanged).

### Touched nodes (all additive)

- `unit/registry` — presence binding + spawn-capability gate + live-only resolution
- `mail/doorbell` — presence-aware ring + fallback
- `attach` — README non-goal only (read-pane is not the seat); no scenario change

Additive scenarios on a frozen `.feature` **self-clear** (stay `@frozen`, no re-open). Narrowing an
existing frozen scenario needs a ratified re-open — surface, never narrow silently.

## Deferred to CR-C (do not build here)

The doctrinal tension is real and belongs to cyberfleet, not the package:
`headless-operator.md:41` freezes "**ready is a pull query, not a service**" and `:25` "**not a
daemon**". A delivery->nudge->ready wire is a *push* edge. Frame it as **the doorbell summons a tick
that then pulls** and both survive; frame it as *push-delivered ready* and it re-opens
`operator.feature:114`/`:157`. CR-A ships only the ring; it asserts no tick policy.

## Known adjacent debt (surfaced, not fixed here)

- `.agents/specs/cyberfleet-plugin/` states the Operator's marker path **three different ways**
  (`.agents/cyberlegion/` vs `.agents/cyberfleet/` vs bare `.cyberfleet/`) — and that predicate is
  what defines the seat today. Resolve inside CR-C while `operator.feature` is open.
- `plugins/cyberlegion/skills/legate/SKILL.md` still scrapes `npx cyberlegion@<version>` from prose
  instead of the `pins.json` contract. Adjacent to CR-B's touch-set.
