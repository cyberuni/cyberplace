---
"cyberplace": minor
---

Add `plugin-design` governance and update `skill-design` governance.

Both are loadable via `governance show <name>`.

- **`plugin-design` (new)**: rules for authoring distributable agent plugins — `plugin.json` manifest schema (Open Plugin Spec), directory layout, component types (skills, MCP servers, commands, hooks, agents, rules, LSP), path/env variable rules (`${PLUGIN_ROOT}`, `${PLUGIN_DATA}`), namespacing, cross-platform portability table, and `plugin.json` vs `skill.json` disambiguation.
- **`skill-design` (updated)**: adds `compatibility` and `allowed-tools` optional frontmatter fields; adds reference to `plugin-design`.
