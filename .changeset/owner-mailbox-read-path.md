---
"cyberlegion": minor
---

Add the owner mailbox read path. `mail hook` now surfaces every standing owner's unread mail
(with bodies) into a root session's injected context under a distinct `## Owner mail — <handle>
(<N>)` heading — read-only, so a message keeps re-surfacing until explicitly acked; a session
that was legion-spawned (has `spawnedBy`) never gets an owner section. `mail inbox`, `mail read`,
and `mail ack` take a new `--owner <handle>` selector that targets a standing owner's mailbox
instead of the caller's own; `--owner` on a handle that is not a standing record errors rather
than falling back to reading a session's inbox as an owner mailbox.
