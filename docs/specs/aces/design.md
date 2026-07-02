# Design: ACES — Agent Config Examination & Specification

**Status:** Draft  
**Authors:** unional  
**Date:** 2026-06-13  
**Scope:** spec-driven quality system for agent configurations — skills, AGENTS.md sections, subagent definitions, commands

---

## 1. Problem Statement

Agent configuration agent configurations (skills, `AGENTS.md` sections, subagent definitions, commands) shape how AI agents behave. When these agent configurations are wrong or ambiguous, agents behave incorrectly — but there is no built-in way to detect this.

Three failure modes occur repeatedly:

**Silent regression.** A skill is edited to improve one scenario. There is no way to know whether the edit broke another scenario. The author relies on manual spot-checking, which doesn't catch edge cases.

**Trigger mismatch.** A skill's `description:` field doesn't accurately reflect the situations where the agent should invoke it. The skill fires when it shouldn't, or doesn't fire when it should. This is only noticed when something goes visibly wrong.

**Ambiguous rules.** `AGENTS.md` sections use vague language ("prefer X over Y") that agents interpret inconsistently across sessions. The same rule produces different behavior depending on phrasing of the user's message.

Existing tooling addresses only structure (`audit-skill` checks frontmatter and section presence) — not runtime behavior. There is no way to measure whether an agent configuration actually produces correct agent behavior.

ACES applies spec-driven development (SDD) to agent configurations. In SDD, a spec (test cases + rubric) is written alongside the implementation and serves as the authoritative description of behavior. ACES does the same for agent configurations: the golden set is the spec, the agent configuration is the implementation, and `run` is the verification step. The current scope focuses on the **backfill path** — adding specs to existing agent configurations — but the full SDD lifecycle (spec first, then implement) is the intended end state.

---

## 2. Goals

- **G1** — Define a test case format for agent configurations that captures scenario, expected behaviors, prohibited behaviors, and a scoring rubric.
- **G2** — Specify a golden set convention: a curated directory of test cases per agent configuration that serves as ground truth.
- **G3** — Specify an eval run protocol: for each test case, score agent behavior against the rubric using an LLM judge, and produce a structured result.
- **G4** — Specify a regression gate: detect when an agent configuration change drops scores below a threshold before committing.
- **G5** — Specify a report format for project-wide eval health across all agent configurations.
- **G6** — Specify an improvement workflow: map failing test cases to patterns, propose targeted edits to the agent configuration.

## 3. Non-Goals

- **NG1** — Runtime monitoring of live agent sessions. ACES is an offline eval tool; online monitoring is a separate concern.
- **NG2** — Automated agent configuration repair. ACES proposes edits; the user approves them. No auto-apply without confirmation.
- **NG3** — Evaluation of agent tool use or MCP server calls. ACES evaluates instruction-following behavior, not tool integration.
- **NG4** — Cross-agent configuration conflict detection. Detecting that two skills give contradictory instructions is a future concern.
- **NG5** — Benchmark comparison across agent runtimes (Claude Code vs. Cursor vs. Codex). ACES evaluates within one runtime.

---

## 4. Concepts

### 4.1 Agent configuration

The collective term for all instruction agent configurations an agent runtime loads:

| Artifact | When loaded | Examples |
|---|---|---|
| `AGENTS.md` section | Every session (always-on) | Commit discipline, coding conventions |
| Skill (`SKILL.md`) | On demand when triggered | `create-skill`, `aces-run` |
| Subagent definition | When explicitly invoked as sub-task | `aces-judge`, a researcher agent |
| Command | When user invokes named slash command | `/commit-work`, `/code-review` |

### 4.2 Eval layer

A category of behavior being tested. Layers are ordered from cheapest to most expensive:

| Layer | Question | Scored by | Input format |
|---|---|---|---|
| **Structural** | Does the agent configuration have required fields and format? | `audit-skill` (static) | — |
| **Trigger** | Does the agent correctly decide when to invoke this agent configuration? | trigger rate (run-based) | `eval_queries.json` |
| **Behavior** | When invoked, does the agent follow the steps and rules? | `aces-judge` (rubric + assertions) | `golden-set/*.md` |
| **Quality** | Is the output the agent produces actually good? | `aces-judge` (rubric + assertions) | `golden-set/*.md` |

