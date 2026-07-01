# Plugin Schema (May–June 2026)

## Question

What do major AI coding agent runtimes actually implement for their plugin/extension manifest format? Which runtimes publish machine-readable schemas? Is the Vercel Labs open-plugin-spec a viable universal standard?

## Scope

**In scope:**
- Official plugin/extension manifest schemas for all major AI coding agent runtimes
- Component types each vendor supports
- Environment variable names and conventions
- What is shared vs. vendor-specific
- Published machine-readable schema URLs (JSON Schema, TOML schema, YAML schema)
- Adoption status of the open-plugin-spec

**Out of scope:**
- Plugin marketplace UX and discovery flows
- End-user plugin installation instructions
- SKILL.md format (covered in universal-agent-plugin research)

## Source angles

- Official Claude Code docs (code.claude.com/docs/en/plugins-reference)
- Official Cursor docs (cursor.com/docs/reference/plugins)
- Official Codex docs (developers.openai.com/codex/plugins/build)
- GitHub Copilot CLI docs (docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference)
- Windsurf/Codeium docs (docs.windsurf.com)
- Gemini Code Assist docs (developers.google.com/gemini-code-assist)
- Zed editor docs (zed.dev/docs/extensions)
- Continue.dev docs (docs.continue.dev)
- Cline SDK docs (docs.cline.bot/sdk/plugins)
- Vercel Labs open-plugin-spec GitHub repo
- GitHub repos for schema files: zed-industries/zed, cursor/plugins, continuedev/continue

## Findings

### Runtime taxonomy — three tiers

Not all runtimes have equivalent plugin systems. They fall into three tiers:

**Tier 1 — Plugin bundle manifest** (installable packages with a manifest file):
Claude Code, Cursor, Codex, GitHub Copilot CLI

**Tier 2 — Config-based or file-based extensibility** (customizable but no bundle manifest):
Windsurf, Continue.dev, Cline, Zed

**Tier 3 — No plugin system** (closed or configuration-only):
Gemini Code Assist, Amazon Q Developer, Sourcegraph Cody, Tabnine, Supermaven, Aider, JetBrains AI Assistant

### Manifest locations — Tier 1 runtimes

| Vendor | Manifest directory | Manifest file | Required? |
| --- | --- | --- | --- |
| Claude Code | `.claude-plugin/` | `plugin.json` | No — auto-discovery works without it |
| Cursor | `.cursor-plugin/` | `plugin.json` | Yes |
| Codex | `.codex-plugin/` | `plugin.json` | Yes |
| GitHub Copilot CLI | plugin root (or `.plugin/`, `.github/plugin/`) | `plugin.json` | Yes |
| open-plugin-spec | `.plugin/` | `plugin.json` | Vendor-neutral fallback (unverified adoption) |

### Required fields per Tier 1 vendor

| Vendor | Required fields |
| --- | --- |
| Claude Code | `name` (only if manifest is present) |
| Cursor | `name` |
| Codex | `name`, `version`, `description` |
| GitHub Copilot CLI | `name` (kebab-case, max 64 chars) |
| open-plugin-spec | `name` |

### Shared manifest content (works across Tier 1)

These fields mean the same thing across all four Tier 1 vendors:

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

- `skills/<name>/SKILL.md` — fully portable across all Tier 1 vendors and 32+ runtimes
- `.mcp.json` content — portable; same MCP protocol structure across all vendors
- `hooks/hooks.json` content — partially portable (event names differ: PascalCase vs camelCase)
- `commands/*.md` — portable
- `agents/*.md` — portable

### Tier 1 vendor divergences

