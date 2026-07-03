---
name: improve-agent-definition
description: >
  Audit, improve, or create a scoped agent or persona definition for any
  major runtime — Claude Code (.claude/agents/), Cursor (.cursor/rules/ with
  alwaysApply: false), Codex (.codex/agents/), or universal SKILL.md. Use when
  writing, reviewing, or fixing a subagent, persona, or scoped rule, even if
  the user doesn't say "agent definition" explicitly.
---

# Improve Agent Definition

## When to use

Use when creating or reviewing a scoped agent or persona file for any major agent runtime:

| Runtime | File location | Format | Notes |
|---|---|---|---|
| Universal | `.agents/skills/<name>/SKILL.md` | YAML frontmatter + Markdown body | Portable across all runtimes |
| Claude Code | `.claude/agents/<name>.md` | YAML frontmatter + Markdown body | Vendor-specific sub-agent |
| Cursor | `.cursor/rules/<name>.mdc` | YAML frontmatter + Markdown body | `alwaysApply: false` = opt-in persona |
| Copilot CLI | `.github/copilot-instructions.md` (persona section) | Markdown, no frontmatter | No scoped agent format |

**Cursor note:** Cursor has no dedicated agent definition format. A rule with `alwaysApply: false` is the Cursor equivalent of a persona — loaded on demand rather than injected into every context.

## Prerequisites — confirm the file is an agent/persona definition

Before running checks, verify the target file is a scoped agent or persona definition, not a general config or always-on rule.

**Structural signals (file location / frontmatter):**
- Claude Code / Codex: file is under `.claude/agents/` or `.codex/agents/`
- Cursor: file has `alwaysApply: false` in frontmatter
- Universal: file is a `SKILL.md` under `.agents/skills/<name>/`

**Content signal (strongest indicator):** a persona definition opens with a role statement:
> "You are a senior frontend engineer…"
> "You are an experienced architect…"

If neither signal is present, the file may be a task agent (instructions-only) rather than a persona — note which type before running checks, as B1 applies only to personas.

If the file is an always-on rule or global config, this skill does not apply — stop and tell the user.

## Instructions

### 1. Identify the target runtime

Determine the runtime (Claude Code, Cursor, Codex, Universal, Copilot CLI) so you apply the correct format in the checks below.

### 2. Run checks

Read the file and evaluate every check. Produce one results table:

| # | Category | Check | Severity |
|---|---|---|---|
| F1 | Frontmatter | `name` and `description` fields present | CRITICAL |
| F2 | Frontmatter | `name` is kebab-case and matches file/directory name | HIGH |
| F3 | Frontmatter | `description` starts with "Use this agent when…" | HIGH |
| F4 | Frontmatter | `description` ≤1024 characters (spec hard limit) | HIGH |
| F5 | Frontmatter | `description` contains no code blocks or slash-command syntax | MEDIUM |
| F9 | Frontmatter | `description` includes implicit trigger phrases or "even if they don't mention X" clause | MEDIUM |
| F6 | Frontmatter | Cursor persona has `alwaysApply: false` | HIGH |
| B1 | Body | If persona: opens with "You are a [seniority] [role]…" | HIGH |
| B2 | Body | Role stated in one sentence | MEDIUM |
| B3 | Body | Each responsibility covers one bounded concern | MEDIUM |
| B4 | Body | Output format is concrete (file path, JSON shape, etc.) | MEDIUM |
| B5 | Body | Human-in-the-loop rules cover irreversible actions | HIGH |
| B6 | Body | Out of scope section present | LOW |
| B7 | Body | No self-evident filler ("be helpful", "write clean code") | LOW |
| B8 | Body | Prompt body under 200 lines | MEDIUM |

Mark each result: ✅ PASS · ⚠️ WARN · ❌ FAIL · ➖ N/A

N/A rules: F6 → non-Cursor files; B1 → task agents (no role statement); B6 → very narrow single-action agents; F9 → descriptions already ≥150 chars with clear trigger coverage.

### 3. Check definitions

**F1 — Required frontmatter (CRITICAL)**
Fail if the YAML frontmatter block is missing, or `name:` or `description:` fields are absent. Copilot CLI files (no frontmatter format) are ➖ N/A.

**F2 — Name format (HIGH)**
Fail if `name:` is not kebab-case, or does not match the file stem / parent directory name exactly.

