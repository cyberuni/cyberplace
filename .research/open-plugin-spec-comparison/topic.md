# Open Plugin Spec Comparison (June 2026)

## Question

How does the Vercel Labs open-plugin-spec v1.0.0 compare to what major AI coding agent runtimes actually implement? Where do they align, diverge, or add vendor-specific extensions?

## Scope

**In scope:**
- Field-by-field comparison of open-plugin-spec against each Tier 1 runtime's plugin manifest
- Hook events and hook types per runtime
- Environment variable naming conventions
- Component field coverage
- Manifest path and discovery behavior
- Tier 2 runtimes (file-based) compared at concept level

**Out of scope:**
- Runtime behavior semantics beyond manifest structure
- Marketplace UX and plugin discovery flows
- SKILL.md internal format (covered in universal-agent-plugin research)
- Runtimes with no plugin system (Tier 3)

## Source angles

- open-plugin-spec v1.0.0: https://github.com/vercel-labs/open-plugin-spec
- Claude Code JSON Schema: https://json.schemastore.org/claude-code-plugin-manifest.json
- Cursor JSON Schema: https://raw.githubusercontent.com/cursor/plugins/main/schemas/plugin.schema.json
- Codex docs: https://developers.openai.com/codex/plugins/build
- GitHub Copilot CLI docs: https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference
- Windsurf docs: https://docs.windsurf.com/windsurf/cascade/skills
- Prior plugin-schema research: .research/plugin-schema/

## open-plugin-spec v1.0.0 baseline

The spec defines a **two-tier component model**:

**Core profile** (every conformant host must support):
- `skills/` — SKILL.md bundles per the Agent Skills specification
- `mcpServers` — MCP server configuration

**Extended profile** (host-dependent, optional):
- `commands/`, `agents/`, `rules/`, `hooks/`, `lspServers`, `outputStyles`

Manifest lives at `.plugin/plugin.json`. Only `name` is required. Vendor-specific manifest paths (`.claude-plugin/plugin.json`, etc.) are preferred when found; `.plugin/plugin.json` is the fallback.

Environment variables: `${PLUGIN_ROOT}` (required), `${PLUGIN_DATA}` (recommended).

Marketplace schema defined in `.plugin/marketplace.json` (optional).

## Findings

### Metadata fields

| Field | open-plugin-spec | Claude Code | Cursor | Codex | Copilot CLI |
|---|---|---|---|---|---|
| `name` | ✅ required | ✅ required | ✅ required | ✅ required | ✅ required |
| `version` | ✅ optional | ✅ optional | ✅ optional | ✅ **required** | ✅ optional |
| `description` | ✅ optional | ✅ optional | ✅ optional | ✅ **required** | ✅ optional |
| `author` | ✅ (name, email, url) | ✅ (name, email, url) | ✅ (name, email — **no url**) | ✅ (name, email, url) | ✅ optional |
| `homepage` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `repository` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `license` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `keywords` | ✅ | ✅ | ✅ | — | ✅ |
| `displayName` | ❌ not in spec | ✅ Claude Code | ✅ Cursor | — | — |
| `publisher` | ❌ not in spec | ❌ | ✅ Cursor | — | — |
| `logo` | ❌ not in spec | ❌ | ✅ Cursor | — | — |
| `category` | ❌ not in spec | ❌ | ✅ Cursor | — | — |
| `tags` | ❌ not in spec | ❌ | ✅ Cursor | — | — |
| `defaultEnabled` | ❌ not in spec | ✅ Claude Code | ❌ | — | — |
| `dependencies` | ❌ not in spec | ✅ Claude Code | ❌ | — | — |
| `interface` | ❌ not in spec | ❌ | ❌ | ✅ Codex | — |

Codex mandates `version` and `description` as required fields; the spec leaves both optional. This is the most significant required-field divergence.

### Component fields

| Component | open-plugin-spec | Claude Code | Cursor | Codex | Copilot CLI | Windsurf | Zed | Continue.dev |
|---|---|---|---|---|---|---|---|---|
| `skills` | ✅ **core** | ✅ | ✅ | ✅ | ✅ | SKILL.md files, no manifest field | ❌ | ❌ |
| `mcpServers` | ✅ **core** | ✅ | ✅ | ✅ | ✅ | `mcp_config.json` separate | `[context_servers.*]` | `mcp_servers` in config.yaml |
| `commands` | ✅ extended | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | `prompts` (different concept) |
| `agents` | ✅ extended | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| `rules` | ✅ extended | ❌ | ✅ (`.mdc`) | ❌ | ❌ | `.windsurfrules` separate | ❌ | `rules` in config |
| `hooks` | ✅ extended | ✅ | ✅ | ✅ | `hooks.json` separate | ❌ | ❌ | ❌ |
| `lspServers` | ✅ extended | ✅ | ❌ | ❌ | ❌ | `[language_servers.*]` in extension.toml | ❌ | ❌ |
| `outputStyles` | ✅ extended | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `themes` | ❌ not in spec | ✅ Claude Code | ❌ | ❌ | ❌ | ❌ | ✅ separate extension | ❌ |
| `channels` | ❌ not in spec | ✅ Claude Code | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `monitors` | ❌ not in spec | ✅ Claude Code | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `settings` | ❌ not in spec | ✅ Claude Code | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `userConfig` | ❌ not in spec | ✅ Claude Code | ❌ | via `interface` | ❌ | ❌ | ❌ | ❌ |
| `apps` | ❌ not in spec | ❌ | ❌ | ✅ Codex | ❌ | ❌ | ❌ | ❌ |

