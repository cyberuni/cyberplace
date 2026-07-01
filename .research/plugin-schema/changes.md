# Changes — Plugin Schema

## 2026-05-31 — Initial research

- **What changed**: First investigation.
- **Why**: `plugin-design.md` governance was based on open-plugin-spec without verifying vendor adoption. Research initiated to ground the governance in what vendors actually implement.
- **Conclusion change**: N/A (initial).
- **Triggered by**: User observation that open-plugin-spec is a proposal, not a confirmed multi-vendor standard.

## 2026-06-01 — Extended to all major agent runtimes

- **What changed**: Expanded research from 3 vendors (Claude Code, Cursor, Codex) to 15+ runtimes including GitHub Copilot CLI, Windsurf, Gemini Code Assist, Zed, Continue.dev, Cline, Roo Code, Aider, Amazon Q Developer, Sourcegraph Cody, Tabnine, Supermaven, JetBrains AI Assistant.
- **Why**: User request to cover all major runtimes and document actual schema links.
- **Conclusion changes (material)**:
  - **New Tier 1 vendor**: GitHub Copilot CLI has a `plugin.json` manifest with the same `name`-only required field pattern — previously unknown. This is the fourth vendor with a `plugin.json` bundle manifest alongside Claude Code, Cursor, and Codex.
  - **Windsurf clarified**: Does not use a bundle manifest at all. Uses separate files (SKILL.md, hooks.json, mcp_config.json). Previously only noted "docs at docs.windsurf.com; no schema file" without architectural detail.
  - **Zed documented**: `extension.toml` required fields now confirmed. Themes schema published at https://zed.dev/schema/themes/v0.2.0.json. `extension.toml` schema issue #21994 confirmed open.
  - **Tier 3 confirmed**: 8 runtimes (Gemini Code Assist, Amazon Q, Cody, Tabnine, Supermaven, Aider, JetBrains AI Assistant, Roo Code) confirmed as having no plugin manifest system.
  - **Roo Code archived**: Shut down May 15, 2026. No longer relevant.
  - **MCP as convergence layer**: Added as a key finding — every active runtime supports MCP regardless of plugin system status.
  - **Schema table updated**: Continue.dev schema URL confirmed; only Claude Code and Cursor have stable authoritative schema URLs.
- **Evidence added**: E13 (Copilot CLI), E14 (Windsurf), E15 (Zed), E16 (Gemini), E17 (Amazon Q/Cody/Tabnine/Supermaven), E18 (Cline), E19 (Continue.dev), E20 (Roo Code/Aider/JetBrains), E21 (MCP convergence).
- **Triggered by**: User request to extend research to additional runtimes.

## 2026-06-01 — Added OIAP and new runtimes from fboldo/oiap

- **What changed**: Added findings from https://github.com/fboldo/oiap (OIAP v0.3.0). Added evidence entries E22–E27.
- **Why**: User request to incorporate OIAP's research and findings into existing research.
- **Conclusion changes**:
  - Added Gemini CLI, OpenCode, OpenClaw, Antigravity to the schema table and Tier 3 section (unverified from primary sources; sourced from OIAP)
  - Added Kiro and Trae as planned future targets (not yet researched from primary sources)
  - Documented Codex manifest path discrepancy (OIAP uses `plugin.json`; our prior research uses `.codex-plugin/plugin.json`) — flagged as needing verification
- **Evidence added**: E22 (OIAP project overview), E23 (new runtimes), E24 (Codex path discrepancy), E25 (OIAP's 8 snake_case hook events), E26 (OIAP capability model), E27 (Gemini CLI distinction)
- **Triggered by**: User pointing to https://github.com/fboldo/oiap.
