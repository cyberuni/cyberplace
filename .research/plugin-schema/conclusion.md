# Conclusion — Plugin Schema (May 2026)

## Question

What do Claude Code, Cursor, and Codex actually implement for plugin manifest format, and is the Vercel Labs open-plugin-spec a viable universal standard?

## Verdict

**There is no universal plugin manifest today.** Each major vendor uses its own manifest directory:
- Claude Code → `.claude-plugin/plugin.json`
- Cursor → `.cursor-plugin/plugin.json`
- Codex → `.codex-plugin/plugin.json`
- open-plugin-spec → `.plugin/plugin.json` (vendor-neutral fallback, not primary for any vendor)

The practical cross-vendor surface is not the manifest — it is the **shared component content**: `skills/<name>/SKILL.md`, `.mcp.json`, `commands/*.md`, `agents/*.md`. These files are portable as-is. The manifests are thin wrappers pointing to them.

A "universal plugin" strategy must therefore:
1. Define a single source of truth (open-plugin-spec or a custom format)
2. Generate or symlink the three vendor-specific manifest files from it at install/sync time

## Confidence

**High** for the per-vendor schemas (sourced from official docs). **Medium** for open-plugin-spec adoption — Claude Code is the primary documented host; Cursor and Codex claim compat via env var aliases and fallback behavior but their official docs don't confirm `.plugin/plugin.json` as a primary path.

## Strongest supporting evidence

- Claude Code official docs document `.claude-plugin/plugin.json` as the only manifest location; no mention of `.plugin/plugin.json` (E01)
- Cursor official docs document `.cursor-plugin/plugin.json` as required (E02)
- Codex provides `${CLAUDE_PLUGIN_ROOT}` as a compat alias, confirming it follows Claude Code's lead rather than a neutral standard (E03)

## Strongest counterevidence / caveats

- The open-plugin-spec claims Claude Code as a conformant host, implying `.plugin/plugin.json` works as a fallback even if not the primary path — unverified from Claude Code's own docs
- Community articles conflate "portability at the SKILL.md level" with "portability at the manifest level" — these are different things
- Codex's Cursor compat env var aliases suggest the vendors may be quietly converging; the spec may become more real over time

## What is not supported

- There is no single manifest file that all three vendors read as their primary configuration
- Hook event casing is not standardized (PascalCase vs camelCase differ between vendors)
- Vendor-specific components (monitors/themes/channels for Claude Code; rules for Cursor; apps for Codex) have no cross-vendor equivalent

## Thin evidence

- Cursor env var names in hook scripts are not documented in official Cursor docs; assumed to follow the same pattern
- Whether any vendor actually checks `.plugin/plugin.json` as a fallback is unconfirmed from primary sources

## Recheck triggers

- If Anthropic, Cursor, or OpenAI publish a joint plugin format statement
- If open-plugin-spec publishes an official adoption list with version commitments from all three
- When Cursor publishes complete hook documentation including env vars

## Implications for plugin-design governance

The current `plugin-design.md` was based on open-plugin-spec and uses `.plugin/plugin.json` — **this is incorrect** as a description of current vendor reality.

The governance should instead describe a **single-source-of-truth design** (e.g., using open-plugin-spec format) and a maintenance pattern (skill or script) that generates/symlinks the three vendor manifests from it. The shared content (SKILL.md, .mcp.json, etc.) stays canonical; only the manifests are vendor-specific artifacts derived from the canonical source.