Claude Code is the most complete implementation of the extended profile. It also extends beyond the spec with 6 additional component types. Cursor skips `lspServers` and `outputStyles`. Codex skips `commands`, `agents`, `rules`, `lspServers`, `outputStyles`. Windsurf's component types have no direct manifest field equivalents — they are all separate files.

### Hook events — naming and coverage

The spec defines 5 core events (PascalCase) plus an extended set. Each runtime's casing is a breaking incompatibility:

| open-plugin-spec event | Claude Code | Cursor | Codex | Copilot CLI | Windsurf |
|---|---|---|---|---|---|
| `PreToolUse` | ✅ `PreToolUse` | `preToolUse` ⚠️ | `PreToolUse` | `preToolUse` ⚠️ | `pre_mcp_tool_use` ⚠️ scoped |
| `PostToolUse` | ✅ `PostToolUse` | `postToolUse` ⚠️ | `PostToolUse` | `postToolUse` ⚠️ | `post_mcp_tool_use` ⚠️ scoped |
| `PostToolUseFailure` | ✅ `PostToolUseFailure` | — | — | — | — |
| `SessionStart` | ✅ `SessionStart` | `sessionStart` ⚠️ | `SessionStart` | `sessionStart` ⚠️ | — |
| `SessionEnd` | ✅ `SessionEnd` | `sessionEnd` ⚠️ | `SessionEnd` | `sessionEnd` ⚠️ | — |
| `UserPromptSubmit` | ✅ `UserPromptSubmit` | — | — | — | `pre_user_prompt` ⚠️ |
| `Stop` | ✅ `Stop` | — | — | `agentStop` (different name) | — |
| `PermissionRequest` | ✅ `PermissionRequest` | — | — | `permissionRequest` ⚠️ | — |
| `Notification` | ✅ `Notification` | — | — | `notification` ⚠️ | — |
| *(not in spec)* | `PostToolBatch`, `UserPromptExpansion`, `PermissionDenied`, `Setup` | — | — | — | `pre/post_read_code`, `pre/post_write_code`, `pre/post_run_command`, `post_cascade_response`, `post_setup_worktree` |

⚠️ = event exists in concept but named differently — a single `hooks.json` targeting the spec's PascalCase will be silently ignored by camelCase runtimes.

### Hook types

| Hook type | open-plugin-spec | Claude Code | Cursor | Codex | Copilot CLI |
|---|---|---|---|---|---|
| `command` (shell) | ✅ | ✅ + `if`, `async`, `asyncRewake`, `once`, `shell`, `statusMessage` | ✅ | ✅ | ✅ bash + powershell, `timeoutSec` |
| `http` | ✅ | ✅ + `headers`, `allowedEnvVars` | — | — | ✅ HTTPS POST only |
| `prompt` | ✅ | ✅ + `model`, `once` | — | — | ✅ |
| `agent` | ✅ | ✅ + `model`, `once` | — | — | — |
| `mcp_tool` | ❌ not in spec | ✅ Claude Code adds | — | — | — |

Claude Code implements all four spec-defined hook types and adds a fifth (`mcp_tool`). Cursor implements only `command`. Codex implements only `command`. Copilot CLI implements `command`, `http`, and `prompt` — the same three spec types the spec defines minus `agent`.

### Environment variables

| Variable | open-plugin-spec | Claude Code | Cursor | Codex | Copilot CLI | Windsurf |
|---|---|---|---|---|---|---|
| Plugin root | `${PLUGIN_ROOT}` | `${CLAUDE_PLUGIN_ROOT}` | undocumented | `${PLUGIN_ROOT}` ✅ + `${CLAUDE_PLUGIN_ROOT}` compat | undocumented | `worktree_path` via stdin JSON |
| Persistent data | `${PLUGIN_DATA}` | `${CLAUDE_PLUGIN_DATA}` | undocumented | `${PLUGIN_DATA}` ✅ + `${CLAUDE_PLUGIN_DATA}` compat | undocumented | — |
| Project dir | — | `${CLAUDE_PROJECT_DIR}` | undocumented | — | — | `root_workspace_path` via stdin JSON |

Codex is the only runtime that matches the spec's env var names exactly. Claude Code uses the vendor-prefixed variants that Codex then re-exports as compatibility aliases — evidence that Claude Code was the origin and the spec later adopted Codex's naming. Windsurf passes context as JSON via stdin rather than as process env vars, which is architecturally incompatible with the spec's substitution model.

### Manifest path and discovery