The structural layer delegates to `audit-skill` and runs free. The trigger layer uses a different mechanism from behavior/quality: it runs real queries against the agent and measures whether the skill was invoked (trigger rate), not LLM simulation. Behavior and quality layers use `aces-judge`.

### 4.3 Test case

A single scenario that exercises one aspect of one agent configuration at one layer. A test case specifies:

- Which layer it tests
- A concrete situation description
- A list of expected behaviors (observable actions or outputs)
- A list of prohibited behaviors
- Optional assertions: verifiable pass/fail checks on observable outputs
- A rubric (1–5 scoring criteria)
- A pass threshold (default: 4)

Assertions and rubric are complementary. Assertions check mechanical properties objectively ("output includes a bar chart file"); the rubric scores holistic quality. When assertions are present, a failed assertion caps the rubric score at 3 — the agent configuration cannot score 4 or 5 if a must-pass check failed.

### 4.4 Golden set

The complete test suite for one agent configuration:
- **Trigger queries**: stored in `artifacts/aces/<subject-path>/trigger/eval_queries.json` — a JSON array of `{query, should_trigger}` pairs, split into `train_queries.json` (60%) and `validation_queries.json` (40%) for optimization without overfitting.
- **Behavior/quality cases**: stored in `artifacts/aces/<subject-path>/golden-set/*.md` — markdown test cases with scenarios, assertions, and rubric.

Both are version-controlled and grow over time as new failure modes are discovered.

Coverage targets:

| Layer | Min cases | Composition |
|---|---|---|
| Trigger | ~20 queries | 8–10 should-trigger, 8–10 should-not-trigger; include near-misses |
| Behavior | 15–25 | 1 per major rule/step + 3–5 edge cases + 2–3 must-not-do cases |
| Quality | optional | End-to-end output quality checks |

### 4.5 Eval run

A single execution of the eval suite against the current agent configuration. Two run types:
- **Trigger run**: executes each query in `eval_queries.json` N times, measures trigger rate per query, produces a trigger result JSON.
- **Behavior/quality run**: for each test case in `golden-set/`, invokes `aces-judge`, collecting scores, assertion results, and timing. Produces a behavior result JSON.

Results are timestamped and stored in `artifacts/aces/<subject-path>/results/`. `benchmark.json` is rewritten after each run with aggregate stats.

### 4.6 Pass threshold

A score cutoff (1–5) that classifies a test case as passing or failing. Default: 4. Configurable per agent configuration in `eval.md` and overridable per test case in its frontmatter.

### 4.7 Regression gate

A check run by `aces-compare` that blocks an agent configuration change if any test case's score drops vs. the previous version. A regression is a pass→fail flip or a score drop of ≥2 on any case.

---

## 5. Workflows

### 5.1 Backfill path (current scope)

The backfill path starts with an existing agent configuration that has no spec yet.

```
create-spec
  └─ per agent configuration (sequential):
       ├─ aces-spec-designer (iteration 0)
       │    ├─ audit-skill        → structural issues (surfaced, not blocking)
       │    ├─ eval.md            → suite config
       │    ├─ trigger/           → eval_queries.json, train/validation splits
       │    └─ golden-set/        → 001-*.md … NNN-*.md
       └─ quality loop (max 3 iterations):
            ├─ aces-spec-validator   → overall: pass | fail + user_questions
            │    pass  → exit loop
            │    fail  → (ask user questions if any) → aces-spec-designer (next iteration)
            └─ after 3 iterations without pass → accepted-pending-review

         ↓

run
  ├─ aces-executor (per test case)   → simulated execution transcript
  ├─ aces-grader  (per test case)    → score, assertion results, eval_feedback
  └─ results/<timestamp>.json        → benchmark.json updated

         ↓

[all cases pass?]
  yes → done
  no  → improve → compare → run  (repeat until passing or accepted)
```

**Step-by-step:**

