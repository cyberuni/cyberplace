---
"cyberlegion": minor
---

Add `unit who --reconcile` (and top-level `who --reconcile`, mirroring `--all`) to live-probe the current multiplexer and mark any dead-pane record `exited` before listing. `unit prune` now reconcile-culls the same way in addition to its existing per-record liveness and staleness checks.
