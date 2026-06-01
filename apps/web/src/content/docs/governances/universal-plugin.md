---
title: Universal Plugin Format
description: Authoritative spec for creating, validating, and transforming cross-vendor agent plugins across Claude Code, Cursor, Codex, and other AI runtimes.
---

**Load:** `npx cyber-skills@<version> governance show universal-plugin`

Authoritative spec for creating, validating, and transforming cross-vendor agent plugins. A **plugin** bundles skills, MCP servers, hooks, commands, and agents into a single installable package. A **skill** is the capability unit inside a plugin.

## Source of truth: `.plugin/plugin.json`

Author `.plugin/plugin.json` as the canonical manifest. All vendor manifests are derived from it.

### Required fields

| Field | Type | Constraint |
| --- | --- | --- |
| `name` | string | 1–64 chars; `^[a-z0-9]([a-z0-9\-.]*[a-z0-9])?$` — lowercase, digits, hyphens, periods; no consecutive `--` or `..`; no leading/trailing `-` or `.` |

### Optional metadata fields

| Field | Type | Notes |
| --- | --- | --- |
| `version` | string | semver. **Required by Codex.** |
| `description` | string | ≤ 1024 chars. **Required by Codex.** |
| `author` | object | `{ name, email, url }` |
| `homepage` | string | URL |
| `repository` | string \| object | URL or `{ type, url }` |
| `license` | string | SPDX identifier |
| `keywords` | string[] | Searchable tags |

### Component path fields

Each accepts `string | string[] | { paths: string[] }`. Every path must start with `./`. No `../` segments.

| Field | Component | Core? | Notes |
| --- | --- | --- | --- |
| `skills` | Skill directories containing `SKILL.md` | Yes | Default: `./skills/` |
| `mcpServers` | `.mcp.json` path or inline config | Yes | Default: `./.mcp.json` |
| `commands` | Slash command `.md` files | Extended | Default: `./commands/` |
| `agents` | Agent `.md` files | Extended | Default: `./agents/` |
| `rules` | Context rule `.mdc` files | Extended | Cursor-only; ignored by other hosts |
| `hooks` | `hooks.json` path or inline config | Extended | Schema differs per vendor |
| `lspServers` | `.lsp.json` path | Extended | Claude Code only |
| `outputStyles` | Output style resources | Extended | Claude Code only |

## Canonical directory layout

```
<plugin-name>/
├── .plugin/plugin.json               ← canonical source of truth
├── .claude-plugin/plugin.json        ← derived: Claude Code
├── .cursor-plugin/plugin.json        ← derived: Cursor
├── .codex-plugin/plugin.json         ← derived: Codex
│
├── skills/<skill-name>/SKILL.md      ← shared: all vendors, identical format
│
├── commands/setup.md                 ← required when rules/ is present
├── commands/<cmd-name>.md            ← Claude Code + Cursor
├── agents/<agent-name>.md            ← Claude Code + Cursor
├── rules/<rule-name>.mdc             ← Cursor-only always-on
│
├── hooks/hooks.json                  ← Claude Code: PascalCase events
├── hooks/codex-hooks.json            ← Codex: camelCase, no version field
├── hooks/<impl>.sh                   ← shared implementation
│                                        Cursor: .cursor/hooks.json at project root
│
├── .mcp.json                         ← source of truth
├── mcp.json -> .mcp.json             ← symlink (Cursor + OAP)
│
└── README.md
```

## Vendor manifest derivation

### Metadata field mapping

| Canonical field | Claude Code | Cursor | Codex |
| --- | --- | --- | --- |
| `name` | ✓ required | ✓ required | ✓ required |
| `version` | ✓ optional | ✓ optional | ✓ **required** |
| `description` | ✓ optional | ✓ optional | ✓ **required** |
| `author`, `homepage`, `repository`, `license`, `keywords` | ✓ | ✓ | ✓ |

### Component path field mapping

| Canonical field | Claude Code | Cursor | Codex |
| --- | --- | --- | --- |
| `skills` | ✓ | ✓ | ✓ |
| `mcpServers` | ✓ → `./.mcp.json` | adapt → `./mcp.json` (symlink) | ✓ → `./.mcp.json` |
| `commands` | ✓ | ✓ | **omit** |
| `agents` | ✓ | ✓ | **omit** |
| `rules` | **omit** | ✓ | **omit** |
| `hooks` | adapt → PascalCase, no version | adapt → camelCase + `version:1` | adapt → camelCase, no version |
| `lspServers` | ✓ | **omit** | **omit** |
| `outputStyles` | ✓ | **omit** | **omit** |

### Vendor-only extension fields

| Field | Claude Code | Cursor | Codex |
| --- | --- | --- | --- |
| `displayName`, `defaultEnabled`, `userConfig` | ✓ | — | — |
| `channels`, `dependencies`, `experimental` | ✓ | — | — |
| `logo` | — | ✓ | — |
| `apps` (→ `.app.json`), `interface` | — | — | ✓ |

## Hook event name mapping

| Canonical event | Claude Code | Cursor | Codex |
| --- | --- | --- | --- |
| `pre-tool-use` | `PreToolUse` | `preToolUse` | `preToolUse` |
| `post-tool-use` | `PostToolUse` | `postToolUse` | `postToolUse` |
| `post-tool-use-failure` | `PostToolUseFailure` | `postToolUseFailure` | `postToolUseFailure` |
| `session-start` | `SessionStart` | `sessionStart` | `sessionStart` |
| `session-end` | `SessionEnd` | `sessionEnd` | `sessionEnd` |
| `stop` | `Stop` | `stop` | `stop` |
| `user-prompt-submit` | `UserPromptSubmit` | `beforeSubmitPrompt` | — |
| `subagent-start` | — | `subagentStart` | — |
| `before-shell-execution` | — | `beforeShellExecution` | — |

