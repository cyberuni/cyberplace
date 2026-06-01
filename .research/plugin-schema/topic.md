# Plugin Schema (May 2026)

## Question

What do the major AI coding agent vendors (Claude Code, Cursor, Codex) actually implement for their plugin manifest format? Is the Vercel Labs open-plugin-spec a real cross-vendor standard or just a proposal?

## Scope

**In scope:**
- Official plugin manifest schemas for Claude Code, Cursor, Codex
- Component types each vendor supports
- Environment variable names and conventions
- What is shared vs. vendor-specific
- Adoption status of the open-plugin-spec

**Out of scope:**
- Plugin marketplace UX and discovery flows
- End-user plugin installation instructions
- SKILL.md format (covered in universal-agent-plugin research)

## Source angles

- Official Claude Code docs (code.claude.com/docs/en/plugins-reference)
- Official Cursor docs (cursor.com/docs/reference/plugins)
- Official Codex docs (developers.openai.com/codex/plugins/build)
- Vercel Labs open-plugin-spec GitHub repo
- Community/practitioner sources for gaps

## Findings

### There is no universal plugin manifest

Each major vendor defines its own manifest directory and treats it as canonical. The Vercel Labs `open-plugin-spec` proposes `.plugin/plugin.json` as a vendor-neutral fallback, but none of the three major vendors treat it as their primary path.

### Manifest locations

| Vendor | Manifest directory | Manifest file | Required? |
| --- | --- | --- | --- |
| Claude Code | `.claude-plugin/` | `plugin.json` | No — auto-discovery works without it |
| Cursor | `.cursor-plugin/` | `plugin.json` | Yes |
| Codex | `.codex-plugin/` | `plugin.json` | Yes |
| open-plugin-spec | `.plugin/` | `plugin.json` | Vendor-neutral fallback |

### Required fields per vendor

| Vendor | Required fields |
| --- | --- |
| Claude Code | `name` (only if manifest is present) |
| Cursor | `name` |
| Codex | `name`, `version`, `description` |
| open-plugin-spec | `name` |

### Shared manifest content (works across all three)