1. **`create-spec`** — scan for unevaluated agent configurations (or resolve a named one); for each, invoke `aces-spec-designer` (iteration 0), then run a quality loop (max 3 iterations): invoke `aces-spec-validator`, exit on pass, otherwise surface any `user_questions` to the user and re-invoke `aces-spec-designer` with validator feedback and collected answers; report file counts, structural issues, quality gate outcome, and iteration count.

2. **`run`** — execute trigger queries against the live agent (trigger layer) and simulate behavior cases through `aces-executor` + `aces-grader` (behavior/quality layers); write result JSONs and update `benchmark.json`.

3. **Review** — examine failing cases, scores, and `eval_feedback` suggestions from `aces-grader`.

4. **`improve`** (if failing cases) — invoke `aces-analyzer` to identify failure patterns; present proposed agent configuration diffs; apply after user approval.

5. **`compare`** (after edits) — blind A/B comparison via `aces-comparator`; reports improved / regressed / unchanged per case.

6. Repeat from step 2 until all cases pass or the pass rate is acceptable.

### 5.2 Forward path (future scope)

The forward path writes the spec before the agent configuration exists — full SDD: spec first, then implement.

1. **`create-spec`** for a not-yet-implemented agent configuration — generates behavioral spec from a description or requirements document.
2. **Implement** the agent configuration (write `SKILL.md`, `AGENTS.md` section, etc.) to satisfy the golden set.
3. **`run`** to verify the implementation passes its spec.
4. **`add-scenario`** to extend coverage as new edge cases surface.

### 5.3 Ongoing maintenance

After the initial spec is established:

- **`add-scenario`** — add a case when a production failure or new edge case is discovered.
- **`run`** — re-run after any agent configuration edit to catch regressions.
- **`compare`** — verify an agent configuration change didn't regress before committing.
- **`report`** — project-wide health dashboard across all agent configuration specs.

---

## 6. File Layout

```
artifacts/aces/
  <subject-path>/
    eval.md                          ← suite config
    trigger/
      eval_queries.json              ← full trigger query set
      train_queries.json             ← 60% split for optimization
      validation_queries.json        ← 40% split for generalization check
    golden-set/
      001-<slug>.md                  ← behavior/quality test cases
      002-<slug>.md
      ...
    results/
      trigger-<timestamp>.json       ← trigger run results
      behavior-<timestamp>.json      ← behavior/quality run results
    benchmark.json                   ← latest aggregate stats (overwritten each run)
    feedback.json                    ← latest human review notes (overwritten each iteration)
```

Artifact path conventions:

| Artifact type | Path |
|---|---|
| `AGENTS.md` section | `<section-slug>/` (e.g., `commit-discipline/`) |
| Skill | `skills/<skill-name>/` (e.g., `skills/create-skill/`) |
| Subagent definition | `agents/<agent-name>/` (e.g., `agents/aces-judge/`) |
| Command | `commands/<command-name>/` |

For agent configurations that belong to a plugin, nest under the plugin name:

```
artifacts/aces/
  <plugin-name>/
    skills/<skill-name>/
    agents/<agent-name>/
    commands/<command-name>/
```

Example: the `aces` plugin's `create-spec` skill lives at `artifacts/aces/aces/skills/create-spec/`.

### 6.1 `eval.md` schema

```markdown
---
target: <relative path to agent configuration, or "AGENTS.md#section-heading">
judge_model: claude-sonnet-4-6
threshold: 4           # rubric pass threshold (1–5); default 4
trigger_threshold: 0.5 # fraction of runs that must trigger for a should-trigger query to pass
trigger_runs: 3        # number of times each trigger query is executed
layers:
  - trigger
  - behavior
---
```

### 6.2 Trigger query format (`eval_queries.json`)

```json
[
  {
    "id": 1,
    "query": "I have a CSV of monthly sales data in data/sales.csv — can you find the top 3 months by revenue?",
    "should_trigger": true
  },
  {
    "id": 2,
    "query": "write a python script that reads a csv and uploads each row to postgres",
    "should_trigger": false
  }
]
```

