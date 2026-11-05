---
"cyberplace": patch
---

`skill-design` governance: load references with the `reference` skill in the `cyber-agentkit` plugin (it moved out of `buddy-agent-harness`), declare `cyber-agentkit` as the plugin dependency, and run `cyber-agentkit reference load` from the `cyber-agentkit` package outside a skill. A skill's default copy of a reference now lives at `references/<name>.default.md` and loads below every other contribution; `references/<name>.md` and `references/governances/` are no longer read.
