---
'cyberplace': minor
---

`governance`: `skill-design`, `skill-repo-structure`, `agent-tool-output`, and `cli-resolution` move to `cyber-aced`, the package that owns agent-configuration authoring (repobuddy/buddy-agent-harness#122). `governance list` no longer lists them, and `governance show <name>` prints a one-line notice naming the new owner and where to read it, then exits non-zero — a forwarder kept for one release so a pinned caller gets a destination instead of `Unknown governance`. `universal-plugin` still ships from this package and is unaffected.
