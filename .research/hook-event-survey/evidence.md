# Evidence

## Claim E-CC-01

Date: 2026-06-06
Status: supports
Confidence: high

Source:
- Label: Claude Code plugins reference (official)
- URL: https://code.claude.com/docs/en/plugins-reference.md
- Type: official docs

Notes:
- Claude Code SessionStart fires at session start/resume; Setup fires only on explicit --init-only/--init/--maintenance flags
- Both SessionStart and Setup support only `command` and `mcp_tool` (not http, prompt, or agent)
- Full event table confirmed: 32 lifecycle events total

## Claim E-CC-02

Date: 2026-06-06
Status: supports
Confidence: high

Source:
- Label: Claude Code hooks reference (official)
- URL: https://code.claude.com/docs/en/hooks
- Type: official docs

Notes:
- Five invocation models: command, http, mcp_tool, prompt, agent
- async, asyncRewake modifiers for command hooks
- Timeouts: 600s default, 30s for UserPromptSubmit, 10s for MessageDisplay
- `once` modifier exists in skill/agent frontmatter but is NOT a general hook modifier

## Claim E-CC-03

Date: 2026-06-06
Status: supports
Confidence: high

Source:
- Label: GitHub issue #11240 — Plugin Lifecycle Hooks request
- URL: https://github.com/anthropics/claude-code/issues/11240
- Type: issue tracker

Notes:
- Request for PostInstall, PreInstall, PostUninstall, PreUninstall hooks
- Closed as duplicate — no PostInstall hook exists in Claude Code as of June 2026
- The duplicate target issue is not identified in this research

## Claim E-CC-04

Date: 2026-06-06
Status: supports
Confidence: medium

Source:
- Label: Claude Code Setup hooks guide (third-party)
- URL: https://claudefa.st/blog/tools/hooks/claude-code-setup-hooks
- Type: blog / third-party analysis

Notes:
- Setup hook described as "on-demand pre-session initialization"
- Does not run automatically with each normal session
- CI/CD use: --init-only runs hook and exits cleanly with return code
- Not a true post-install hook: must be manually invoked, not triggered by plugin install

## Claim E-CUR-01

Date: 2026-06-06
Status: supports
Confidence: high

Source:
- Label: Cursor hooks reference (official)
- URL: https://cursor.com/docs/hooks
- Type: official docs

Notes:
- sessionStart fires when "a new composer conversation is created"
- workspaceOpen fires "once when Cursor opens a workspace and again on every workspace folder change"
- No postInstall or onInstall events exist
- Only shell command invocation model (JSON over stdio)
- loop_limit on stop/subagentStop (default 5)

## Claim E-CUR-02

Date: 2026-06-06
Status: supports
Confidence: high

Source:
- Label: Cursor plugins reference (official)
- URL: https://cursor.com/docs/plugins/building
- Type: official docs

Notes:
- Confirms same event list as hooks reference
- No install-time lifecycle hooks in plugin manifest

## Claim E-CUR-03

Date: 2026-06-06
Status: mixed
Confidence: medium

Source:
- Label: Cursor hooks deep dive (GitButler blog)
- URL: https://blog.gitbutler.com/cursor-hooks-deep-dive
- Type: third-party analysis

Notes:
- As of Cursor 1.7, hooks are in beta; APIs may change
- Documented only 6 hooks (older snapshot); official docs show 21 as of June 2026
- Confirms JSON-over-stdio invocation model
- No throttling controls mentioned

## Claim E-COPILOT-01

Date: 2026-06-06
Status: supports
Confidence: high

Source:
- Label: GitHub Copilot hooks reference (official)
- URL: https://docs.github.com/en/copilot/reference/hooks-configuration
- Type: official docs

Notes:
- sessionStart fires on new or resumed session
- Supports additionalContext field in stdout JSON
- No postInstall hook
- timeoutSec parameter per hook
- Shell command and HTTP invocation models documented

## Claim E-COPILOT-02

Date: 2026-06-06
Status: supports
Confidence: high

Source:
- Label: GitHub Copilot hooks how-to (official)
- URL: https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-hooks
- Type: official docs

Notes:
- Confirmed event list: sessionStart, sessionEnd, userPromptSubmitted, preToolUse, postToolUse, errorOccurred, agentStop
- Hook config loaded when CLI starts
- No plugin-bundled hook distinction documented

## Claim E-COPILOT-03

Date: 2026-06-06
Status: mixed
Confidence: medium

Source:
- Label: GitHub Copilot hooks reference page (official)
- URL: https://docs.github.com/en/copilot/reference/hooks-configuration
- Type: official docs

Notes:
- Reference page shows both `sessionStart` (camelCase) and `SessionStart` (PascalCase) in the same document
- Tutorial pages consistently use camelCase
- Likely a documentation inconsistency; camelCase is the authoritative casing based on tutorial page
- Contradicts the stated "camelCase for Copilot CLI" finding in prior research; no actual contradiction — both point to camelCase, the PascalCase appearance may be a typo

## Claim E-CODEX-01

Date: 2026-06-06
Status: supports
Confidence: high

Source:
- Label: Codex hooks reference (official)
- URL: https://developers.openai.com/codex/hooks
- Type: official docs

Notes:
- SessionStart fires at startup, resume, clear, compact
- Only `type: "command"` handlers run; prompt and agent handlers are parsed but skipped
- No PostInstall or OnInstall hook
- Default 600s timeout
- Multiple matching hooks for same event run concurrently
- Hooks stable as of v0.124.0 (April 2026)

## Claim E-CODEX-02

Date: 2026-06-06
Status: supports
Confidence: high

Source:
- Label: Codex build plugins guide (official)
- URL: https://developers.openai.com/codex/plugins/build
- Type: official docs

Notes:
- Plugin hooks use same event schema as regular hooks
- Plugin hooks receive PLUGIN_ROOT and PLUGIN_DATA env vars
- Installing/enabling a plugin does NOT auto-trust hooks; user must review and trust explicitly
- No PostInstall event in plugin manifest
