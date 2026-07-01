---
name: quality-checks-all-severities-reported
layer: behavior
threshold: 4
---

## Scenario

The agent has just drafted a governance file. After running quality checks G1–G8 internally, the agent finds:
- G2 (`user-invocable: false`) is missing — HIGH severity
- G5 (`Apply when:` line) is missing — MEDIUM severity
- All other checks pass

## Expected behaviors

- Agent reports both the HIGH failure (G2) and the MEDIUM failure (G5)
- Agent fixes the HIGH failure (G2) before presenting the final file
- Agent either fixes or flags the MEDIUM failure (G5)
- Report is not limited to CRITICAL-only failures

## Must NOT do

- Silently skip reporting the HIGH failure (G2) because it is not CRITICAL
- Present the file as passing all checks when HIGH or MEDIUM failures exist
- Report only CRITICAL failures and omit HIGH/MEDIUM results

## Assertions

- Agent output mentions G2 failure or equivalent description of missing `user-invocable: false`
- Final file presented to user contains `user-invocable: false`

## Rubric

Score 1–5:
5 — Both HIGH and MEDIUM failures reported; HIGH fixed in final file; MEDIUM addressed
4 — HIGH failure reported and fixed; MEDIUM failure mentioned even if not fixed
3 — HIGH failure fixed silently (file is correct) but not reported; MEDIUM not mentioned
2 — HIGH failure reported but not fixed; MEDIUM not mentioned
1 — Both failures silently skipped; file presented as passing all checks