| Aspect | Claude Code | Cursor | Codex | GitHub Copilot CLI |
| --- | --- | --- | --- | --- |
| Manifest required | No | Yes | Yes | Yes |
| Plugin root env var | `${CLAUDE_PLUGIN_ROOT}` | unknown | `${PLUGIN_ROOT}` (+ `${CLAUDE_PLUGIN_ROOT}` compat) | not documented |
| Data dir env var | `${CLAUDE_PLUGIN_DATA}` | unknown | `${PLUGIN_DATA}` (+ `${CLAUDE_PLUGIN_DATA}` compat) | not documented |
| Project dir env var | `${CLAUDE_PROJECT_DIR}` | unknown | — | not documented |
| Hook event casing | PascalCase (`PostToolUse`) | camelCase (`postToolUse`) | PascalCase | camelCase (`postToolUse`) |
| Hook types | command (bash) | command (bash) | command (bash) | command (bash/powershell), HTTP, prompt |
| Rules (`.mdc` files) | No | Yes | No | No |
| Monitors | Yes (experimental) | No | No | No |
| Themes | Yes (experimental) | No | No | No |
| Channels | Yes | No | No | No |
| Apps (`.app.json`) | No | No | Yes | No |
| Bin executables | Yes | No | No | No |
| `userConfig` | Yes | No | Via `interface` obj | No |
| `dependencies` | Yes (inter-plugin) | No | No | No |
| `defaultEnabled` | Yes | No | No | No |
| `displayName` | Yes | No | No | No |
| permissionRequest hook | No | No | No | Yes |
| HTTP hook type | No | No | No | Yes |
| JSON Schema URL | `https://json.schemastore.org/claude-code-plugin-manifest.json` | `https://raw.githubusercontent.com/cursor/plugins/main/schemas/plugin.schema.json` | not published | not published |

### Tier 2 — Config-based or file-based extensibility

#### Windsurf (Codeium)

No single plugin.json. Customization is spread across separate files:

| File | Location | Purpose |
| --- | --- | --- |
| `SKILL.md` | `.windsurf/skills/<name>/SKILL.md` or `~/.codeium/windsurf/skills/` | Agent capability definition (YAML frontmatter: `name`, `description` required) |
| `hooks.json` | `.windsurf/hooks.json` or `~/.codeium/windsurf/hooks.json` | Automation at 12 lifecycle events |
| `mcp_config.json` | `~/.codeium/windsurf/mcp_config.json` | MCP server connections |
| `.windsurfrules` / `RULES.md` | `.windsurf/rules/` | Behavioral constraints for Cascade |

Hook events (12 total): `pre_read_code`, `post_read_code`, `pre_write_code`, `post_write_code`, `pre_run_command`, `post_run_command`, `pre_mcp_tool_use`, `post_mcp_tool_use`, `pre_user_prompt`, `post_cascade_response`, `post_cascade_response_with_transcript`, `post_setup_worktree`. Pre-hooks can block (exit code 2). No JSON schema published for any file.

Windsurf also supports VS Code-compatible extensions via Open VSX Registry (standard `.vsix` format).

#### Continue.dev

Uses `config.yaml` (YAML format) in `.continue/` directory. Required fields: `name`, `version`, `schema`. Optional sections: `models`, `context`, `rules`, `prompts`, `docs`, `mcp_servers`, `data`. No plugin bundle manifest. Schema published at unstable raw GitHub URL: https://raw.githubusercontent.com/continuedev/continue/main/extensions/vscode/config_schema.json. Hub marketplace at https://continue.dev/hub. Legacy `config.json` format deprecated.

#### Cline

Has a formal plugin system using `package.json` with a `cline` object. Plugin `paths` array declares TypeScript/JavaScript entry points. Exports `AgentPlugin` interface: `name`, `manifest` (capabilities array), `setup(api, ctx)`, optional `hooks`. Hook lifecycle: `beforeRun`, `afterRun`, `beforeModel`, `afterModel`, `beforeTool`, `afterTool`, `onEvent`. Hook config: `mode` (blocking/async), `timeoutMs`, `retries`, `failureMode` (fail_open/fail_closed). Installation: file URL, git repo, npm package, local path. Plugin locations: `~/.cline/plugins/` (global), `.cline/plugins/` (project). Plugin support is SDK/CLI only — VS Code and JetBrains extensions do not yet support plugins. Also uses `.clinerules/` (recognizes `.cursorrules`, `.windsurfrules`, `AGENTS.md`). No JSON schema published.

#### Zed

Uses `extension.toml` (TOML format) in a git repository root. Required fields: `id`, `name`, `version`, `schema_version` (currently 1), `authors`, `description`, `repository`. `id` must not contain "zed", "Zed", or "extension". Component types: language servers, grammars, themes, debuggers, snippets, MCP server extensions. Extensions compiled to WASM (`cdylib`) when they require code. No schema published for `extension.toml`; GitHub issue #21994 open. Themes have a published schema: https://zed.dev/schema/themes/v0.2.0.json. Distribution via PR to zed-industries/extensions repo.

### Tier 3 — No plugin system

