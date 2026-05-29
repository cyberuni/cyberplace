# Universal Plugin: Cursor + Claude Code

**Date:** 2026-05-29
**Purpose:** Research report for designing a `create-plugin` skill that scaffolds a single plugin repo working in both Cursor and Claude Code.

---

## 1. Claude Code Plugin System

### Manifest

File: `.claude-plugin/plugin.json`

```json
{
  "name": "my-plugin",
  "description": "...",
  "author": {
    "name": "Author Name",
    "email": "email@example.com"
  }
}
```

Fields observed in official plugins: `name`, `description`, `author.name`, `author.email`. No `version` field seen in practice (though likely accepted).

### Component Types

| Component | Directory | Format | Notes |
|-----------|-----------|--------|-------|
| Skills | `skills/<name>/SKILL.md` | Markdown with YAML frontmatter | Preferred over flat `commands/` layout |
| Commands | `commands/<name>.md` | Markdown with YAML frontmatter | Legacy flat layout, still supported |
| Agents | `agents/<name>.md` | Markdown with YAML frontmatter | Spawned by Claude, not user-invoked |
| MCP Servers | `.mcp.json` | JSON, same schema as `~/.claude/mcp.json` | Note the dot-prefix |
| Hooks | `hooks/hooks.json` | JSON with hook event keys | `CLAUDE_PLUGIN_ROOT` env var available |

**Skills frontmatter:**
```yaml
---
name: skill-name
description: "Trigger conditions..."
version: 1.0.0
license: MIT
---
```

**Commands frontmatter:**
```yaml
---
description: Short description shown in /help
argument-hint: <required-arg> [optional-arg]
allowed-tools: [Read, Glob, Grep, Bash]
model: sonnet
---
```

**Agents frontmatter:**
```yaml
---
name: agent-name
description: "When to invoke..."
model: sonnet
---
```

**Hooks format (`hooks/hooks.json`):**
```json
{
  "description": "...",
  "hooks": {
    "PreToolUse": [{ "hooks": [{ "type": "command", "command": "python3 \"${CLAUDE_PLUGIN_ROOT}/hooks/pre.py\"", "timeout": 10 }] }],
    "PostToolUse": [...],
    "Stop": [...],
    "UserPromptSubmit": [...]
  }
}
```

**MCP format (`.mcp.json`):**
```json
{
  "server-name": {
    "type": "http",
    "url": "https://...",
    "headers": { "Authorization": "Bearer ${TOKEN}" }
  }
}
```

### Installation Methods

| Method | Path | Notes |
|--------|------|-------|
| Official marketplace | `anthropics/claude-plugins-official` GitHub repo | Manual review, open source required |
| External plugins | Listed in marketplace `external_plugins/` | MCP-only plugins (no skills/commands) |
| Local (inferred) | `~/.claude/plugins/local/<name>/` | Analogous to Cursor local install |

### Distribution (Private)

No documented team marketplace as of this research. Private distribution requires either:
- npm package with `.claude-plugin/` structure (consumed via registry)
- Direct git subdir or local path

---

## 2. Cursor Plugin System

### Manifest

File: `.cursor-plugin/plugin.json`

```json
{
  "name": "my-plugin",
  "description": "...",
  "version": "1.0.0",
  "author": { "name": "Author Name" }
}
```

Only `name` is required. Components are auto-discovered from standard directories, or custom paths can be specified in the manifest.

### Component Types

| Component | Directory / File | Format | Notes |
|-----------|-----------------|--------|-------|
| Rules | `rules/` | `.mdc` files | Persistent AI guidance, coding standards |
| Skills | `skills/<name>/SKILL.md` | Same as Claude Code | Direct format compatibility |
| Agents | `agents/` | Agent config files | Custom configurations and prompts |
| Commands | `commands/` | Executable files | Agent-executable commands |
| MCP Servers | `mcp.json` | JSON | No dot-prefix (differs from Claude Code) |
| Hooks | `hooks/` | Automation scripts | Event-triggered automation |

### Installation Methods

| Method | Path | Notes |
|--------|------|-------|
| Local dev | `~/.cursor/plugins/local/<name>/` | Symlink supported for fast iteration |
| Team marketplace | Admin-imported GitHub repo | Teams/Enterprise plan required |
| Public marketplace | `cursor.com/marketplace` | Manual review, open source required |

