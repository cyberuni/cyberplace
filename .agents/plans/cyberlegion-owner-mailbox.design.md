# CR-A2 — owner mailbox read path (design)

Second of three CRs (A1 → A2 → B). A1 gave a frameless agent a durable standing inbox to report to.
A2 gives the **human** the read path: see owner mail inline in a root session, and manage (list /
read / ack) the one hub-level owner mailbox from wherever they are.

## Why / reframe

The human is **not a session** and **roams** across panes — no session "is" the owner, so the owner
inbox is **hub-level**, addressed by the standing handle (from A1), not pinned to a session. And
"read" is **not observable**: surfacing a message into a session's context is a *model* printing
text, not proof a *human* read it. So surfacing may *show* the message but must **never ack**; read
is a deliberate `mail ack`.

## What (all additive to two frozen nodes)

### `surfacing/` node — owner mail into root sessions
`src/runtime/inject-inbox.ts`: beyond the caller's own brief + unread, also surface the **standing
owner** inbox's unread mail (bodies included) under a distinct owner-mail heading. Gate =
**"is this a spawned unit?"**: a caller whose record has `spawnedBy` (legion-spawned) surfaces no
owner mail; a top-level session (no `spawnedBy`) surfaces it. Never acks — an unread owner message
re-surfaces every hook call until acked, then stops.

### `mail/` node — owner mailbox from any session
- `mail send --to <owner>` already resolves the standing record (A1 standing-precedence) → delivers
  to the owner inbox (closes the carry-over from A1's spec gate).
- Add an `--owner <handle>` selector to `mail inbox` / `mail read` / `mail ack` that targets a
  **standing** record's inbox instead of the caller's own. `--owner` on a non-standing handle errors.
- Read still peeks; `ack` is still the only read-state flip; two concurrent `mail ack --owner` of one
  message → one success, one error (loser throws on already-acked), so nothing double-consumed.

## Scenarios
surfacing (+4): root surfaces owner mail w/ body under owner heading; spawned unit surfaces none;
surfacing never acks (re-surfaces until acked); acked no longer surfaces.
mail (+6): send-to-standing delivers; inbox --owner lists owner mailbox from any session; read --owner
peeks without consuming; ack --owner is the only read-flip; concurrent ack one-wins; non-standing
--owner errors.

## Non-goals (CR-B)
The `relay-governance` contract that routes a frameless agent to the standing inbox. The user-facing
`manage-inbox` skill (a `plugins/cyberlegion` artifact) is a thin CLI wrapper filed after this
package CR.
