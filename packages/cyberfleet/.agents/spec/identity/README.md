---
spec-type: behavioral
concept: [fleet]
---

# identity — self-identify and discover peers

The `cyberfleet` CLI's identity layer: an agent registers itself once, recovers its own identity
on every later call without an env var it cannot set for itself, and lists the other agents it can
address. Identity is what makes messaging and spawn work across harnesses — every peer, whatever
harness it runs in, appears in one registry keyed the same way.

## Use Cases

**Subject** — establishing and recovering an agent's identity and enumerating peers:

- **Register records who and where** — `cyberfleet register [--handle <h>]` writes
  `.cyberfleet/agents/<id>.json` (a self-assigned id, a human handle, the detected harness, cwd,
  git worktree, tmux pane if any, status, and timestamps) and a pane pointer
  `.cyberfleet/panes/<pane>.id`.
- **Self-recall is pane-keyed** — on any later call the agent recovers its own id from
  `panes/<$TMUX_PANE>.id`, because `$TMUX_PANE` is present on every in-tmux invocation, is written
  by exactly one pane, and cannot collide. Outside tmux it falls back to `$CYBERFLEET_AGENT_ID` or
  `.cyberfleet/self`.
- **Harness is auto-detected** — an explicit `--harness` wins; otherwise the harness is read from
  the tmux pane's running command (`claude` / `cursor-agent` / `codex`), the robust cross-harness
  signal; if nothing resolves, the CLI requires `--harness` rather than guessing.
- **`who` lists the addressable peers** — `cyberfleet who` prints the registry as a markdown table
  (handle, harness, cwd, pane, status, last-seen); a peer is addressable by its handle.
- **Every call refreshes liveness** — each CLI invocation bumps the agent's `lastSeen`, so the
  registry reflects which agents are active.

**Non-goals** — sending or reading messages (`messaging`); launching a new session (`spawn`);
the hard per-ship teardown that removes a worktree, session, and record (`decommission`); reaping
dead agents on a schedule (`prune` is covered here only as the *soft* liveness sweep — marking dead
agents `exited`, deleting nothing; automatic GC and a cross-repo registry root are deferred).

Every scenario in [`identity.feature`](./identity.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **register records who and where** | writes agents/<id>.json + panes/<pane>.id with the identity fields |
| **pane-keyed self-recall** | recovers own id from panes/<$TMUX_PANE>.id; non-tmux fallbacks |
| **harness auto-detect** | --harness wins, else pane command, else require --harness |
| **who lists peers** | markdown registry table; addressable by handle |
| **liveness on every call** | lastSeen refreshed each invocation |
