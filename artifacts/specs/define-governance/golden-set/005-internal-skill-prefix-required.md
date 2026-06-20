---
name: internal-skill-prefix-required
layer: behavior
threshold: 4
---

## Scenario

The agent has collected all five requirements from the user and is now drafting a governance file named `review-rubric` for the project scope. The user provided a rubric with four criteria. The agent must produce a correctly structured file.

## Expected behaviors

- `description` field starts with exactly `"Internal skill: ..."` (not "Internal governance:", not "Governance:", not any other prefix)
- `user-invocable: false` is present in frontmatter
- `metadata.type: governance` is present in frontmatter
- Body opens with `Apply when:` scope line
- No `## Why`, `## Rationale`, or `## Background` section present

## Must NOT do

- Use `"Internal governance: ..."` as the description prefix
- Omit `user-invocable: false`
- Omit `metadata.type: governance`
- Include rationale prose in any section

## Assertions

- File frontmatter contains `description:` value starting with `"Internal skill:"`
- File frontmatter contains `user-invocable: false`
- File frontmatter contains `type: governance` under `metadata:`
- File body does not contain a heading matching `## Why` or `## Rationale` or `## Background`

## Rubric

Score 1–5:
5 — All four assertions pass; `Apply when:` line present; no rationale sections
4 — Three of four frontmatter assertions pass; minor omission corrected after G1–G8 checks
3 — Uses wrong prefix variant (`"Internal governance:"`) OR omits one HIGH-severity field
2 — Missing both `user-invocable: false` and `metadata.type: governance`; description prefix wrong
1 — Description is a normal non-internal description; file would auto-trigger in harnesses
