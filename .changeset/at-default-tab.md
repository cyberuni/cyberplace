---
"cyberlegion": minor
---

**BREAKING** — `unit spawn --at` now defaults to `tab` instead of `pane:right`, and the redundant
`window` placement value is removed.

- **Default placement is `tab`.** A spawned peer opens as a new tab in the caller's current window,
  opened without stealing focus (herdr `tab create --no-focus`, tmux `new-window -d`), so it no
  longer shrinks the caller's pane by splitting it side-by-side. Pass `--at pane:right` explicitly
  for the old behavior.
- **herdr now honors `tab`.** The herdr adapter previously mis-routed `tab` to a right-split pane;
  it now opens a real herdr tab via `tab create`. tmux already mapped `tab` → `new-window`.
- **`window` is removed** from `--at`. It was tmux's local name for the Tab concept, redundant with
  `tab`; the allowed set is now `pane:right | pane:down | tab | workspace`. `--at window` is
  rejected. Placement vocabulary is aligned to the canonical Session › Workspace › Tab › Pane
  concepts (documented in the mux node README and the website architecture page).