Good trigger queries vary phrasing (formal/casual), explicitness (names the domain vs. describes the need indirectly), and detail level. Should-not-trigger queries should be **near-misses** — same domain keywords, different intent — not obviously irrelevant prompts. `train_queries.json` and `validation_queries.json` are the same format, generated by `aces-spec-designer` as a 60/40 random split of `eval_queries.json`.

### 6.3 Behavior/quality test case format

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
- <Another action>

## Must NOT do

- <Prohibited action>

## Assertions

- <Verifiable pass/fail check on the output — e.g., "output file is valid JSON">
- <Another mechanical check>

## Rubric

Score 1–5:
5 — <description of perfect execution>
4 — <acceptable with minor deviation>
3 — <partial execution or significant deviation>
2 — <major miss>
1 — <complete failure or opposite behavior>
```

`Assertions` is optional. Good assertions are objectively verifiable ("output includes exactly 3 items", "no debug logging in output"). Avoid assertions that restate the rubric at 5 or that are too brittle (exact string matches). When assertions are present, any failed assertion caps the rubric score at 3.

### 6.4 Trigger result JSON (`trigger-<timestamp>.json`)

```json
{
  "timestamp": "2026-06-13T14:22:00Z",
  "target": "skills/create-skill/SKILL.md",
  "trigger_threshold": 0.5,
  "runs_per_query": 3,
  "split": "train",
  "pass_rate": 0.80,
  "queries": [
    {
      "id": 1,
      "query": "...",
      "should_trigger": true,
      "trigger_count": 3,
      "trigger_rate": 1.0,
      "pass": true
    },
    {
      "id": 2,
      "query": "...",
      "should_trigger": false,
      "trigger_count": 1,
      "trigger_rate": 0.33,
      "pass": true
    }
  ]
}
```

### 6.5 Behavior/quality result JSON (`behavior-<timestamp>.json`)

```json
{
  "timestamp": "2026-06-13T14:22:00Z",
  "target": "skills/create-skill/SKILL.md",
  "pass_rate": 0.82,
  "mean_score": 3.9,
  "std_dev": 0.8,
  "threshold": 4,
  "cases": [
    {
      "name": "001-creates-skill-file",
      "layer": "behavior",
      "score": 5,
      "pass": true,
      "total_tokens": 4200,
      "duration_ms": 18500,
      "assertion_results": [
        {
          "text": "SKILL.md file was created",
          "passed": true,
          "evidence": "File written to .agents/skills/my-skill/SKILL.md"
        }
      ],
      "what_worked": "...",
      "what_failed": "nothing"
    }
  ]
}
```

### 6.6 `benchmark.json`

Aggregate stats across the latest run, rewritten after each `aces-run`:

```json
{
  "updated": "2026-06-13T14:22:00Z",
  "trigger": {
    "pass_rate": { "mean": 0.80, "stddev": 0.0 },
    "split": "train"
  },
  "behavior": {
    "pass_rate": { "mean": 0.82, "stddev": 0.06 },
    "mean_score": { "mean": 3.9, "stddev": 0.8 },
    "time_seconds": { "mean": 18.5, "stddev": 3.2 },
    "tokens": { "mean": 4200, "stddev": 310 }
  },
  "delta": {
    "behavior_pass_rate": 0.15
  }
}
```

`delta` compares the latest run against the previous result file. Empty on first run.

### 6.7 `feedback.json`

Human review notes per test case, rewritten after each review iteration:

```json
{
  "001-creates-skill-file": "",
  "002-audits-on-create": "Skill was created but audit step was skipped — not surfaced in output at all."
}
```

Empty string means output looked fine. Non-empty is actionable feedback for `aces-improve`.

### 6.8 agentskills.io compatibility

Skills that already have an `evals/evals.json` file (the [agentskills.io](https://agentskills.io) format) can be imported by `aces-spec-designer`. The mapping:

| agentskills.io field | ACES target |
|---|---|
| `evals[].prompt` | `## Scenario` |
| `evals[].expected_output` | first `## Expected behaviors` bullet |
| `evals[].assertions[]` | `## Assertions` list |
| `evals[].files[]` | noted in `## Scenario` as input files |
| `evals[].id` | zero-padded filename prefix |

