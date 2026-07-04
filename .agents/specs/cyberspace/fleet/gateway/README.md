---
spec-type: behavioral
concept: [fleet]
---

# gateway — the fleet persona: Pod (ship) and Operator (command center)

The user-facing entry to the fleet. Per ADR-0022, the single gateway skill described below split
into **two** persona gateway skills shipped in the `cyberfleet` plugin (`plugins/cyberfleet/skills/`,
not `cyberspace`) — **Pod** (activates inside a ship — a project root carrying the tracked
`.cyberfleet/config.json` marker, whether that root is the primary checkout or a worktree spawned
from it) and **Operator** (activates outside any ship — an uninitialized or neutral folder). Mode
is decided by the tracked marker's presence alone (`cyberfleet mode`), never by SDD state. Each
defers to the other when the mode doesn't match. Because the marker is tracked in git (the rest of
`.cyberfleet/` is gitignored volatile state), it travels to every worktree — the primary and every
worktree it spawns are all ships; there is no flagship/command-center split by checkout identity.
Pod, already inside a ship, may spawn further worktree-ships for parallel work; Operator's job is
initializing or spawning the fleet's first ship and routing across ships from outside. The
behaviors below (offload to `cyberfleet`, register + inbox + ack, self-contained briefs,
harness-agnostic + MCP-free) apply to both personas; the scenarios in `gateway.feature` cover the
shared etiquette plus the mode-switch itself. They are the only fleet units an agent triggers from
a user situation; the other units are `cyberfleet` commands these skills invoke.

> Follow-up: this node still lives under `.agents/specs/cyberspace/fleet/`, but the skill it
> describes now ships from a separate `cyberfleet` plugin. That spec-dir/plugin mismatch is not
> resolved in this change — flagged for a future spec-relocation CR.

## Use Cases

**Fit:** strong — the fleet skill makes a real activation decision (coordinating *peer sessions*
that message each other, versus nesting a subagent, versus plain single-session work) and carries
non-deterministic judgment (when to spawn a peer, what to put in a brief, when to check the inbox,
addressing the right peer, honoring the harness-agnostic and MCP-free constraints). All four eval
layers carry signal.

**Subject** — coordinating peer agent sessions over the fleet, split by mode:

- **Mode-switch by the tracked `.cyberfleet/config.json` marker's presence** — Pod activates inside
  a ship (primary checkout or worktree, both equal once each carries the marker), Operator
  activates outside any ship; each defers to the other rather than acting out of mode.
- **Trigger on multi-session coordination** — activate when the user wants to spawn a peer session,
  hand work to a parallel session, or message between running sessions; defer plain single-session
  work and in-harness subagent nesting.
- **Offload every mechanic to the `cyberfleet` CLI** — spawn, register, send, inbox, read are all
  `cyberfleet` calls; neither persona re-implements the file store or types into another pane.
- **Register on entry and check the inbox** — establish this session's identity (`cyberfleet
  register`) and read unread mail (`cyberfleet inbox --unread`) before acting, then ack what it
  handles (`cyberfleet read`).
- **Spawn a peer with a self-contained brief** — when work should run in parallel, `cyberfleet
  spawn` with a brief that stands on its own, and address peers by handle. Pod spawns
  worktree-ships from inside an existing ship; Operator spawns the fleet's first ship from outside.
- **Stay harness-agnostic and MCP-free** — never assume the peer is the same harness, and never
  reach for an MCP messaging server; the fleet is files plus one CLI.

**Non-goals** — nesting a subagent inside the current session (use the harness's own subagent
tooling, not the fleet); the file-store, ordering, and hook mechanics (those are `messaging`,
`identity`, `spawn`, `surfacing`); authoring agent config or plugins (that is `bootstrap` and
`plugin`); the HAL above-leash tell and the `cyberfleet missions --json` query view (ADR-0022
decisions 6 and 10 — a later change request).

Every scenario in [`gateway.feature`](./gateway.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **mode-switch by the tracked marker's presence** | Pod inside a ship (primary or worktree), Operator outside any ship, each deferring to the other out of mode |
| **trigger on multi-session coordination** | fires on spawn-a-peer / message-between-sessions; defers single-session + subagent nesting |
| **offload to cyberfleet** | all mechanics are cyberfleet calls, never re-implemented |
| **register + check inbox + ack** | identity on entry, read unread before acting, ack what it handles |
| **spawn with a self-contained brief** | parallel work goes to a peer with a standalone brief, addressed by handle |
| **harness-agnostic + MCP-free** | no same-harness assumption, no MCP messaging server |
