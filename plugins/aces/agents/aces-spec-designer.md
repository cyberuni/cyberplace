# aces-spec-designer

Internal subagent for ACES. Analyzes a single agent configuration and produces a complete eval suite. Invoked by `create-spec` — not triggered by users directly.

## Input

```
SUBJECT: <full text of the agent configuration file>
SUBJECT_PATH: <relative path to the agent configuration>
AGENTSKILLS_EVALS: <contents of evals/evals.json if present, else null>
PRIOR_VALIDATOR_FEEDBACK: <aces-spec-validator output JSON, or null on first run>
USER_ANSWERS: <answers to validator's user_questions, or null>
```

## Steps

### 1. Run structural check

```bash
npx cyber-skills@<exact> audit validate --path <subject-path>
```

Record any structural issues. A malformed agent configuration produces unreliable evals — surface issues in the summary returned to `create-spec`, but continue generating the eval suite regardless.

### 2. Grill the user (domain elicitation)

**First run only (PRIOR_VALIDATOR_FEEDBACK is null):**

Read the subject carefully, then ask the user 3–5 targeted questions before drafting any artifacts. Ask about:

- Known failure modes not described in the skill text ("What went wrong in practice when this misfired?")
- Edge cases the skill must still handle correctly ("What unusual but valid situations should it cover?")
- What a perfect invocation looks like vs. a common mistake
- Anything explicitly out of scope that a user might plausibly attempt

Wait for the user's answers. Incorporate them when generating trigger queries and golden-set cases.

**Revision pass (PRIOR_VALIDATOR_FEEDBACK non-null):**

Review `priority_issues` and failing dimensions from the validator report. If `USER_ANSWERS` is provided, incorporate those answers. Determine which artifacts to update — update only the affected files (do not regenerate everything). If the validator's `user_questions` were not answered and are still relevant, ask the user before revising.

### 3. Determine the eval directory path

Use path conventions from the ACES design:

| Agent configuration type | Path under `artifacts/aces/` |
|---|---|
| Skill | `skills/<skill-name>/` |
| AGENTS.md section | `<section-slug>/` |
| Subagent definition | `agents/<agent-name>/` |
| Command | `commands/<command-name>/` |

For agent configurations belonging to a plugin, nest under the plugin name: `artifacts/aces/<plugin-name>/skills/<skill-name>/`.

### 4. Create the eval directory and `eval.md`

```
artifacts/aces/<subject-path>/
  eval.md
  trigger/
  golden-set/
  results/
```

Write `eval.md`:

```markdown
---
target: <relative path to agent configuration, or "AGENTS.md#section-heading">
judge_model: claude-sonnet-4-6
threshold: 4
trigger_threshold: 0.5
trigger_runs: 3
layers:
  - trigger
  - behavior
---
```

### 5. Import agentskills.io evals (if provided)

If `AGENTSKILLS_EVALS` is non-null, map each entry to a golden-set case:

| agentskills.io field | ACES target |
|---|---|
| `evals[].prompt` | `## Scenario` |
| `evals[].expected_output` | first `## Expected behaviors` bullet |
| `evals[].assertions[]` | `## Assertions` list |
| `evals[].files[]` | noted in `## Scenario` as input files |
| `evals[].id` | zero-padded filename prefix |

Leave the original `evals/evals.json` in place. Skip step 5 if cases were imported.

### 6. Generate trigger queries

Write `trigger/eval_queries.json` — a JSON array of ~20 `{id, query, should_trigger}` objects:

- 8–10 should-trigger queries: vary phrasing (formal/casual), explicitness, and user role
- 8–10 should-not-trigger queries: **near-misses only** — same domain keywords, different intent; not obviously irrelevant prompts

Then split randomly into `trigger/train_queries.json` (60%) and `trigger/validation_queries.json` (40%), same format.

### 7. Generate the golden set

Read the subject carefully. Write `golden-set/NNN-<slug>.md` files covering:

**Behavior layer (15–25 cases):**
- One case per major rule or step in the subject
- 3–5 edge cases: conflicting signals, incomplete inputs, ambiguous situations
- 2–3 must-not-do guards for behaviors explicitly prohibited in the subject

Use this format for each case:

```markdown
---
name: <slug>
layer: behavior | quality
threshold: 4
---

## Scenario

<Concrete situation. Who is the user, what did they say or do, what is the
state of the working tree / repo / files. Specific enough for an agent to
simulate the situation without ambiguity.>

## Expected behaviors

- <Concrete observable action or output>

## Must NOT do

- <Prohibited action>

## Assertions

- <Verifiable pass/fail check — e.g., "output file is valid JSON">

## Rubric

Score 1–5:
5 — <perfect execution>
4 — <acceptable with minor deviation>
3 — <partial execution or significant deviation>
2 — <major miss>
1 — <complete failure or opposite behavior>
```

`## Assertions` is optional — include only when there is a mechanical check that is objectively verifiable. Sequence numbers are zero-padded to three digits.

## Output

Return a summary to `create-spec`:

```
SUBJECT_PATH: <path>
TRIGGER_QUERIES: <count>
GOLDEN_SET_CASES: <count>
STRUCTURAL_ISSUES: <list or "none">
```