| Runtime | Model | Notes |
| --- | --- | --- |
| Gemini Code Assist | Closed IDE extension | VS Code (`Google.geminicodeassist`), JetBrains (#24198). `.aiexclude` for file exclusion. Moving to MCP for external tools but no plugin dev API. |
| Amazon Q Developer | Service-based IDE extension | Available for VS Code, JetBrains, Eclipse, Visual Studio. No plugin development API. |
| Sourcegraph Cody | Service-based IDE extension | Integrates with Sourcegraph Enterprise. No plugin system. |
| Tabnine | Legacy/deprecated | Enterprise-only deployment. No public plugin SDK. |
| Supermaven | Single-purpose completion | No extensibility API. |
| Aider | Configuration-only CLI | `.aider.conf.yml` (YAML); env vars prefixed `AIDER_`. No plugin architecture. |
| JetBrains AI Assistant | Built-in IDE feature | Uses inherited JetBrains `plugin.xml`; no external extensibility hooks specific to AI features. |
| Roo Code | **Archived May 15, 2026** | Was a Cline fork; no independent plugin system. Community fork: ZooCode. |
| Pear AI | Inherits Continue.dev | Electron app using Continue as submodule; no independent plugin system. |
| Gemini CLI | Extension manifest (unverified) | Google CLI agent, distinct from Gemini Code Assist. OIAP has an exporter for it. Primary docs not verified. |
| OpenCode | `opencode.json` (unverified) | Python/JavaScript SDK model. OIAP exporter exists. Primary docs not verified. |
| OpenClaw | `openclaw.plugin.json` (unverified) | Has `package.json` and `index.ts`. OIAP exporter exists. Primary docs not verified. |
| Antigravity | `.agents/` directory (unverified) | Rules, skills, workflows under `.agents/`. OIAP exporter exists. Primary docs not verified. |
| Kiro | Future target | Rule/steering focus. No OIAP exporter yet. |
| Trae | Future target | Rule/steering focus. No OIAP exporter yet. |

### Published JSON Schemas — all major runtimes

| Runtime | Schema URL | Format | Notes |
| --- | --- | --- | --- |
| Claude Code | https://json.schemastore.org/claude-code-plugin-manifest.json | JSON Schema Draft 7 | Generated 2026-04-23; on SchemaStore |
| Cursor | https://raw.githubusercontent.com/cursor/plugins/main/schemas/plugin.schema.json | JSON Schema Draft 7 | In cursor/plugins GitHub repo |
| Codex (OpenAI) | not published | — | Docs only at developers.openai.com |
| GitHub Copilot CLI | not published | — | Docs only at docs.github.com |
| open-plugin-spec | not published | — | Spec prose in vercel-labs/open-plugin-spec; no schema.json |
| Windsurf | not published | — | Docs at docs.windsurf.com; separate files, no single manifest schema |
| Zed (extension.toml) | not published | — | Issue #21994 open; themes schema at https://zed.dev/schema/themes/v0.2.0.json |
| Continue.dev | https://raw.githubusercontent.com/continuedev/continue/main/extensions/vscode/config_schema.json | JSON Schema Draft 2020-12 | Unstable raw GitHub URL; config, not plugin bundle manifest |
| Gemini Code Assist | N/A | — | No plugin system |
| Gemini CLI | not published | — | Extension manifest with embedded MCP config (per OIAP E27); primary docs not verified |
| OpenCode | not published | — | `opencode.json` manifest (per OIAP E23); primary docs not verified |
| OpenClaw | not published | — | `openclaw.plugin.json` (per OIAP E23); primary docs not verified |
| Amazon Q Developer | N/A | — | No plugin system |
| Cline | not published | — | Docs at https://docs.cline.bot/sdk/plugins; no schema file |
| Aider | not published | — | Docs only at aider.chat/docs/config.html; no plugin system |

**Only Claude Code and Cursor publish machine-readable schemas at stable, authoritative URLs.**

### Open Plugin Spec status

Published by Vercel Labs as v1.0.0. Proposes `.plugin/plugin.json` as a vendor-neutral fallback that conformant hosts check after their vendor-specific path. Claude Code is the primary documented host. Cursor and Codex have vendor-specific paths but may fall back to `.plugin/plugin.json` — not confirmed from official docs. GitHub Copilot CLI also searches `.plugin/` among its fallback paths, lending partial credibility to the spec as a fallback convention. The spec is real and published (not a draft) but multi-vendor adoption as primary path is unconfirmed.

### MCP as the real convergence layer

Every active runtime surveyed supports MCP (Model Context Protocol) server integration, even those without a plugin manifest system. The `.mcp.json` file format is broadly shared. MCP is the de-facto cross-vendor extensibility mechanism beyond SKILL.md.

## Contradictions

- open-plugin-spec claims Claude Code as a conformant host, but Claude Code's official docs make no mention of `.plugin/plugin.json` — only `.claude-plugin/plugin.json`
- Codex provides `${CLAUDE_PLUGIN_ROOT}` as a compatibility alias, suggesting Claude Code was the first mover and Codex is explicitly aligning to it, not to a neutral standard
- GitHub Copilot CLI searches `.plugin/` as a fallback path, but it is not their primary path either — consistent with open-plugin-spec as a weak convention rather than a standard
- "Universal" plugin format claims in community articles are aspirational; the actual cross-vendor surface at the manifest level is limited to name/version/description and component pointer fields
- The prior research claimed Windsurf has docs at docs.windsurf.com — confirmed; but it does not have a single plugin manifest, rather a set of separate files

## Open questions

- Does Cursor actually fall back to `.plugin/plugin.json` if `.cursor-plugin/plugin.json` is absent?
- What env vars does Cursor provide to hook scripts?
- Is there an official joint statement from Anthropic + OpenAI + Cursor + GitHub on plugin format alignment?
- Will the open-plugin-spec become a true multi-vendor standard or remain a Vercel Labs proposal?
- Will Zed publish a schema for `extension.toml` (issue #21994 is open and assigned)?
- Will Cline's plugin system reach VS Code/JetBrains extension support?

## Sources consulted

- [Claude Code Plugins Reference](https://code.claude.com/docs/en/plugins-reference)
- [Claude Code plugin manifest JSON Schema](https://json.schemastore.org/claude-code-plugin-manifest.json)
- [Cursor Plugins Reference](https://cursor.com/docs/reference/plugins)
- [Cursor plugin manifest JSON Schema](https://raw.githubusercontent.com/cursor/plugins/main/schemas/plugin.schema.json)
- [Codex Plugins Build](https://developers.openai.com/codex/plugins/build)
- [GitHub Copilot CLI Plugin Reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference)
- [GitHub Copilot CLI Creating Plugins](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/plugins-creating)
- [GitHub Copilot Hooks Reference](https://docs.github.com/en/copilot/reference/hooks-configuration)
- [Windsurf Cascade Skills](https://docs.windsurf.com/windsurf/cascade/skills)
- [Windsurf Cascade Hooks](https://docs.windsurf.com/windsurf/cascade/hooks)
- [Windsurf Cascade MCP Integration](https://docs.windsurf.com/plugins/cascade/mcp)
- [Gemini Code Assist Documentation](https://developers.google.com/gemini-code-assist/docs/overview)
- [Zed Extensions — Developing Extensions](https://zed.dev/docs/extensions/developing-extensions)
- [Zed MCP Server Extensions](https://zed.dev/docs/extensions/mcp-extensions)
- [Zed Theme Schema v0.2.0](https://zed.dev/schema/themes/v0.2.0.json)
- [Zed GitHub Issue #21994 — Schema request](https://github.com/zed-industries/zed/issues/21994)
- [Continue.dev Hub](https://continue.dev/hub)
- [Continue.dev config_schema.json](https://raw.githubusercontent.com/continuedev/continue/main/extensions/vscode/config_schema.json)
- [Cline SDK Plugin Reference](https://docs.cline.bot/sdk/plugins)
- [Cline Writing Plugins Guide](https://docs.cline.bot/sdk/guides/writing-plugins)
- [Open Plugin Spec — vercel-labs/open-plugin-spec](https://github.com/vercel-labs/open-plugin-spec)
- [Amazon Q Developer docs](https://docs.aws.amazon.com/amazonq/)
- [Roo Code archived repository](https://github.com/RooCodeInc/Roo-Code)
- [Aider configuration docs](https://aider.chat/docs/config.html)
- [OIAP — fboldo/oiap](https://github.com/fboldo/oiap)
- [OIAP ARCHITECTURE.md](https://github.com/fboldo/oiap/blob/main/ARCHITECTURE.md)
- [OIAP MATRIX.md](https://github.com/fboldo/oiap/blob/main/MATRIX.md)
