---
"cyberplace": minor
---

Build the `cyberplace tavern` AXI output surface and fail loud on a malformed marketplace manifest.

`cyberplace tavern` now emits TOON by default (name/description/recruit rows plus a pre-computed
`N crews` aggregate) instead of human prose. Long rosters truncate with a `… +N lines — rerun with
--full` hint (`--full` prints the whole roster; `--format json` is never truncated), an empty roster
is the definitive `0 crews found`, the bare command shows the roster rather than help, every run ends
with a `→ cyberplace add <name>` next-step on stderr, and an unknown flag fails loud. A present-but-
corrupt `.claude-plugin/marketplace.json` now fails loud with a clear "Could not parse marketplace
manifest" error (exit 1) rather than throwing a raw `SyntaxError` or yielding a silently empty roster.
