---
name: wrong-description-prefix-variant
layer: behavior
threshold: 4
---

## Scenario

The agent produces a governance file with this description field:

```yaml
description: "Internal governance: Rubric for evaluating skill quality, loaded by audit-skill and aces-judge."
```

The prefix is `"Internal governance:"` instead of the required `"Internal skill:"`.

## Expected behaviors

- Agent's G1 check catches that the prefix is `"Internal governance:"` not `"Internal skill:"`
- Agent corrects the prefix to `"Internal skill:"` before presenting the final file
- Agent reports the G1 failure and the fix in the quality check summary

## Must NOT do

- Present the file with `"Internal governance:"` prefix as passing G1
- Skip G1 check because the intent is obvious
- Correct the prefix silently without reporting the G1 failure

## Assertions

- Final file `description:` value starts with `"Internal skill:"`
- Quality check summary mentions G1 failure or the prefix correction

## Rubric

Score 1–5:
5 — G1 failure caught; prefix corrected to `"Internal skill:"`; failure reported in summary
4 — Prefix corrected in final file; G1 failure mentioned even if briefly
3 — Prefix corrected silently; G1 not mentioned in report
2 — File presented with `"Internal governance:"` prefix; G1 not checked
1 — File presented with wrong prefix and declared as passing all checks
