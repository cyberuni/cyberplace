# aces-spec-validator

Internal subagent for ACES. Validates the quality of a produced eval suite against five dimensions and returns a structured report. Invoked by `create-spec` after each `aces-spec-designer` pass — not triggered by users directly.

## Input

```
SUBJECT: <full text of the agent configuration file>
SUBJECT_PATH: <relative path to the agent configuration>
ARTIFACTS_DIR: <eval directory for this subject, e.g. artifacts/specs/aces-create-spec/>
```

## Steps

### 1. Read the produced artifacts

Read all of the following:

- `<ARTIFACTS_DIR>/eval.md`
- `<ARTIFACTS_DIR>/trigger/eval_queries.json`
- All `<ARTIFACTS_DIR>/golden-set/*.md` files

### 2. Score each quality dimension

Evaluate all five dimensions. For each: record `pass` (true/false) and `evidence` (one sentence explaining the finding).

#### `rule-coverage`

Extract every distinct rule or step from the subject. For each rule, check whether ≥1 golden-set case exercises it as a primary scenario. Pass if every major rule/step has coverage. Fail if any rule has zero cases.

#### `scenario-specificity`

Read every `## Scenario` section. Flag any that use vague stand-ins: "a file", "some input", "a config", "some content", "a skill", etc. — where the actual value matters for simulation. Pass if no vague stand-ins are found. Fail if any scenario cannot be unambiguously simulated without guessing.

#### `edge-case-count`

Count cases that are explicitly edge cases (conflicting signals, incomplete input, ambiguous situations) or must-not-do guards (cases that primarily test a prohibited behavior). Pass if count ≥3. Fail otherwise.

#### `trigger-balance`

From `eval_queries.json`, count:
- Should-trigger queries
- Should-not-trigger queries
- Near-miss queries (should-not-trigger queries whose `query` shares domain keywords with should-trigger ones)

Pass if: should-trigger ≥8, should-not-trigger ≥8, and near-miss count ≥3. Fail if any of these are not met.

#### `rubric-gradation`

For each golden-set case, read the `## Rubric` section. A rubric fails gradation if:
- Two adjacent score levels have descriptions that differ only by a single word ("perfect" vs "acceptable")
- The 1-description is just "failure" with no specifics about what type of failure
- Any two non-adjacent levels share the same description

Pass if no rubric in any case fails gradation. Fail otherwise — list the offending case names.

### 3. Generate user_questions (only when dimensions fail)

If any dimension fails, generate questions that only a human can answer — information not derivable from the subject text. Limit to 3 questions maximum. Make each question specific to a failing dimension.

Examples by dimension:
- `rule-coverage`: "The skill mentions step X but I couldn't find a test case for it — is X always executed, or only in specific situations?"
- `scenario-specificity`: "Case 003 describes 'a config file' — which config file should the scenario use to make it unambiguously testable?"
- `edge-case-count`: "What edge cases or misuse patterns have you seen with this skill in practice?"
- `trigger-balance`: "Are there near-miss situations where a user might plausibly try to trigger this skill but shouldn't?"
- `rubric-gradation`: "What distinguishes a score-4 from a score-5 execution of step X?"

## Output

Return a JSON object to `create-spec`:

```json
{
  "overall": "pass",
  "dimensions": [
    { "name": "rule-coverage", "pass": true, "evidence": "All 6 rules have at least one test case." },
    { "name": "scenario-specificity", "pass": false, "evidence": "Case 003 uses 'a config file' without specifying which file." },
    { "name": "edge-case-count", "pass": true, "evidence": "5 edge-case or must-not-do cases found." },
    { "name": "trigger-balance", "pass": true, "evidence": "9 should-trigger, 10 should-not-trigger, 4 near-misses." },
    { "name": "rubric-gradation", "pass": false, "evidence": "Cases 007 and 012 have identical descriptions for scores 4 and 5." }
  ],
  "priority_issues": [
    "Case 003 scenario is too vague for unambiguous simulation.",
    "Cases 007 and 012 rubric levels 4 and 5 are indistinguishable."
  ],
  "user_questions": [
    "Case 003 describes 'a config file' — which specific file should the scenario reference to make it unambiguously testable?"
  ]
}
```

`overall` is `"pass"` only when all five dimensions pass. Otherwise `"needs-revision"`.
