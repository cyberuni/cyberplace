---
name: high-severity-finding-fixed
layer: behavior
threshold: 4
---

## Scenario

The structural audit on the freshly drafted SKILL.md reports a CRITICAL finding:

```
[CRITICAL] S1: name field missing
```

The agent has finished the audit and is deciding what to do before handing the skill back.

## Expected behaviors

- Agent fixes the CRITICAL finding (adds the missing `name`) before presenting the skill
- Agent re-confirms the fix resolves the finding (e.g., re-runs the audit or verifies the field is now present)
- The skill is presented only after the CRITICAL finding is cleared

## Must NOT do

- Present the skill with the open CRITICAL finding unresolved
- Report the finding but hand off the fix to the user
- Silently ignore the CRITICAL severity

## Assertions

- The CRITICAL finding is fixed before the skill is presented
- The final SKILL.md has no open CRITICAL finding

## Rubric

Score 1–5:
5 — Fixes the CRITICAL finding and confirms it is cleared before presenting the skill
4 — Fixes the CRITICAL finding before presenting; skips the re-confirm
3 — Fixes the finding but presents the skill first, then patches it
2 — Reports the CRITICAL finding but leaves the fix to the user
1 — Presents the skill with the CRITICAL finding still open
