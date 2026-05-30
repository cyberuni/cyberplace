# Universal Plugin Format

Authoritative format spec for plugins that work in Claude Code, Cursor, and Codex CLI. Apply when creating, reviewing, or debugging a universal plugin.

## Manifests

Four vendor manifest files plus one canonical neutral manifest:

| Agent | Path |
|-------|------|
| Open Agent Plugin (canonical) | `.plugin/plugin.json` |
| Claude Code | `.claude-plugin/plugin.json` |
| Cursor | `.cursor-plugin/plugin.json` |
| Codex CLI | `.codex-plugin/plugin.json` |

Author `.plugin/plugin.json` as the canonical source of truth. Vendor manifests can be symlinks to it when all fields are compatible, or thin wrappers with vendor-specific additions.

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

**Codex CLI** supports additional interface metadata in the manifest:
```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "...",
  "skills": "./skills/",
  "mcpServers": "./.mcp.json",
  "hooks": "./hooks/codex-hooks.json",
  "interface": {
    "displayName": "My Plugin",
    "shortDescription": "...",
    "category": "Productivity"
  }
}
```

## Component Compatibility

| Component | Directory | Cross-agent |
|-----------|-----------|------------|
| Skills | `skills/<name>/SKILL.md` | All four — identical format |
| Commands | `commands/<name>.md` | Claude Code + Cursor only |
| Agents | `agents/<name>.md` | Claude Code + Cursor only |
| MCP | `.mcp.json` + `mcp.json` symlink | All four — via symlink |
| Hooks (Claude Code) | `hooks/hooks.json` | Claude Code only |
| Hooks (Codex) | `hooks/codex-hooks.json` | Codex CLI only |
| Rules | `rules/<name>.mdc` | Cursor only |
| App connectors | `.app.json` | Codex CLI only |

Always include at least one skill.

## MCP: Symlink Rule

`.mcp.json` is the source of truth. `mcp.json` is a symlink — never a regular file.

```bash
ln -sf .mcp.json mcp.json
```

- Claude Code reads `.mcp.json`
- Codex CLI reads `.mcp.json`
- Cursor reads `mcp.json` (via symlink)
- Open Agent Plugin spec uses `mcp.json` (via symlink)
- Edit only `.mcp.json`; symlink propagates automatically
- Add `.gitattributes` entry if the repo needs explicit symlink tracking: `mcp.json symlink`

## Hooks: Incompatible Schemas

| Aspect | Claude Code | Cursor | Codex CLI |
|--------|-------------|--------|-----------|
| File | `hooks/hooks.json` | `.cursor/hooks.json` (project root, outside plugin) | `hooks/codex-hooks.json` |
| Event names | PascalCase (`PreToolUse`) | camelCase (`preToolUse`) | camelCase (`preToolUse`) |
| Top-level | none | `"version": 1` required | none (no version field) |
| Plugin root | `CLAUDE_PLUGIN_ROOT` env var | not available | not available |
| Default loop limit | null (no limit) | 5 | not specified |

Extract shared behavior into a script (`hooks/<impl>.sh`) called by all configs.

**Claude Code (`hooks/hooks.json`):**
```json
{
  "description": "<plugin-name> hooks",
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

**Cursor (user's `.cursor/hooks.json` at project root — not inside the plugin):**
```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      { "type": "command", "command": "<installed-plugin-path>/hooks/<impl>.sh", "timeout": 10 }
    ]
  }
}
```

Include Cursor hook registration instructions in the plugin's `README.md` — it cannot be automated from inside the plugin.

## Rules: Always-On Only + AGENTS.md Merge

Rules (`.mdc`) are Cursor-only always-on injection. Claude Code and Codex ignore `rules/`. For cross-agent always-on guidance, `AGENTS.md` is the right target — all agents read it.

**Decision tree:**
- Guidance triggered by situation → use a **skill** (works in all agents)
- Guidance that must be always-on, cross-agent → merge into **AGENTS.md**
- Guidance that must be always-on, Cursor-only → use `rules/` with `alwaysApply: true`

**When `rules/` is included:** bundle `commands/setup.md` that merges rule content into the project's `AGENTS.md`. After setup runs, all agents get the always-on guidance from `AGENTS.md`; the `.mdc` files are redundant and can be deleted.

`rules/<name>.mdc` format:
```markdown
---
description: <what this rule enforces>
globs: ["**/*"]
alwaysApply: true
---
# <Rule Title>
<guidance>
```

`commands/setup.md` template:
```markdown
---
description: Post-install setup — merge always-on plugin guidance into project AGENTS.md
---
# Plugin Setup

