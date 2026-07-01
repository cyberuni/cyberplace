# Evidence Log — Open Plugin Spec Comparison

## E-CMP-01 — Claude Code JSON Schema fields mapped against open-plugin-spec

- **claim_id**: E-CMP-01
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: Claude Code plugin manifest JSON Schema (SchemaStore)
- **source.url**: https://json.schemastore.org/claude-code-plugin-manifest.json
- **source.type**: Official schema file
- **notes**: Schema fetched directly. Claude Code includes all spec metadata fields (`name`, `version`, `description`, `author` with name/email/url, `homepage`, `repository`, `license`, `keywords`). Core component fields match spec naming: `skills`, `mcpServers`, `commands`, `agents`, `hooks`, `lspServers`, `outputStyles`. Claude Code ADDS beyond spec: `dependencies` (inter-plugin), `themes`, `channels`, `monitors`, `settings`, `userConfig`, `defaultEnabled`. Hook events use PascalCase (matching spec): PreToolUse, PostToolUse, PostToolUseFailure, SessionStart, SessionEnd, plus 20+ more. Claude Code adds `mcp_tool` hook type not in spec. Author object includes `url` field (spec-conformant); Cursor omits it. Env vars use vendor-prefixed names (`${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}`) diverging from spec's `${PLUGIN_ROOT}`, `${PLUGIN_DATA}`.

---

## E-CMP-02 — Cursor JSON Schema confirms camelCase hook naming (breaking vs spec)

- **claim_id**: E-CMP-02
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: Cursor plugin manifest JSON Schema (GitHub)
- **source.url**: https://raw.githubusercontent.com/cursor/plugins/main/schemas/plugin.schema.json
- **source.type**: Official schema file
- **notes**: Schema fetched directly. Cursor's hook events use camelCase (`sessionStart`, `postToolUse`) while the spec uses PascalCase (`SessionStart`, `PostToolUse`). This is a concrete breaking incompatibility — a `hooks.json` authored to the spec's PascalCase will silently fail to fire on Cursor. Cursor ADDS vs spec: `displayName`, `publisher`, `logo`, `category`, `tags`. Cursor DROPS vs spec: `lspServers`, `outputStyles`, `author.url`. Cursor includes `rules` field (spec has it; Claude Code does not). Only `command` hook type documented in Cursor schema (spec defines 4 types).

---

## E-CMP-03 — Codex env vars match spec exactly; compat aliases for Claude Code naming

- **claim_id**: E-CMP-03
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: Codex Plugins Build
- **source.url**: https://developers.openai.com/codex/plugins/build
- **source.type**: Official docs
- **notes**: Codex primary env vars `${PLUGIN_ROOT}` and `${PLUGIN_DATA}` match the spec exactly. Codex ALSO provides `${CLAUDE_PLUGIN_ROOT}` and `${CLAUDE_PLUGIN_DATA}` as documented compat aliases for Claude Code's naming. This suggests the spec adopted the generic naming (normalizing away from Claude Code's vendor prefix), and Codex followed the spec while maintaining compat with Claude Code's prior art. Codex hook events use PascalCase (matching spec). Codex mandates `version` and `description` as required fields (spec makes them optional). Codex ADDS: `apps` (.app.json), `interface` (marketplace metadata). Codex DROPS vs spec: `commands`, `agents`, `rules`, `lspServers`, `outputStyles`.

---

## E-CMP-04 — Copilot CLI searches `.plugin/` as fallback; only confirmed instance

- **claim_id**: E-CMP-04
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: GitHub Copilot CLI Plugin Reference
- **source.url**: https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference
- **source.type**: Official docs
- **notes**: Copilot CLI docs explicitly list `.plugin/`, `.github/plugin/`, and the plugin root itself as search paths for `plugin.json`. This makes Copilot CLI the only confirmed runtime that checks the spec's designated path (`.plugin/plugin.json`) as a fallback. Copilot CLI hook events use camelCase (`sessionStart`, `postToolUse`, `preToolUse`) — same divergence as Cursor. Copilot CLI ADDS: `permissionRequest`, `notification`, `agentStop` events; powershell hook commands; HTTP hook type. Env vars undocumented. The older "GitHub Copilot Extensions" (GitHub App model) was deprecated Nov 2025 in favor of this CLI plugin model.

---

## E-CMP-05 — Windsurf uses separate files; architecturally incompatible with spec

- **claim_id**: E-CMP-05
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: Windsurf Cascade documentation
- **source.url**: https://docs.windsurf.com/windsurf/cascade/skills
- **source.type**: Official docs
- **notes**: Windsurf does not use a bundle manifest (`plugin.json` equivalent). Customization is spread across SKILL.md (in `.windsurf/skills/<name>/`), `hooks.json` (in `.windsurf/hooks.json`), `mcp_config.json` (in `~/.codeium/windsurf/mcp_config.json`), and `.windsurfrules`. Hook events use snake_case (`pre_mcp_tool_use`, `post_write_code`, etc.) with 12 event types scoped more specifically than the spec's abstract `PreToolUse`. Context is passed to hook scripts via stdin JSON (`worktree_path`, `root_workspace_path`) rather than env var expansion in command strings. This is architecturally incompatible with the spec's `${PLUGIN_ROOT}` substitution model. SKILL.md and MCP concepts are shared; everything else diverges.

