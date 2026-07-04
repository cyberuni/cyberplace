---
spec-type: behavioral
concept: [fleet]
---

# spawn — launch a new peer session and hand it its brief

The `cyberfleet` CLI's spawn layer: launch a new top-level agent session as a peer (not a nested
subagent) in its own git worktree, register it before it starts, and deliver its task brief through
its own SessionStart hook rather than by typing into its prompt. This is the harness-agnostic
peer-session escape hatch (`../../sdd/design/harness-spawning.md`) generalized into a
first-class command. Per ADR-0022 (decisions 8–9): a ship is a git worktree, and the session pane
is opened through one of two swappable backend adapters — tmux or herdr.

## Use Cases

**Subject** — creating a peer session with an identity and a brief:

- **Spawn opens a new pane and pre-registers the peer** — `cyberfleet spawn --harness <h> --task
  <t>` opens a fresh pane via the selected session backend, then writes the spawnee's
  `agents/<id>.json` (harness, the new pane, `status: spawning`, `spawnedBy` = the spawner) and its
  `panes/<pane>.id` before the session launches, so the peer's identity exists the moment it starts.
- **The brief is written to a file, not typed** — the task (`--task <text>`, `--task -` for stdin,
  or `--brief-file <path>`) is written to `.cyberfleet/data/<id>/brief.md`; the spawn never depends
  on the new session being at a prompt.
- **The runtime is launched per harness** — the pane is started with that harness's own CLI via a
  per-harness launch map (`claude`, `cursor-agent`, `codex`).
- **The peer picks up its own brief at start** — on launch the spawnee's SessionStart hook resolves
  itself by pane, finds its pre-registered id and its `brief.md`, and has the brief injected into
  its context; the spawner does not type the task in.
- **A ship is a git worktree** — spawn first creates a real `git worktree` (default branch
  `cyberfleet/ship-<id>`, default path under `.cyberfleet/worktrees/<id>`, both overridable via
  `--branch` / `--worktree-path`), then opens the new pane with its cwd set to that worktree's
  root — never the spawner's own cwd. The created worktree is recorded on the peer's
  `agents/<id>.json` under `worktree.root` / `worktree.branch`.
- **The flagship rule** — a ship's resolved worktree root must be distinct from the primary
  checkout (the flagship); spawn refuses with a clear error rather than opening a session inside
  the primary checkout.
- **The session backend is chosen by environment** — `$TMUX` selects the tmux adapter, `$HERDR_ENV`
  selects the herdr adapter (real busy-state: working / idle / blocked); neither present errors
  clearly rather than failing obscurely.

**Non-goals** — nesting a subagent inside the current session (that is the harness's own subagent
tooling, not fleet); a live nudge to a peer's prompt (deferred); surfacing the brief or inbox
itself, which is `surfacing`; tearing down a finished peer, its worktree, and reaping its state
(deferred with `prune`); zellij/orca backends (deferred).

Every scenario in [`spawn.feature`](./spawn.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **open pane + pre-register** | session backend split; agents/<id>.json + panes/<pane>.id written with status spawning, spawnedBy |
| **brief written to a file** | brief.md from --task/--task -/--brief-file; never typed |
| **per-harness launch** | pane started with claude / cursor-agent / codex |
| **peer picks up brief at start** | spawnee SessionStart hook resolves self, injects brief.md |
| **ship = worktree** | real git worktree created per ship, pane cwd set to it, worktree recorded on the agent record, --branch/--worktree-path overrides |
| **flagship rule** | refuses when the resolved worktree root equals the primary checkout |
| **console = two adapters** | backend selected by $TMUX / $HERDR_ENV; errors clearly when neither is set |
