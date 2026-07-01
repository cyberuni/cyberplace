# Plugin Consumption Leveling (June 2026)

## Question

How can a universal plugin installed via one vendor's marketplace (e.g., Claude Code) be made available across other vendors (Cursor, Codex, GitHub Copilot CLI)? Is "install once, use everywhere" achievable at the OS/runtime level, or does it require explicit sync logic (hooks, `prepare` skills)?

## Scope

**In scope:**
- Filesystem paths each Tier 1 vendor uses for plugin installation and discovery
- Whether any shared global plugin directory exists or can be created
- Community tools that bridge the gap (sync, export, convert)
- The `prepare` skill as a cross-vendor sync mechanism
- The project-scoped skills convention as a zero-config universal surface

**Out of scope:**
- Authoring-side universal plugin format (covered in `open-plugin-spec-comparison`)
- MCP server configuration portability (covered in `plugin-schema`)

## Source angles

- Official vendor docs for plugin install paths (Claude Code, Cursor, Codex, Copilot CLI)
- Community sync tools (ecc2cursor, acplugin, plugin-portability, compound-engineering-plugin)
- agentskills.io specification for shared skill format
- Linux Foundation Agentic AI Foundation (AAIF) governance direction
- BuildBetter canonical source pattern (2026)

## Findings

### Vendor plugin caches are fully isolated

Each vendor installs plugins into its own isolated cache directory:

| Vendor | Install location |
|---|---|
| Claude Code | `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/` |
| Cursor | `~/.cursor/plugins/local/<name>` |
| GitHub Copilot CLI | `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/` |
| Codex | `~/.agents/plugins/...` |

No vendor reads another vendor's cache. There is no shared global plugin directory, no XDG override mechanism, and no symlink convention to create automatic cross-vendor availability. A plugin installed via Claude Code marketplace is invisible to Cursor and Codex.

### Why skills don't cross over automatically

Even though the SKILL.md format is universal (32+ tools via agentskills.io), the _location_ is vendor-specific. Cursor scans `~/.cursor/plugins/local/*/skills/`; it does not scan `~/.claude/plugins/cache/`. The format is shared; the discovery path is not.

### The one path that is genuinely universal: project scope

If skills are installed at **project scope** — i.e., into the project's own `skills/` directory — all vendors that support the Agent Skills standard pick them up automatically. No sync required. This is the universal minimum:

- `./skills/<name>/SKILL.md` → picked up by every Tier 1 vendor and 32+ tools
- `./.mcp.json` → picked up by every active vendor for MCP server config

The practical implication: plugin authors who want cross-vendor reach should install skills into the project directory (or support a `--project` install flag), not only into the vendor's global cache.

### Community sync tools

Three community tools exist to bridge vendor caches:

| Tool | Direction | Mechanism |
|---|---|---|
| ecc2cursor (cminn10/ecc2cursor) | Claude Code → Cursor | `npx ecc2cursor sync`; copies skills, agents, commands, MCP to `~/.cursor/`; prefixes with `ecc-` to track |
| acplugin (tokenRollAI/acplugin) | Claude Code → Codex, OpenCode, Cursor, Antigravity | Interactive TUI; converts skills, instructions, MCP, agents, commands, hooks |
| plugin-portability (hiivmind/plugin-portability) | Any → Claude Code, Cursor, Gemini CLI, Codex, Antigravity, OpenClaw | Embedded plugin; assess-then-generate; produces manifests and install docs |

These are **post-install sync steps** — the user must run them manually after each marketplace install. None are automatic.

### The `prepare` skill approach

The `prepare` skill (ADR-0001 in this project) is the right hook for plugin authors. It can encode cross-vendor sync logic that runs automatically on install and update:

```
prepare skill logic:
1. Detect which other vendor runtimes are installed
   (check ~/.cursor/, ~/.codex/, ~/.agents/, etc.)
2. For each detected vendor, copy/symlink:
   - skills/ → <vendor-plugin-dir>/skills/
   - .mcp.json → vendor MCP config location
   - agents/, commands/ → vendor equivalents
3. Translate hook event casing per vendor
   (PascalCase for Claude Code/Codex; camelCase for Cursor/Copilot CLI)
4. Write vendor-specific manifests to the correct paths
```

This keeps sync logic _inside the plugin_, not as an external tool the user must remember to run. It is idempotent. The open question is whether Claude Code's marketplace triggers a post-install hook that can run `prepare` automatically (see Open questions below).

## Contradictions

- The SKILL.md format is universal but the discovery path is vendor-specific — "universal format" does not imply "universal install."
- agentskills.io claims 32+ adopters for the SKILL.md format, but adoption is at the _format_ level; no shared global skills directory is part of the spec.

## Open questions

- **Does Claude Code's marketplace support a post-install hook?** If yes, `prepare` runs automatically without user action.
- **Is there a shared `~/.agent-skills/` directory convention** forming? agentskills.io defines the format but not a global location.
- **Will Linux Foundation AAIF drive a shared directory convention?** They govern MCP and AGENTS.md — a shared skills path is a natural next step.
- **Can plugin-portability's "embedded plugin" approach** be used to ship a `prepare` skill that handles vendor sync as part of any plugin?

## Sources consulted

- Claude Code plugin docs — https://code.claude.com/docs/en/plugins-reference
- Claude Code JSON Schema — https://json.schemastore.org/claude-code-plugin-manifest.json
- Cursor plugin docs — https://cursor.com/docs/reference/plugins
- Cursor JSON Schema — https://raw.githubusercontent.com/cursor/plugins/main/schemas/plugin.schema.json
- GitHub Copilot CLI plugin reference — https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference
- agentskills.io specification — https://agentskills.io/specification
- ecc2cursor — https://github.com/cminn10/ecc2cursor
- acplugin — https://github.com/tokenRollAI/acplugin
- plugin-portability — https://github.com/hiivmind/plugin-portability
- BuildBetter canonical source pattern — https://blog.buildbetter.ai/how-engineering-teams-share-ai-coding-context-across-claude-code-cursor-codex-2026/
- Linux Foundation AAIF announcement — https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation
