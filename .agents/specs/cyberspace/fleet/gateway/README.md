---
spec-type: behavioral
concept: [fleet]
---

# gateway — the fleet skill: spawn peers and message between sessions

The user-facing entry to the fleet. A gateway skill that activates when the user wants to run
parallel agent sessions that talk to each other, loads the fleet etiquette, and routes every
mechanic to the `cyberfleet` CLI. It is the only fleet unit an agent triggers from a user
situation; the other units are `cyberfleet` commands this skill invokes.

## Use Cases

**Fit:** strong — the fleet skill makes a real activation decision (coordinating *peer sessions*
that message each other, versus nesting a subagent, versus plain single-session work) and carries
non-deterministic judgment (when to spawn a peer, what to put in a brief, when to check the inbox,
addressing the right peer, honoring the harness-agnostic and MCP-free constraints). All four eval
layers carry signal.

**Subject** — coordinating peer agent sessions over the fleet:

- **Trigger on multi-session coordination** — activate when the user wants to spawn a peer session,
  hand work to a parallel session, or message between running sessions; defer plain single-session
  work and in-harness subagent nesting.
- **Offload every mechanic to the `cyberfleet` CLI** — spawn, register, send, inbox, read are all
  `cyberfleet` calls; the skill never re-implements the file store or types into another pane.
- **Register on entry and check the inbox** — establish this session's identity (`cyberfleet
  register`) and read unread mail (`cyberfleet inbox --unread`) before acting, then ack what it
  handles (`cyberfleet read`).
- **Spawn a peer with a self-contained brief** — when work should run in parallel, `cyberfleet
  spawn` with a brief that stands on its own, and address peers by handle.
- **Stay harness-agnostic and MCP-free** — never assume the peer is the same harness, and never
  reach for an MCP messaging server; the fleet is files plus one CLI.

**Non-goals** — nesting a subagent inside the current session (use the harness's own subagent
tooling, not the fleet); the file-store, ordering, and hook mechanics (those are `messaging`,
`identity`, `spawn`, `surfacing`); authoring agent config or plugins (that is `bootstrap` and
`plugin`).

Every scenario in [`gateway.feature`](./gateway.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **trigger on multi-session coordination** | fires on spawn-a-peer / message-between-sessions; defers single-session + subagent nesting |
| **offload to cyberfleet** | all mechanics are cyberfleet calls, never re-implemented |
| **register + check inbox + ack** | identity on entry, read unread before acting, ack what it handles |
| **spawn with a self-contained brief** | parallel work goes to a peer with a standalone brief, addressed by handle |
| **harness-agnostic + MCP-free** | no same-harness assumption, no MCP messaging server |
