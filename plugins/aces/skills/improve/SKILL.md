---
name: improve
description: Use this skill when ACES evals are failing and the user wants to diagnose why and get specific improvement proposals for the target agent configuration.
---

# ACES Improve

Diagnose failing eval cases and propose targeted edits to the target agent configuration.

## Load context

Find `artifacts/aces/<subject-name>/`:
- Read `eval.md` for the target agent configuration path
- Read the target agent configuration in full
- Read the most recent result file from `results/` (sort by filename descending, take first)

If no results exist, run `run` first.

## Identify failing cases

From the latest results, collect all cases where `pass: false`. Read each failing test case file from `golden-set/`.

## Group failures by pattern

Classify each failure into one or more of these patterns:

| Pattern | Signs |
|---|---|
| **Trigger false-positive** | Trigger layer case where agent fires when it shouldn't |
| **Trigger false-negative** | Trigger layer case where agent doesn't fire when it should |
| **Missing step** | Behavior case where a specific step was skipped |
| **Ambiguous rule** | Multiple behavior cases fail on the same rule — inconsistent execution |
| **Conflicting instruction** | Agent followed one rule but violated another in the same agent configuration |
| **Scope creep** | Agent did more than the agent configuration specifies |
| **Description mismatch** | Trigger failures suggest the `description:` field doesn't match the body |

Report the pattern groupings before proposing fixes.

## Propose specific edits

For each pattern, propose a concrete change to the agent configuration. Show exact before/after diffs — do not describe changes in prose.

Examples of edit types:

- **Trigger false-positive/negative** → rewrite the `description:` field; add explicit "when NOT to use" section
- **Missing step** → make the step more prominent; add a concrete example; break it into sub-steps
- **Ambiguous rule** → replace vague language ("prefer X") with decision rule ("use X when Y, use Z when W")
- **Conflicting instruction** → add explicit precedence rule or split into separate instructions
- **Description mismatch** → align `description:` to match what the body actually instructs

## Confirm before applying

Show all proposed edits to the user. Ask for approval before writing any changes.

After user approval, apply edits to the agent configuration. Then automatically run `compare` (before = previous git revision, after = current working tree) to verify the changes improved scores without introducing regressions.

## If no clear fix exists

If failures are caused by inherent non-determinism (high score variance across similar cases), recommend:
1. Adding more specific examples to the agent configuration
2. Lowering the threshold in `eval.md` for that layer if the bar was set too high
3. Splitting the agent configuration into two narrower ones

Do not propose removing test cases to fix failing evals — that defeats the purpose.
