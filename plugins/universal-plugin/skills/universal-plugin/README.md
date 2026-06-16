# universal-plugin skill

A skill for creating, inspecting, updating, and deleting universal AI coding agent plugins that target multiple runtimes from a single source of truth.

## Supported runtimes

| Vendor      | Manifest path                |
| ----------- | ---------------------------- |
| Claude Code | `.claude-plugin/plugin.json` |
| Cursor      | `.cursor-plugin/plugin.json` |
| Codex       | `.codex-plugin/plugin.json`  |
| Copilot CLI | `plugin.json` at plugin root |

Universal minimum (no vendor manifest needed): `skills/<name>/SKILL.md` or `.mcp.json`.

## Operations

- **Create** — scaffold a new plugin with chosen vendors and components
- **Inspect** — show build status for each declared vendor
- **Update** — add/remove vendors or components
- **Delete** — remove generated manifests or the whole plugin

## References

- [Spec](https://github.com/cyberuni/universal-plugin/blob/main/spec/universal-plugin-system.md)
- [Schema](https://raw.githubusercontent.com/cyberuni/universal-plugin/refs/heads/main/schema/v1.json)
- [Examples](https://github.com/cyberuni/universal-plugin/tree/main/examples)