These fields mean the same thing across vendors:

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "...",
  "author": { "name": "...", "email": "...", "url": "..." },
  "homepage": "...",
  "repository": "...",
  "license": "...",
  "keywords": [],
  "skills": "./skills/",
  "mcpServers": "./.mcp.json",
  "hooks": "./hooks/hooks.json",
  "agents": "./agents/",
  "commands": "./commands/"
}
```

### What is truly portable (content, not just field names)

- `skills/<name>/SKILL.md` — fully portable across all vendors and 32+ runtimes
- `.mcp.json` content — portable; same structure across vendors
- `hooks/hooks.json` content — partially portable (event names differ: PascalCase vs camelCase)
- `commands/*.md` — portable
- `agents/*.md` — portable

### Vendor divergences

| Aspect | Claude Code | Cursor | Codex |
| --- | --- | --- | --- |
| Plugin root env var | `${CLAUDE_PLUGIN_ROOT}` | unknown | `${PLUGIN_ROOT}` (+ `${CLAUDE_PLUGIN_ROOT}` as compat alias) |
| Data dir env var | `${CLAUDE_PLUGIN_DATA}` | unknown | `${PLUGIN_DATA}` (+ `${CLAUDE_PLUGIN_DATA}` as compat alias) |
| Project dir env var | `${CLAUDE_PROJECT_DIR}` | unknown | — |
| Hook event casing | PascalCase (`PostToolUse`) | camelCase (`postToolUse`) | PascalCase |
| Rules (`.mdc` files) | No | Yes | No |
| Monitors | Yes (experimental, v2.1.105+) | No | No |
| Themes | Yes (experimental) | No | No |
| Channels | Yes | No | No |
| Apps (`.app.json`) | No | No | Yes |
| Bin executables (`bin/`) | Yes | No | No |
| Output styles | Yes | No | No |
| `userConfig` | Yes (prompts at enable time) | No | Via `interface` object |
| `dependencies` | Yes (inter-plugin) | No | No |
| `defaultEnabled` | Yes | No | No |
| `displayName` | Yes | No | No |
| JSON Schema URL | `https://json.schemastore.org/claude-code-plugin-manifest.json` | `https://raw.githubusercontent.com/cursor/plugins/main/schemas/plugin.schema.json` | not published |

### Claude Code manifest (complete schema)

The `.claude-plugin/plugin.json` manifest is **optional**. Claude Code auto-discovers components in default directories (`skills/`, `commands/`, `agents/`, `hooks/hooks.json`, `.mcp.json`, `.lsp.json`, `output-styles/`, `themes/`, `monitors/monitors.json`) without any manifest.

Full schema:

```json
{
  "name": "plugin-name",
  "displayName": "Human Name",
  "version": "1.2.0",
  "description": "...",
  "author": { "name": "...", "email": "...", "url": "..." },
  "homepage": "...",
  "repository": "...",
  "license": "MIT",
  "keywords": [],
  "defaultEnabled": false,
  "skills": "./custom/skills/",
  "commands": ["./custom/cmd.md"],
  "agents": ["./custom/agents/reviewer.md"],
  "hooks": "./config/hooks.json",
  "mcpServers": "./.mcp.json",
  "outputStyles": "./styles/",
  "lspServers": "./.lsp.json",
  "experimental": {
    "themes": "./themes/",
    "monitors": "./monitors.json"
  },
  "userConfig": {
    "api_token": {
      "type": "string",
      "title": "API token",
      "description": "...",
      "sensitive": true,
      "required": false
    }
  },
  "channels": [
    { "server": "telegram", "userConfig": { ... } }
  ],
  "dependencies": [
    "helper-lib",
    { "name": "secrets-vault", "version": "~2.1.0" }
  ]
}
```

Component path rules:
- `skills` **adds to** the default `skills/` directory (default always scanned)
- `commands`, `agents`, `outputStyles`, themes, monitors **replace** their defaults
- Hooks and MCP have their own merge rules

Environment variables (expanded in all path fields, hook commands, MCP/LSP configs):
- `${CLAUDE_PLUGIN_ROOT}` — absolute path to plugin installation directory (ephemeral, changes on update)
- `${CLAUDE_PLUGIN_DATA}` — persistent data directory (`~/.claude/plugins/data/{id}/`), survives updates
- `${CLAUDE_PROJECT_DIR}` — project root Claude Code was launched from

### Cursor manifest

`.cursor-plugin/plugin.json` is required. Minimal:

```json
{
  "name": "plugin-name",
  "description": "...",
  "version": "1.0.0",
  "skills": "./skills/",
  "rules": "./rules/",
  "mcpServers": "./.mcp.json",
  "hooks": "./hooks/hooks.json",
  "agents": "./agents/",
  "commands": "./commands/"
}
```

Cursor-specific:
- `rules` field pointing to `.mdc` rule files (not supported by other vendors)
- `logo` field (relative path or absolute URL to image)
- Hook events use camelCase: `sessionStart`, `postToolUse`, not PascalCase

### Codex manifest

`.codex-plugin/plugin.json` is required. Required fields: `name`, `version`, `description`.

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "...",
  "author": { "name": "...", "email": "...", "url": "..." },
  "skills": "./skills/",
  "mcpServers": "./.mcp.json",
  "apps": "./.app.json",
  "hooks": "./hooks/hooks.json",
  "interface": {
    "displayName": "My Plugin",
    "shortDescription": "...",
    "category": "...",
    "websiteURL": "..."
  }
}
```

Codex-specific:
- `apps` component type (`.app.json`) for connector/app integrations — not supported by other vendors
- `interface` object for marketplace metadata
- Env vars: `${PLUGIN_ROOT}`, `${PLUGIN_DATA}` (primary); `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}` (compatibility aliases)

### Published JSON Schemas — all major runtimes

| Runtime | Schema URL | Notes |
| --- | --- | --- |
| Claude Code | `https://json.schemastore.org/claude-code-plugin-manifest.json` | Draft 7; generated 2026-04-23 |
| Cursor | `https://raw.githubusercontent.com/cursor/plugins/main/schemas/plugin.schema.json` | Draft 7; in cursor/plugins GitHub repo |
| Codex (OpenAI) | not published | Docs only at developers.openai.com |
| open-plugin-spec | not published | Spec prose in vercel-labs/open-plugin-spec; no schema.json |
| Windsurf (Codeium) | not published | Docs at docs.windsurf.com; no schema file |
| GitHub Copilot Extensions | not published | Docs at docs.github.com; no schema file |
| Gemini Code Assist | not published | config.yaml format; no schema file |
| Zed | not published | TOML format (extension.toml); schema requested in issue #21994 |
| Continue.dev | `https://raw.githubusercontent.com/continuedev/continue/main/extensions/vscode/config_schema.json` | Draft 2020-12; VSCode config schema, not a plugin manifest |

### Open Plugin Spec status

Published by Vercel Labs as v1.0.0. Proposes `.plugin/plugin.json` as a vendor-neutral fallback that conformant hosts check after their vendor-specific path. Claude Code is the primary documented host. Cursor and Codex have vendor-specific paths but may fall back to `.plugin/plugin.json` — not confirmed from official docs. The spec is real and published (not a draft) but multi-vendor adoption is partial and early-stage.

## Contradictions

- open-plugin-spec claims Claude Code as a conformant host, but Claude Code's official docs make no mention of `.plugin/plugin.json` — only `.claude-plugin/plugin.json`
- Codex provides `${CLAUDE_PLUGIN_ROOT}` as a compatibility alias, suggesting Claude Code was the first mover and Codex is explicitly aligning to it, not to a neutral standard
- "Universal" plugin format claims in community articles are aspirational; the actual cross-vendor surface is limited to shared component directories (skills/, .mcp.json) not the manifest

## Open questions

- Does Cursor actually fall back to `.plugin/plugin.json` if `.cursor-plugin/plugin.json` is absent?
- What env vars does Cursor provide to hook scripts?
- Is there an official joint statement from Anthropic + OpenAI + Cursor on plugin format alignment?
- Will the open-plugin-spec become a true multi-vendor standard or remain a Vercel Labs proposal?

## Sources consulted

- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Claude Code plugin manifest JSON Schema](https://json.schemastore.org/claude-code-plugin-manifest.json)
- [Cursor Plugins Reference](https://cursor.com/docs/reference/plugins)
- [Cursor plugin manifest JSON Schema](https://raw.githubusercontent.com/cursor/plugins/main/schemas/plugin.schema.json)
- [Codex Plugins Build](https://developers.openai.com/codex/plugins/build)
- [Open Plugin Spec — vercel-labs/open-plugin-spec](https://github.com/vercel-labs/open-plugin-spec)
- [Windsurf extension docs](https://docs.windsurf.com)
- [GitHub Copilot Extensions docs](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference)
- [Gemini Code Assist customization docs](https://developers.google.com/gemini-code-assist/docs/customize-gemini-behavior-github)
- [Zed extension development docs](https://zed.dev/docs/extensions/developing-extensions)
- [Continue.dev VSCode config schema](https://raw.githubusercontent.com/continuedev/continue/main/extensions/vscode/config_schema.json)
