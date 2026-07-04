# fleet

Coordinate parallel agent sessions that talk to each other over the filesystem — spawn a peer
session in any harness, message between running sessions, and check for mail — **harness-agnostic
and MCP-free**. Every mechanic offloads to the `cyberfleet` CLI.

## When to use

- Spawning a second/parallel agent session to work alongside this one
- Sending a message to another running agent session
- Checking whether other sessions left this one mail

Not for nesting a subagent in the current session (use the harness's own subagent tooling), plain
single-session work, or an MCP messaging server.

## What it does

- Registers this session's identity and reads unread mail before acting; acks what it handles.
- Spawns a peer with a self-contained brief the peer reads through its own SessionStart hook;
  addresses peers by handle.
- Keeps everything harness-agnostic (a Claude session can coordinate with a Cursor or Codex peer)
  and MCP-free (the `.cyberfleet/` files plus the `cyberfleet` CLI — no server, no port, no daemon).

The runtime engine is the `cyberfleet` CLI; this skill decides when to reach for the fleet and
carries the coordination etiquette.
