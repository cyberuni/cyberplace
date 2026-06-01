# Universal Plugin Format

Authoritative spec for creating, validating, and transforming cross-vendor agent plugins. Apply when creating, auditing, or distributing a plugin; see **skill-design** for standalone skill authoring rules.

A **plugin** is the distribution unit — it bundles skills, MCP servers, hooks, commands, agents, and other extensions into a single installable package. A **skill** is the capability unit inside a plugin. Install plugins; invoke skills.

## Source of Truth: `.plugin/plugin.json`

Author `.plugin/plugin.json` as the canonical manifest. All vendor manifests are derived from it. This file is never read directly by vendors at runtime today, but is the convergence target for cross-vendor tooling and the open-plugin-spec.

### Required fields

| Field | Type | Constraint |
| --- | --- | --- |
| `name` | string | 1–64 chars. Pattern: `^[a-z0-9]([a-z0-9\-.]*[a-z0-9])?$`. Lowercase letters, digits, hyphens, periods only. Cannot start or end with `-` or `.`. No consecutive `--` or `..`. |

### Optional metadata fields

| Field | Type | Notes |
| --- | --- | --- |
| `version` | string | semver `MAJOR.MINOR.PATCH[-pre][+build]`. **Required by Codex** — derivation fails if absent. |
| `description` | string | ≤ 1024 chars. **Required by Codex** — derivation fails if absent. |
| `author` | object | `{ name, email, url }` — all sub-fields optional. |
| `homepage` | string | URL. |
| `repository` | string \| object | URL string or `{ type, url }` object. |
| `license` | string | SPDX identifier (e.g. `"MIT"`). |
| `keywords` | string[] | Searchable tags for marketplace discovery. |

### Component path fields

Each accepts `string | string[] | { paths: string[] }`. Every path must start with `./`. No `../` segments (traversal is rejected by conformant hosts).

| Field | Component | Core? | Notes |
| --- | --- | --- | --- |
| `skills` | Skill directories (each must contain `SKILL.md`) | Yes | Default: `./skills/` |
| `mcpServers` | `.mcp.json` file path or inline MCP config object | Yes | Default: `./.mcp.json` |
| `commands` | Slash command `.md` files | Extended | Default: `./commands/` |
| `agents` | Agent `.md` files | Extended | Default: `./agents/` |
| `rules` | Context rule `.mdc` files | Extended | Cursor-only; ignored by other hosts |
| `hooks` | `hooks.json` path or inline hook config | Extended | Schema differs per vendor — see Hooks section |
| `lspServers` | `.lsp.json` path | Extended | Claude Code only |
| `outputStyles` | Output style resources directory | Extended | Claude Code only |

A conformant host must support at least one core component (`skills` or `mcpServers`). Extended types are silently ignored on non-supporting hosts — do not rely on them for core plugin functionality.

