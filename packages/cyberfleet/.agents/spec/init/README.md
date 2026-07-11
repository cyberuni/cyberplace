---
spec-type: behavioral
concept: fleet
---

# init — commission a ship by writing cyberfleet's own marker

`cyberfleet init` makes the current working directory a **ship** — it writes cyberfleet's own
**minimal opt-in marker** `.agents/cyberfleet/ship.json` (a schema `version`), the flag `mode` reads
to report a ship. This is the birth of cyberfleet's fleet/ship concept, owned entirely by cyberfleet:
it does not touch `.agents/cyberlegion/` (cyberlegion's own `init` sets up the mail hook and the hub
space — a separate namespace and concern). A git repo's marker is tracked, so committing it carries
ship-ness to the primary and every worktree; a non-git folder becomes a lone ship the moment `init`
runs in it.

## Use Cases

**Subject** — creating cyberfleet's project-local opt-in marker so a directory becomes a ship,
idempotently:

- **init creates the marker when absent** — running `cyberfleet init` in a directory with no
  `.agents/cyberfleet/` writes `.agents/cyberfleet/ship.json` recording a schema `version` (the
  marker `mode` reads to report a ship; that detection is `mode`'s own contract).
- **init is idempotent** — running `cyberfleet init` where `.agents/cyberfleet/ship.json` already
  exists is a clean no-op: it reports the marker is already present, never overwrites it, and never
  errors.
- **init works without git** — a plain non-git folder gets the marker just the same; ship-ness does
  not require a git repository (a git repo only lets the tracked marker travel to worktrees).

**Non-goals** — `cyberfleet mode`, which *reads* the marker (`mode/`); cyberlegion's `init`, which
sets up the mail-surfacing hook and the hub space (a different namespace and concern); the ship's
**blueprint** — capturing a ship's live layout (its sectors/panes and what runs in each) so re-entry
rebuilds it on the bridge console, a Pod-driven action taken on request and a separate future CR,
never written by `init`; the **fleet** grouping concept (deferred); spawning a worktree-ship
(`cyberlegion unit spawn` — the tracked marker rides along for free).

Every scenario in [`init.feature`](./init.feature) maps to one of these behaviors.