---

## E-CMP-06 — open-plugin-spec v1.0.0 full field inventory from primary source

- **claim_id**: E-CMP-06
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: vercel-labs/open-plugin-spec GitHub repository
- **source.url**: https://github.com/vercel-labs/open-plugin-spec
- **source.type**: Spec repository (Vercel Labs authored)
- **notes**: Fetched complete spec v1.0.0. Manifest path: `.plugin/plugin.json`. Required field: `name` only. Core profile (required for conformance): `skills`, `mcpServers`. Extended profile (host-dependent): `commands`, `agents`, `rules`, `hooks`, `lspServers`, `outputStyles`. Hook event naming: PascalCase. Core hook events: `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `SessionStart`, `SessionEnd`. Extended events include: `UserPromptSubmit`, `Stop`, `StopFailure`, `SubagentStart`, `SubagentStop`, `PreCompact`, `PostCompact`, `TeammateIdle`, `TaskCreated`, `TaskCompleted`, `Notification`, `PermissionRequest`, `InstructionsLoaded`, `ConfigChange`, `CwdChanged`, `FileChanged`, `WorktreeCreate`, `WorktreeRemove`, `Elicitation`, `ElicitationResult`. Hook types: `command`, `http`, `prompt`, `agent`. Env vars: `${PLUGIN_ROOT}` (required), `${PLUGIN_DATA}` (recommended). Path config supports string, string[], or `{ "paths": [...] }` object. Marketplace schema: `.plugin/marketplace.json` (optional). Vendor-specific manifest paths (`.claude-plugin/plugin.json`) take precedence over `.plugin/plugin.json`.

---

## E-CMP-07 — Hook event casing divergence is a concrete breaking incompatibility

- **claim_id**: E-CMP-07
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: Claude Code Plugins Reference + Cursor Plugins Reference + Copilot CLI docs
- **source.url**: https://code.claude.com/docs/en/plugins-reference
- **source.type**: Official docs (multiple)
- **notes**: PascalCase runtimes (spec-conformant): Claude Code, Codex. camelCase runtimes (breaking): Cursor, GitHub Copilot CLI. snake_case (fully incompatible): Windsurf. A `hooks.json` using spec's PascalCase `SessionStart` will fire on Claude Code and Codex but be silently ignored by Cursor and Copilot CLI which expect `sessionStart`. This cannot be worked around in a single shared `hooks.json` without runtime detection. Any universal plugin strategy must either (a) author two hooks files and use manifest path overrides, or (b) use a build step that generates runtime-specific hooks.json files from a single source.

---

## E-CMP-08 — Rules component: spec defines it, Cursor implements it, Claude Code does not

- **claim_id**: E-CMP-08
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: open-plugin-spec Appendix D.3 + Cursor plugin manifest JSON Schema
- **source.url**: https://github.com/vercel-labs/open-plugin-spec
- **source.type**: Spec + Official schema
- **notes**: The spec defines `rules` as an extended component type (Appendix D.3). Markdown files with YAML frontmatter: required `description`, optional `alwaysApply` (boolean), optional `globs`. File extension `.mdc`. Cursor implements this field in its schema. Claude Code does NOT have a `rules` field in its manifest schema — despite the spec claiming Claude Code as a conformant host. This is a direct contradiction: the spec defines an extended type that its "primary conformant host" does not implement. Windsurf has `.windsurfrules` (separate file, not a manifest field). Continue.dev has `rules` in config.yaml but with different semantics.

---

## E-CMP-09 — OIAP (fboldo/oiap) is a real implementation of the same problem space; chose snake_case canonical events

- **claim_id**: E-CMP-09
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: fboldo/oiap — README, ARCHITECTURE.md, MATRIX.md
- **source.url**: https://github.com/fboldo/oiap
- **source.type**: Open source project (third party)
- **notes**: OIAP solves the same "write once, export everywhere" problem as our spec. Key design differences from our approach: (1) OIAP chose snake_case as canonical hook event names (`session_start`, `before_tool`, etc.) and translates to vendor-specific casing at build time — we chose PascalCase following open-plugin-spec. (2) OIAP defines only 8 canonical events (minimal cross-vendor intersection) vs. open-plugin-spec's 25 and our adoption of the full spec set. (3) OIAP defines a capability model (NetworkCapability, DatabaseCapability, etc.) not present in open-plugin-spec or our spec. (4) OIAP uses TypeScript authoring (definePlugin() + hook factories) as its canonical layer rather than a JSON manifest file. (5) OIAP covers 9 platforms including OpenCode, OpenClaw, Antigravity, and Gemini CLI — not covered by open-plugin-spec or our initial research. The existence of OIAP confirms that the "write once, export everywhere" design space is real and being actively built. Our spec's approach of JSON-first with vendorExtensions is complementary (declarative vs. programmatic) rather than competing.