Run once after installing the plugin.

## Instructions

1. Read all `.mdc` files under this plugin's `rules/` directory
2. Strip YAML frontmatter from each file
3. Append the remaining content as a new `## <plugin-name>` section in the project's `AGENTS.md`
4. Confirm the merge completed
5. The `rules/*.mdc` files are now redundant — delete them if desired
```

## Distribution

| Scope | Claude Code | Cursor | Codex CLI |
|-------|-------------|--------|-----------|
| Personal | `~/.claude/plugins/local/<name>` symlink | `~/.cursor/plugins/local/<name>` symlink + reload window | `~/.agents/plugins/marketplace.json` entry |
| Team | npm private package | Cursor Teams: admin imports GitHub repo | `.agents/plugins/marketplace.json` in repo |
| Public | PR to `anthropics/claude-plugins-official` (open source) | Submit to `cursor.com/marketplace/publish` (open source) | `codex plugin marketplace add <source>` |

**Codex marketplace discovery** uses a JSON catalog file, not a shared marketplace:

```json
{
  "name": "team-plugins",
  "plugins": [
    {
      "name": "my-plugin",
      "source": { "source": "local", "path": "./plugins/my-plugin" },
      "policy": { "installation": "AVAILABLE" },
      "category": "Productivity"
    }
  ]
}
```

Place at `.agents/plugins/marketplace.json` (repo-scoped) or `~/.agents/plugins/marketplace.json` (personal). Installation policies: `AVAILABLE` (browseable) or `INSTALLED_BY_DEFAULT` (auto-active).

For npm distribution: the plugin directory must be the npm package root. All manifest directories (`.plugin/`, `.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`) must be present at the package root and listed in `package.json#files`.

Default scope: **team**.

## Other Agents

| Agent | Compatible with this format? | Notes |
|-------|--------------------------|-------|
| Amp (Sourcegraph) | Partial | Same SKILL.md format; reads from `.agents/skills/` not `skills/` |
| Gemini CLI | No | Uses `gemini-extension.json`; MCP/context/themes focus |
| Continue.dev | No | YAML blocks format |
| OpenCode | No | JS/TS module plugins |
| Codex CLI | Yes | `skills/<name>/SKILL.md` identical format; see Codex sections above |
| Cline / Roo Code | No | MCP servers only, no plugin system |
| Windsurf | No | VS Code extensions only |

## Reference Layout

```
<plugin-name>/
├── .plugin/plugin.json               (Open Agent Plugin — canonical/convergence manifest)
├── .claude-plugin/plugin.json        (Claude Code manifest, or symlink to ../.plugin/plugin.json)
├── .cursor-plugin/plugin.json        (Cursor manifest, or symlink)
├── .codex-plugin/plugin.json         (Codex CLI manifest; add "apps" if needed)
├── skills/<skill-name>/SKILL.md
├── commands/setup.md                 (if rules/ included)
├── commands/<cmd-name>.md
├── agents/<agent-name>.md
├── rules/<rule-name>.mdc             (always-on, Cursor-only)
├── hooks/hooks.json                  (Claude Code format — PascalCase events)
├── hooks/codex-hooks.json            (Codex format — camelCase, no version field)
├── hooks/<impl>.sh                   (shared implementation)
├── .app.json                         (Codex app connectors — optional)
├── .mcp.json                         (source of truth)
├── mcp.json -> .mcp.json             (symlink)
└── README.md
```