| | open-plugin-spec | Claude Code | Cursor | Codex | Copilot CLI |
|---|---|---|---|---|---|
| Primary path | `.plugin/plugin.json` | `.claude-plugin/plugin.json` | `.cursor-plugin/plugin.json` | `.codex-plugin/plugin.json` | `plugin.json` (root) |
| Searches `.plugin/`? | — (is the spec) | unconfirmed | unconfirmed | unconfirmed | ✅ confirmed fallback |
| Manifest required? | yes | **no** | yes | yes | yes |
| Auto-discovery w/o manifest | ❌ not in spec | ✅ Claude Code extension | ❌ | ❌ | ❌ |

No vendor uses `.plugin/plugin.json` as its primary path. Copilot CLI is the only one that confirms searching it as a fallback. Claude Code's auto-discovery feature (no manifest needed at all) has no equivalent in the spec.

### Path config format

The spec allows three forms for any component field:
```
"skills": "./skills/"                   // string
"skills": ["./skills/", "./extra/"]    // string[]
"skills": { "paths": ["./skills/"] }  // path config object
```

Claude Code and Cursor implement the string and string-array forms. The `{ "paths": [...] }` object form is defined by the spec; vendor support for it is unconfirmed from primary docs.

The spec also defines object disambiguation: if an object contains `mcpServers` it is treated as inline MCP config; if it contains `paths` it is a path config. Claude Code confirms inline MCP config support. The `paths` object form is spec-defined but not confirmed adopted.

## Summary: deviation matrix

| Runtime | Spec alignment | Key divergences |
|---|---|---|
| **Claude Code** | ~70% | Vendor-prefixed env vars; adds 6+ components not in spec (`themes`, `channels`, `monitors`, `userConfig`, `dependencies`, `settings`); adds `mcp_tool` hook type; manifest optional (spec requires); most hook events PascalCase match spec |
| **Cursor** | ~60% | camelCase hook events (breaking); adds marketplace fields (`publisher`, `logo`, `category`, `tags`); missing `lspServers`, `outputStyles`; drops `author.url`; includes `rules` ✅ |
| **Codex** | ~55% | Closest on env vars; mandates `version`+`description`; adds `apps`, `interface`; missing `commands`, `agents`, `rules`, `lspServers`, `outputStyles`; PascalCase hooks match spec |
| **Copilot CLI** | ~65% | camelCase hook events (breaking); searches `.plugin/` as fallback; adds `permissionRequest`/`notification`/`agentStop`; powershell + HTTP hook support; env vars undocumented |
| **Windsurf** | ~20% | No bundle manifest; separate files per component; snake_case hook events; env via stdin JSON; only SKILL.md and MCP concepts overlap |
| **Zed** | ~10% | TOML format, incompatible structure; extension.toml is a language/tool extension not an agent plugin bundle; only MCP servers overlap |
| **Continue.dev** | ~15% | YAML config, not a bundle manifest; `mcp_servers` field name matches; `rules` present but different semantics; no `skills` |
| **Cline** | ~5% | TypeScript SDK interface; entirely different extensibility model; shares MCP and concept of hooks only |

## Contradictions

- The spec claims Claude Code as a conformant host, but Claude Code's official docs make no mention of `.plugin/plugin.json` as a supported path. The spec's "primary" fallback location is not primary for any vendor.
- Codex's env var naming (`${PLUGIN_ROOT}`, `${PLUGIN_DATA}`) matches the spec exactly, yet Codex also provides `${CLAUDE_PLUGIN_ROOT}` as a compat alias for Claude Code's divergent naming — suggesting Claude Code was the original and the spec adopted Codex's normalization, not the other way around.
- The spec defines `rules` as an extended component type; Cursor implements it, Claude Code does not — the opposite of what "Claude Code as primary conformant host" would predict.
- Hook event casing: the spec uses PascalCase (matching Claude Code and Codex), but GitHub Copilot CLI (which searches `.plugin/` as a fallback) uses camelCase — meaning a spec-conformant `hooks.json` will not work on Copilot CLI without transformation.

## Open questions

- Does any vendor actually load `.plugin/plugin.json` as a fallback in practice? (Only Copilot CLI confirmed from docs.)
- Does the spec's `{ "paths": [...] }` path config object form work on any current vendor?
- Will hook event casing ever be standardized? A cross-runtime `hooks.json` currently requires runtime-specific event names.
- Will the spec adopt vendor extensions like `userConfig`, `channels`, or `monitors` in a future version?

## Sources consulted

- [open-plugin-spec v1.0.0](https://github.com/vercel-labs/open-plugin-spec)
- [Claude Code plugin manifest JSON Schema](https://json.schemastore.org/claude-code-plugin-manifest.json)
- [Cursor plugin manifest JSON Schema](https://raw.githubusercontent.com/cursor/plugins/main/schemas/plugin.schema.json)
- [Codex Plugins Build](https://developers.openai.com/codex/plugins/build)
- [GitHub Copilot CLI Plugin Reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference)
- [Windsurf Cascade Skills](https://docs.windsurf.com/windsurf/cascade/skills)
- [Windsurf Cascade Hooks](https://docs.windsurf.com/windsurf/cascade/hooks)
- Prior research: .research/plugin-schema/
