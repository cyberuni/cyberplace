# Evidence Log — Plugin Schema

## E01 — Claude Code manifest location is `.claude-plugin/plugin.json`

- **claim_id**: E01
- **date**: 2026-05-31
- **status**: Confirmed
- **confidence**: High
- **source.label**: Claude Code Plugins Reference
- **source.url**: https://code.claude.com/docs/en/plugins-reference
- **source.type**: Official docs
- **notes**: Complete schema documented. Manifest is optional — auto-discovery works without it. `name` is the only required field when manifest is present. Uses `${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}`, `${CLAUDE_PROJECT_DIR}`. JSON Schema at https://json.schemastore.org/claude-code-plugin-manifest.json.

---

## E02 — Cursor manifest location is `.cursor-plugin/plugin.json` and is required

- **claim_id**: E02
- **date**: 2026-05-31
- **status**: Confirmed
- **confidence**: High
- **source.label**: Cursor Plugins Reference
- **source.url**: https://cursor.com/docs/reference/plugins
- **source.type**: Official docs
- **notes**: Required for every plugin. Only `name` is required. Cursor-specific: `rules` component type (.mdc files), `logo` field, hook events in camelCase (`sessionStart`, `postToolUse`).

---

## E03 — Codex uses `${CLAUDE_PLUGIN_ROOT}` as a compat alias

- **claim_id**: E03
- **date**: 2026-05-31
- **status**: Confirmed
- **confidence**: High
- **source.label**: Codex Plugins Build
- **source.url**: https://developers.openai.com/codex/plugins/build
- **source.type**: Official docs
- **notes**: Primary env vars are `${PLUGIN_ROOT}` and `${PLUGIN_DATA}`. `${CLAUDE_PLUGIN_ROOT}` and `${CLAUDE_PLUGIN_DATA}` are documented as compatibility aliases. Manifest is `.codex-plugin/plugin.json`. Required fields: `name`, `version`, `description`. Codex-specific: `apps` component (.app.json), `interface` object for marketplace metadata.

---

## E04 — open-plugin-spec uses `.plugin/plugin.json` and claims Claude Code as a conformant host

- **claim_id**: E04
- **date**: 2026-05-31
- **status**: Claimed (unverified from primary vendor sources)
- **confidence**: Medium
- **source.label**: vercel-labs/open-plugin-spec GitHub
- **source.url**: https://github.com/vercel-labs/open-plugin-spec
- **source.type**: Spec repository (Vercel Labs authored)
- **notes**: Published as v1.0.0. Documents Claude Code hook events and capabilities. Claims conformant hosts must check `.plugin/plugin.json`. Claude Code's own official docs make no mention of `.plugin/plugin.json` as a supported path. Cursor and Codex not confirmed as conformant hosts in this spec.

---

## E05 — Hook event casing differs between Claude Code (PascalCase) and Cursor (camelCase)

- **claim_id**: E05
- **date**: 2026-05-31
- **status**: Confirmed
- **confidence**: High
- **source.label**: Claude Code Plugins Reference + Cursor Plugins Reference
- **source.url**: https://code.claude.com/docs/en/plugins-reference
- **source.type**: Official docs (both)
- **notes**: Claude Code uses `PostToolUse`, `SessionStart`, `PreToolUse`. Cursor uses `postToolUse`, `sessionStart`, `preToolUse`. Codex uses PascalCase (same as Claude Code). This is a concrete incompatibility in `hooks/hooks.json` if targeting both Claude Code and Cursor with a single file.

---

## E06 — Claude Code manifest is optional; auto-discovery covers all default paths

- **claim_id**: E06
- **date**: 2026-05-31
- **status**: Confirmed
- **confidence**: High
- **source.label**: Claude Code Plugins Reference
- **source.url**: https://code.claude.com/docs/en/plugins-reference
- **source.type**: Official docs
- **notes**: Default auto-discovered locations: `skills/`, `commands/`, `agents/`, `hooks/hooks.json`, `.mcp.json`, `.lsp.json`, `output-styles/`, `themes/`, `monitors/monitors.json`, `bin/`, `settings.json`. A plugin with no manifest at all still loads if it follows default directory structure.

