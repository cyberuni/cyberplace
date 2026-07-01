# Plugin Design

Authoritative rules for creating, validating, and transforming cross-vendor agent plugins. Apply when creating, auditing, or distributing a plugin; see **skill-design** governance for standalone skill authoring rules.

A **plugin** is the distribution unit — it bundles skills, MCP servers, hooks, commands, agents, and other extensions into a single installable package. A **skill** is the capability unit inside a plugin. Install plugins; invoke skills.

## Source of Truth: `.plugin/plugin.json`

Author `.plugin/plugin.json` as the canonical manifest. All vendor manifests are derived from it via `build`. This file is never read directly by vendors at runtime; it is the single source that the build layer transforms into each vendor's manifest.

Schema declaration (first field):

```json
{ "$schema": "https://schema.cyberuni.dev/universal-agent-plugin/v1.json" }
```

### Required fields

| Field | Type | Constraint |
| --- | --- | --- |
| `name` | string | 1–64 chars. Pattern: `^[a-z0-9]([a-z0-9\-.]*[a-z0-9])?$`. Lowercase letters, digits, hyphens, periods only. No leading/trailing `-` or `.`. No `--` or `..`. |

### Optional metadata fields

| Field | Type | Notes |
| --- | --- | --- |
| `version` | string | semver. **Required by Codex** — build fails if absent. |
| `description` | string | ≤ 1024 chars. **Required by Codex** — build fails if absent. |
| `author` | object | `{ name, email, url }` — all sub-fields optional. |
| `homepage` | string | URL. |
| `repository` | string \| object | URL string or `{ type, url }` object. |
| `license` | string | SPDX identifier (e.g. `"MIT"`). |
| `keywords` | string[] | Searchable tags for marketplace discovery. |

### Component path fields

Each accepts `string | string[] | { paths: string[] }`. Every path must start with `./`. No `../` segments — traversal rejected by conformant hosts.

| Field | Component | Core? | Notes |
| --- | --- | --- | --- |
| `skills` | Skill directories containing `SKILL.md` | Yes | Default: `./skills/` |
| `mcpServers` | `.mcp.json` path or inline MCP config | Yes | Default: `./.mcp.json` |
| `commands` | Slash command `.md` files | Extended | Default: `./commands/` |
| `agents` | Agent `.md` files | Extended | Default: `./agents/` |
| `rules` | Context rule `.mdc` files | Extended | Cursor-only; ignored by other hosts |
| `hooks` | `hooks.json` path or inline hook config | Extended | Canonical uses PascalCase events; build translates per vendor |
| `lspServers` | `.lsp.json` path | Extended | Claude Code only |
| `outputStyles` | Output style resources directory | Extended | Claude Code only |

A conformant host must support at least one core component (`skills` or `mcpServers`). Extended types are silently ignored on non-supporting hosts — do not rely on them for core plugin functionality.

### `vendorExtensions` field

Declares which vendor manifests `build` generates, and provides vendor-specific fields for each. Each key is a recognized vendor ID; its presence drives build output. An empty `{}` opts into that vendor's output with no vendor-specific fields.

| Vendor ID | Output path | Required beyond `name` |
| --- | --- | --- |
| `claude-code` | `.claude-plugin/plugin.json` | none |
| `cursor` | `.cursor-plugin/plugin.json` | none |
| `codex` | `.codex-plugin/plugin.json` | `version`, `description` |
| `copilot-cli` | `plugin.json` (repo root) | none |

Vendor-specific extension fields:

| Field | `claude-code` | `cursor` | `codex` | `copilot-cli` |
| --- | --- | --- | --- | --- |
| `displayName` | ✓ | — | — | — |
| `defaultEnabled` | ✓ (bool) | — | — | — |
| `userConfig` | ✓ (prompted at enable) | — | — | — |
| `channels` | ✓ | — | — | — |
| `dependencies` | ✓ (inter-plugin) | — | — | — |
| `themes` | ✓ | — | — | — |
| `monitors` | ✓ | — | — | — |
| `logo` | — | ✓ | — | — |
| `publisher` | — | ✓ | — | — |
| `category` | — | ✓ | — | ✓ |
| `tags` | — | ✓ | — | ✓ |
| `apps` | — | — | ✓ (→ `.app.json`) | — |
| `interface` | — | — | ✓ (marketplace metadata) | — |

## Canonical Directory Layout

```
<plugin-name>/
├── .plugin/
│   └── plugin.json               ← canonical source of truth
│
├── skills/<skill-name>/SKILL.md  ← shared: all vendors, identical format
│
├── commands/setup.md             ← required when rules/ is present
├── commands/<cmd-name>.md        ← Claude Code + Cursor + Copilot CLI
├── agents/<agent-name>.md        ← Claude Code + Cursor + Copilot CLI
├── rules/<rule-name>.mdc         ← Cursor-only always-on
│
├── hooks/hooks.json              ← canonical hooks (PascalCase, ${PLUGIN_ROOT})
│
├── .mcp.json                     ← source of truth (all vendors)
├── mcp.json -> .mcp.json         ← symlink (Cursor + open-plugin-spec)
│
└── README.md
```

