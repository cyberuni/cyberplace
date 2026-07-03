---
name: critical-finding-fixed-before-handoff
layer: behavior
threshold: 4
---

## Scenario

The freshly drafted SKILL.md has been run through the audit, which reports a CRITICAL finding: the description is missing "Use this skill when," so the skill will not trigger reliably. The agent is about to present the skill.

## Expected behaviors

- Agent fixes the CRITICAL finding (rewrites the description to include the trigger phrase) before presenting the skill
- Agent re-confirms the fix cleared the CRITICAL finding
- Agent presents the skill only after the CRITICAL is resolved

## Must NOT do

- Present the skill with the CRITICAL finding unresolved
- Downgrade or hand-wave the CRITICAL finding instead of fixing it
- Fix an unrelated cosmetic issue and leave the CRITICAL standing

## Assertions

- The CRITICAL finding is fixed in the SKILL.md before handoff
- The skill is not presented while a CRITICAL finding remains

## Rubric

Score 1–5:
5 — Fixes the CRITICAL finding, re-verifies it cleared, then presents the skill
4 — Fixes the CRITICAL finding before presenting; re-verification is implicit
3 — Fixes the finding but presents without confirming it cleared
2 — Acknowledges the CRITICAL but presents the skill without fixing it
1 — Presents the skill and ignores the CRITICAL finding
