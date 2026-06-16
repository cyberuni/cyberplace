# Conclusion — Plugin Schema (June 2026)

## Question

What do major AI coding agent runtimes actually implement for plugin/extension manifest format, and which ones publish machine-readable schemas?

## Verdict

**There is no universal plugin manifest, and only two runtimes publish machine-readable schemas.**

Runtimes fall into three tiers:

**Tier 1 — Plugin bundle manifests** (all use `plugin.json`):
- Claude Code → `.claude-plugin/plugin.json` (optional; only required field: `name`)
- Cursor → `.cursor-plugin/plugin.json` (required; only required field: `name`)
- Codex → `.codex-plugin/plugin.json` (required; required: `name`, `version`, `description`)
- GitHub Copilot CLI → `plugin.json` in plugin root (required; only required field: `name`)
- open-plugin-spec → `.plugin/plugin.json` (vendor-neutral fallback; not confirmed as primary for any vendor)

**Tier 2 — File-based or config-based extensibility** (no bundle manifest):
- Windsurf → separate files: `SKILL.md`, `hooks.json`, `mcp_config.json`, `.windsurfrules`
- Zed → `extension.toml` (TOML, not a plugin bundle — distributed via PR to extensions repo)
- Continue.dev → `config.yaml` in `.continue/` directory
- Cline → `package.json` + `AgentPlugin` TypeScript interface (SDK/CLI only, not yet in VS Code extension)

**Tier 3 — No plugin system**:
Gemini Code Assist, Amazon Q Developer, Sourcegraph Cody, Tabnine, Supermaven, Aider, JetBrains AI Assistant, Roo Code (archived May 2026)

The practical cross-vendor surface is not the manifest — it is **MCP servers** (supported by every active runtime) and **SKILL.md content** (portable across all Tier 1 vendors and many Tier 2).

## Published schema URLs

| Runtime | Schema URL | Format |
| --- | --- | --- |
| Claude Code | https://json.schemastore.org/claude-code-plugin-manifest.json | JSON Schema Draft 7 |
| Cursor | https://raw.githubusercontent.com/cursor/plugins/main/schemas/plugin.schema.json | JSON Schema Draft 7 |
| Zed (themes only) | https://zed.dev/schema/themes/v0.2.0.json | JSON Schema |
| Continue.dev (config only) | https://raw.githubusercontent.com/continuedev/continue/main/extensions/vscode/config_schema.json | JSON Schema Draft 2020-12 |
| All others | **not published** | — |

Only Claude Code and Cursor publish schemas at stable, authoritative URLs (SchemaStore for Claude Code; official GitHub org for Cursor). Zed's theme schema is real but covers only themes, not the extension manifest. Continue.dev's schema is a raw GitHub URL and covers configuration, not a plugin bundle manifest.

## Confidence

**High** for Tier 1 vendor schemas (sourced from official docs). **High** for the Tier 3 "no plugin system" determinations. **Medium** for Windsurf and Cline details — their docs are less comprehensive than Claude Code/Cursor. **Medium** for open-plugin-spec adoption — the spec claims conformant hosts but this is unverified from vendor primary docs.

## Strongest supporting evidence

- Claude Code official docs document `.claude-plugin/plugin.json` and publish a JSON Schema at SchemaStore (E01)
- Cursor official docs document `.cursor-plugin/plugin.json` and publish a JSON Schema on GitHub (E02, E11)
- GitHub Copilot CLI has a `plugin.json` system with the same required-only-`name` pattern (E13)
- Windsurf uses separate files, not a bundle manifest — confirmed from official docs (E14)
- Zed's `extension.toml` required fields are documented; no schema published (GitHub issue #21994 open) (E15)
- MCP is confirmed as the cross-vendor convergence layer: every active runtime supports it (E21)

## Strongest counterevidence / caveats

- The open-plugin-spec claims Claude Code as a conformant host, implying `.plugin/plugin.json` works as a fallback — unverified from Claude Code's own docs (E04)
- GitHub Copilot CLI searches `.plugin/` as a fallback path, giving partial credence to open-plugin-spec as a convention
- Cline's plugin system is SDK/CLI only — VS Code extension (its primary distribution channel) does not yet support it
- Community articles conflate "portability at the SKILL.md level" with "portability at the manifest level" — these are architecturally different things

## What is not supported

- There is no single manifest file that all Tier 1 vendors read as their primary configuration
- Hook event casing is not standardized (PascalCase in Claude Code/Codex, camelCase in Cursor/Copilot CLI)
- Vendor-specific components (monitors/themes/channels for Claude Code; rules for Cursor; apps for Codex; permissionRequest/HTTP hooks for Copilot CLI) have no cross-vendor equivalent
- No runtime other than Claude Code and Cursor publishes a machine-readable schema at a stable URL

## Thin evidence

- Cursor env var names in hook scripts are not documented in official Cursor docs; assumed to follow pattern
- Whether any vendor actually checks `.plugin/plugin.json` as a fallback is unconfirmed from primary sources
- Cline plugin system details come from SDK docs which may be ahead of actual implementation

## Recheck triggers

- If Zed publishes an `extension.toml` schema (issue #21994)
- If GitHub Copilot CLI publishes a JSON Schema for `plugin.json`
- If Anthropic, Cursor, OpenAI, or GitHub publish a joint plugin format statement
- If open-plugin-spec publishes an official adoption list with version commitments
- When Cursor publishes complete hook documentation including env vars
- If Cline plugin support reaches VS Code extension

## Implications for plugin-design governance

A "universal plugin" strategy must:
1. Define a Tier 1-compatible `plugin.json` (compatible with Claude Code, Cursor, Codex, Copilot CLI field names)
2. Generate or symlink the four vendor-specific manifest files from a single source of truth at install/sync time
3. Treat MCP server configuration as the primary cross-vendor extension mechanism
4. Treat SKILL.md as the primary cross-vendor capability definition format
5. Do not rely on open-plugin-spec `.plugin/plugin.json` as the primary path for any vendor — it may work as a fallback but is not authoritative
