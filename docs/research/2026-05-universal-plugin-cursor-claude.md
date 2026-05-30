# Universal Plugin: Cursor + Claude Code

**Date:** 2026-05-29
**Updated:** 2026-05-30 (added Codex CLI plugin system, Open Agent Plugin spec from Vercel; updated comparison table and universal layout)
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

## 3. Codex CLI Plugin System

### Manifest

File: `.codex-plugin/plugin.json`

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "What the plugin does",
  "skills": "./skills/",
  "mcpServers": "./.mcp.json",
  "apps": "./.app.json",
  "hooks": "./hooks.json",
  "interface": {
    "displayName": "My Plugin",
    "shortDescription": "...",
    "category": "Productivity"
  }
}
```

Full fields: `name` (kebab-case, 64 chars max), `version`, `description`, `author`, `homepage`, `repository`, `license`, `keywords`, `skills`, `mcpServers`, `apps`, `hooks`, `interface` (displayName, shortDescription, longDescription, logo, brandColor, category, capabilities, websiteURL, privacyPolicyURL, termsOfServiceURL).

### Component Types

| Component | Directory / File | Format | Notes |
|-----------|-----------------|--------|-------|
| Skills | `skills/<name>/SKILL.md` | Same as Claude Code / Cursor | **Format-compatible** |
| MCP Servers | `.mcp.json` | JSON | Same field name as Claude Code |
| App Connectors | `.app.json` | JSON | GitHub, Slack integrations — Codex-only |
| Hooks | `hooks.json` | JSON | See below |

**Skills frontmatter** — identical to Claude Code / Cursor:
```yaml
---
name: skill-name
description: When/why to use this skill
---
```

**Hooks format** — no version field, event names are camelCase (like Cursor):
```json
{
  "preToolUse": [{ "type": "command", "command": "./hooks/impl.sh" }],
  "postToolUse": [{ ... }]
}
```

### Marketplace

Codex discovers plugins via `.agents/plugins/marketplace.json` (repo-scoped) or `~/.agents/plugins/marketplace.json` (personal).

```json
{
  "name": "local-repo",
  "plugins": [
    {
      "name": "my-plugin",
      "source": { "source": "local", "path": "./plugins/my-plugin" },
      "policy": { "installation": "AVAILABLE", "authentication": "ON_INSTALL" },
      "category": "Productivity"
    }
  ]
}
```

Installation policies: `AVAILABLE` (browseable) or `INSTALLED_BY_DEFAULT` (auto-active).

### Installation Methods

| Method | Path |
|--------|------|
| Repo marketplace | `.agents/plugins/marketplace.json` |
| Personal marketplace | `~/.agents/plugins/marketplace.json` |
| CLI | `codex plugin marketplace add <source>` |

### User Config (TOML)

`~/.codex/config.toml` or repo-scoped `.codex/config.toml`. Covers model selection, sandbox/security, MCP server auth, and feature flags. No TOML inside plugins themselves.

---

## 4. Open Agent Plugin Spec (Vercel)

### Overview

A vendor-neutral, cross-host standard for packaging AI agent plugins. Hosts ignore unsupported component types, so a plugin can conform without implementing every component. Goal: one plugin package works across Claude Code, Cursor, VS Code Copilot, Codex, and future hosts.

GitHub: `vercel-labs/open-plugin-spec` (v1.0.0)

### Manifest

File: `.plugin/plugin.json`

```json
{
  "name": "plugin-id",
  "version": "1.0.0",
  "description": "Purpose",
  "author": { "name": "...", "email": "...", "url": "..." },
  "keywords": ["tag1"],
  "skills": "./skills/",
  "mcpServers": "./mcp.json"
}
```

- `name`: 1–64 chars, alphanumeric + hyphens (required)
- `skills`: path string, path array, or `{ "paths": ["./skills1/", "./skills2/"] }`
- All relative paths must start with `./` and stay within plugin root (no parent traversal)

### Component Types

**Core** (required for conformance):

| Component | File / Dir | Notes |
|-----------|-----------|-------|
| Skills | `skills/<name>/SKILL.md` | Agent Skills spec — identical to Claude Code / Cursor / Codex |
| MCP Servers | `mcp.json` | `mcpServers` object |

**Extended** (optional, Appendix D):

Commands, Agents, Rules, Hooks, LSP Servers, Output Styles

### Discovery

1. Host reads `.plugin/plugin.json`
2. Discovers components via default paths or manifest-declared paths
3. Components surfaced as namespaced tools: `/plugin-name:skill-name`

### Relation to Existing Formats

Open Agent Plugin is the convergence target. It deliberately mirrors the `skills/` dir and SKILL.md format shared by Claude Code, Cursor, and Codex. The manifest location (`.plugin/`) and `mcp.json` (no dot-prefix, no symlink needed) differ from all three vendors today.

---

## 5. Comparison

| Aspect | Claude Code | Cursor | Codex CLI | Open Agent Plugin | Universal? |
|--------|-------------|--------|-----------|-------------------|------------|
| Manifest file | `.claude-plugin/plugin.json` | `.cursor-plugin/plugin.json` | `.codex-plugin/plugin.json` | `.plugin/plugin.json` | **Four files needed** — or OAP as canonical + vendor manifests as thin wrappers |
| Skills dir | `skills/<name>/SKILL.md` | `skills/<name>/SKILL.md` | `skills/<name>/SKILL.md` | `skills/<name>/SKILL.md` | **Identical** — one dir works across all four |
| Commands dir | `commands/<name>.md` | `commands/` | not supported | extended (Appendix D) | **Claude Code + Cursor compatible**; skip for Codex |
| Agents dir | `agents/<name>.md` | `agents/` | not supported | extended (Appendix D) | **Claude Code + Cursor compatible**; skip for Codex |
| MCP file | `.mcp.json` (dot-prefix) | `mcp.json` (no dot) | `.mcp.json` (dot-prefix) | `mcp.json` (no dot) | **Symlink resolves CC + Codex + Cursor**; OAP aligns with Cursor |
| Hooks | `hooks/hooks.json` (PascalCase) | `hooks/` (camelCase, `version:1`) | `hooks.json` (camelCase, no version) | extended (Appendix D) | **Incompatible schemas** — separate files required; shared impl script |
| Rules | not supported | `rules/*.mdc` (always-on) | not supported | extended (Appendix D) | **Cursor-only** — use AGENTS.md for cross-agent always-on |
| AGENTS.md in plugin | not auto-read | not auto-read | not auto-read | not in spec | Inert in plugin dir; requires post-install merge |
| App connectors | not supported | not supported | `.app.json` | not in core spec | **Codex-only** |
| Marketplace | official GitHub repo | `cursor.com/marketplace` | `.agents/plugins/marketplace.json` | not in spec | **Codex marketplace.json** is the only repo-local discovery mechanism |

---

## 6. Universal Plugin Layout

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

### Manifest strategy

Four vendor manifests are needed today. The Open Agent Plugin spec (`.plugin/plugin.json`) is the convergence target. A practical approach:

1. Author `.plugin/plugin.json` as the canonical manifest
2. Generate `.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`, `.codex-plugin/plugin.json` as thin wrappers (or symlinks to `.plugin/plugin.json` if all fields are compatible)

### Final layout

```
<plugin-name>/
├── .plugin/
│   └── plugin.json           # OPEN AGENT PLUGIN — canonical/convergence manifest
├── .claude-plugin/
│   └── plugin.json           # Claude Code manifest (or symlink to ../.plugin/plugin.json)
├── .cursor-plugin/
│   └── plugin.json           # Cursor manifest (or symlink)
├── .codex-plugin/
│   └── plugin.json           # Codex CLI manifest (or symlink); add "apps" if needed
│
├── skills/                   # SHARED — identical format across all four
│   └── <skill-name>/
│       └── SKILL.md
│
├── commands/                 # CLAUDE CODE + CURSOR only (Codex ignores)
│   ├── setup.md              # Post-install: merges rules into AGENTS.md
│   └── <cmd-name>.md
│
├── agents/                   # CLAUDE CODE + CURSOR only (Codex ignores)
│   └── <agent-name>.md
│
├── rules/                    # CURSOR-ONLY — always-on only; others ignore
│   └── <rule-name>.mdc
│
├── hooks/
│   ├── hooks.json            # CLAUDE CODE — PascalCase events
│   ├── codex-hooks.json      # CODEX — camelCase, no version field
│   └── <impl>.sh             # SHARED — implementation script
│                             # Cursor: .cursor/hooks.json at project root
│
├── .mcp.json                 # SOURCE OF TRUTH — Claude Code + Codex read this
├── mcp.json -> .mcp.json     # SYMLINK — Cursor + OAP read this
│
└── README.md
```

---

## 7. Other Agent Landscape

| Agent | Plugin system | SKILL.md compatible? |
|-------|--------------|---------------------|
| **Amp** (Sourcegraph) | Yes — `.agents/skills/`, `.agents/commands/` | Partial — same SKILL.md format, different install path |
| **Gemini CLI** | Yes — `gemini-extension.json` | No — MCP/context/themes focus |
| **Continue.dev** | Yes — YAML blocks (`config.yaml`) | No — different format |
| **OpenCode** | Yes — JS/TS modules (`.opencode/plugins/`) | No — different format |
| **Codex CLI** | Yes — `.codex-plugin/plugin.json`; marketplace via `.agents/plugins/marketplace.json` | **Yes** — `skills/<name>/SKILL.md` identical format |
| **Cline / Roo Code** | No — MCP servers only | No |
| **Windsurf** | No — VS Code extensions only | No |

**Amp note:** Amp uses the same `SKILL.md` format as Claude Code and Cursor, but installs to `.agents/skills/` not `skills/`. A plugin's `skills/` directory is not auto-read by Amp. Future extension: an Amp-compatible layout would need `skills/` → `.agents/skills/` mapping at install time.

**Codex note:** Codex is the third host (alongside Claude Code and Cursor) with native SKILL.md support. The `.agents/plugins/marketplace.json` discovery mechanism is Codex-specific and enables repo-local plugin catalogs — a pattern worth emulating for team distribution.

**Open Agent Plugin note:** The OAP spec (`vercel-labs/open-plugin-spec` v1.0.0) is a convergence proposal, not a shipping runtime. It defines the SKILL.md + `mcp.json` core and leaves vendor-specific components (hooks, rules, app connectors) as optional extensions. Tracking this spec is worthwhile — adoption by a major host would simplify multi-vendor distribution significantly.

---

## 8. Resolved Questions (from original report)

| Question | Resolution |
|----------|-----------|
| Claude Code local install path | Confirmed: `~/.claude/plugins/local/<name>/` |
| Cursor hooks format | Resolved: `{ "version": 1, hooks: { camelCase: [...] } }` — see Section 2 |
| Claude Code `version` field | Absent from all official plugins; not required |
| MCP drift risk | Resolved: `mcp.json` symlinks to `.mcp.json` — no drift |
| Rules cross-agent gap | Resolved: rules + `commands/setup.md` merges into `AGENTS.md` |
| Codex SKILL.md support | Confirmed: `skills/<name>/SKILL.md` with identical frontmatter — see Section 3 |
| Codex hooks format | camelCase event names, no `version` field (differs from Cursor's `version:1`) — separate `codex-hooks.json` required |
| OAP manifest location | `.plugin/plugin.json` — distinct from all three vendor paths; use as canonical source |
| OAP adoption status | v1.0.0 spec published; no major host has announced full adoption as of 2026-05-30 |

---

## References

- Cursor plugin docs: `https://cursor.com/docs/plugins`
- Cursor hooks docs: `https://cursor.com/docs/hooks`
- Cursor hooks deep dive: `https://blog.gitbutler.com/cursor-hooks-deep-dive`
- Claude Code official plugins: `~/.claude/plugins/marketplaces/claude-plugins-official/`
- Example Claude plugin: `.../plugins/example-plugin/`
- Hookify plugin (Claude hooks reference): `.../plugins/hookify/`
- Codex CLI plugin build guide: `https://developers.openai.com/codex/plugins/build`
- Codex CLI config reference: `https://developers.openai.com/codex/config-reference`
- Codex plugin marketplace guide: `https://codex.danielvaughan.com/2026/04/24/codex-cli-plugin-marketplace-building-distributing-extending/`
- Codex example repo with plugins: `https://github.com/ansea09/agent-skills-and-protocols`
- Open Agent Plugin spec (Vercel): `https://github.com/vercel-labs/open-plugin-spec`
- InfoQ — Vercel Open Agents announcement: `https://www.infoq.com/news/2026/04/vercel-open-agents/`
- Governance: `governances/universal-plugin.md`