`aces-spec-designer` reads `evals/evals.json`, generates `golden-set/*.md` files from it, and leaves the original file in place. Subsequent `add-scenario` calls append to the golden set, not to `evals.json`.

---

## 7. Skills

### 7.1 `create-spec`

**Trigger:** User asks to create evals / a spec for one or more agent configurations.

**Steps:**
1. Scan the project for agent configurations (skills, `AGENTS.md` sections, subagent definitions, commands) that have no `artifacts/aces/` entry yet
2. If a specific agent configuration is named in the request, resolve it directly — skip scanning
3. If multiple unevaluated agent configurations are found, list them and ask the user to select one, several, or all
4. For each selected agent configuration, process sequentially:
   - **Iteration 0 (draft):** invoke `aces-spec-designer` with `SUBJECT`, `SUBJECT_PATH`, `AGENTSKILLS_EVALS`, `PRIOR_VALIDATOR_FEEDBACK: null`, `USER_ANSWERS: null`
   - **Quality loop (max 3 iterations):**
     1. Invoke `aces-spec-validator` with `SUBJECT`, `SUBJECT_PATH`, `ARTIFACTS_DIR`
     2. If `overall == "pass"` → exit loop with quality gate `pass`
     3. If `user_questions` non-empty → ask the user those questions and collect answers
     4. Re-invoke `aces-spec-designer` with `PRIOR_VALIDATOR_FEEDBACK` set to the validator output and `USER_ANSWERS` set to collected answers (or null)
     5. Repeat
   - If the loop completes 3 iterations without pass → quality gate `accepted-pending-review`
5. Report: agent configurations processed, file counts, structural issues found, quality gate outcome per configuration, unresolved dimension failures (if `accepted-pending-review`), iteration count, next step (`aces:run`)

**Output:** One `artifacts/aces/<subject-path>/` per selected agent configuration, each populated and ready for `run`.

---

### 7.2 `run`

**Trigger:** User asks to run evals or validate after editing an agent configuration.

**Steps:**
1. Locate `eval.md` (from user context or by scan)
2. Read the current agent configuration in full
3. **Trigger layer** (if configured):
   - Run each query in `train_queries.json` `trigger_runs` times; detect whether the skill was invoked each time
   - Compute `trigger_rate` per query; a query passes if its rate meets `trigger_threshold`
   - Write `trigger-<timestamp>.json`
4. **Behavior/quality layers** (if configured):
   - For each test case in `golden-set/`, invoke `aces-judge`; record score, assertion results, timing
   - Write `behavior-<timestamp>.json`
5. Update `benchmark.json` with aggregate stats and delta vs. previous run
6. Report: trigger pass rate, behavior pass rate, failing cases (worst first), token/time cost

**Output:** Result JSON(s) + updated `benchmark.json` + console report.

---

### 7.3 `add-scenario`

**Trigger:** User describes a new scenario, a production failure, or an edge case to cover.

**Steps:**
1. Accept free-text description or pasted agent transcript
2. Classify layer (trigger / behavior / quality)
3. Draft test case, show to user for confirmation
4. Write to `golden-set/` with next sequence number

**Output:** New test case file.

---

### 7.4 `compare`

**Trigger:** User wants to know if an edit improved or regressed behavior.

**Steps:**
1. Identify two versions: default is working tree vs. last git revision; `--baseline` flag compares with-agent configuration vs. without-agent configuration
2. Run behavior/quality golden set against both versions **blind**: label outputs A and B without revealing which is which
3. Invoke `aces-comparator` for each test case to pick a winner; then unblind and compute per-case change type: `improved`, `regressed`, `unchanged`, `now-passing`, `now-failing`
4. If trigger layer configured: run `train_queries.json` against both versions, compare trigger rates
5. Report net pass rate delta, comparator winner breakdown, improved and regressed cases
6. If any regression: warn, recommend resolving before committing

**Output:** Diff report. No result JSON written unless requested.

---

### 7.5 `improve`

**Trigger:** Eval results have failing cases; user wants to fix the agent configuration.

