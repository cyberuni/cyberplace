---
title: Universal Plugin Format
description: Format spec for plugins that work across Claude Code, Cursor, and Codex CLI.
---

**Load:** `npx cyber-skills@<version> governance show universal-plugin`

Authoritative format spec for plugins that work in Claude Code, Cursor, and Codex CLI.

## Manifests

Four vendor manifests plus one canonical neutral manifest:

| Agent | Path |
| ----- | ---- |
| Open Agent Plugin (canonical) | `.plugin/plugin.json` |
| Claude Code | `.claude-plugin/plugin.json` |
| Cursor | `.cursor-plugin/plugin.json` |
| Codex CLI | `.codex-plugin/plugin.json` |

Author `.plugin/plugin.json` as the canonical source of truth. Vendor manifests can be symlinks or thin wrappers.

Minimum required content:

```json
{
  "name": "<plugin-name>",
  "description": "<description>",
  "version": "1.0.0",
  "author": { "name": "<author>" }
}
```

Only `name` is strictly required by all agents. Include all fields for discoverability.

## Component compatibility

| Component | Directory | Cross-agent |
| --------- | --------- | ----------- |
| Skills | `skills/<name>/SKILL.md` | All four — identical format |
| Commands | `commands/<name>.md` | Claude Code + Cursor only |
| Agents | `agents/<name>.md` | Claude Code + Cursor only |
| MCP | `.mcp.json` + `mcp.json` symlink | All four — via symlink |
| Hooks (Claude Code) | `hooks/hooks.json` | Claude Code only |
| Hooks (Codex) | `hooks/codex-hooks.json` | Codex CLI only |
| Rules | `rules/<name>.mdc` | Cursor only |
| App connectors | `.app.json` | Codex CLI only |

Always include at least one skill.

## MCP: symlink rule

`.mcp.json` is the source of truth. `mcp.json` is a symlink — never a regular file.

```bash
ln -sf .mcp.json mcp.json
```

- Claude Code reads `.mcp.json`; Cursor reads `mcp.json` via symlink
- Edit only `.mcp.json`; the symlink propagates automatically
- Add `.gitattributes` entry if needed: `mcp.json symlink`

## Hooks: incompatible schemas

| Aspect | Claude Code | Cursor | Codex CLI |
| ------ | ----------- | ------ | --------- |
| File | `hooks/hooks.json` | `.cursor/hooks.json` (project root) | `hooks/codex-hooks.json` |
| Event names | PascalCase (`PreToolUse`) | camelCase (`preToolUse`) | camelCase (`preToolUse`) |
| Top-level | none | `"version": 1` required | no version field |
| Plugin root | `CLAUDE_PLUGIN_ROOT` env var | not available | not available |

Extract shared behavior into a script (`hooks/<impl>.sh`) called by all configs.

**Claude Code (`hooks/hooks.json`):**

```json
{
  "hooks": {
    "PreToolUse": [
      { "type": "command", "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/<impl>.sh\"", "timeout": 10 }
    ]
  }
}
```

**Codex CLI (`hooks/codex-hooks.json`):**

```json
{
  "preToolUse": [
    { "type": "command", "command": "./hooks/<impl>.sh", "timeout": 10 }
  ]
}
```

**Cursor** — hooks live at the project root (`.cursor/hooks.json`), not inside the plugin. Include registration instructions in the plugin's `README.md`.

## Rules: always-on only + AGENTS.md merge

Rules (`.mdc`) are Cursor-only always-on injection. Claude Code and Codex ignore `rules/`.

For cross-agent always-on guidance, merge into `AGENTS.md`:

- Guidance triggered by situation → **skill** (works in all agents)
- Always-on, cross-agent → merge into **`AGENTS.md`**
- Always-on, Cursor-only → use `rules/` with `alwaysApply: true`

When `rules/` is included, bundle `commands/setup.md` that merges rule content into `AGENTS.md` — after setup runs, all agents get the guidance from `AGENTS.md`.

## Distribution

| Scope | Claude Code | Cursor | Codex CLI |
| ----- | ----------- | ------ | --------- |
| Personal | `~/.claude/plugins/local/<name>` symlink | `~/.cursor/plugins/local/<name>` symlink | `~/.agents/plugins/marketplace.json` entry |
| Team | npm private package | Cursor Teams admin import | `.agents/plugins/marketplace.json` in repo |
| Public | PR to `anthropics/claude-plugins-official` | Submit to `cursor.com/marketplace` | `codex plugin marketplace add <source>` |

Default scope: **team**.

## Reference layout

```
<plugin-name>/
├── .plugin/plugin.json               (Open Agent Plugin — canonical)
├── .claude-plugin/plugin.json        (Claude Code, or symlink)
├── .cursor-plugin/plugin.json        (Cursor, or symlink)
├── .codex-plugin/plugin.json         (Codex CLI)
├── skills/<skill-name>/SKILL.md
├── commands/setup.md
├── commands/<cmd-name>.md
├── agents/<agent-name>.md
├── rules/<rule-name>.mdc
├── hooks/hooks.json                  (Claude Code — PascalCase events)
├── hooks/codex-hooks.json            (Codex — camelCase, no version field)
├── hooks/<impl>.sh                   (shared implementation)
├── .app.json                         (Codex app connectors)
├── .mcp.json                         (source of truth)
├── mcp.json -> .mcp.json             (symlink)
└── README.md
```

## Other agents

| Agent | Compatible? | Notes |
| ----- | ----------- | ----- |
| Amp (Sourcegraph) | Partial | Same SKILL.md format; reads from `.agents/skills/` |
| Gemini CLI | No | Uses `gemini-extension.json` |
| Continue.dev | No | YAML blocks format |
| OpenCode | No | JS/TS module plugins |
| Codex CLI | Yes | `skills/<name>/SKILL.md` identical format |
| Cline / Roo Code | No | MCP servers only |
| Windsurf | No | VS Code extensions only |
