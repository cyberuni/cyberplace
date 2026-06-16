# Hook Event Support Survey (June 2026)

## Question

What hook events do Claude Code, Cursor, GitHub Copilot CLI, and Codex (OpenAI) support? For each vendor: what is the session-start hook event name, does a post-install/post-update hook exist, are there hooks that fire less than once per session, what is the invocation model, and are there frequency/throttling controls?

## Scope

In scope:
- The four Tier 1 vendors: Claude Code, Cursor, GitHub Copilot CLI, Codex CLI (OpenAI)
- Session-start hooks (exact names, frequency)
- Post-install / post-update / install-lifecycle hooks
- Any sub-session-frequency hooks (once per install, once per day, etc.)
- Invocation models (shell command, HTTP POST, prompt injection, agent call)
- Frequency throttling or `once` modifiers

Out of scope:
- Windsurf, Zed, Continue.dev, Cline (Tier 2/3 vendors)
- VS Code agent hooks (separate surface from Copilot CLI)
- Non-hook automation (rules, CLAUDE.md injection, etc.)

## Source angles

- Official docs pages for each vendor
- Changelog / release notes for recent additions
- GitHub issues and forum threads for feature requests (signals what is absent)
- Third-party deep-dives and blog posts cross-checking official claims

## Findings

### Claude Code

**Session-start hook:** `SessionStart` (PascalCase)
- Fires once per session: at startup, resume, clear, and compact
- The `source` field in the hook payload distinguishes these sub-cases (`startup`, `resume`, `compact`, `clear`)
- `SessionStart` only supports `command` and `mcp_tool` invocation types (not `http`, `prompt`, or `agent`)

**Sub-session-frequency hook:** `Setup` (PascalCase)
- Fires only when explicitly triggered: `claude --init-only`, `claude --init`, or `claude --maintenance`
- Does NOT fire on normal session startup — must be invoked explicitly
- Matcher field `trigger` is set to `"init"` or `"maintenance"` to distinguish modes
- The `--init-only` flag exits after the hook, making it CI/CD-friendly
- Only supports `command` and `mcp_tool` invocation types
- This is the closest Claude Code has to a "post-install" hook: a manually triggered setup hook, not an automatic one

**Post-install hook:** DOES NOT EXIST. GitHub issue #11240 (closed as duplicate) explicitly requested `PostInstall`/`PreInstall`/`PostUninstall`/`PreUninstall` hooks. Anthropic closed it as a duplicate of a prior request; no implementation has shipped.

**Invocation models:** Five types supported for most events: `command` (shell), `http` (POST), `mcp_tool`, `prompt` (LLM eval), `agent` (subagent with tools). Exception: `SessionStart` and `Setup` support only `command` and `mcp_tool`.

**Frequency/throttling controls:**
- `async`: run hook in background without blocking (command hooks only)
- `asyncRewake`: run in background, wake Claude on exit code 2 (command hooks only)
- `once`: run once per session then remove (skill/agent frontmatter only — not a general hook modifier)
- Default timeout: 600s for most hooks; 30s for `UserPromptSubmit`; 10s for `MessageDisplay`

**Full event list (32 events as of June 2026):**
SessionStart, Setup, UserPromptSubmit, UserPromptExpansion, PreToolUse, PermissionRequest, PermissionDenied, PostToolUse, PostToolUseFailure, PostToolBatch, Stop, StopFailure, SubagentStart, SubagentStop, TaskCreated, TaskCompleted, TeammateIdle, Notification, MessageDisplay, ConfigChange, CwdChanged, FileChanged, InstructionsLoaded, PreCompact, PostCompact, WorktreeCreate, WorktreeRemove, Elicitation, ElicitationResult, SessionEnd, and two more (total 32 per reference page).

### Cursor

