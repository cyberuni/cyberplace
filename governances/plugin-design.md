# Plugin Design

Rules for authoring agent plugins — distributable packages that bundle skills, MCP servers, hooks, commands, and other extensions into a single installable unit. Apply when creating or auditing a plugin, not when creating a standalone skill.

A **plugin** is the distribution unit; a **skill** is the capability unit. Install plugins; invoke skills. For standalone skills not distributed in a plugin, see **skill-design**.

## Structure

A plugin is a directory with a vendor-neutral manifest at `.plugin/plugin.json` (Open Plugin Specification, `vercel-labs/open-plugin-spec`). Supported by Claude Code, Cursor, Codex, and other conformant runtimes.

```
plugin-root/
├── .plugin/
│   └── plugin.json        # required manifest
├── skills/
│   └── <skill-name>/
│       └── SKILL.md       # Agent Skills spec — see skill-design governance
├── .mcp.json              # optional MCP server config
├── commands/              # optional slash commands (.md files)
├── hooks/
│   └── hooks.json         # optional event hooks
├── agents/                # optional specialist agents (.md files)
├── rules/                 # optional context rules (.mdc files)
├── .lsp.json              # optional LSP server config
└── assets/
```

Vendor-specific overrides: `.<tool-name>-plugin/plugin.json` (e.g. `.claude-plugin/plugin.json`) takes precedence over `.plugin/plugin.json` on that host only.

## `plugin.json` fields

**Required:** `name` — 1–64 chars, lowercase alphanumeric + hyphens/periods; no consecutive hyphens or periods; cannot start or end with a special character.

**Optional metadata:** `version` (semver), `description`, `author`, `homepage`, `repository`, `license`, `keywords`.

**Optional component paths** — each accepts a string, array, or `{ "paths": [...] }` object:

| Field | Component type | Core? |
| --- | --- | --- |
| `skills` | Skill directories (each containing `SKILL.md`) | Yes |
| `mcpServers` | MCP server config or path to `.mcp.json` | Yes |
| `commands` | Slash command markdown files | No |
| `agents` | Agent definition markdown files | No |
| `rules` | Context rule `.mdc` files | No |
| `hooks` | `hooks.json` path or inline config | No |
| `lspServers` | LSP server config | No |
| `outputStyles` | Host-specific output resources | No |

A conformant host must support at least one core component type (skills or MCP servers). Extended types are silently ignored on hosts that don't implement them — do not rely on extended types for core plugin functionality.

## Path and environment rules

- All manifest-declared paths must start with `./`; `../` traversal is rejected.
- `${PLUGIN_ROOT}` expands to the plugin root directory in MCP `command`, `args`, `env`, `cwd`, and hook commands. Use it for any path that must resolve relative to the plugin.
- `${PLUGIN_DATA}` (recommended by hosts) provides a persistent data directory that survives plugin updates and reinstalls. Use for caches, generated artifacts, and installed dependencies.

## Component authoring rules

### Skills

Author skills inside `skills/<name>/SKILL.md` following the **skill-design** governance. Within a plugin, skill instructions may reference MCP tools by their fully qualified name (`{plugin-name}:{server-name}__{tool-name}`) to avoid "tool not found" errors on hosts with multiple MCP servers active.

### MCP servers

Declare in `.mcp.json` at the plugin root or inline in `plugin.json` under `mcpServers`. Use `${PLUGIN_ROOT}` in `command` and `cwd` so the server resolves correctly regardless of install location. MCP server startup failures are non-fatal — other plugin components continue loading.

### Commands

One markdown file per command in `commands/`. Filename (without extension) becomes the command identifier. Use optional YAML frontmatter for `description` and `disable-model-invocation`. The placeholder `$ARGUMENTS` is replaced with user input at invocation.

### Hooks

Declare in `hooks/hooks.json`. Supported event types (core): `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `SessionStart`, `SessionEnd`. Map each event to an array of rule objects with an optional `matcher` (regex against event context) and an `action` (`command`, `http`, `prompt`, or `agent`).

Do not duplicate hook logic that already belongs in `activation` on the individual SKILL.md — use hooks for plugin-level side effects only.

### Agents

One markdown file per agent in `agents/`. Required frontmatter: `name` (1–64 lowercase alphanumeric + hyphens), `description` (≤1024 chars). The markdown body is the agent's system prompt.

### Rules

`.mdc` files in `rules/`. Required frontmatter: `description`. Optional: `alwaysApply` (boolean), `globs` (file-pattern array for scope limiting).

## Namespacing

Components are namespaced by plugin name to avoid collisions when multiple plugins are installed:

- Skills: `{plugin-name}:{skill-name}`
- MCP tools: `mcp__plugin_{plugin-name}_{server-name}__{tool-name}`
- Commands / agents: `{plugin-name}:{component-name}`

## `plugin.json` vs `skill.json`

`plugin.json` (`.plugin/plugin.json`) is the distribution manifest read by agent runtimes. `skill.json` (sidecar in a skill directory) is the cyber-skills installer metadata for individual skills — see the **skill-design** governance. They are distinct files with different readers.

## Cross-platform portability

Skills inside a plugin are read natively by 32+ agent runtimes. Some require format conversion at install time.

| Platform | SKILL.md native | Notes |
| --- | --- | --- |
| Claude Code, Codex, Gemini CLI, GitHub Copilot, Amp, Goose | Yes | Read directly from platform paths |
| Cursor | Needs conversion | Project-only; no global install path |
| Windsurf | Needs conversion | 6,000 char/file hard limit, 12,000 chars total |
| Zed, Aider | No | Require separate manual configuration |

### Installation paths per platform

| Platform | Global | Project |
| --- | --- | --- |
| Claude Code | `~/.claude/skills/` | `.claude/skills/` |
| Codex / Gemini CLI | `~/.agents/skills/` | `.agents/skills/` |
| Cursor | — (none) | `.cursor/skills/` |
| GitHub Copilot | `~/.copilot/skills/` | `.github/copilot/skills/` |
| Windsurf | `~/.codeium/windsurf/` | `.windsurf/rules/` |

### Portability rules for skill bodies inside a plugin

- Use forward slashes in all file paths (backslashes break Unix hosts).
- Keep each SKILL.md body under 6,000 characters (Windsurf hard limit).
- Declare environment requirements in the `compatibility` frontmatter field; do not assume tools are installed.
- Do not embed platform-specific syntax (hook event names, slash command formats) in skill bodies — put those in `activation` on SKILL.md and in `hooks/hooks.json`.

## Anti-patterns

- Putting install-time metadata (distribution, package info) in `plugin.json` instead of `skill.json`
- Putting distribution manifest fields (`mcpServers`, `hooks`) in SKILL.md frontmatter
- Relying on extended component types (commands, hooks, agents, rules) for core functionality — they are silently ignored on non-supporting hosts
- Using `../` in any manifest path
- Hardcoding absolute paths instead of `${PLUGIN_ROOT}` or `${PLUGIN_DATA}`

## References

Related governances (load on demand; read stdout as authoritative):

```bash
npx cyber-skills@<version> governance show skill-design
npx cyber-skills@<version> governance show skill-repo-structure
npx cyber-skills@<version> governance show agent-tool-output
```
