---
"cyberlegion": minor
---

Add `cyberlegion mail read <id> --ack` — read and acknowledge a message in one atomic step. It
prints the message body (as `read` does) and acks it in the same call, so "receive and consume" is
one round-trip instead of read-then-separately-ack. It is idempotent: it always prints the body and
acks only when the message is still unread, so running it on an already-acked message prints the
body and succeeds (`acked: false`) rather than erroring like a bare `mail ack`. An unknown message
id still errors, and it composes with `--owner` for the standing owner mailbox. Bare `mail read`
(no `--ack`) is unchanged — it stays the non-consuming peek.
