---
"cyberlegion": minor
---

`unit who --reconcile` (and top-level `who --reconcile`) now also adopts live-but-unregistered panes: any live pane in the current multiplexer running a detectable harness (`claude | cursor | codex`) with no matching record gets a minted record — pane bound to a new id, handle derived from the pane's cwd basename (`id.slice(0, 6)` when no cwd is reported), status `active`, `lastSeen` now — so a manually-opened or hook-failed pane becomes listable, mailable, and dispatchable. Panes with no detectable harness are never adopted (herdr reports the running agent; tmux does not, so tmux adoption is deferred), a bound pane — exited included — is never re-adopted or resurrected, and `unit prune` stays cull-only.
