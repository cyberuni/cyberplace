---
spec-type: behavioral
concept: [fleet]
---

# surfacing — inject unread mail into a session, across harnesses

The `cyberfleet` CLI's surfacing layer: turn the file queue into something a session actually
sees, without a daemon. `cyberfleet inbox --hook` emits the same SessionStart payload cyberspace
already uses, so a harness's hook can inject an agent's unread mail (and, at spawn, its brief) into
context. Registering that emitter across harnesses reuses the per-vendor event mapping cyberspace
already ships — this is the MCP-free replacement for a message-push server.

## Use Cases

**Subject** — emitting and wiring the hook that surfaces unread mail:

- **`inbox --hook` emits the SessionStart payload** — `cyberfleet inbox --hook --event
  SessionStart` resolves the calling agent, reads its unread mail (and its `brief.md` if it has one
  from a spawn), and prints the `{ hookSpecificOutput: { hookEventName, additionalContext } }`
  payload the harness injects — the same shape cyberspace's existing SessionStart hook emits.
- **The emitter is purpose-built, not arbitrary exec** — surfacing is done by this dedicated
  `inbox --hook` command; it does not add a generic run-any-command source to the hook layer.
- **Registration maps one logical event to each harness** — wiring the hook reuses the per-vendor
  mapping (`vendors.json` / `build-definition`): SessionStart registers for Claude, Cursor
  (`sessionStart`), and Codex; PostToolUse registers for Claude and Codex only (Cursor has no
  PostToolUse) — the same asymmetry cyberspace already encodes.
- **Nothing unread yields no injection** — when the agent has no unread mail and no pending brief,
  the emitter injects nothing rather than noise.
- **Registration is idempotent** — re-registering the surfacing hook leaves a correct existing
  registration unchanged rather than duplicating it.

**Non-goals** — the message store and acks themselves (`messaging`); a live nudge or a background
watcher for instant delivery (deferred phase-2 CRs); teaching an agent *when* to check or send mail
(that is the `gateway` skill).

Every scenario in [`surfacing.feature`](./surfacing.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **inbox --hook emits SessionStart payload** | resolves self, reads unread + brief, prints hookSpecificOutput/additionalContext |
| **purpose-built emitter** | surfacing via the dedicated command, not a generic exec source |
| **per-vendor registration** | SessionStart → claude/cursor/codex; PostToolUse → claude/codex only |
| **empty yields no injection** | no unread + no brief → nothing injected |
| **idempotent registration** | re-register leaves a correct registration unchanged |
