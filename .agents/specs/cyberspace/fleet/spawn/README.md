---
spec-type: behavioral
concept: [fleet]
---

# spawn — launch a new peer session and hand it its brief

The `cyberfleet` CLI's spawn layer: launch a new top-level agent session as a peer (not a nested
subagent) in a tmux split, register it before it starts, and deliver its task brief through its own
SessionStart hook rather than by typing into its prompt. This is the harness-agnostic peer-session
escape hatch (`../../../sdd/design/harness-spawning.md`) generalized into a first-class command.

## Use Cases

**Subject** — creating a peer session with an identity and a brief:

- **Spawn opens a new pane and pre-registers the peer** — `cyberfleet spawn --harness <h> --task
  <t>` runs `tmux split-window` to get a fresh pane id, then writes the spawnee's
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
- **Spawn requires tmux** — outside a tmux session spawn reports that it needs tmux rather than
  failing obscurely.

**Non-goals** — nesting a subagent inside the current session (that is the harness's own subagent
tooling, not fleet); a live nudge to a peer's prompt (deferred); surfacing the brief or inbox
itself, which is `surfacing`; tearing down a finished peer and reaping its state (deferred with
`prune`).

Every scenario in [`spawn.feature`](./spawn.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **open pane + pre-register** | tmux split; agents/<id>.json + panes/<pane>.id written with status spawning, spawnedBy |
| **brief written to a file** | brief.md from --task/--task -/--brief-file; never typed |
| **per-harness launch** | pane started with claude / cursor-agent / codex |
| **peer picks up brief at start** | spawnee SessionStart hook resolves self, injects brief.md |
| **requires tmux** | reports the tmux requirement outside a tmux session |