**Session-start hook:** `sessionStart` (camelCase)
- Fires "when a new composer conversation is created" — i.e., once per agent chat session
- Does NOT fire on resume or compact (unlike Claude Code's SessionStart)
- Fire-and-forget: no blocking capability

**Sub-application-frequency hook:** `workspaceOpen` (camelCase)
- Fires "once when Cursor opens a workspace and again on every workspace folder change"
- Fires less often than `sessionStart` (workspace open vs. conversation start)
- This is the closest thing to a "once per project open" hook — not a post-install hook

**Post-install hook:** DOES NOT EXIST. No `postInstall`, `onInstall`, or similar events are documented in Cursor 1.7 hooks.

**Invocation model:** Shell command only. Hooks are spawned processes that communicate over stdio using JSON. Exit codes control behavior: `0` (success/proceed), `2` (block action), other (proceed, fail-open).

**Frequency/throttling controls:**
- `loop_limit` on `stop` and `subagentStop` hooks (default 5 iterations, configurable to `null` for unlimited)
- No general throttle or `once` modifier documented

**Full event list (21 events as of Cursor 1.7):**
Agent: sessionStart, sessionEnd, preToolUse, postToolUse, postToolUseFailure, subagentStart, subagentStop, beforeShellExecution, afterShellExecution, beforeMCPExecution, afterMCPExecution, beforeReadFile, afterFileEdit, beforeSubmitPrompt, preCompact, stop, afterAgentResponse, afterAgentThought
Tab: beforeTabFileRead, afterTabFileEdit
App lifecycle: workspaceOpen

### GitHub Copilot CLI

**Session-start hook:** `sessionStart` (camelCase)
- Fires when a new agent session starts or resumes
- Supports `additionalContext` field: JSON on stdout with `additionalContext` key is injected into the conversation
- Fire-and-forget (output is informational only per tutorial page)
- Hook configurations are loaded when the CLI starts

**Post-install hook:** DOES NOT EXIST. No `postInstall`, `onInstall`, or equivalent is documented anywhere in the Copilot hooks reference or tutorials.

**Invocation models:** Shell command (bash or PowerShell depending on OS) and HTTP POST. The reference also shows `prompt` invocation for `sessionStart`. Shell is the primary/documented model.

**Frequency/throttling controls:**
- `timeoutSec` per hook (default 30s in tutorial examples)
- `notification` event is "fire-and-forget" (never blocks session)
- No throttle or `once` modifier documented

**Full event list (documented as of 2026):**
sessionStart, sessionEnd, userPromptSubmitted, preToolUse, postToolUse, postToolUseFailure, agentStop, subagentStart, subagentStop, errorOccurred, preCompact, notification, permissionRequest

Note: The reference page shows both `sessionStart` and `SessionStart` casing — this may reflect a transition or documentation inconsistency. The tutorial pages consistently use camelCase.

### Codex CLI (OpenAI)

**Session-start hook:** `SessionStart` (PascalCase)
- Fires at startup, resume, clear, and compact (same four sources as Claude Code)
- Matcher `"startup|resume"` is the documented example
- Plugin hooks receive `PLUGIN_ROOT` and `PLUGIN_DATA` environment variables
- Hooks stable as of v0.124.0 (April 2026); configurable inline in `config.toml` and `requirements.toml`

**Post-install hook:** DOES NOT EXIST. No `PostInstall`, `OnInstall`, or installation-lifecycle event is documented.

**Invocation model:** Shell command ONLY (`type: "command"`). The documentation states: "Only `type: 'command'` handlers run today. `prompt` and `agent` handlers are parsed but skipped." HTTP hooks are not mentioned as supported.

**Frequency/throttling controls:**
- Multiple matching hooks for the same event are launched concurrently
- Default 600-second timeouts (configurable)
- No `once` modifier or throttle documented

**Plugin trust model:** Installing or enabling a plugin does NOT automatically trust its hooks. Codex skips plugin-bundled hooks until the user reviews and trusts the current hook definition.

**Full event list (10 events as of June 2026):**
SessionStart, SubagentStart, PreToolUse, PermissionRequest, PostToolUse, PreCompact, PostCompact, UserPromptSubmit, SubagentStop, Stop

## Contradictions

- GitHub Copilot CLI reference page shows both `sessionStart` and `SessionStart` casing in the same document. Likely a docs inconsistency; tutorial pages use camelCase consistently. (E-COPILOT-03)
- Claude Code `Setup` hook is described as "pre-session" in third-party sources but the official plugin reference describes it as a session event triggered by explicit flags — not truly a post-install hook, just a manual-trigger equivalent.

## Open questions

- Does Claude Code have a duplicate issue for PostInstall hooks that is further along? (Issue #11240 was closed as duplicate, pointing to another issue not identified in this research)
- When Cursor `sessionStart` fires on "resume" — does this mean /resume command, or is there no resume concept in Cursor?
- Does GitHub Copilot CLI's `sessionStart` have a `source` field distinguishing new vs. resumed sessions?
- Codex `prompt` and `agent` hook types are parsed but skipped — is there a timeline for enabling them?
- Are Cursor hooks available in Cursor versions prior to 1.7?

## Sources consulted

- Claude Code hooks reference: https://code.claude.com/docs/en/hooks
- Claude Code plugins reference: https://code.claude.com/docs/en/plugins-reference.md
- Claude Code Setup hooks guide: https://claudefa.st/blog/tools/hooks/claude-code-setup-hooks
- Claude Code feature request #11240: https://github.com/anthropics/claude-code/issues/11240
- Cursor hooks reference: https://cursor.com/docs/hooks
- Cursor plugins reference: https://cursor.com/docs/plugins/building
- Cursor hooks deep dive: https://blog.gitbutler.com/cursor-hooks-deep-dive
- GitHub Copilot hooks reference: https://docs.github.com/en/copilot/reference/hooks-configuration
- GitHub Copilot hooks how-to: https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-hooks
- GitHub Copilot hooks tutorial: https://docs.github.com/en/copilot/tutorials/copilot-cli-hooks
- Codex hooks reference: https://developers.openai.com/codex/hooks
- Codex build plugins guide: https://developers.openai.com/codex/plugins/build
