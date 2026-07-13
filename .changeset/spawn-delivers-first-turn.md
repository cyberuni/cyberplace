---
"cyberlegion": minor
---

`unit spawn` now delivers the spawned peer's **first turn** on a fresh paned session, so a spawned
pod acts on its brief with no human nudge (issue #188).

A paned agent boots to an idle prompt: its brief is injected into context by its own SessionStart
hook, but the model takes no turn on its own (unlike a subagent, where the caller's Task call *is*
the turn). So `unit spawn` now rings a best-effort **first-turn doorbell** over the same boot-race-
aware submit-verify path `unit nudge` uses, exactly mirroring `mail send`'s delivery ring: the
worktree/session/registry record is the guaranteed effect and the ring is opportunistic on top.

- **Best-effort, never fails the spawn.** A ring that never completes within the retry budget (the
  harness never reaches its prompt) is surfaced as a stderr warning; the peer is still spawned. The
  spawn result carries a `rung` field.
- **`--no-wake` opts out** (mirroring `mail send --no-nudge`) for a caller that will drive the first
  turn itself.

This is mechanism, not routing — it completes the spawn, it does not select a backend — so it stays
within the CLI's dumb-hands charter and fixes every paned caller at once (Operator, Pod, and the
Legate's `channel` dispatch strategy) with no persona change.