---

## E07 — Claude Code supports vendor-specific components not present in other platforms

- **claim_id**: E07
- **date**: 2026-05-31
- **status**: Confirmed
- **confidence**: High
- **source.label**: Claude Code Plugins Reference
- **source.url**: https://code.claude.com/docs/en/plugins-reference
- **source.type**: Official docs
- **notes**: Claude Code-only: monitors (background processes, v2.1.105+), themes (color schemes), channels (message injection via MCP), bin/ executables (added to Bash PATH), `userConfig` (prompted at enable time), `dependencies` (inter-plugin), `defaultEnabled`, `displayName`, `outputStyles`.

---

## E08 — Cursor-specific `rules` component type has no equivalent in other vendors

- **claim_id**: E08
- **date**: 2026-05-31
- **status**: Confirmed
- **confidence**: High
- **source.label**: Cursor Plugins Reference
- **source.url**: https://cursor.com/docs/reference/plugins
- **source.type**: Official docs
- **notes**: `.mdc` rule files in `rules/` directory. Required frontmatter: `description`, `alwaysApply`. Optional: `globs`. Not present in Claude Code, Codex, or open-plugin-spec.

---

## E09 — Codex `apps` component type has no equivalent in other vendors

- **claim_id**: E09
- **date**: 2026-05-31
- **status**: Confirmed
- **confidence**: High
- **source.label**: Codex Plugins Build
- **source.url**: https://developers.openai.com/codex/plugins/build
- **source.type**: Official docs
- **notes**: `.app.json` file for connector/app integrations (GitHub, Slack, Google Drive). Not present in Claude Code, Cursor, or open-plugin-spec.

---

## E11 — Cursor publishes a JSON Schema for its plugin manifest

- **claim_id**: E11
- **date**: 2026-05-31
- **status**: Confirmed
- **confidence**: High
- **source.label**: cursor/plugins GitHub — plugin.schema.json
- **source.url**: https://raw.githubusercontent.com/cursor/plugins/main/schemas/plugin.schema.json
- **source.type**: Official schema file (GitHub, cursor org)
- **notes**: Draft-07 JSON Schema. Hosted in the `cursor/plugins` repository under `schemas/`. Covers `.cursor-plugin/plugin.json` manifest fields.

---

## E12 — Codex, open-plugin-spec, Windsurf, GitHub Copilot, Gemini, and Zed do not publish JSON Schemas

- **claim_id**: E12
- **date**: 2026-05-31
- **status**: Confirmed
- **confidence**: High
- **source.label**: Each vendor's official docs and GitHub repos
- **source.url**: https://developers.openai.com/codex/plugins/build
- **source.type**: Official docs (multiple vendors)
- **notes**: Survey of all major AI agent runtimes found no published JSON Schema files for: Codex (.codex-plugin/plugin.json), open-plugin-spec (.plugin/plugin.json), Windsurf, GitHub Copilot Extensions, Gemini Code Assist (uses config.yaml), Zed (uses TOML; schema requested in issue #21994 but not published). Continue.dev publishes a VSCode config schema (not a plugin manifest). Only Claude Code and Cursor have machine-readable schemas.

---

## E10 — SKILL.md and .mcp.json content is fully portable across vendors

- **claim_id**: E10
- **date**: 2026-05-31
- **status**: Confirmed
- **confidence**: High
- **source.label**: All vendor official docs
- **source.url**: https://agentskills.io/specification
- **source.type**: Official docs (multiple)
- **notes**: All three vendors read `skills/<name>/SKILL.md` from the same relative path. `.mcp.json` uses the same MCP protocol structure across all. `commands/*.md` and `agents/*.md` are portable. These are the true cross-vendor surface.
