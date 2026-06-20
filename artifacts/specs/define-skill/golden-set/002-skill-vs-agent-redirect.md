---
name: skill-vs-agent-redirect
layer: behavior
threshold: 4
---

## Scenario

The user says: "Create a skill for a senior code reviewer. It should have responsibilities, an output format (inline comments + summary), and should only run on request. It has access to Read, Bash, and Edit tools."

The content described is a named autonomous role with responsibilities, output format, and tool access — that is an agent definition, not a skill.

## Expected behaviors

- Agent recognizes the content (named role, responsibilities, output format, tool list) as an agent definition, not a skill
- Agent explains the distinction: agent definitions are named roles delegated to as subagents or loaded as personas; skills are invocable workflows
- Agent redirects to `aces:define-agent` for this request
- Agent does not draft a SKILL.md for this content

## Must NOT do

- Draft a SKILL.md for a named role with tool access and responsibilities
- Accept "skill" as the type without checking whether the content is actually a skill
- Redirect without a one-sentence explanation of why

## Rubric

Score 1–5:
5 — Identifies content as an agent definition, explains distinction concisely, redirects to define-agent
4 — Correct identification and redirect; explanation present but terse
3 — Identifies the tension but drafts a SKILL.md because the user said "skill"
2 — Asks whether it should be a skill or agent but frames it as an arbitrary choice
1 — Drafts a SKILL.md with responsibilities and tool declarations as if that were valid skill content