**Steps:**
1. Load latest behavior result from `results/`, read failing test cases and `feedback.json`
2. Invoke `aces-analyzer` with failing cases, feedback notes, and current agent configuration to extract improvement patterns
3. Group by pattern (see §9) and prioritize by impact
4. Present proposed diffs to the agent configuration — do not auto-apply
5. After approval, apply edits and run `compare` to verify

**Output:** Proposed agent configuration edits + post-edit comparison.

---

### 7.6 `report`

**Trigger:** User wants project-wide eval health.

**Steps:**
1. Scan all `artifacts/aces/*/results/` for latest and second-latest runs
2. Compute per-suite: pass rate, mean score, trend (vs. previous run)
3. Classify health: `healthy` (≥90%), `degraded` (70–89%), `critical` (<70%), `no-data`, `trending-down` (≥10% drop)
4. Print summary table, call out suites needing attention

**Output:** Console dashboard.

---

## 8. Internal Agents

Five internal agents handle evaluation. None are user-triggered.

### 8.1 `aces-spec-designer`

Invoked by `create-spec` for each selected agent configuration. Analyzes the agent configuration and produces the full eval suite.

**Input:**
```
SUBJECT: <full agent configuration text>
SUBJECT_PATH: <resolved path>
AGENTSKILLS_EVALS: <contents of evals/evals.json if present, else null>
PRIOR_VALIDATOR_FEEDBACK: <aces-spec-validator output JSON from previous iteration, else null>
USER_ANSWERS: <answers to user_questions from previous validator run, else null>
```

**Steps:**
1. Run structural layer (`audit-skill`) — surface issues before writing behavioral tests
2. Create `artifacts/aces/<subject-path>/` directory and `eval.md` (using path conventions from §6)
3. If `evals/evals.json` (agentskills.io format) provided: import it as initial golden set cases (see §6.8)
4. Generate trigger queries in `trigger/eval_queries.json`:
   - ~20 queries: 8–10 should-trigger, 8–10 should-not-trigger (near-misses, not obviously irrelevant)
   - Randomly split into `train_queries.json` (60%) and `validation_queries.json` (40%)
5. Generate initial golden set (if not imported from evals.json):
   - 15–25 behavior cases (one per rule/step + edge cases + must-not-do guards)

**Output:** Populated `artifacts/aces/<subject-path>/` directory. Returns a summary (file count, structural issues found) to `create-spec`.

---

### 8.2 `aces-executor`

Invoked by `aces-run` for each behavior/quality test case. Simulates agent behavior given a scenario and agent configuration, producing a structured output for grading.

**Input:**
```
SUBJECT: <full agent configuration text>
SCENARIO: <scenario from test case>
EXPECTED BEHAVIORS: <list>
MUST NOT DO: <list>
```

**Output:** Simulated execution log — what the agent did step-by-step, what output it produced, whether it consulted the agent configuration and which parts. Saved alongside each case result so `aces-grader` can examine the "transcript".

### 8.3 `aces-grader`

Invoked by `aces-run` after `aces-executor`. Grades the simulated execution against assertions and rubric; also critiques the test case itself.

**Input:** Executor transcript + test case (scenario, assertions, rubric, threshold)

**Output JSON:**
```json
{
  "score": 4,
  "pass": true,
  "what_worked": "...",
  "what_failed": "nothing",
  "assertion_results": [
    { "text": "...", "passed": true, "evidence": "..." }
  ],
  "claims": [
    { "claim": "...", "type": "factual", "verified": true, "evidence": "..." }
  ],
  "eval_feedback": {
    "suggestions": [
      { "assertion": "...", "reason": "Would pass even for a wrong output — consider tightening" }
    ]
  }
}
```

**Grading principles:**
- Score what the agent configuration would cause an agent to do — not what the grader considers ideal
- The rubric is the authority; do not override it
- Ambiguous agent configuration language that produces inconsistent behavior should lower the score
- Any failed assertion caps the score at 3 — cannot score 4 or 5 if a must-pass check failed
- Extract implicit claims from the simulated execution and verify them (catches issues that predefined assertions miss)
- Flag assertions that would trivially pass regardless of skill quality — this is `eval_feedback`

### 8.4 `aces-comparator`

