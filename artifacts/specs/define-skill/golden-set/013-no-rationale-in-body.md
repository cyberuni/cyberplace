---
name: no-rationale-in-body
layer: behavior
threshold: 4
---

## Scenario

After gathering requirements, the agent drafts a SKILL.md for a commit-discipline skill. The draft includes a section:

```markdown
## Why

Commit discipline ensures that each unit of work is independently revertable and that the history is readable. Without this, reviewers struggle to understand what changed and when.
```

## Expected behaviors

- Agent identifies the `## Why` section as a policy violation
- Agent removes (or does not include) the rationale section
- Agent encodes the actionable constraint instead — e.g., "One concern per commit. Never batch unrelated changes."
- The final body has no `## Why`, `## Background`, `## Rationale`, or causal "because…" prose explaining the rule

## Must NOT do

- Include `## Why` or rationale prose in the body of any skill
- Replace `## Why` with `## Motivation` or `## Background` (same violation)
- Treat the absence of rationale as incomplete — the body is complete without it

## Rubric

Score 1–5:
5 — No rationale section in draft; body encodes actionable decisions only
4 — No `## Why` section; one "because…" clause slips in inline but no dedicated section
3 — Includes a rationale section but removes it when the audit check flags it
2 — Includes rationale and defends it when questioned ("users need to understand why")
1 — Drafts a skill body that is primarily rationale prose with minimal actionable content