### Private Distribution

- **Personal:** symlink repo into `~/.cursor/plugins/local/<name>`, reload Cursor
- **Team:** requires Cursor Teams or Enterprise; admin imports GitHub repo, assigns to groups via SCIM

---

## 3. Comparison

| Aspect | Claude Code | Cursor | Universal? |
|--------|-------------|--------|------------|
| Manifest file | `.claude-plugin/plugin.json` | `.cursor-plugin/plugin.json` | **Both needed** — different paths |
| Skills dir | `skills/<name>/SKILL.md` | `skills/<name>/SKILL.md` | **Identical** — one dir works |
| Commands dir | `commands/<name>.md` | `commands/` | **Compatible** — same dir, similar format |
| Agents dir | `agents/<name>.md` | `agents/` | **Compatible** — same dir |
| MCP file | `.mcp.json` (dot-prefix) | `mcp.json` (no dot) | **Incompatible** — different filenames |
| Hooks | `hooks/hooks.json` | `hooks/` | **Incompatible** — different formats |
| Rules | not supported | `rules/*.mdc` | Cursor-only; safe to include (Claude ignores) |

---

## 4. Universal Plugin Layout

A single repo can serve both agents. Shared components are in common directories; environment-specific files coexist without conflict.

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json           # Claude Code manifest
├── .cursor-plugin/
│   └── plugin.json           # Cursor manifest (same content, different location)
│
├── skills/                   # SHARED — identical format in both agents
│   └── my-skill/
│       └── SKILL.md
│
├── commands/                 # SHARED — compatible in both
│   └── my-command.md
│
├── agents/                   # SHARED — compatible in both
│   └── my-agent.md
│
├── rules/                    # CURSOR ONLY — Claude Code ignores this dir
│   └── my-rule.mdc
│
├── hooks/                    # SPLIT — each agent reads its own file
│   ├── hooks.json            # Claude Code hooks
│   └── my-hook.py            # Shared hook implementation
│
├── .mcp.json                 # CLAUDE CODE MCP config
├── mcp.json                  # CURSOR MCP config (same content, different filename)
│
└── README.md
```

### Key decisions for the `create-plugin` skill

1. **Dual manifests required:** scaffold both `.claude-plugin/plugin.json` and `.cursor-plugin/plugin.json` with identical content.

2. **Skills are the primary shared value:** one `skills/` directory works in both. This is the main reason to build a universal plugin.

3. **MCP must be duplicated:** `.mcp.json` for Claude Code, `mcp.json` for Cursor. The skill should scaffold both from the same template, and document the duplication risk (drift if one is edited without the other).

4. **Hooks are incompatible:** `hooks/hooks.json` for Claude Code. Cursor hooks format is undocumented in the public docs. Recommend: scaffold Claude Code hooks only; document Cursor hooks as a manual step.

5. **Rules are Cursor-only:** safe to include; Claude Code ignores `rules/`. No collision.

6. **Commands and agents are compatible:** same directory, similar `.md` format. Scalar frontmatter differences (e.g. `allowed-tools`) are unknown-field-ignored by the other agent.

### Private distribution paths

| Scope | Claude Code | Cursor |
|-------|-------------|--------|
| Personal | `~/.claude/plugins/local/<name>/` (inferred) | `~/.cursor/plugins/local/<name>/` + symlink |
| Team | npm private package via registry | Teams/Enterprise GitHub import |
| Public | `anthropics/claude-plugins-official` PR | `cursor.com/marketplace/publish` |

---

## 5. Open Questions

- **Claude Code local install path:** `~/.claude/plugins/local/` is inferred by analogy with Cursor but not confirmed in docs. Verify before implementing install step.
- **Cursor hooks format:** docs mention `hooks/` directory but don't specify the file schema. Needs empirical testing or Cursor docs update.
- **Claude Code `version` field:** present in Cursor docs, absent from all observed Claude Code `plugin.json` files. Likely accepted but not required.
- **Custom component paths in Cursor manifest:** docs mention this is possible but don't show the schema. Requires testing.

---

## References

- Cursor plugin docs: `https://cursor.com/docs/plugins`
- Claude Code official plugins: `~/.claude/plugins/marketplaces/claude-plugins-official/`
- Example Claude plugin: `.../plugins/example-plugin/`
- Hookify (hooks reference): `.../plugins/hookify/`