## Canonical Directory Layout

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
├── rules/<rule-name>.mdc             ← Cursor-only always-on; ignored by others
│
├── hooks/hooks.json                  ← Claude Code: PascalCase events, no version field
├── hooks/codex-hooks.json            ← Codex: camelCase events, no version field
├── hooks/<impl>.sh                   ← shared implementation script (referenced by all)
│                                       Cursor: .cursor/hooks.json at project root (not in plugin)
│
├── .mcp.json                         ← source of truth (Claude Code + Codex)
├── mcp.json -> .mcp.json             ← symlink (Cursor + open-plugin-spec)
│
└── README.md
```

## Vendor Manifest Derivation

Generate `.claude-plugin/plugin.json`, `.cursor-plugin/plugin.json`, and `.codex-plugin/plugin.json` from the canonical manifest. The tables below specify field-by-field derivation. ✓ = copy as-is; **adapt** = transform before copying; **omit** = exclude entirely.

### Metadata fields

| Canonical field | Claude Code | Cursor | Codex |
| --- | --- | --- | --- |
| `name` | ✓ required | ✓ required | ✓ required |
| `version` | ✓ optional | ✓ optional | ✓ **required** — fail derivation if absent |
| `description` | ✓ optional | ✓ optional | ✓ **required** — fail derivation if absent |
| `author` | ✓ | ✓ | ✓ |
| `homepage` | ✓ | ✓ | ✓ |
| `repository` | ✓ | ✓ | ✓ |
| `license` | ✓ | ✓ | ✓ |
| `keywords` | ✓ | ✓ | ✓ |

### Component path fields

| Canonical field | Claude Code | Cursor | Codex |
| --- | --- | --- | --- |
| `skills` | ✓ | ✓ | ✓ |
| `mcpServers` | ✓ → `./.mcp.json` | **adapt** → `./mcp.json` (symlink target) | ✓ → `./.mcp.json` |
| `commands` | ✓ | ✓ | **omit** |
| `agents` | ✓ | ✓ | **omit** |
| `rules` | **omit** | ✓ | **omit** |
| `hooks` | **adapt** → `./hooks/hooks.json` PascalCase | **adapt** → `./hooks/hooks.json` camelCase + `version:1` | **adapt** → `./hooks/codex-hooks.json` camelCase, no version |
| `lspServers` | ✓ | **omit** | **omit** |
| `outputStyles` | ✓ | **omit** | **omit** |

### Vendor-only extension fields

These fields are NOT in the canonical manifest. Add them to individual vendor manifests via a `.<vendor>-plugin/plugin.json` overlay file or a generator configuration.

| Extension field | Claude Code | Cursor | Codex |
| --- | --- | --- | --- |
| `displayName` | ✓ — human-readable name | — | — |
| `defaultEnabled` | ✓ — bool; skip enable step | — | — |
| `userConfig` | ✓ — prompted at enable time | — | — |
| `channels` | ✓ — message injection via MCP | — | — |
| `dependencies` | ✓ — inter-plugin dependencies | — | — |
| `experimental.themes` | ✓ — color schemes | — | — |
| `experimental.monitors` | ✓ — background processes (v2.1.105+) | — | — |
| `logo` | — | ✓ — relative path or URL | — |
| `apps` | — | — | ✓ → `./.app.json` (GitHub, Slack, etc.) |
| `interface` | — | — | ✓ — marketplace metadata object |

## Hook Event Name Mapping

Canonical events use kebab-case. Vendor hook files use vendor-specific casing.

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
| `subagent-stop` | — | `subagentStop` | — |
| `before-shell-execution` | — | `beforeShellExecution` | — |
| `after-shell-execution` | — | `afterShellExecution` | — |
| `pre-compact` | — | `preCompact` | — |

Extract shared behavior into `hooks/<impl>.sh`. Point all vendor hook config files at the same script.

**Claude Code** (`hooks/hooks.json` — PascalCase events, no `version` field):
```json
{
  "description": "<plugin-name> hooks",
  "hooks": {
    "PreToolUse": [
      { "type": "command", "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/<impl>.sh\"", "timeout": 10 }
    ],
    "PostToolUse": [
      { "type": "command", "command": "\"${CLAUDE_PLUGIN_ROOT}/hooks/<impl>.sh\"", "timeout": 10 }
    ]
  }
}
```

**Codex** (`hooks/codex-hooks.json` — camelCase events, no `version` field):
```json
{
  "preToolUse": [
    { "type": "command", "command": "./hooks/<impl>.sh", "timeout": 10 }
  ],
  "postToolUse": [
    { "type": "command", "command": "./hooks/<impl>.sh", "timeout": 10 }
  ]
}
```

**Cursor** (user adds `.cursor/hooks.json` at project root — not inside plugin; cannot be automated):
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

Include Cursor hook registration instructions in `README.md`.

## MCP: Symlink Rule

`.mcp.json` is the source of truth. `mcp.json` is always a symlink — never a regular file.

```bash
ln -sf .mcp.json mcp.json
```

| Runtime | Reads |
| --- | --- |
| Claude Code | `.mcp.json` (dot-prefix) |
| Codex | `.mcp.json` (dot-prefix) |
| Cursor | `mcp.json` (via symlink) |
| open-plugin-spec | `mcp.json` (via symlink) |

Edit only `.mcp.json`. If the repository needs explicit symlink tracking, add `mcp.json symlink` to `.gitattributes`.

MCP server startup failures are non-fatal — other plugin components continue loading.

Use `${CLAUDE_PLUGIN_ROOT}` (Claude Code) or `${PLUGIN_ROOT}` (Codex) in `command` and `cwd` fields — these env vars expand to the same absolute path at runtime. Codex accepts `${CLAUDE_PLUGIN_ROOT}` as a compatibility alias.

## Component Authoring Rules

### Skills

Author `skills/<name>/SKILL.md` following the **skill-design** governance. Within a plugin, skill instructions may reference MCP tools by fully qualified name (`{plugin-name}:{server-name}__{tool-name}`) to avoid resolution ambiguity when multiple plugins are installed.

### Commands

One `.md` file per command in `commands/`. The filename (without extension) is the command identifier. Optional YAML frontmatter: `description`, `argument-hint`, `allowed-tools`, `disable-model-invocation`. The placeholder `$ARGUMENTS` expands to user input at invocation.

### Agents

One `.md` file per agent in `agents/`. Required frontmatter: `name` (1–64 lowercase alphanumeric + hyphens), `description` (≤ 1024 chars). The markdown body is the agent system prompt.

### Rules (Cursor-only always-on)

`.mdc` files in `rules/`. Required frontmatter: `description`. Optional: `alwaysApply` (boolean), `globs` (file-pattern array for scope). Rules and skills are not alternatives — rules inject guidance on every Cursor interaction; skills are triggered by situation.

**Decision tree for always-on guidance:**
- Situation-triggered → **skill** (all agents)
- Always-on, cross-agent → merge into **AGENTS.md**
- Always-on, Cursor-only → `rules/` + `commands/setup.md`

When `rules/` is present, bundle `commands/setup.md` that merges rule content into the project's `AGENTS.md`. After that merge, `.mdc` files are redundant and can be deleted.

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

## Path and Environment Rules

- All manifest-declared paths must start with `./`; `../` traversal is rejected by conformant hosts
- `${CLAUDE_PLUGIN_ROOT}` / `${PLUGIN_ROOT}` — plugin installation directory; **ephemeral** (changes on update); expand in hook commands, MCP commands, and agent paths
- `${CLAUDE_PLUGIN_DATA}` / `${PLUGIN_DATA}` — persistent data directory; survives plugin updates; use for caches and generated artifacts
- `${CLAUDE_PROJECT_DIR}` — Claude Code only; the project root the agent was launched from
- Use forward slashes in all paths; backslashes break Unix hosts
- `skills` field in the manifest **adds to** the default `skills/` directory in Claude Code (the default is always scanned); `commands`, `agents`, `outputStyles` **replace** their defaults

## Namespacing

When multiple plugins are installed, components are namespaced by plugin name to prevent collisions:

- Skills: `{plugin-name}:{skill-name}`
- MCP tools: `mcp__plugin_{plugin-name}_{server-name}__{tool-name}`
- Commands / agents: `{plugin-name}:{component-name}`

## Distribution

| Scope | Claude Code | Cursor | Codex |
| --- | --- | --- | --- |
| **Personal** | `~/.claude/plugins/local/<name>` symlink | `~/.cursor/plugins/local/<name>` symlink + reload window | `~/.agents/plugins/marketplace.json` entry |
| **Team** | npm private package | Cursor Teams: admin imports GitHub repo | `.agents/plugins/marketplace.json` in repo |
| **Public** | PR to `anthropics/claude-plugins-official` (open source) | Submit to `cursor.com/marketplace/publish` (open source) | `codex plugin marketplace add <source>` |

Default scope: **team**.

**Codex marketplace catalog** (`.agents/plugins/marketplace.json` in repo, or `~/.agents/plugins/marketplace.json` personal):
```json
{
  "name": "team-plugins",
  "plugins": [
    {
      "name": "<plugin-name>",
      "source": { "source": "local", "path": "./plugins/<plugin-name>" },
      "policy": { "installation": "AVAILABLE" },
      "category": "Productivity"
    }
  ]
}
```

`INSTALLED_BY_DEFAULT` makes the plugin auto-active for all project users; `AVAILABLE` makes it browseable. Cursor Teams distribution requires admin access and a Cursor Teams or Enterprise plan.

**npm distribution:** The plugin directory must be the npm package root. All manifest directories (`.plugin/`, `.claude-plugin/`, `.cursor-plugin/`, `.codex-plugin/`) and component directories (`skills/`, `commands/`, `agents/`, `hooks/`) must be in `package.json#files`. The `package.json` carries distribution metadata only — no plugin-specific semantics. Add `"exports": { "./package.json": "./package.json" }` for JS-consumer root resolution convenience.