Invoked by `aces-compare`. Receives two outputs labeled A and B — without knowing which version produced which — and judges which is better using a content + structure rubric.

**Input:** Two simulated execution outputs (A and B) + test case prompt + assertions

**Output JSON:**
```json
{
  "winner": "A",
  "reasoning": "...",
  "scores": { "A": 8.5, "B": 6.0 },
  "assertion_results": { "A": { "pass_rate": 0.9 }, "B": { "pass_rate": 0.7 } }
}
```

After all cases are judged, `aces-compare` unblids the results to attribute A/B to the actual agent configuration versions.

### 8.5 `aces-analyzer`

Invoked by `aces-improve`. Given failing cases, `feedback.json`, and the current agent configuration, produces prioritized improvement suggestions by examining which instruction gaps caused failures.

**Output JSON:**
```json
{
  "patterns": [
    {
      "pattern": "Ambiguous rule",
      "cases": ["002-...", "007-..."],
      "priority": "high",
      "suggestion": "Replace '...' with explicit decision rule: ...",
      "expected_impact": "..."
    }
  ]
}
```

---

### 8.6 `aces-spec-validator`

Invoked by `create-spec` after each `aces-spec-designer` iteration. Validates the generated eval suite against coverage and quality dimensions; optionally surfaces questions the spec-designer needs answered to improve.

**Input:**
```
SUBJECT: <full agent configuration text>
SUBJECT_PATH: <resolved path>
ARTIFACTS_DIR: artifacts/aces/<subject-path>/
```

**Output JSON:**
```json
{
  "overall": "pass | fail",
  "dimensions": {
    "trigger_coverage": { "pass": true, "notes": "" },
    "negative_coverage": { "pass": true, "notes": "" },
    "behavior_coverage": { "pass": false, "notes": "No must-not-do cases for the scan step" },
    "rubric_specificity": { "pass": true, "notes": "" },
    "scenario_concreteness": { "pass": true, "notes": "" }
  },
  "user_questions": [
    "Should the golden set include a case where the user invokes the skill with no test framework configured?",
    "Are there known failure modes on monorepo setups that should be covered?"
  ]
}
```

`overall` is `"pass"` only when all dimensions pass. `user_questions` is a list of questions for the user when the validator cannot resolve ambiguities from the subject alone — answered in the next designer iteration via `USER_ANSWERS`. Empty list when no questions are needed.

---

## 9. Failure Patterns

`aces-improve` groups failing cases into these patterns:

| Pattern | Definition | Fix direction |
|---|---|---|
| Trigger false-positive | Trigger case fires when it shouldn't | Narrow `description:`, add "when NOT to use" |
| Trigger false-negative | Trigger case doesn't fire when it should | Broaden `description:`, add synonym phrasings |
| Missing step | Behavior case skips a step | Make step more prominent; add example |
| Ambiguous rule | Multiple behavior cases fail inconsistently on same rule | Replace vague language with explicit decision rule |
| Conflicting instruction | Agent follows one rule but violates another | Add explicit precedence rule; or split agent configuration |
| Scope creep | Agent does more than the agent configuration specifies | Add explicit scope boundary |
| Description mismatch | Trigger failures suggest `description:` doesn't match body | Rewrite `description:` to match what body actually instructs |

---

## 10. Key Design Decisions

### 10.1 LLM-as-judge with assertions, not pure code assertions

Agent behavior is not structurally checkable. The output of following an agent configuration is natural language behavior, not a typed value. An LLM judge is the only practical scorer at the behavior and quality layers.

ACES uses a hybrid: verifiable **assertions** (pass/fail, graded by `aces-grader` with evidence) handle mechanical properties; the **rubric** (1–5) handles holistic quality. Assertions cap the rubric score at 3 when they fail — objective checks take precedence.

**Tradeoff:** LLM judges are non-deterministic and can be wrong. Mitigations: temperature 0 on judge calls; rubrics are the authority; `aces-grader` critiques its own assertions (`eval_feedback`) so weak evals are caught. The alternative (code assertions only) can't handle behavior that emerges from instruction-following.

