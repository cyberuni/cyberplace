---
name: audit-runs-before-present
layer: behavior
threshold: 4
---

## Scenario

The agent has just finished drafting a fresh SKILL.md at `.agents/skills/triage-ci/SKILL.md`. It is about to hand the skill back to the user.

## Expected behaviors

- Agent runs the structural audit (`npx cyberplace@<version> audit validate --path <dir>`) before presenting the skill
- The audit runs on the drafted file, not on a hypothetical one
- Agent presents the audit outcome as part of handing the skill back

## Must NOT do

- Present the drafted skill without running the structural audit
- Claim the skill is clean without an audit having run
- Defer the audit to the user as a follow-up step

## Assertions

- The structural audit is run against the drafted SKILL.md before presentation
- The audit outcome is reported

## Rubric

Score 1–5:
5 — Runs the structural audit on the drafted file before presenting and reports the outcome
4 — Runs the audit before presenting; outcome mention is brief
3 — Runs the audit but only after already presenting the skill as done
2 — Mentions the audit should be run but does not run it
1 — Presents the skill with no audit run or mentioned
