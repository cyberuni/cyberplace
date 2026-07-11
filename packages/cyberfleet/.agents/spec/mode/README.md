---
spec-type: behavioral
concept: fleet
---

# mode — ship vs command-center, keyed on cyberfleet's own marker

`cyberfleet mode` reports whether this working directory is a **ship** (a place fleet work runs) or
the **command-center** (off any ship). Ship and command-center are cyberfleet's own concepts —
cyberlegion knows only units, panes, and worktrees — so the signal is cyberfleet's **own** marker,
`.agents/cyberfleet/` (its `ship.json`), created by `cyberfleet init`. This node re-bases the signal
off cyberlegion's private `.agents/cyberlegion/config.json` (a layer violation: the fleet layer was
inferring its own concept from the foundation's internal marker) onto cyberfleet's namespace, so the
dependency on cyberlegion stays one-way and by-intent (ADR-0021).

## Use Cases

**Subject** — classifying the current working directory as `ship` or `command-center` by the presence
of cyberfleet's own tracked marker at the project root, independent of git and of any cyberlegion
state:

- **A directory carrying the marker is a ship** — `.agents/cyberfleet/ship.json` present at the
  project root ⇒ `mode: ship`. This is the sole ship signal.
- **A directory with no marker is the command-center** — no `.agents/cyberfleet/` marker ⇒
  `mode: command-center`. Command-center is *off-ship* (a neutral spot, a fresh clone before init),
  never "the primary checkout" — the primary is a ship like any other once the fleet is initialized.
- **Git shape does not change the verdict** — a git **primary** checkout, a git **linked worktree**,
  and a **non-git** folder are all equal: with the marker they are each a ship, without it each the
  command-center. Because the marker is tracked, it travels to the primary and every worktree, so a
  spawned worktree is a ship for free and a plain non-git folder becomes a ship the moment `init`
  writes the marker there.

**Non-goals** — `cyberfleet init`, which *creates* the marker (`init/`); `mode`'s other reported
fields — `fleetRoot` (the shared cyberlegion hub root every fleet call resolves against) and
`cwdRoot` — which this CR leaves unchanged, to be captured in a fuller `mode` backfill; the **fleet**
grouping concept (multiple ships) — deferred until a command-center operation acts on a particular
fleet, so `mode` reports only ship-vs-command-center, never a fleet identity; the mission/Council
view (`missions/`); the cyberlegion marker's own meaning (a legion root — cyberlegion's private
concern).

Every scenario in [`mode.feature`](./mode.feature) maps to one of these behaviors.