**F3 — Trigger language (HIGH)**
Fail if `description` does not start with "Use this agent when…" (case-insensitive). Without this, the runtime cannot reliably decide when to delegate.

**F4 — Description length (HIGH)**
Fail if `description` exceeds 1024 characters (hard spec limit). Optimal range is 150–400 characters — enough to cover the capability, a "Use when…" trigger condition, and implicit phrasing examples. A one-liner under 50 characters almost always lacks trigger coverage.

**F5 — No syntax examples in description (MEDIUM)**
Fail if `description` contains code blocks or slash-command invocation syntax (e.g. `` `/code-review` ``). Natural-language trigger phrases ("even if the user doesn't say 'review' explicitly") are encouraged and do not fail this check.

**F9 — Trigger phrase coverage (MEDIUM)**
Warn if the description covers only explicit invocations but not implicit ones. A description that lists how users naturally phrase the request — including cases where they don't name the domain directly — triggers reliably on real prompts. The pattern is: capabilities + "Use when…" + "even if they don't mention X."

**F6 — Cursor alwaysApply (HIGH)**
For Cursor `.mdc` files: fail if `alwaysApply` is missing or `true`. A persona must be opt-in (`false`); always-on rules inject into every context regardless of relevance.

**B1 — Persona role statement (HIGH)**
For persona files: fail if the body does not open with a role statement in the form `"You are a [seniority] [role]…"`. The seniority qualifier ("senior", "experienced", "expert") grounds the agent's judgment. Task agents (instructions-only) are ➖ N/A.

**B2 — Role sentence (MEDIUM)**
Warn if the role statement spans more than one sentence, or if it is absent (non-persona agents should still have a concise purpose statement).

**B3 — Bounded responsibilities (MEDIUM)**
Warn if any responsibility is too broad to be independently executable — e.g., "handle all backend tasks", "manage the entire auth system". Each bullet should be one scoped concern an agent can complete without ambiguity.

**B4 — Concrete output format (MEDIUM)**
Warn if no Output format section exists, or if the description is vague ("return a summary"). Concrete means: file path, JSON schema, Markdown table structure, PR description template, etc.

**B5 — Human-in-the-loop rules (HIGH)**
Warn if the agent can take irreversible actions (push to remote, open/merge PR, deploy, delete files, send messages) but has no explicit rule requiring user confirmation before doing so.

**B6 — Out of scope section (LOW)**
Warn if the agent has broad responsibilities but no Out of scope section. Without it, scope creep is likely across sessions.

**B7 — No filler instructions (LOW)**
Warn if the body contains instructions any capable model already follows without being told — "write clean code", "be helpful", "provide useful error messages". These dilute the signal of the actual decisions the agent encodes.

**B8 — Body length (MEDIUM)**
Warn if the prompt body exceeds 200 lines. Extract reference material to sibling files and link from a References section.

### 4. Report format

After the table, list every non-passing finding:

```
[SEVERITY] <check-id>: <check name>
  Evidence: <quoted excerpt or observation, ≤120 chars>
  Fix:      <one-line remediation>
```

If all checks pass:
```
✅ <agent-name>: all checks passed.
```

### 5. Example — well-formed agent definition (Claude Code / Cursor / Codex)

```markdown
---
name: code-reviewer
description: >
  Use this agent when reviewing a pull request or changed files for
  correctness, security, and style — even if the user says "look for bugs",
  "check this code", or doesn't mention "review" explicitly.
tools: [Read, Grep, Glob, Bash]
---

# Code Reviewer

## Role
You are a senior code reviewer focused on correctness, security, and maintainability.

## Responsibilities
- Read changed files and identify bugs, logic errors, and security issues
- Flag violations of project conventions from CLAUDE.md / AGENTS.md
- Suggest concrete fixes, not just observations

## Output format
Return a Markdown list grouped by severity: CRITICAL, WARNING, SUGGESTION.
Each item: `[SEVERITY] file:line — description. Suggested fix: ...`

## Human-in-the-loop rules
- Do not post comments to GitHub without explicit user confirmation
- If you find a CRITICAL security issue, stop and report before continuing

## Out of scope
- Do not modify files — report only
- Do not review test files unless explicitly asked
```

## References

- [Claude Code sub-agents docs](https://code.claude.com/docs/en/sub-agents)
- [Cursor rules docs](https://docs.cursor.com/context/rules)
- [Best practices for Claude Code](https://code.claude.com/docs/en/best-practices)
