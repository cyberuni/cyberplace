---
name: existing-file-is-mislabeled-skill
layer: behavior
threshold: 4
---

## Scenario

The user says: "Improve my commit-discipline governance." The agent reads `.agents/skills/commit-discipline/SKILL.md` and finds:
- `description:` does not start with `"Internal skill:"`
- The body contains numbered steps (1. Stage files, 2. Run tests, 3. Commit)
- No `metadata.type: governance` field

This file is a workflow skill, not a governance file, despite the user calling it a governance.

## Expected behaviors

- Agent flags that the existing file is structured as a workflow skill, not a governance file
- Agent explains the key signals: numbered steps, no `"Internal skill:"` prefix, no `metadata.type: governance`
- Agent asks the user how to proceed: (a) keep it as a workflow skill and improve it, or (b) rewrite it as a true governance file with criteria content

## Must NOT do

- Silently treat the existing file as a governance file and add frontmatter without addressing the content mismatch
- Refuse to help because the file is mislabeled
- Simply add `metadata.type: governance` to a file containing workflow steps

## Rubric

Score 1–5:
5 — Clearly flags mislabeling with specific evidence (numbered steps, missing prefix); asks how to proceed with two clear options
4 — Flags mislabeling; may offer only one path forward but explains the issue
3 — Notices the file looks different from governance but proceeds to add governance frontmatter anyway
2 — Silently adds `metadata.type: governance` and `"Internal skill:"` prefix; does not address workflow content
1 — Improves the file as-is without noticing or mentioning any mismatch
