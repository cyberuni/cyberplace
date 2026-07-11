---
spec-type: behavioral
concept: fleet
---

# init — commission a ship by writing cyberfleet's own marker

`cyberfleet init` makes the current working directory a **ship** — it writes cyberfleet's own marker
`.agents/cyberfleet/ship.json`, the opt-in that `mode` reads and the home for the ship's own
settings. This is the birth of cyberfleet's fleet/ship concept, owned entirely by
cyberfleet: it does not touch `.agents/cyberlegion/` (cyberlegion's own `init` registers the mail
hook — a separate concern). A git repo's marker is tracked, so committing it carries ship-ness to the
primary and every worktree; a non-git folder becomes a lone ship the moment `init` runs in it.

## Use Cases

**Subject** — creating and populating cyberfleet's project-local marker so a directory opts into being
a ship, idempotently:

- **init creates the marker when absent** — running `cyberfleet init` in a directory with no
  `.agents/cyberfleet/` writes `.agents/cyberfleet/ship.json`, after which `cyberfleet mode` at that
  root reports `ship`.
- **ship.json carries the ship's settings** — the written config records the ship's own
  settings: a schema `version`, the default `harness` for commissioned ships, and the default spawn
  placement `at`, with sane defaults when the caller passes none; an optional `space` hub binding is
  recorded only when given. These are cyberfleet's settings, not a copy of cyberlegion unit state or
  SDD mission state.
- **flags override the defaults** — `cyberfleet init --harness <h> --at <placement>` records the given
  values in `ship.json` instead of the defaults.
- **init is idempotent** — running `cyberfleet init` where `.agents/cyberfleet/ship.json` already
  exists is a clean no-op: it reports the marker is already present, never overwrites the existing
  config, and never errors.
- **init works without git** — a plain non-git folder gets the marker just the same; ship-ness does
  not require a git repository (a git repo only lets the tracked marker travel to worktrees).
- **init never touches cyberlegion's marker** — writing the cyberfleet marker creates or modifies
  nothing under `.agents/cyberlegion/`; the two namespaces are independent (cyberlegion's own `init`
  registers the mail hook, a separate concern).

**Non-goals** — `cyberfleet mode`, which *reads* the marker (`mode/`); cyberlegion's `init`, which
registers the mail-surfacing hook and binds the owner pane (a different namespace and concern);
spawning a worktree-ship (`cyberlegion unit spawn` — the marker rides along for free, no cyberfleet
step needed); the **fleet** grouping concept (deferred); the persona that decides *when* to
commission (the cyberfleet-plugin Operator). **No input validation** — an unrecognized `--harness` or
`--at` value is recorded in `ship.json` as given; init does not validate flag values.

Every scenario in [`init.feature`](./init.feature) maps to one of these behaviors.
