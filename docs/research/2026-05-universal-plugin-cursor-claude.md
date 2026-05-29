# Universal Plugin: Cursor + Claude Code

**Date:** 2026-05-29
**Updated:** 2026-05-29 (added Cursor hooks schema, MCP symlink approach, rules/AGENTS.md pattern, other agent landscape; resolved open questions)
**Purpose:** Research report for the `create-universal-plugin` skill. Background for `governances/universal-plugin.md`.

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

Fields observed in official plugins: `name`, `description`, `author.name`, `author.email`. No `version` field seen in practice (likely accepted but not required).

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
    "PreToolUse": [{ "type": "command", "command": "python3 \"${CLAUDE_PLUGIN_ROOT}/hooks/pre.py\"", "timeout": 10 }],
    "PostToolUse": [{ ... }],
    "Stop": [{ ... }],
    "UserPromptSubmit": [{ ... }]
  }
}
```

Note: event names are PascalCase. `CLAUDE_PLUGIN_ROOT` is the plugin installation directory.

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
| Local | `~/.claude/plugins/local/<name>/` | Symlink supported for fast iteration |

### Distribution (Private)

No documented team marketplace as of this research. Private distribution:
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
| Rules | `rules/` | `.mdc` files | Always-on AI guidance; injected on every interaction |
| Skills | `skills/<name>/SKILL.md` | Same as Claude Code | Direct format compatibility |
| Agents | `agents/` | Agent config files | Custom configurations and prompts |
| Commands | `commands/` | Executable files | Agent-executable commands |
| MCP Servers | `mcp.json` | JSON | No dot-prefix (differs from Claude Code) |
| Hooks | `hooks/` | JSON + scripts | See hooks schema below |

### Cursor Hooks Schema

Cursor hooks use `{ "version": 1, ... }` JSON format with camelCase event names. This differs from Claude Code's PascalCase-without-version format.

**Supported events:**
- Agent: `sessionStart`, `sessionEnd`, `preToolUse`, `postToolUse`, `postToolUseFailure`, `subagentStart`, `subagentStop`, `beforeShellExecution`, `afterShellExecution`, `beforeMCPExecution`, `afterMCPExecution`, `beforeReadFile`, `afterFileEdit`, `beforeSubmitPrompt`, `preCompact`, `stop`, `afterAgentResponse`, `afterAgentThought`
- Tab completions: `beforeTabFileRead`, `afterTabFileEdit`
- App: `workspaceOpen`

**Format:**
```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [
      {
        "command": "./hooks/impl.sh",
        "type": "command",
        "timeout": 30,
        "matcher": "pattern",
        "loop_limit": 5,
        "failClosed": false
      }
    ]
  }
}
```

- `type`: `"command"` (default) or `"prompt"` (LLM-evaluated)
- `failClosed`: block action on hook failure when `true`
- `loop_limit`: default 5 (Claude Code default: null/no limit)

**Hooks in plugins** are loaded from the plugin's `hooks/` directory. For project-level hooks outside a plugin, use `.cursor/hooks.json`.

### Installation Methods

| Method | Path | Notes |
|--------|------|-------|
| Local dev | `~/.cursor/plugins/local/<name>/` | Symlink supported for fast iteration |
| Team marketplace | Admin-imported GitHub repo | Teams/Enterprise plan required |
| Public marketplace | `cursor.com/marketplace` | Manual review, open source required |

### Private Distribution

- **Personal:** symlink repo into `~/.cursor/plugins/local/<name>`, reload Cursor
- **Team:** requires Cursor Teams or Enterprise; admin imports GitHub repo, assigns to groups

---

## 3. Comparison

| Aspect | Claude Code | Cursor | Universal? |
|--------|-------------|--------|------------|
| Manifest file | `.claude-plugin/plugin.json` | `.cursor-plugin/plugin.json` | **Both needed** — different paths |
| Skills dir | `skills/<name>/SKILL.md` | `skills/<name>/SKILL.md` | **Identical** — one dir works |
| Commands dir | `commands/<name>.md` | `commands/` | **Compatible** — same dir, similar format |
| Agents dir | `agents/<name>.md` | `agents/` | **Compatible** — same dir |
| MCP file | `.mcp.json` (dot-prefix) | `mcp.json` (no dot) | **Resolved** — `mcp.json` symlinks to `.mcp.json` |
| Hooks | `hooks/hooks.json` (PascalCase) | `hooks/` (camelCase, `version:1`) | **Incompatible schemas** — separate files required |
| Rules | not supported | `rules/*.mdc` (always-on) | **Cursor-only** — use AGENTS.md for cross-agent always-on |
| AGENTS.md in plugin | not auto-read | not auto-read | Inert in plugin dir; requires post-install merge |

---

## 4. Universal Plugin Layout

### MCP: Symlink approach

Instead of duplicating MCP config (drift risk), `mcp.json` is a symlink to `.mcp.json`:

```bash
ln -sf .mcp.json mcp.json
```

`.mcp.json` is the source of truth. Cursor reads `mcp.json` through the symlink. Never commit `mcp.json` as a regular file.

### Hooks: Separate schemas, shared implementation

Claude Code and Cursor have incompatible hook schemas. The solution:
1. Scaffold `hooks/hooks.json` for Claude Code (PascalCase events, `CLAUDE_PLUGIN_ROOT`)
2. Extract shared logic into `hooks/<impl>.sh`
3. For Cursor, document that users add `.cursor/hooks.json` at project root pointing to the same script

### Rules: Always-on only + AGENTS.md merge

Cursor rules (`.mdc`) inject guidance on every interaction. Claude Code ignores `rules/`. For cross-agent always-on guidance, use `AGENTS.md` instead — both agents read it.

Pattern:
1. Scaffold `rules/<name>.mdc` with `alwaysApply: true` only for truly always-on content
2. Bundle `commands/setup.md` that merges rule content into the project's `AGENTS.md`
3. After running setup, the `.mdc` files are redundant (both agents read from `AGENTS.md`)

### Final layout

```
<plugin-name>/
├── .claude-plugin/
│   └── plugin.json           # Claude Code manifest
├── .cursor-plugin/
│   └── plugin.json           # Cursor manifest (identical content)
│
├── skills/                   # SHARED — identical format
│   └── <skill-name>/
│       └── SKILL.md
│
├── commands/                 # SHARED — compatible format
│   ├── setup.md              # Post-install: merges rules into AGENTS.md
│   └── <cmd-name>.md
│
├── agents/                   # SHARED — compatible format
│   └── <agent-name>.md
│
├── rules/                    # CURSOR-ONLY — always-on only; Claude ignores
│   └── <rule-name>.mdc
│
├── hooks/
│   ├── hooks.json            # CLAUDE CODE — PascalCase events
│   └── <impl>.sh             # SHARED — implementation script
│                             # Cursor: .cursor/hooks.json at project root
│
├── .mcp.json                 # SOURCE OF TRUTH — Claude Code reads this
├── mcp.json -> .mcp.json     # SYMLINK — Cursor reads this
│
└── README.md
```

---

## 5. Other Agent Landscape

| Agent | Plugin system | SKILL.md compatible? |
|-------|--------------|---------------------|
| **Amp** (Sourcegraph) | Yes — `.agents/skills/`, `.agents/commands/` | Partial — same SKILL.md format, different install path |
| **Gemini CLI** | Yes — `gemini-extension.json` | No — MCP/context/themes focus |
| **Continue.dev** | Yes — YAML blocks (`config.yaml`) | No — different format |
| **OpenCode** | Yes — JS/TS modules (`.opencode/plugins/`) | No — different format |
| **Codex CLI** | Yes — `plugin.json` + TOML | No — different format |
| **Cline / Roo Code** | No — MCP servers only | No |
| **Windsurf** | No — VS Code extensions only | No |

**Amp note:** Amp uses the same `SKILL.md` format as Claude Code and Cursor, but installs to `.agents/skills/` not `skills/`. A plugin's `skills/` directory is not auto-read by Amp. Future extension: an Amp-compatible layout would need `skills/` → `.agents/skills/` mapping at install time.

---

## 6. Resolved Questions (from original report)

| Question | Resolution |
|----------|-----------|
| Claude Code local install path | Confirmed: `~/.claude/plugins/local/<name>/` |
| Cursor hooks format | Resolved: `{ "version": 1, hooks: { camelCase: [...] } }` — see Section 2 |
| Claude Code `version` field | Absent from all official plugins; not required |
| MCP drift risk | Resolved: `mcp.json` symlinks to `.mcp.json` — no drift |
| Rules cross-agent gap | Resolved: rules + `commands/setup.md` merges into `AGENTS.md` |

---

## References

- Cursor plugin docs: `https://cursor.com/docs/plugins`
- Cursor hooks docs: `https://cursor.com/docs/hooks`
- Cursor hooks deep dive: `https://blog.gitbutler.com/cursor-hooks-deep-dive`
- Claude Code official plugins: `~/.claude/plugins/marketplaces/claude-plugins-official/`
- Example Claude plugin: `.../plugins/example-plugin/`
- Hookify plugin (Claude hooks reference): `.../plugins/hookify/`
- Governance: `governances/universal-plugin.md`