## Cross-Platform Portability

| Runtime | SKILL.md native | Plugin manifest path | Notes |
| --- | --- | --- | --- |
| Claude Code | Yes | `.claude-plugin/plugin.json` | Optional — auto-discovery covers defaults |
| Codex | Yes | `.codex-plugin/plugin.json` | Required; `version` + `description` mandatory |
| Gemini CLI | Yes | `gemini-extension.json` | Different format; SKILL.md from `.agents/skills/` |
| GitHub Copilot | Yes | `.copilot-plugin/` | Separate manifest; SKILL.md compatible |
| Amp (Sourcegraph) | Partial | `.agents/skills/` convention | Same SKILL.md; different install path; requires mapping |
| Cursor | Yes (conversion) | `.cursor-plugin/plugin.json` | Required; project-only; no global install path |
| Windsurf | Needs conversion | VS Code extension format | 6,000 char/file hard limit; 12,000 chars total |
| Zed | No | TOML `extension.toml` | Manual configuration required |
| Aider | No | Separate config | Manual configuration required |
| Continue.dev | No | YAML blocks config | Incompatible format |
| Cline / Roo Code | No | MCP servers only | No plugin or skill system |
| OpenCode | No | JS/TS module plugins | Incompatible format |

**Portability rules for skill bodies inside a plugin:**
- Keep each `SKILL.md` body under 6,000 characters (Windsurf per-file hard limit)
- Use forward slashes in all file path references
- Declare environment requirements in `compatibility` frontmatter; do not assume tools are installed
- Do not embed vendor-specific syntax (hook event names, slash command formats) in skill bodies — put those in `activation` on SKILL.md and in `hooks/hooks.json`

