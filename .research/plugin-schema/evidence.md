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

## E22 — OIAP (fboldo/oiap) is an existing multi-platform plugin build system with 9 exporters

- **claim_id**: E22
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: fboldo/oiap GitHub repository (README, ARCHITECTURE.md, MATRIX.md)
- **source.url**: https://github.com/fboldo/oiap
- **source.type**: Open source project (third party)
- **notes**: OIAP (Open Interoperable Agent Plugins) is a TypeScript SDK + CLI that solves the same "write once, export everywhere" problem. v0.3.0 as of May 21, 2026. Three packages: `@oiap/core` (authoring SDK), `@oiap/cli` (build tool), `@oiap/runtime` (generated JS utilities). Nine implemented exporters: Claude Code, Cursor, Codex, Cline, VS Code Copilot Chat, Gemini CLI, OpenClaw, OpenCode, Antigravity. Additional platforms in planning: Factory Droid, Kiro, Trae, Hermes, Aider, Pi. Build: `npx oiap build [file] --target [platform]`. Each export produces native host files + `oiap-bundle.json` + `capability-report.json` + `source-map.json`. MIT licensed.

---

## E23 — OIAP surfaces new runtimes not previously researched

- **claim_id**: E23
- **date**: 2026-06-01
- **status**: Confirmed (OIAP as source); Unverified (primary runtime docs)
- **confidence**: Medium
- **source.label**: fboldo/oiap ARCHITECTURE.md and MATRIX.md
- **source.url**: https://github.com/fboldo/oiap
- **source.type**: Open source project (third party)
- **notes**: Runtimes surfaced by OIAP not in prior research: **Gemini CLI** (Google's own CLI agent — distinct from Gemini Code Assist IDE extension; uses extension manifest with embedded MCP config), **OpenCode** (`opencode.json` manifest; Python/JavaScript SDK model), **OpenClaw** (`openclaw.plugin.json` with `package.json` and `index.ts`), **Antigravity** (`.agents/` directory structure for rules, skills, workflows), **Kiro** (future; rule/steering focus), **Trae** (future; rule/steering focus), **Hermes** (future; Python/JS SDK host), **Factory Droid** (future). These are in planning or early exporter stage in OIAP; no independent primary source verification attempted yet.

---

## E24 — Codex manifest path discrepancy: OIAP uses `plugin.json`, prior research used `.codex-plugin/plugin.json`

- **claim_id**: E24
- **date**: 2026-06-01
- **status**: Needs verification
- **confidence**: Low
- **source.label**: fboldo/oiap exporter-codex vs. Codex official docs
- **source.url**: https://github.com/fboldo/oiap
- **source.type**: Third-party implementation vs. official docs
- **notes**: OIAP's exporter-codex generates a manifest at `plugin.json` (root), while prior research (E03) documents the official Codex path as `.codex-plugin/plugin.json`. This discrepancy may indicate: (a) OIAP uses a different/simplified layout, (b) Codex also accepts a root `plugin.json` as a fallback (unconfirmed), or (c) OIAP's exporter is not fully spec-conformant. Needs verification against current Codex official docs before updating E03.

---

## E25 — OIAP defines 8 canonical hook events in snake_case across all platforms

- **claim_id**: E25
- **date**: 2026-06-01
- **status**: Confirmed (OIAP internal standard)
- **confidence**: High
- **source.label**: fboldo/oiap @oiap/core type system
- **source.url**: https://github.com/fboldo/oiap
- **source.type**: Open source project (third party)
- **notes**: OIAP standardizes on 8 hook events in snake_case as its authoring-level canonical names: `session_start`, `user_prompt_submit`, `before_tool`, `permission_request`, `after_tool`, `before_agent`, `after_agent`, `stop`. The build layer translates these to vendor-specific names/casing. This contrasts with our spec's choice of PascalCase (following open-plugin-spec) and the open-plugin-spec's 25-event list. OIAP's 8 events are a deliberate minimal cross-vendor intersection. Hook result types: AllowHookResult, BlockHookResult, AskHookResult, ModifyHookResult, InjectContextHookResult, ReplaceResultHookResult, ScheduleHookResult, NoopHookResult.

---

## E26 — OIAP defines a formal capability model for plugin permissions

- **claim_id**: E26
- **date**: 2026-06-01
- **status**: Confirmed (OIAP internal standard)
- **confidence**: High
- **source.label**: fboldo/oiap ARCHITECTURE.md
- **source.url**: https://github.com/fboldo/oiap
- **source.type**: Open source project (third party)
- **notes**: OIAP defines a typed capability negotiation model not present in open-plugin-spec or any vendor manifest: NetworkCapability (host, methods, timeout), DatabaseCapability (driver: postgres/sqlite/mysql/redis, operations), ProcessCapability (command, args, cwd, timeout, exit codes), FilesystemCapability (read/write/delete path arrays), SecretCapability, McpCapability, CustomCapability. Hooks also receive a service context at runtime: fetch, db, exec, mcp, secrets, cache, schedule. Failure modes: fail_closed (default), fail_open, ask_user, use_fallback_rule, log_only. This capability layer is OIAP-specific and not mapped from any vendor's existing manifest format.

---

## E27 — Gemini CLI is distinct from Gemini Code Assist; has its own extension format

- **claim_id**: E27
- **date**: 2026-06-01
- **status**: Partially confirmed (OIAP as source; primary docs not fetched)
- **confidence**: Medium
- **source.label**: fboldo/oiap exporter-gemini-cli
- **source.url**: https://github.com/fboldo/oiap
- **source.type**: Third-party implementation
- **notes**: OIAP distinguishes Gemini CLI (a CLI-based agent tool, separate from the Gemini Code Assist IDE extension) and implements an exporter for it. The exporter generates an extension manifest with embedded MCP config. Prior research (E16) covered only Gemini Code Assist (closed IDE extension, no plugin system). Gemini CLI may have a different, extensible architecture. Needs primary source verification from Google's Gemini CLI docs.

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

## E12 — Codex and open-plugin-spec do not publish JSON Schemas

- **claim_id**: E12
- **date**: 2026-05-31
- **updated**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: Each vendor's official docs and GitHub repos
- **source.url**: https://developers.openai.com/codex/plugins/build
- **source.type**: Official docs (multiple vendors)
- **notes**: Updated 2026-06-01 to narrow scope — Zed, Windsurf, Copilot, Gemini, and others are now covered in separate evidence entries. Codex and open-plugin-spec remain confirmed as having no published machine-readable schema.

---

## E13 — GitHub Copilot CLI has a `plugin.json` manifest system

- **claim_id**: E13
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: GitHub Copilot CLI Plugin Reference
- **source.url**: https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference
- **source.type**: Official docs
- **notes**: GitHub Copilot CLI plugins use a `plugin.json` manifest in the plugin root. Only required field is `name` (kebab-case, max 64 chars). Supports: `agents`, `skills`, `commands`, `hooks`, `mcpServers`, `lspServers`. Hook events: `sessionStart`, `sessionEnd`, `preToolUse`, `postToolUse`, `permissionRequest`, `agentStop`, `errorOccurred`, `notification`. Hook types: command (bash/powershell), HTTP (HTTPS POST), prompt. No JSON Schema published. The older "GitHub Copilot Extensions" (GitHub App model) is deprecated as of Nov 2025 and replaced by this plugin system.

---

## E14 — Windsurf uses separate config files rather than a single plugin manifest

- **claim_id**: E14
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: Windsurf Cascade documentation
- **source.url**: https://docs.windsurf.com/windsurf/cascade/skills
- **source.type**: Official docs
- **notes**: Windsurf (Codeium) does not use a single `plugin.json` bundle manifest. Customization is spread across separate files: `SKILL.md` (in `.windsurf/skills/<name>/`), `hooks.json` (in `.windsurf/hooks.json` or `~/.codeium/windsurf/hooks.json`), `mcp_config.json` (in `~/.codeium/windsurf/mcp_config.json`), `.windsurfrules` or `RULES.md`. SKILL.md requires YAML frontmatter with `name` and `description`. Hook events include 12 types: pre/post_read_code, pre/post_write_code, pre/post_run_command, pre/post_mcp_tool_use, pre_user_prompt, post_cascade_response, post_cascade_response_with_transcript, post_setup_worktree. Pre-hooks can block (exit code 2). No JSON schemas published for any of these files. Windsurf also supports VS Code-compatible extensions via Open VSX Registry.

---

## E15 — Zed uses `extension.toml` with documented required fields; no schema published

- **claim_id**: E15
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: Zed Extensions — Developing Extensions
- **source.url**: https://zed.dev/docs/extensions/developing-extensions
- **source.type**: Official docs
- **notes**: Zed's extension manifest is `extension.toml` (TOML format) in the repository root. Required fields: `id`, `name`, `version`, `schema_version` (currently 1), `authors`, `description`, `repository`. `id` must not contain "zed", "Zed", or "extension". Component sections: `[language_servers.*]`, `[grammars.*]`, `[debug_adapters.*]`, `[debug_locators.*]`, `snippets`, `[context_servers.*]` (MCP servers). Most extensions don't require Rust; language servers, debuggers, and MCP extensions compile to WASM. No JSON Schema published for extension.toml (GitHub issue #21994 open, assigned to @maxdeviant). Themes have a published schema: https://zed.dev/schema/themes/v0.2.0.json. Extensions distributed via PR to zed-industries/extensions repo.

---

## E16 — Gemini Code Assist has no plugin system; closed IDE extension

- **claim_id**: E16
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: Gemini Code Assist Documentation
- **source.url**: https://developers.google.com/gemini-code-assist/docs/overview
- **source.type**: Official docs
- **notes**: Gemini Code Assist is a closed IDE extension (VS Code Marketplace: `Google.geminicodeassist`, JetBrains Marketplace: plugin #24198). No external plugin/extension development API. Configuration via IDE settings UI. Uses `.aiexclude` file for file exclusion. Moving toward MCP protocol for tool integration but this is for external tool connections, not extension development. No manifest format, no schema.

---

## E17 — Amazon Q, Cody, Tabnine, Supermaven have no plugin systems

- **claim_id**: E17
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: Multiple official docs
- **source.url**: https://docs.aws.amazon.com/amazonq/
- **source.type**: Official docs (multiple vendors)
- **notes**: Amazon Q Developer: service-based IDE extension (VS Code, JetBrains, Eclipse, Visual Studio), no plugin development API. Sourcegraph Cody: service-based extension, integrates with Sourcegraph Enterprise, no plugin system. Tabnine: legacy VS Code extension deprecated, enterprise-only deployment, no public plugin SDK. Supermaven: single-purpose code completion tool, no extensibility API. None of these expose a plugin manifest format for external developers.

---

## E18 — Cline has a formal plugin system via `package.json` + AgentPlugin SDK

- **claim_id**: E18
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: Cline SDK Plugin Reference
- **source.url**: https://docs.cline.bot/sdk/plugins
- **source.type**: Official docs
- **notes**: Cline (formerly Claude Dev) has a formal plugin architecture using `package.json` with a `cline` object. Plugin `paths` array declares entry points (TypeScript/JavaScript). Plugins export an `AgentPlugin` interface with: `name`, `manifest` (capabilities: `["tools", "hooks"]`), `setup(api, ctx)`, optional `hooks`. Hook lifecycle events: `beforeRun`, `afterRun`, `beforeModel`, `afterModel`, `beforeTool`, `afterTool`, `onEvent`. Hook config: `mode` (blocking/async), `timeoutMs`, `retries`, `failureMode` (fail_open/fail_closed). Installation sources: file URL, git repo, npm package (`npm:@scope/pkg`), local path. Plugin locations: `~/.cline/plugins/` (global) or `.cline/plugins/` (project). Note: plugin support is in SDK/CLI only; VS Code and JetBrains extensions do not yet support plugins. No JSON Schema published; docs only.

---

## E19 — Continue.dev uses `config.yaml`; schema published at raw GitHub URL only

- **claim_id**: E19
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: Continue.dev Hub and Configuration Reference
- **source.url**: https://docs.continue.dev
- **source.type**: Official docs
- **notes**: Continue.dev uses `config.yaml` (replacing deprecated `config.json`) in `.continue/` directory. Required fields: `name`, `version`, `schema`. Optional sections: `models`, `context`, `rules`, `prompts`, `docs`, `mcp_servers`, `data`. Schema published at raw GitHub URL: https://raw.githubusercontent.com/continuedev/continue/main/extensions/vscode/config_schema.json (no stable schema registry hostname). Supports 50+ model providers. Hub marketplace at https://continue.dev/hub for curated extensions. Extensibility is configuration-based + MCP server integration; no native plugin bundle manifest system (no equivalent to `.claude-plugin/plugin.json`).

---

## E20 — Roo Code is archived (shut down May 15, 2026)

- **claim_id**: E20
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: Roo Code archived repository
- **source.url**: https://github.com/RooCodeInc/Roo-Code
- **source.type**: Project announcement
- **notes**: Roo Code (formerly Roo Cline, a fork of Cline) was shut down on May 15, 2026. Repository is now read-only/archived. Had no independent plugin system — inherited Cline's model. Community fork ZooCode continues at https://github.com/Zoo-Code-Org/Zoo-Code/. Aider is also confirmed as a configuration-only CLI tool (`.aider.conf.yml`); no plugin system. JetBrains AI Assistant uses inherited `plugin.xml` from JetBrains platform but is a built-in feature with no external extensibility hooks.

---

## E21 — MCP (Model Context Protocol) is the convergence point across all runtimes

- **claim_id**: E21
- **date**: 2026-06-01
- **status**: Confirmed
- **confidence**: High
- **source.label**: Multiple official docs
- **source.url**: https://modelcontextprotocol.io
- **source.type**: Official docs (multiple vendors)
- **notes**: Every active runtime surveyed (Claude Code, Cursor, Codex, GitHub Copilot CLI, Windsurf, Gemini Code Assist, Zed, Continue.dev, Cline) supports or is adopting MCP server integration. MCP is the de-facto cross-vendor extensibility layer even where no plugin manifest system exists. The `.mcp.json` file format is broadly shared. This makes MCP server support the strongest single cross-vendor integration target beyond SKILL.md.
