# Universal Plugin Format

Authoritative format spec for plugins that work in both Cursor and Claude Code. Apply when creating, reviewing, or debugging a universal plugin.

## Manifests

Two manifest files, identical content, different paths:

| Agent | Path |
|-------|------|
| Claude Code | `.claude-plugin/plugin.json` |
| Cursor | `.cursor-plugin/plugin.json` |

Minimum required content:
```json
{
  "name": "<plugin-name>",
  "description": "<description>",
  "version": "1.0.0",
  "author": { "name": "<author>" }
}
```

Only `name` is strictly required by both agents. Include all fields for discoverability.

## Component Compatibility

| Component | Directory | Cross-agent |
|-----------|-----------|------------|
| Skills | `skills/<name>/SKILL.md` | Both — identical format |
| Commands | `commands/<name>.md` | Both — compatible format |
| Agents | `agents/<name>.md` | Both — compatible format |
| MCP | `.mcp.json` + `mcp.json` symlink | Both — via symlink |
| Hooks | `hooks/hooks.json` | Claude Code only |
| Rules | `rules/<name>.mdc` | Cursor only |

Always include at least one skill.

## MCP: Symlink Rule

`.mcp.json` is the source of truth. `mcp.json` is a symlink — never a regular file.

```bash
ln -sf .mcp.json mcp.json
```

- Claude Code reads `.mcp.json`
- Cursor reads `mcp.json` (via symlink)
- Edit only `.mcp.json`; symlink propagates automatically
- Add `.gitattributes` entry if the repo needs explicit symlink tracking: `mcp.json symlink`

## Hooks: Incompatible Schemas

| Aspect | Claude Code | Cursor |
|--------|-------------|--------|
| File | `hooks/hooks.json` | `.cursor/hooks.json` (project root, outside plugin) |
| Event names | PascalCase (`PreToolUse`) | camelCase (`preToolUse`) |
| Top-level | none | `"version": 1` required |
| Plugin root | `CLAUDE_PLUGIN_ROOT` env var | not available |
| Default loop limit | null (no limit) | 5 |

Extract shared behavior into a script (`hooks/<impl>.sh`) called by both configs.

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

Rules (`.mdc`) are Cursor-only always-on injection. Claude Code ignores `rules/`. For cross-agent always-on guidance, `AGENTS.md` is the right target — both agents read it.

**Decision tree:**
- Guidance triggered by situation → use a **skill** (works in both agents)
- Guidance that must be always-on, cross-agent → merge into **AGENTS.md**
- Guidance that must be always-on, Cursor-only → use `rules/` with `alwaysApply: true`

**When `rules/` is included:** bundle `commands/setup.md` that merges rule content into the project's `AGENTS.md`. After setup runs, both agents get the always-on guidance from `AGENTS.md`; the `.mdc` files are redundant and can be deleted.

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

| Scope | Claude Code | Cursor |
|-------|-------------|--------|
| Personal | `~/.claude/plugins/local/<name>` symlink | `~/.cursor/plugins/local/<name>` symlink + reload window |
| Team | npm private package (both agents read from npm) | Cursor Teams: admin imports GitHub repo |
| Public | PR to `anthropics/claude-plugins-official` (open source) | Submit to `cursor.com/marketplace/publish` (open source) |

For npm distribution: the plugin directory must be the npm package root. Both `.claude-plugin/` and `.cursor-plugin/` must be present at the package root.

Default scope: **team**.

## Other Agents

| Agent | Compatible with this format? | Notes |
|-------|--------------------------|-------|
| Amp (Sourcegraph) | Partial | Same SKILL.md format; reads from `.agents/skills/` not `skills/` |
| Gemini CLI | No | Uses `gemini-extension.json`; MCP/context/themes focus |
| Continue.dev | No | YAML blocks format |
| OpenCode | No | JS/TS module plugins |
| Codex CLI | No | `plugin.json` + TOML |
| Cline / Roo Code | No | MCP servers only, no plugin system |
| Windsurf | No | VS Code extensions only |

## Reference Layout

```
<plugin-name>/
├── .claude-plugin/plugin.json
├── .cursor-plugin/plugin.json
├── skills/<skill-name>/SKILL.md
├── commands/setup.md             (if rules/ included)
├── commands/<cmd-name>.md
├── agents/<agent-name>.md
├── rules/<rule-name>.mdc         (always-on, Cursor-only)
├── hooks/hooks.json              (Claude Code format)
├── hooks/<impl>.sh               (shared implementation)
├── .mcp.json                     (source of truth)
├── mcp.json -> .mcp.json         (symlink)
└── README.md
```