Extract shared behavior into `hooks/<impl>.sh` — all three vendor hook files reference the same script.

**Claude Code** (`hooks/hooks.json`):
```json
{
  "description": "<plugin-name> hooks",
  "hooks": {
    "PreToolUse": [{ "type": "command", "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/<impl>.sh\"", "timeout": 10 }]
  }
}
```

**Codex** (`hooks/codex-hooks.json`):
```json
{
  "preToolUse": [{ "type": "command", "command": "./hooks/<impl>.sh", "timeout": 10 }]
}
```

**Cursor** (user's `.cursor/hooks.json` at project root — cannot be automated from inside the plugin):
```json
{
  "version": 1,
  "hooks": {
    "preToolUse": [{ "type": "command", "command": "<plugin-path>/hooks/<impl>.sh", "timeout": 10 }]
  }
}
```

## MCP: symlink rule

`.mcp.json` is the source of truth. `mcp.json` is always a symlink — never a regular file.

```bash
ln -sf .mcp.json mcp.json
```

| Runtime | Reads |
| --- | --- |
| Claude Code, Codex | `.mcp.json` |
| Cursor, open-plugin-spec | `mcp.json` (via symlink) |

If the repo needs explicit symlink tracking: `mcp.json symlink` in `.gitattributes`.

## Component authoring rules

### Skills

Author `skills/<name>/SKILL.md` following [skill-design](/governances/skill-design/). Within a plugin, reference MCP tools by fully qualified name: `{plugin-name}:{server-name}__{tool-name}`.

### Commands

One `.md` file per command in `commands/`. Filename (without extension) is the command identifier. Optional frontmatter: `description`, `argument-hint`, `allowed-tools`. `$ARGUMENTS` expands to user input.

### Agents

One `.md` file per agent in `agents/`. Required frontmatter: `name` (1–64 lowercase alphanumeric + hyphens), `description` (≤ 1024 chars). Body is the agent system prompt.

### Rules (Cursor-only always-on)

`.mdc` files in `rules/`. Required frontmatter: `description`. Optional: `alwaysApply`, `globs`. Bundle `commands/setup.md` to merge rule content into `AGENTS.md` — after that merge, `.mdc` files are redundant.

**Decision tree for always-on guidance:**
- Situation-triggered → **skill** (all agents)
- Always-on, cross-agent → merge into **AGENTS.md**
- Always-on, Cursor-only → `rules/` + `commands/setup.md`

## Path and environment rules

- All manifest paths must start with `./`; `../` traversal is rejected
- `${CLAUDE_PLUGIN_ROOT}` / `${PLUGIN_ROOT}` — plugin installation directory (ephemeral; changes on update)
- `${CLAUDE_PLUGIN_DATA}` / `${PLUGIN_DATA}` — persistent data directory (survives updates)
- `${CLAUDE_PROJECT_DIR}` — Claude Code only; project root
- Codex accepts `${CLAUDE_PLUGIN_ROOT}` as a compatibility alias for `${PLUGIN_ROOT}`

## Distribution

| Scope | Claude Code | Cursor | Codex |
| --- | --- | --- | --- |
| **Personal** | `~/.claude/plugins/local/<name>` symlink | `~/.cursor/plugins/local/<name>` symlink + reload | `~/.agents/plugins/marketplace.json` |
| **Team** | npm private package | Cursor Teams admin import | `.agents/plugins/marketplace.json` in repo |
| **Public** | PR to `anthropics/claude-plugins-official` | `cursor.com/marketplace/publish` | `codex plugin marketplace add` |

Default scope: **team**.

**npm distribution:** All manifest directories (`.plugin/`, `.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`) and component directories (`skills/`, `commands/`, `agents/`, `hooks/`) must be in `package.json#files`. The `package.json` carries distribution metadata only — no plugin semantics.

## Cross-platform portability

| Runtime | SKILL.md native | Notes |
| --- | --- | --- |
| Claude Code, Codex | Yes | Read directly |
| Gemini CLI, GitHub Copilot, Amp, Goose | Yes | Different install paths |
| Cursor | Needs conversion | Project-only; no global install path |
| Windsurf | Needs conversion | 6,000 char/file hard limit; 12,000 chars total |
| Zed, Aider, Continue.dev, Cline | No | Require separate manual configuration |

**Portability rules for skill bodies in a plugin:**
- Keep each `SKILL.md` body under 6,000 characters (Windsurf limit)
- Use forward slashes in all path references
- Declare environment requirements in `compatibility` frontmatter
- Do not embed vendor-specific syntax in skill bodies

## Namespacing

| Component | Namespace format |
| --- | --- |
| Skills | `{plugin-name}:{skill-name}` |
| MCP tools | `mcp__plugin_{plugin-name}_{server-name}__{tool-name}` |
| Commands / agents | `{plugin-name}:{component-name}` |

## Anti-patterns

- Using `../` in any manifest-declared path
- Hardcoding absolute paths instead of `${CLAUDE_PLUGIN_ROOT}` or `${PLUGIN_DATA}`
- Committing `mcp.json` as a regular file (it must be a symlink)
- A single `hooks/hooks.json` for all vendors — schemas are incompatible
- Relying on extended types (commands, rules, agents) for core functionality — silently ignored on non-supporting hosts
- Duplicating SKILL.md content in `plugin.json` — the manifest is an index (paths), never a content mirror
- Using `rules/` for cross-agent always-on guidance — use AGENTS.md instead

## Acceptance specification

Formal Gherkin acceptance criteria for conformant plugin tooling: `docs/specs/universal-plugin/*.feature`
