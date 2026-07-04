---
name: fleet
description: Use this skill when the user wants parallel agent sessions that talk to each other — spawn a peer session (in any harness), send messages between running sessions, or check for mail other sessions left you. Use this skill when the user asks for a second/parallel agent working alongside this one, cross-session messaging, or a Claude/Cursor/Codex session to hand work to another. Not for nesting a subagent in this session, plain single-session work, or MCP messaging servers.
---

# fleet — spawn peer sessions and message between them (MCP-free)

Coordinate a **fleet** of peer agent sessions that talk to each other over the filesystem, across
harnesses (a Claude Code session ↔ a Cursor session ↔ a Codex session) and without any MCP server.
Every mechanic is a `cyberfleet` CLI call; this skill decides *when* to reach for the fleet and
carries the etiquette. It never re-implements the message store or types into another session's pane.

Offload all mechanics to the CLI — in this repo the local `cyberfleet` bin, elsewhere a pinned
`npx cyberfleet@<version> …`.

## When this skill runs (and when it does not)

Activate when the user wants to **run sessions in parallel that coordinate**:

- spawn a peer/second session to work alongside this one,
- send a message to another running session, or
- check whether other sessions left mail.

Do **not** activate for: nesting a **subagent** inside this session (use the harness's own subagent
tooling — a subagent returns a single result to *this* session; it is not a peer), plain
single-session work, or a request to set up an MCP messaging server (the fleet is files + one CLI,
never MCP).

## 1. Register on entry, then check the inbox

Before acting as part of a fleet, establish this session's identity and read pending mail:

```
cyberfleet register --handle <name>     # once per session; harness auto-detected
cyberfleet inbox --unread               # what peers have sent this session
```

Handle what the mail asks, then **acknowledge each message you handle** so it leaves the unread set:

```
cyberfleet read <msg-id>
```

## 2. Spawn a peer with a self-contained brief

When work should run in parallel, spawn a peer session and give it a brief that **stands on its
own** — the peer starts cold and reads the brief through its own SessionStart hook, so it must not
assume this session's context:

```
cyberfleet spawn --harness <claude|cursor|codex> --handle <name> --task "<self-contained brief>"
```

Address peers by their **handle**, not a raw id:

```
cyberfleet send --to <handle> --subject "<subject>" --body "<message>"
```

## 3. Stay harness-agnostic and MCP-free

- **Never assume the peer runs the same harness.** A Claude session may be coordinating with a
  Cursor or Codex peer; address it through the shared files and `cyberfleet`, which every harness
  shares — not through anything harness-specific.
- **Never reach for an MCP messaging server** (e.g. mcp-agent-mail). The fleet is the local
  `.cyberfleet/` files plus the `cyberfleet` CLI: no server, no port, no daemon.
- **Never hand-write or type into a peer's pane or inbox.** Let `cyberfleet` own the file store and
  the tmux mechanics.

## Report

State which peers you spawned or messaged (by handle), what you sent, which mail you read and
acked, and confirm every mechanic went through the `cyberfleet` CLI over the shared files — no MCP,
no same-harness assumption.
