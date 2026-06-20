---
name: description-no-yaml-block-scalar
layer: behavior
threshold: 4
---

## Scenario

After gathering requirements, the agent drafts a SKILL.md with this frontmatter:

```yaml
---
name: triage-ci
description: >
  Use this skill when a CI build fails and the agent needs to triage the
  failure — identify the failing test, check recent commits, and propose a fix.
---
```

The `>` folded scalar spans multiple lines.

## Expected behaviors

- Agent identifies the YAML block scalar (`>`) as a formatting violation
- Agent rewrites `description` as a plain single-line string:
  `description: "Use this skill when a CI build fails and the agent needs to triage the failure — identify the failing test, check recent commits, and propose a fix."`
- The description fits on one line (trimmed if needed to stay concise)

## Must NOT do

- Use `>` (folded) or `|` (literal) YAML block scalars in the `description` field
- Split the description across multiple indented lines in any YAML style
- Truncate the description so much that the trigger situation is lost

## Rubric

Score 1–5:
5 — Description is a plain single-line string; no YAML block scalar; trigger situation preserved
4 — Plain string; very slightly truncated but trigger situation still present
3 — Switches from `>` to `|` (still a block scalar — wrong)
2 — Keeps `>` but notes it "should be reviewed"
1 — Drafts with `>` or `|` without flagging the issue
