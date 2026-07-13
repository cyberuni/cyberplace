---
"cyberlegion": minor
---

Owner-mail doorbell rings the bound main pane only when it is focused.

- **New focus probe.** `SessionAdapter.isPaneFocused` reports whether the attached client is currently viewing a pane — tri-state `focused | not-focused | unknown`. tmux reads `pane_active` + `window_active` + `session_attached`; herdr reads the pane record's own `focused` flag (`pane get`). A backend that cannot report focus, or a query that errors, answers `unknown`.
- **Doorbell focus gate.** When a standing-owner message is delivered, the doorbell now skips ringing the bound main pane if that pane is **positively not focused** — the human has roamed off it, so ringing would wake a session nobody is watching. The report stays queued in the durable owner inbox and surfaces on the pane's next SessionStart pull; nothing is lost. When the pane is focused, or focus is `unknown`, the ring proceeds as before (fail-open, no regression). A peer recipient's ring is never focus-gated, and a focus probe that errors never fails the send.
