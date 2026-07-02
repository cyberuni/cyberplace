# improve-agent-definition

Review and improve a scoped agent or persona definition file for any major agent runtime.

## When to use

When creating or reviewing a `.claude/agents/<name>.md`, `.cursor/rules/<name>.mdc`, or `.agents/skills/<name>/SKILL.md` file. Trigger phrases: "improve agent", "review agent definition", "create agent file", "write agent prompt".

## What it does

Runs 14 named checks (F1–F6, B1–B8) across frontmatter and body, produces a results table with severity levels, and lists actionable findings in a standardized format.

## Install

```bash
npx skills add cyberuni/universal-plugin --skill improve-agent-definition
```

---

## Sources

Every check in this skill is grounded in an official source or widely-cited community practice. Findings marked **community** have no single authoritative reference and are compiled from multiple sources.

### Runtime file locations

| Claim                                                                  | Source                                                                                                               | Notes                                                        |
| ---------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| Claude Code agents at `.claude/agents/<name>.md`                       | [Claude Code sub-agents docs](https://code.claude.com/docs/en/sub-agents) — official                                 | YAML frontmatter + Markdown body                             |
| Cursor persona at `.cursor/rules/<name>.mdc` with `alwaysApply: false` | [Cursor rules docs](https://docs.cursor.com/context/rules) — official                                                | `alwaysApply: false` makes a rule opt-in                     |
| Cursor has no dedicated agent definition format                        | [Cursor rules docs](https://docs.cursor.com/context/rules) — official; project evidence E-CMP-02                     | Rules with `alwaysApply: false` serve as personas            |
| Codex does NOT support agent definitions                               | [Codex plugins build](https://developers.openai.com/codex/plugins/build) — official; project evidence E-CMP-03       | Codex drops the `agents` component from the open-plugin-spec |
| Universal `.agents/skills/<name>/SKILL.md`                             | [open-plugin-spec](https://github.com/vercel-labs/open-plugin-spec); [skills.sh](https://skills.sh) — community spec | Portable across all runtimes via `npx skills add`            |

### Frontmatter checks

| Check                           | Claim                                                                                                             | Source                                                                                                                                                                                                |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1 — frontmatter required       | Claude Code requires `name` and `description` fields                                                              | [Claude Code sub-agents docs](https://code.claude.com/docs/en/sub-agents) — official                                                                                                                  |
| F2 — kebab-case name            | `name` must match the parent directory name                                                                       | [skill-design governance](https://www.npmjs.com/package/cyberplace) — `npx cyberplace governance show skill-design`                                                                               |
| F3 — trigger language           | `description` is what the runtime reads to decide when to delegate; "Use this agent when…" is the required phrase | [Claude Code sub-agents docs](https://code.claude.com/docs/en/sub-agents) — official                                                                                                                  |
| F4 — ≤120 chars                 | Descriptions truncated in context windows past ~120 chars                                                         | [skill-design governance](https://www.npmjs.com/package/cyberplace) — `npx cyberplace governance show skill-design`; [Claude Code best practices](https://code.claude.com/docs/en/best-practices) |
| F5 — no examples in description | Examples pad the description past the 120-char truncation point and belong in the skill body                      | [skill-design governance](https://www.npmjs.com/package/cyberplace) — Q5 check definition                                                                                                           |
| F6 — Cursor alwaysApply: false  | `alwaysApply: true` injects a rule into every context; personas must be opt-in                                    | [Cursor rules docs](https://docs.cursor.com/context/rules) — official                                                                                                                                 |

### Body checks

| Check                                | Claim                                                                                                                                     | Source                                                                                                                                                                                                                                   |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1 — "You are a [seniority] [role]…" | Widely-adopted convention for establishing agent identity and grounding judgment                                                          | Community: [awesome-claude-code-subagents](https://github.com/VoltAgent/awesome-claude-code-subagents) examples (architect, security-auditor, ml-engineer); [everything-claude-code](https://github.com/affaan-m/everything-claude-code) |
| B2 — role in one sentence            | Concise role statements are easier for the model to internalize and stay consistent with                                                  | Community: [PubNub — Best practices for Claude Code subagents](https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/)                                                                                                   |
| B3 — bounded responsibilities        | Over-scoped tasks fail; "build entire auth system" fails, "implement /api/auth/login with JWT" succeeds                                   | Community: [PubNub — Best practices for Claude Code subagents](https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/)                                                                                                   |
| B4 — concrete output format          | Output format is one of three essential system prompt components; vague specs produce inconsistent results                                | Community: [PubNub — Best practices for Claude Code subagents](https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/)                                                                                                   |
| B5 — human-in-the-loop rules         | Human-in-the-loop rules are one of three essential system prompt components; required for any agent that can take irreversible actions    | Community: [PubNub — Best practices for Claude Code subagents](https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/)                                                                                                   |
| B6 — out of scope section            | Agents without scope boundaries accumulate unrelated responsibilities across sessions                                                     | Community: [Claude Code best practices](https://code.claude.com/docs/en/best-practices)                                                                                                                                                  |
| B7 — no filler instructions          | Instructions the model already follows by default dilute the signal of the decisions that actually matter                                 | [skill-design governance](https://www.npmjs.com/package/cyberplace) — Q8 check; [HumanLayer — Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)                                                      |
| B8 — body under 200 lines            | Context window budget is shared; the Claude Code system prompt itself uses ~50 instructions; large agent bodies crowd out project context | Community: [Claude Code best practices](https://code.claude.com/docs/en/best-practices); [HumanLayer — Writing a good CLAUDE.md](https://www.humanlayer.dev/blog/writing-a-good-claude-md)                                               |
