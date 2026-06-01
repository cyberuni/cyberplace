---
"cyber-skills": minor
---

Add plugin layer and cross-platform portability sections to the `skill-design` governance.

The `skill-design` governance (loadable via `governance show skill-design`) now covers:

- **Plugin layer**: plugin vs skill distinction, `plugin.json` manifest schema (Open Plugin Spec), directory layout, component types (skills, MCP servers, commands, hooks, agents, rules, LSP), path/env variable rules, namespacing, and `plugin.json` vs `skill.json` disambiguation.
- **Cross-platform portability**: which platforms read `SKILL.md` natively vs require conversion, installation paths per platform, and portability rules (forward slashes, 6,000-char limit, `compatibility` field, `allowed-tools`).
- **Frontmatter**: documents the `compatibility` and `allowed-tools` optional fields.