Generated build artifacts (gitignore or commit — author's choice):

```
├── .claude-plugin/
│   ├── plugin.json               ← generated
│   └── hooks/hooks.json          ← generated (PascalCase, ${CLAUDE_PLUGIN_ROOT})
├── .cursor-plugin/
│   ├── plugin.json               ← generated
│   └── hooks/hooks.json          ← generated (camelCase, ${PLUGIN_ROOT} pass-through)
├── .codex-plugin/
│   ├── plugin.json               ← generated
│   └── hooks/hooks.json          ← generated (PascalCase, ${PLUGIN_ROOT} native)
└── plugin.json                   ← generated (copilot-cli root manifest)
```

## Vendor Manifest Derivation

Build reads `.plugin/plugin.json`, applies the rules below, writes each vendor's output.

### Metadata field mapping

| Canonical field | Claude Code | Cursor | Codex | Copilot CLI |
| --- | --- | --- | --- | --- |
| `name` | ✓ required | ✓ required | ✓ required | ✓ required |
| `version` | ✓ optional | ✓ optional | ✓ **required** | ✓ optional |
| `description` | ✓ optional | ✓ optional | ✓ **required** | ✓ optional |
| `author`, `homepage`, `repository`, `license`, `keywords` | ✓ | ✓ | ✓ | ✓ |

### Component path field mapping

| Canonical field | Claude Code | Cursor | Codex | Copilot CLI |
| --- | --- | --- | --- | --- |
| `skills` | ✓ | ✓ | ✓ | ✓ |
| `mcpServers` | ✓ → `./.mcp.json` | adapt → `./mcp.json` (symlink) | ✓ → `./.mcp.json` | ✓ |
| `commands` | ✓ | ✓ | **omit** | ✓ |
| `agents` | ✓ | ✓ | **omit** | ✓ |
| `rules` | **omit** | ✓ | **omit** | **omit** |
| `hooks` | adapt → PascalCase, `${CLAUDE_PLUGIN_ROOT}` | adapt → camelCase, pass-through env | ✓ → PascalCase, `${PLUGIN_ROOT}` native | adapt → camelCase, pass-through env |
| `lspServers` | ✓ | **omit** | **omit** | **omit** |
| `outputStyles` | ✓ | **omit** | **omit** | **omit** |

## Hook Event Name Mapping

Canonical hooks file uses **PascalCase** event names. Build translates per vendor.

| Canonical (PascalCase) | Claude Code | Cursor | Codex | Copilot CLI |
| --- | --- | --- | --- | --- |
| `PreToolUse` | `PreToolUse` | `preToolUse` | `PreToolUse` | `preToolUse` |
| `PostToolUse` | `PostToolUse` | `postToolUse` | `PostToolUse` | `postToolUse` |
| `PostToolUseFailure` | `PostToolUseFailure` | — (drop+warn) | — (drop+warn) | — (drop+warn) |
| `SessionStart` | `SessionStart` | `sessionStart` | `SessionStart` | `sessionStart` |
| `SessionEnd` | `SessionEnd` | `sessionEnd` | `SessionEnd` | `sessionEnd` |
| `Stop` | `Stop` | — (drop+warn) | — (drop+warn) | `agentStop` |
| `UserPromptSubmit` | `UserPromptSubmit` | `beforeSubmitPrompt` | — (drop+warn) | — (drop+warn) |
| `Notification` | `Notification` | — (drop+warn) | — (drop+warn) | `notification` |
| `PermissionRequest` | `PermissionRequest` | — (drop+warn) | — (drop+warn) | `permissionRequest` |
| `SubagentStart` | — | `subagentStart` | — | — |
| `SubagentStop` | — | `subagentStop` | — | — |
| `PreCompact` | `PreCompact` | `preCompact` | — | — |

Events not in this table: pass through for `claude-code`; drop + warn for all others.

**Canonical hooks file** (`hooks/hooks.json` — PascalCase, `${PLUGIN_ROOT}`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [{ "type": "command", "command": "${PLUGIN_ROOT}/hooks/impl.sh", "timeout": 10 }]
      }
    ],
    "SessionStart": [
      {
        "hooks": [{ "type": "command", "command": "${PLUGIN_ROOT}/hooks/impl.sh", "timeout": 10 }]
      }
    ]
  }
}
```

Build generates vendor-specific versions. Do not hand-author the generated hook files.

## MCP: Symlink Rule

`.mcp.json` is the source of truth. `mcp.json` is always a symlink — never a regular file.

```bash
ln -sf .mcp.json mcp.json
```

| Runtime | Reads |
| --- | --- |
| Claude Code, Codex | `.mcp.json` |
| Cursor, open-plugin-spec | `mcp.json` (via symlink) |

If the repo needs explicit symlink tracking: `mcp.json symlink` in `.gitattributes`. MCP server startup failures are non-fatal.

## Environment Variable Mapping

| Canonical | Claude Code | Cursor | Codex | Copilot CLI |
| --- | --- | --- | --- | --- |
| `${PLUGIN_ROOT}` | `${CLAUDE_PLUGIN_ROOT}` | pass-through (undocumented) | `${PLUGIN_ROOT}` (native) | pass-through (undocumented) |
| `${PLUGIN_DATA}` | `${CLAUDE_PLUGIN_DATA}` | pass-through (undocumented) | `${PLUGIN_DATA}` (native) | pass-through (undocumented) |

`${PLUGIN_ROOT}` is ephemeral (changes on update). `${PLUGIN_DATA}` survives updates; use it for caches and generated artifacts. `${CLAUDE_PROJECT_DIR}` (Claude Code only) is the project root the agent launched from.

## Component Authoring Rules

**Skills:** Author `skills/<name>/SKILL.md` following the **skill-design** governance. Within a plugin, reference MCP tools by fully qualified name: `{plugin-name}:{server-name}__{tool-name}`.

**Commands:** One `.md` file per command in `commands/`. Filename (minus extension) is the command identifier. Optional frontmatter: `description`, `argument-hint`, `allowed-tools`, `disable-model-invocation`. `$ARGUMENTS` expands to user input.

**Agents:** One `.md` file per agent in `agents/`. Required frontmatter: `name` (1–64 lowercase alphanumeric + hyphens), `description` (≤ 1024 chars). Body is the agent system prompt.

**Rules (Cursor-only):** `.mdc` files in `rules/`. Required frontmatter: `description`. Optional: `alwaysApply` (bool), `globs` (file-pattern array). Bundle `commands/setup.md` to merge rule content into project's `AGENTS.md` — after that merge, `.mdc` files are redundant.

**Decision tree for always-on guidance:**
- Situation-triggered → **skill** (all agents)
- Always-on, cross-agent → merge into **AGENTS.md**
- Always-on, Cursor-only → `rules/` + `commands/setup.md`

## Namespacing

| Component | Format |
| --- | --- |
| Skills | `{plugin-name}:{skill-name}` |
| MCP tools | `mcp__plugin_{plugin-name}_{server-name}__{tool-name}` |
| Commands / agents | `{plugin-name}:{component-name}` |

## Distribution

| Scope | Claude Code | Cursor | Codex |
| --- | --- | --- | --- |
| **Personal** | `~/.claude/plugins/local/<name>` symlink | `~/.cursor/plugins/local/<name>` symlink + reload | `~/.agents/plugins/marketplace.json` |
| **Team** | npm private package | Cursor Teams admin import | `.agents/plugins/marketplace.json` in repo |
| **Public** | PR to `anthropics/claude-plugins-official` | `cursor.com/marketplace/publish` | `codex plugin marketplace add` |

Default scope: **team**.

**npm distribution:** All manifest directories (`.plugin/`, `.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`) and component directories (`skills/`, `commands/`, `agents/`, `hooks/`) must be in `package.json#files`. `package.json` carries distribution metadata only — no plugin semantics.

