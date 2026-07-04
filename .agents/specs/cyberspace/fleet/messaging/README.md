---
spec-type: behavioral
concept: [fleet]
---

# messaging — send, read, and acknowledge mail between agents

The `cyberfleet` CLI's message layer: one agent drops a message into another's queue, the
recipient reads its unread mail, and acking a message removes it from the unread set. The queue is
a directory tree under project-scoped `.cyberfleet/`, designed so concurrent writers in a shared
working tree never clobber each other (ADR-0020) and delivery order is preserved.

## Use Cases

**Subject** — sending, reading, and acking mail via files under `.cyberfleet/`:

- **Send drops one file into the recipient's inbox** — `cyberfleet send --to <handle|id>` writes a
  single message file to `.cyberfleet/inbox/<recipient-id>/`, addressable by human handle or raw
  id, with the body taken from `--body`, `--body-file <path>`, or stdin (`--body-file -`).
- **Every message file is collision-free and time-ordered** — the filename is
  `<epochMs>-<hex>.json`, so a lexical sort is chronological and the random `<hex>` suffix
  guarantees two senders (or one sender twice in the same millisecond) never overwrite each other —
  no shared mutable file exists anywhere in the queue.
- **Inbox lists the recipient's mail** — `cyberfleet inbox` lists messages for the calling agent in
  chronological order as markdown (not JSON — markdown reads better for an agent); `--unread` limits
  to un-acked mail; `--from <id>` filters by sender.
- **Read prints a message and acks it** — `cyberfleet read <msg-id>` prints the body and acks the
  message by **moving** it from `inbox/<me>/<msg>.json` to `inbox/<me>/read/<msg>.json`. The
  recipient is the sole writer of its own read-state, so acking never races another writer.
- **The file queue is the source of truth** — a message exists once its file is written, whether or
  not the recipient is live; delivery does not depend on any running process.

**Non-goals** — waking an idle peer the instant mail lands (a live `send` nudge and a watcher are
deferred phase-2 CRs); surfacing unread mail into a session's context at start (that is
[`../surfacing/`](../surfacing/README.md)); who an agent is and how it is discovered (that is
[`../identity/`](../identity/README.md)); message threads and replies beyond a flat `--reply-to`
reference (deferred).

Every scenario in [`messaging.feature`](./messaging.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **send drops one addressable file** | `send --to` writes one file to the recipient's inbox; handle or id; body from flag/file/stdin |
| **collision-free time-ordered names** | `<epochMs>-<hex>.json`; concurrent/same-ms sends never clobber; lexical == chronological |
| **inbox lists mail** | markdown, chronological; `--unread` and `--from` filters |
| **read prints + acks by move** | body printed; file moved to `read/`; recipient sole writer |
| **file queue is source of truth** | message durable regardless of recipient liveness |
