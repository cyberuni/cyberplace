# Conclusion — Open Plugin Spec Comparison (June 2026)

## Question

How does open-plugin-spec v1.0.0 compare to what major AI coding agent runtimes actually implement, and where do they diverge?

## Verdict

**The open-plugin-spec is a reasonable approximation of the shared field names, but no runtime fully conforms to it, and its three central premises are each contradicted by vendor reality.**

The three premises that fail:

1. **`.plugin/plugin.json` as the shared fallback path** — Not confirmed as a searched path by any vendor except GitHub Copilot CLI. Every other vendor has a vendor-specific primary path with no documented fallback to `.plugin/`.

2. **PascalCase hook event names as the common standard** — Cursor and GitHub Copilot CLI use camelCase. Windsurf uses snake_case. A spec-conformant `hooks.json` silently fails on two of the four Tier 1 vendors.

3. **`${PLUGIN_ROOT}` / `${PLUGIN_DATA}` as the shared env var convention** — Only Codex matches these names exactly. Claude Code uses `${CLAUDE_PLUGIN_ROOT}` / `${CLAUDE_PLUGIN_DATA}`, and Codex then re-exports those as compat aliases — suggesting the spec adopted Codex's normalization of Claude Code's prefix naming, not the other way around.

Where the spec does accurately describe reality:
- The **core profile** (skills + MCP) is genuinely universal across all Tier 1 vendors.
- The **metadata fields** (`name`, `version`, `description`, `author`, `homepage`, `repository`, `license`) are shared by all Tier 1 vendors.
- The **component field names** (`commands`, `agents`, `hooks`, `mcpServers`, `lspServers`, `outputStyles`) match what Claude Code and partially Cursor actually use.
- The **hook types** (`command`, `http`, `prompt`, `agent`) match Claude Code's implementation; Copilot CLI supports three of the four.

## Deviation summary per runtime

| Runtime | Spec alignment | Biggest divergence |
|---|---|---|
| **Claude Code** | ~70% | Vendor-prefixed env vars; manifest optional (spec requires); 6+ components not in spec |
| **GitHub Copilot CLI** | ~65% | camelCase hook events; env vars undocumented; searches `.plugin/` confirmed |
| **Cursor** | ~60% | camelCase hook events; missing `lspServers`, `outputStyles`; extra marketplace fields |
| **Codex** | ~55% | Mandates `version`+`description`; missing `commands`, `agents`, `rules`, `lspServers`, `outputStyles` |
| **Windsurf** | ~20% | No bundle manifest; separate files; snake_case hooks; env via stdin JSON |
| **Continue.dev** | ~15% | YAML config, not a bundle; different component semantics |
| **Zed** | ~10% | TOML format; language/tool extension model, not agent plugin bundle |
| **Cline** | ~5% | TypeScript SDK interface; completely different extensibility model |

## What is genuinely cross-vendor (the real universal minimum)

1. `skills/<name>/SKILL.md` — every Tier 1 vendor reads this path.
2. `.mcp.json` / `mcpServers` — every active runtime supports MCP server integration.
3. Metadata fields: `name`, `version`, `description`, `author`, `homepage`, `repository`, `license`.
4. `commands/`, `agents/` — supported by Claude Code, Cursor, Copilot CLI (not Codex).

Everything else — hooks, env vars, rules, lspServers, outputStyles, and all vendor-specific additions — requires vendor-specific handling.

## Confidence

**High** for Claude Code and Cursor (sourced from published JSON Schemas). **High** for Codex and Copilot CLI (sourced from official docs). **Medium** for Windsurf (docs less complete). **Low** for whether any vendor actually loads `.plugin/plugin.json` as a fallback — only Copilot CLI is confirmed.

## Strongest supporting evidence

- Claude Code JSON Schema confirms field names that match the spec for metadata and core components (E-CMP-01)
- Cursor JSON Schema confirms camelCase hook naming divergence from spec's PascalCase (E-CMP-02)
- Codex docs confirm `${PLUGIN_ROOT}` + `${PLUGIN_DATA}` matching spec, plus compat aliases for Claude Code's names (E-CMP-03)
- Copilot CLI docs confirm `.plugin/` is searched as a fallback path (E-CMP-04)

## Strongest counterevidence / caveats

- The spec claims Claude Code as a conformant host, lending it authority — but Claude Code's docs don't confirm `.plugin/plugin.json` support
- The spec's extended events list overlaps significantly with Claude Code's event list, suggesting the spec was derived from Claude Code's implementation rather than leading it
- Codex's env var alignment may be intentional standardization toward the spec, or may just reflect that they wanted to match Claude Code while using cleaner names

## What is not supported

- A single `plugin.json` that works identically across all four Tier 1 vendors — hook event casing alone prevents this
- A single `hooks.json` that fires correctly on both PascalCase (Claude Code, Codex) and camelCase (Cursor, Copilot CLI) runtimes
- The spec's `.plugin/plugin.json` path as a confirmed loaded location on Claude Code, Cursor, or Codex

## Notable real-world implementation: OIAP

[fboldo/oiap](https://github.com/fboldo/oiap) (v0.3.0, May 2026) independently implements the same "write once, export everywhere" concept with 9 platform exporters. Key design differences from our spec worth tracking:

- OIAP chose **snake_case** as canonical hook event names (`session_start`, `before_tool`) and translates at build time; our spec chose PascalCase (following open-plugin-spec)
- OIAP defines only **8 canonical events** (minimal cross-vendor intersection); open-plugin-spec defines 25
- OIAP uses **TypeScript authoring** (`definePlugin()`) as the canonical layer rather than a JSON manifest
- OIAP adds a **capability model** (NetworkCapability, DatabaseCapability, ProcessCapability, etc.) not present in open-plugin-spec
- OIAP targets platforms not in open-plugin-spec: Gemini CLI, OpenCode, OpenClaw, Antigravity

OIAP confirms the design space is real. Its existence is evidence that the "write once, export everywhere" approach is viable, while its architectural choices (TypeScript-first, 8 events, capability model) represent alternative design decisions worth considering for future spec versions.

## Recheck triggers

- If any vendor publicly confirms loading `.plugin/plugin.json` as a fallback
- If hook event casing is standardized across vendors
- If the spec publishes v2.0.0 with changes to the core premises
- If Claude Code adds `rules` support (currently absent despite spec including it and Cursor implementing it)
- If OIAP matures and its event/capability model becomes a de-facto standard
