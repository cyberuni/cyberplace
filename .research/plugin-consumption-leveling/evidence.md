# Evidence — Plugin Consumption Leveling

## E-PCL-01

- **Claim:** Claude Code installs plugins to `~/.claude/plugins/cache/<marketplace>/<plugin>/<version>/`
- **Date:** 2026-06-06
- **Status:** confirmed
- **Confidence:** high
- **Source label:** Claude Code plugin marketplaces docs
- **Source URL:** https://code.claude.com/docs/en/plugin-marketplaces
- **Source type:** official docs
- **Notes:** Personal scope installs via symlink; cache is vendor-specific

## E-PCL-02

- **Claim:** Cursor installs plugins to `~/.cursor/plugins/local/<name>`
- **Date:** 2026-06-06
- **Status:** confirmed
- **Confidence:** high
- **Source label:** Cursor plugin docs
- **Source URL:** https://cursor.com/docs/reference/plugins
- **Source type:** official docs
- **Notes:** Separate from `~/.claude/`; no cross-reading documented

## E-PCL-03

- **Claim:** GitHub Copilot CLI installs plugins to `~/.codex/plugins/cache/<marketplace>/<plugin>/<version>/`
- **Date:** 2026-06-06
- **Status:** confirmed
- **Confidence:** high
- **Source label:** GitHub Copilot CLI plugin reference
- **Source URL:** https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-plugin-reference
- **Source type:** official docs
- **Notes:** Also supports team scope `.agents/plugins/marketplace.json` and personal scope `~/.agents/plugins/marketplace.json`

## E-PCL-04

- **Claim:** No vendor reads another vendor's plugin cache directory
- **Date:** 2026-06-06
- **Status:** confirmed
- **Confidence:** high
- **Source label:** Vendor docs (all four Tier 1 vendors)
- **Source URL:** multiple
- **Source type:** official docs (absence of evidence)
- **Notes:** No cross-vendor discovery path documented anywhere; each vendor scans only its own cache

## E-PCL-05

- **Claim:** `skills/<name>/SKILL.md` at project scope is read by 32+ tools without any vendor-specific configuration
- **Date:** 2026-06-06
- **Status:** confirmed
- **Confidence:** high
- **Source label:** agentskills.io specification
- **Source URL:** https://agentskills.io/specification
- **Source type:** specification / governance body
- **Notes:** Adopters include Claude Code, Codex CLI, ChatGPT, VS Code, GitHub Copilot, Gemini CLI, JetBrains Junie, AWS Kiro, Block Goose, Sourcegraph Amp, Snowflake, Databricks, ByteDance TRAE, Mistral AI, and others

## E-PCL-06

- **Claim:** ecc2cursor syncs Claude Code plugin content to Cursor via `npx ecc2cursor sync`
- **Date:** 2026-06-06
- **Status:** confirmed
- **Confidence:** medium
- **Source label:** ecc2cursor GitHub repository
- **Source URL:** https://github.com/cminn10/ecc2cursor
- **Source type:** community tool / open source
- **Notes:** Converts skills, agents, commands, MCP config; prefixes with `ecc-` to track; stateless (no daemon)

## E-PCL-07

- **Claim:** acplugin converts Claude Code plugins to Codex, OpenCode, Cursor, and Antigravity via interactive TUI
- **Date:** 2026-06-06
- **Status:** confirmed
- **Confidence:** medium
- **Source label:** acplugin GitHub repository
- **Source URL:** https://github.com/tokenRollAI/acplugin
- **Source type:** community tool / open source
- **Notes:** Converts skills, instructions, MCP, agents, commands, hooks; also maps Claude model names to GPT/Gemini equivalents

## E-PCL-08

- **Claim:** plugin-portability operates as an installable plugin that generates platform manifests and install docs for multiple vendors
- **Date:** 2026-06-06
- **Status:** confirmed
- **Confidence:** medium
- **Source label:** plugin-portability GitHub repository
- **Source URL:** https://github.com/hiivmind/plugin-portability
- **Source type:** community tool / open source
- **Notes:** Targets Claude Code, Cursor, Gemini CLI, Codex, Antigravity, OpenClaw; assessment-first approach

## E-PCL-09

- **Claim:** Linux Foundation Agentic AI Foundation (AAIF) governs MCP, AGENTS.md, and SKILL.md standards with Anthropic, AWS, Microsoft, Google, OpenAI as platinum members
- **Date:** 2026-06-06
- **Status:** confirmed
- **Confidence:** high
- **Source label:** Linux Foundation AAIF announcement
- **Source URL:** https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation
- **Source type:** official announcement
- **Notes:** AAIF is the governance body most likely to standardize a shared global skills directory if one emerges

## E-PCL-10

- **Claim:** BuildBetter's canonical source pattern uses `/context/` as single source of truth, rendered to vendor-specific outputs (CLAUDE.md, .cursor/rules/*.mdc, AGENTS.md)
- **Date:** 2026-06-06
- **Status:** confirmed
- **Confidence:** medium
- **Source label:** BuildBetter engineering blog
- **Source URL:** https://blog.buildbetter.ai/how-engineering-teams-share-ai-coding-context-across-claude-code-cursor-codex-2026/
- **Source type:** practitioner blog
- **Notes:** Pattern-level evidence; confirms that teams are solving this with "canonical source + render" rather than waiting for vendor coordination