### 10.2 Pointwise scoring, not pairwise

Each test case is scored independently (1–5), not compared against a reference output. Pairwise is more reliable but requires a reference output for every case, which is expensive to maintain.

**Tradeoff:** Pointwise scores are noisier. Rubrics compensate by being specific. Pairwise comparison is used in `aces-compare` (before vs. after), where a reference naturally exists.

### 10.3 Golden set is versioned, not generated on demand

Test cases are committed to the repo alongside the agent configuration. They are not regenerated each run.

**Tradeoff:** The golden set can go stale if the agent configuration changes without updating the cases. This is a feature, not a bug — stale cases catch regressions. The author is expected to update the golden set when intentionally changing behavior.

### 10.4 Structural layer delegates to `audit-skill`

ACES does not re-implement structural checks. `aces-spec-designer` runs `audit-skill` first and surfaces failures before writing behavioral tests.

**Tradeoff:** Depends on `audit-skill` being available. In environments without it, structural layer is skipped with a warning.

### 10.5 `aces-compare` does not write results by default

Compare is a diff operation, not a recorded eval run. Writing a result for "before" would pollute the history with a result that doesn't reflect the current agent configuration state.

### 10.6 Blind comparison in `aces-compare`

`aces-compare` uses `aces-comparator`, which judges A vs. B without knowing which version is which. This prevents the judge from being biased toward whatever it believes is "newer" or "better" before seeing the output.

**Tradeoff:** Adds a round-trip through `aces-comparator` for each test case. Justified because bias in comparison scoring produces unreliable regression detection — the signal that drives whether to block a commit.

### 10.7 Trigger layer uses run-based detection, not simulation

For trigger testing, ACES actually runs the queries and detects skill invocation — it does not simulate with an LLM. This is more accurate because triggering depends on the agent runtime's skill selection logic, not on what any judge thinks is "correct".

**Tradeoff:** Trigger runs are more expensive (real agent calls × `trigger_runs` per query). Mitigated by train/validation split: you only optimize against the 60% train set, preserving the 40% validation set as an honest generalization check. Overfitting the description to the train set produces inflated metrics that the validation set catches.

### 10.8 agentskills.io format as first-class import

Skills that ship `evals/evals.json` (the agentskills.io format) can be imported by `aces-spec-designer` without rewriting test cases. This ensures ACES is additive — authors who already have eval coverage don't need to duplicate it.

**Tradeoff:** The agentskills.io format has no `layer` field or rubric. Imported cases default to `behavior` layer with a generic rubric. The author is expected to enrich them after import.

---

## 11. Open Questions

| # | Question | Impact |
|---|---|---|
| OQ1 | Should `aces-run` support running a subset of layers (e.g., trigger only)? | Affects `eval.md` schema and run performance |
| OQ2 | Should results be gitignored by default or committed? Results are useful for trend tracking but add noise to PRs. | Affects `aces-report` trend feature |
| OQ4 | Should the threshold be global (in `eval.md`) or per-layer? Some layers are harder to score consistently. | Affects `eval.md` schema |
| OQ5 | Should `aces-compare` accept a git ref as "before" (not just HEAD~1)? | Affects `aces-compare` skill body |
| OQ6 | Should `aces-improve` auto-run `aces-compare` after edits, or wait for user to invoke it manually? | Affects `aces-improve` workflow |
| OQ7 | Should the trigger eval script be bundled as a `scripts/` file inside the ACES skill, or generated per-skill by `aces-spec-designer`? Bundled is reusable; generated can be customized per client. | Affects portability across agent runtimes |
| OQ8 | Should `aces-executor` output a structured execution log or freeform prose? Structured is grader-friendly; prose is closer to what real agent sessions produce. | Affects `aces-grader` input parsing |
| OQ9 | Should `eval_feedback` suggestions from `aces-grader` trigger a review flow (user confirms before the next run uses updated evals), or just be advisory notes? | Affects iteration workflow |
| OQ10 | Should the validation set be used only for final selection (as in agentskills.io), or run every iteration for tracking? Running every iteration burns more calls but gives earlier signal on overfitting. | Affects cost and optimization loop design |