## Anti-Patterns

- Using `../` in any manifest-declared path
- Hardcoding absolute paths instead of `${PLUGIN_ROOT}` or `${PLUGIN_DATA}`
- Committing `mcp.json` as a regular file — must always be a symlink to `.mcp.json`
- Hand-authoring vendor hook files — use canonical `hooks/hooks.json` and let build generate vendor versions
- Relying on extended component types (commands, rules, agents, hooks) for core functionality — silently ignored on non-supporting hosts
- Duplicating SKILL.md content in `plugin.json` — the manifest is a path index, never a content mirror
- Using `rules/` for cross-agent always-on guidance — use AGENTS.md instead
- Putting install-time metadata in `plugin.json` instead of `skill.json`

## Cross-Platform Portability

| Runtime | SKILL.md native | Plugin manifest |
| --- | --- | --- |
| Claude Code | Yes | `.claude-plugin/plugin.json` |
| Codex | Yes | `.codex-plugin/plugin.json` (`version` + `description` required) |
| Cursor | Yes (conversion) | `.cursor-plugin/plugin.json` |
| Copilot CLI | Yes | `plugin.json` at repo root |
| Gemini CLI, GitHub Copilot, Amp | Yes | Different manifest paths — require separate authoring |
| Windsurf | Needs conversion | 6,000 char/file hard limit; 12,000 chars total |
| Zed, Aider, Continue.dev, Cline | No | Incompatible formats |

Portability rules for skill bodies: keep each `SKILL.md` body under 6,000 chars; use forward slashes in path references; declare environment requirements in `compatibility` frontmatter; do not embed vendor-specific syntax in skill bodies.

## References

```bash
npx universal-plugin@<version> governance show skill-design
npx universal-plugin@<version> governance show skill-repo-structure
npx universal-plugin@<version> governance show agent-tool-output
```

Spec: https://github.com/cyberuni/universal-plugin/blob/main/spec/universal-plugin-system.md
