# Hook Event Support Survey Conclusion

## Last updated

June 2026

## Question

What hook events do Claude Code, Cursor, GitHub Copilot CLI, and Codex (OpenAI) support for session-start and post-install lifecycle points? What invocation models are available? Are there hooks that fire less than once per session? Are there throttling or frequency controls?

## Verdict

### Session-start hooks

All four vendors have a session-start hook. Event names diverge in casing:

| Vendor | Event name | Fires on resume? | Notes |
|---|---|---|---|
| Claude Code | `SessionStart` | Yes (source field: `startup`, `resume`, `compact`, `clear`) | command + mcp_tool only |
| Cursor | `sessionStart` | Unclear — fires "per new composer conversation"; no documented resume concept | command (shell) only |
| GitHub Copilot CLI | `sessionStart` | Yes ("new or resumed session") | shell command + HTTP + prompt |
| Codex | `SessionStart` | Yes (startup, resume, clear, compact) | command only |

Casing summary: Claude Code and Codex use **PascalCase**. Cursor and Copilot CLI use **camelCase**. This is consistent with prior research (E-CC-01, E-CUR-01, E-COPILOT-01, E-CODEX-01).

### Post-install / post-update hooks

**None of the four vendors has a post-install or post-update hook.** This is a gap across the entire landscape.

- **Claude Code:** Feature requested in issue #11240, closed as duplicate of an earlier request. No implementation as of June 2026.
- **Cursor:** No `postInstall` or `onInstall` event in the 1.7 hooks spec.
- **GitHub Copilot CLI:** Not mentioned anywhere in the hooks reference or tutorials.
- **Codex:** Not in the hooks reference. Plugin manifest bundles only SessionStart and other session-lifecycle events.

The closest approximation is Claude Code's `Setup` hook, which runs only when explicitly invoked via `claude --init-only`, `--init`, or `--maintenance`. It does not fire automatically on plugin install or update. It must be manually triggered by the developer or a CI pipeline.

### Hooks that fire less frequently than every session

| Vendor | Hook | Frequency | Notes |
|---|---|---|---|
| Claude Code | `Setup` | On-demand only (`--init-only`, `--init`, `--maintenance` flags) | Not automatic; no "once per install" |
| Cursor | `workspaceOpen` | Once per workspace open + on workspace folder change | Less frequent than sessionStart |
| GitHub Copilot CLI | — | None documented below per-session frequency | — |
| Codex | — | None documented below per-session frequency | — |

Neither `Setup` (Claude Code) nor `workspaceOpen` (Cursor) is triggered by plugin install or update — they are triggered by user or workspace actions.

### Invocation models

| Vendor | Supported models | Notes |
|---|---|---|
| Claude Code | command, http, mcp_tool, prompt, agent | SessionStart and Setup: command + mcp_tool only |
| Cursor | command (shell) only | JSON over stdio; no HTTP or prompt hooks |
| GitHub Copilot CLI | command (shell), HTTP POST | Tutorial also shows prompt for sessionStart |
| Codex | command only | prompt and agent types parsed but skipped (not yet implemented) |

Claude Code has the most complete invocation model. Codex lags behind — only shell commands work despite the schema supporting more.

### Frequency and throttling controls

| Vendor | Controls | Notes |
|---|---|---|
| Claude Code | `async`, `asyncRewake` modifiers; per-event timeouts; `once` in skill frontmatter | No general throttle; `once` is not a hook modifier |
| Cursor | `loop_limit` on stop/subagentStop (default 5, configurable) | No general throttle |
| GitHub Copilot CLI | `timeoutSec` per hook | No throttle or `once` |
| Codex | Per-hook timeout (default 600s); concurrent execution of multiple matching hooks | No throttle or `once` |

No vendor provides a "once per day" or "once per version" frequency control. The closest thing is a manual workaround: write a sentinel file in the hook script and check for its existence on each run.

## Confidence

High for session-start event names and invocation models (backed by official docs for all four vendors).
High for "no post-install hook exists" on all four vendors (absence is confirmed by docs + feature request).
Medium for exact Copilot CLI casing (mixed PascalCase/camelCase in reference page; camelCase used in tutorial).
Medium for Cursor sessionStart resume behavior (not explicitly documented).

## Strongest support

- Official hooks reference pages for all four vendors confirm event names (E-CC-01, E-CUR-01, E-COPILOT-01, E-CODEX-01)
- Claude Code issue #11240 confirms PostInstall does not exist and has been requested (E-CC-03)
- Codex docs explicitly state "only command handlers run today" (E-CODEX-01)

## Strongest counterevidence

- Copilot CLI reference page inconsistently shows both `sessionStart` and `SessionStart` (E-COPILOT-03) — minor; tutorial pages are consistent
- Claude Code `Setup` hook could be used as a post-install workaround if the install process calls `claude --init-only` — but this is a manual integration, not an automatic lifecycle event

## Not supported

- No evidence that any vendor automatically fires a hook when a plugin is installed or updated
- No evidence that any vendor has a "once per day" or "per-version" frequency control
- No evidence that Cursor `sessionStart` fires on conversation resume (the concept may not exist in Cursor)

## Thin evidence

- Whether GitHub Copilot CLI's `sessionStart` distinguishes new vs. resumed sessions via a `source` field (like Claude Code and Codex do)
- What the duplicate Claude Code issue for PostInstall lifecycle hooks is, and its current status
- Whether Codex `prompt` and `agent` hook types have a planned implementation timeline

## Recheck triggers

- When Claude Code ships a PostInstall or plugin lifecycle hook (watch issue tracker)
- When Cursor 1.8+ is released (hooks are beta in 1.7; API may change)
- When Codex enables `prompt` and `agent` handler types
- If GitHub Copilot CLI hooks reference is updated to resolve the camelCase/PascalCase inconsistency