## `plugin.json` vs `skill.json`

`plugin.json` in `.<vendor>-plugin/` (or `.plugin/`) is the **distribution manifest** read by agent runtimes. `skill.json` in a skill directory is the **installer metadata** for the `skills` CLI — see **skill-design** governance. They are distinct files with different readers and must never duplicate content.

The manifest is a **pure index** (path declarations only). It never duplicates or overrides content from `SKILL.md`. `SKILL.md` remains the authoritative runtime source; the manifest tells installers where to find it.

## Anti-Patterns

- Using `../` in any manifest-declared path
- Hardcoding absolute paths instead of `${CLAUDE_PLUGIN_ROOT}` or `${PLUGIN_DATA}`
- Committing `mcp.json` as a regular file — it must always be a symlink to `.mcp.json`
- Using a single `hooks/hooks.json` for all vendors — schemas are incompatible; separate files are required
- Relying on extended component types (commands, hooks, rules, agents) for core functionality — they are silently ignored on non-supporting hosts
- Putting hook logic in `activation` on SKILL.md instead of `hooks/hooks.json` for plugin-level side effects
- Duplicating SKILL.md content in `plugin.json` — the manifest is an index (paths), never a content mirror
- Putting distribution manifest fields (`mcpServers`, `hooks`) in SKILL.md frontmatter
- Putting install-time metadata (distribution, package info) in `plugin.json` instead of `skill.json`
- Using Cursor's `rules/` component for cross-agent always-on guidance — use AGENTS.md instead

## Other Agents

| Agent | Compatible with SKILL.md? | Notes |
| --- | --- | --- |
| Amp (Sourcegraph) | Partial | Same format; reads from `.agents/skills/` not `skills/` — requires install mapping |
| Gemini CLI | No | Uses `gemini-extension.json`; focuses on MCP/context/themes |
| Continue.dev | No | YAML blocks format |
| OpenCode | No | JS/TS module plugins only |
| Codex CLI | Yes | `skills/<name>/SKILL.md` identical format; see Codex sections above |
| Cline / Roo Code | No | MCP servers only; no plugin or skill system |
| Windsurf | Needs conversion | VS Code extension format; 6,000 char/file hard limit |

## References

Related governances (load on demand; read stdout as authoritative):

```bash
npx cyber-skills@<version> governance show skill-design
npx cyber-skills@<version> governance show skill-repo-structure
npx cyber-skills@<version> governance show agent-tool-output
```

Acceptance specification: `docs/specs/universal-plugin/*.feature`
