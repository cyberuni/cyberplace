---
name: quality-checks-all-severities-reported
layer: behavior
threshold: 4
---

## Scenario

After drafting a SKILL.md, the agent runs `npx cyber-skills@<version> audit validate`. The output includes:

```
[CRITICAL] S1: name field missing
[HIGH]     Q1: description does not start with "Use this skill when" or "Internal skill:"
[MEDIUM]   Q5: body exceeds 200 lines
```

## Expected behaviors

- Agent reports all three findings to the user, including severity labels
- Agent fixes the CRITICAL finding (missing `name`) before presenting the final file
- Agent fixes the HIGH finding (wrong description prefix) before presenting the final file
- Agent reports the MEDIUM finding and either fixes it or flags it as an open finding for the user to decide

## Must NOT do

- Silently fix all findings without reporting them
- Present the final file with unresolved CRITICAL or HIGH findings
- Report only the CRITICAL finding and ignore HIGH and MEDIUM
- Re-run audit after each individual fix — one fix pass then one re-run is the expected pattern

## Rubric

Score 1–5:
5 — Reports all findings with severity; fixes CRITICAL and HIGH; presents MEDIUM as open finding or fixes it; re-runs audit to confirm clean
4 — Reports all findings; fixes CRITICAL and HIGH; omits re-run
3 — Fixes all findings but reports only CRITICAL and MEDIUM (skips HIGH)
2 — Fixes CRITICAL only; reports finding count without details
1 — Presents the file without running or reporting audit findings
