---
'cyberlegion': patch
---

Address live units only, and fail fast on a dead pane.

A handle is reusable, so over time the dead units holding a name outnumber the live one.
`resolveRecipient`/`resolveAgent` matched on handle without filtering status, so a name could
resolve to an exited unit — `mail send` then reported "delivered" for an inbox with no reader.
Handles (and worktree-branch refs) now resolve to live units only, and a name matching only exited
units throws and lists them. An explicit id still addresses an exited unit.

`nudge` now probes `paneExists` before sending: a gone pane and a booting one both read back empty,
so a dead peer was being retried ten times and reported as "never took the turn" — the boot-race
shape — instead of the real cause.
