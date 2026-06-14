# Design: ACES — Agent Config Evaluation System

**Status:** Draft  
**Authors:** unional  
**Date:** 2026-06-13  
**Scope:** eval framework for agent configuration artifacts — skills, AGENTS.md sections, subagent definitions, commands

---

## 1. Problem Statement

Agent configuration artifacts (skills, `AGENTS.md` sections, subagent definitions, commands) shape how AI agents behave. When these artifacts are wrong or ambiguous, agents behave incorrectly — but there is no built-in way to detect this.

Three failure modes occur repeatedly:

**Silent regression.** A skill is edited to improve one scenario. There is no way to know whether the edit broke another scenario. The author relies on manual spot-checking, which doesn't catch edge cases.

**Trigger mismatch.** A skill's `description:` field doesn't accurately reflect the situations where the agent should invoke it. The skill fires when it shouldn't, or doesn't fire when it should. This is only noticed when something goes visibly wrong.

**Ambiguous rules.** `AGENTS.md` sections use vague language ("prefer X over Y") that agents interpret inconsistently across sessions. The same rule produces different behavior depending on phrasing of the user's message.

Existing tooling addresses only structure (`audit-skill` checks frontmatter and section presence) — not runtime behavior. There is no way to measure whether an artifact actually produces correct agent behavior.

---

## 2. Goals

- **G1** — Define a test case format for agent configuration that captures scenario, expected behaviors, prohibited behaviors, and a scoring rubric.
- **G2** — Specify a golden set convention: a curated directory of test cases per artifact that serves as ground truth.
- **G3** — Specify an eval run protocol: for each test case, score agent behavior against the rubric using an LLM judge, and produce a structured result.
- **G4** — Specify a regression gate: detect when an artifact change drops scores below a threshold before committing.
- **G5** — Specify a report format for project-wide eval health across all artifacts.
- **G6** — Specify an improvement workflow: map failing test cases to patterns, propose targeted edits to the artifact.

## 3. Non-Goals

- **NG1** — Runtime monitoring of live agent sessions. ACES is an offline eval tool; online monitoring is a separate concern.
- **NG2** — Automated artifact repair. ACES proposes edits; the user approves them. No auto-apply without confirmation.
- **NG3** — Evaluation of agent tool use or MCP server calls. ACES evaluates instruction-following behavior, not tool integration.
- **NG4** — Cross-artifact conflict detection. Detecting that two skills give contradictory instructions is a future concern.
- **NG5** — Benchmark comparison across agent runtimes (Claude Code vs. Cursor vs. Codex). ACES evaluates within one runtime.

---

## 4. Concepts

### 4.1 Agent configuration

The collective term for all instruction artifacts an agent runtime loads:

| Artifact | When loaded | Examples |
|---|---|---|
| `AGENTS.md` section | Every session (always-on) | Commit discipline, coding conventions |
| Skill (`SKILL.md`) | On demand when triggered | `create-skill`, `aces-run` |
| Subagent definition | When explicitly invoked as sub-task | `aces-judge`, a researcher agent |
| Command | When user invokes named slash command | `/commit-work`, `/code-review` |

### 4.2 Eval layer

A category of behavior being tested. Layers are ordered from cheapest to most expensive:

| Layer | Question | Scored by |
|---|---|---|
| **Structural** | Does the artifact have required fields and format? | `audit-skill` (static) |
| **Trigger** | Does the agent correctly decide when to invoke this artifact? | `aces-judge` |
| **Behavior** | When invoked, does the agent follow the steps and rules? | `aces-judge` |
| **Quality** | Is the output the agent produces actually good? | `aces-judge` |

The structural layer delegates to `audit-skill` and runs free. The remaining three layers use `aces-judge`.

### 4.3 Test case

A single scenario that exercises one aspect of one artifact at one layer. A test case specifies:

- Which layer it tests
- A concrete situation description
- A list of expected behaviors (observable actions or outputs)
- A list of prohibited behaviors
- A rubric (1–5 scoring criteria)
- A pass threshold (default: 4)

### 4.4 Golden set

The complete collection of test cases for one artifact. Stored in `.evals/<artifact-name>/golden-set/`. The golden set is version-controlled and grows over time as new failure modes are discovered.

Coverage targets for a well-formed golden set:

| Layer | Min cases | Composition |
|---|---|---|
| Trigger | 10–15 | 5–8 should-fire, 5–7 should-not-fire |
| Behavior | 15–25 | 1 per major rule/step + 3–5 edge cases + 2–3 must-not-do cases |
| Quality | optional | End-to-end output quality checks |

### 4.5 Eval run

A single execution of the full golden set against the current artifact. Produces a result JSON with per-case scores, pass/fail, and judge explanations. Results are timestamped and stored in `.evals/<artifact-name>/results/`.

### 4.6 Pass threshold

A score cutoff (1–5) that classifies a test case as passing or failing. Default: 4. Configurable per artifact in `eval.md` and overridable per test case in its frontmatter.

### 4.7 Regression gate

A check run by `aces-compare` that blocks an artifact change if any test case's score drops vs. the previous version. A regression is a pass→fail flip or a score drop of ≥2 on any case.

---

## 5. File Layout

```
.evals/
  <artifact-path>/
    eval.md                     ← suite config
    golden-set/
      001-<slug>.md             ← test cases, zero-padded sequence
      002-<slug>.md
      ...
    results/
      2026-06-13T14:22:00Z.json ← timestamped run results
      2026-06-13T16:05:00Z.json
```

Artifact path conventions:

| Artifact type | Path |
|---|---|
| `AGENTS.md` section | `<section-slug>/` (e.g., `commit-discipline/`) |
| Skill | `skills/<skill-name>/` (e.g., `skills/create-skill/`) |
| Subagent definition | `agents/<agent-name>/` (e.g., `agents/aces-judge/`) |
| Command | `commands/<command-name>/` |

For artifacts that belong to a plugin, nest under the plugin name:

```
.evals/
  <plugin-name>/
    skills/<skill-name>/
    agents/<agent-name>/
    commands/<command-name>/
```

Example: the `aces` plugin's `init` skill lives at `.evals/aces/skills/init/`.

### 5.1 `eval.md` schema

```markdown
---
target: <relative path to artifact, or "AGENTS.md#section-heading">
judge_model: claude-sonnet-4-6
threshold: 4
layers:
  - trigger
  - behavior
---
```

### 5.2 Test case format

```markdown
---
name: <slug>
layer: trigger | behavior | quality
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

## Rubric

Score 1–5:
5 — <description of perfect execution>
4 — <acceptable with minor deviation>
3 — <partial execution or significant deviation>
2 — <major miss>
1 — <complete failure or opposite behavior>
```

### 5.3 Result JSON schema

```json
{
  "timestamp": "2026-06-13T14:22:00Z",
  "target": "skills/aces-run/SKILL.md",
  "pass_rate": 0.82,
  "mean_score": 3.9,
  "std_dev": 0.8,
  "threshold": 4,
  "cases": [
    {
      "name": "001-trigger-on-run-request",
      "layer": "trigger",
      "score": 5,
      "pass": true,
      "explanation": "..."
    }
  ]
}
```

---

## 6. Skills

### 6.1 `aces-init`

**Trigger:** User asks to set up evals for an artifact.

**Steps:**
1. Identify the target artifact (ask if unclear)
2. Run structural layer (`audit-skill`) — surface issues before writing behavioral tests
3. Create `.evals/<artifact-path>/` directory and `eval.md` (using path conventions from §5)
4. Generate initial golden set:
   - 10–15 trigger cases (should-fire + should-not-fire)
   - 15–25 behavior cases (one per rule/step + edge cases + must-not-do guards)
5. Report: file count, structural issues found, next step

**Output:** `.evals/<name>/` populated, ready for `aces-run`.

---

### 6.2 `aces-run`

**Trigger:** User asks to run evals or validate after editing an artifact.

**Steps:**
1. Locate `eval.md` (from user context or by scan)
2. Read the current artifact in full
3. For each test case in `golden-set/`, invoke `aces-judge`
4. Collect scores, compute pass rate and mean ± std dev per layer
5. Write timestamped result JSON
6. Report pass rate, failing cases (worst first), per-layer breakdown

**Output:** Result JSON + console report.

---

### 6.3 `aces-add`

**Trigger:** User describes a new scenario, a production failure, or an edge case to cover.

**Steps:**
1. Accept free-text description or pasted agent transcript
2. Classify layer (trigger / behavior / quality)
3. Draft test case, show to user for confirmation
4. Write to `golden-set/` with next sequence number

**Output:** New test case file.

---

### 6.4 `aces-compare`

**Trigger:** User wants to know if an edit improved or regressed behavior.

**Steps:**
1. Identify two versions (default: working tree vs. last git revision)
2. Run golden set against both — do not write results unless user asks
3. Compute per-case deltas and change type: `improved`, `regressed`, `unchanged`, `now-passing`, `now-failing`
4. Report net pass rate delta, mean score delta, improved and regressed cases
5. If any regression: warn, recommend resolving before committing

**Output:** Diff report. No result JSON written unless requested.

---

### 6.5 `aces-improve`

**Trigger:** Eval results have failing cases; user wants to fix the artifact.

**Steps:**
1. Load latest result from `results/`, read failing test cases
2. Group failures by pattern (see §8)
3. Propose specific diffs to the artifact for each pattern
4. Show proposals to user — do not auto-apply
5. After approval, apply edits and run `aces-compare` to verify

**Output:** Proposed artifact edits + post-edit comparison.

---

### 6.6 `aces-report`

**Trigger:** User wants project-wide eval health.

**Steps:**
1. Scan all `.evals/*/results/` for latest and second-latest runs
2. Compute per-suite: pass rate, mean score, trend (vs. previous run)
3. Classify health: `healthy` (≥90%), `degraded` (70–89%), `critical` (<70%), `no-data`, `trending-down` (≥10% drop)
4. Print summary table, call out suites needing attention

**Output:** Console dashboard.

---

## 7. `aces-judge` Agent

Internal agent invoked by `aces-run` and `aces-compare`. Not user-triggered.

**Role:** Impartial evaluator. Simulates agent behavior given a scenario and scores it against a rubric.

**Input block passed by caller:**
```
ARTIFACT:
<full artifact text>

TEST CASE: <name>
LAYER: <layer>
SCENARIO: <scenario>
EXPECTED BEHAVIORS: <list>
MUST NOT DO: <list>
RUBRIC: <rubric>
THRESHOLD: <threshold>
```

**Output format (exactly four lines, no preamble):**
```
SCORE: <1-5>
PASS: <yes|no>
WHAT WORKED: <one sentence>
WHAT FAILED: <one sentence, or "nothing" if score is 5>
```

**Scoring principles:**
- Score what the artifact would cause an agent to do — not what the judge considers ideal
- The rubric is the authority; do not override it
- Ambiguous artifact language that produces inconsistent behavior should lower the score
- Do not give 5 if any expected behavior was missed or any must-not-do was triggered

---

## 8. Failure Patterns

`aces-improve` groups failing cases into these patterns:

| Pattern | Definition | Fix direction |
|---|---|---|
| Trigger false-positive | Trigger case fires when it shouldn't | Narrow `description:`, add "when NOT to use" |
| Trigger false-negative | Trigger case doesn't fire when it should | Broaden `description:`, add synonym phrasings |
| Missing step | Behavior case skips a step | Make step more prominent; add example |
| Ambiguous rule | Multiple behavior cases fail inconsistently on same rule | Replace vague language with explicit decision rule |
| Conflicting instruction | Agent follows one rule but violates another | Add explicit precedence rule; or split artifact |
| Scope creep | Agent does more than the artifact specifies | Add explicit scope boundary |
| Description mismatch | Trigger failures suggest `description:` doesn't match body | Rewrite `description:` to match what body actually instructs |

---

## 9. Key Design Decisions

### 9.1 LLM-as-judge, not code assertions

Agent behavior is not structurally checkable. The output of following an artifact is natural language behavior, not a typed value. An LLM judge is the only practical scorer at the behavior and quality layers.

**Tradeoff:** LLM judges are non-deterministic and can be wrong. Mitigations: temperature 0 on judge calls; rubrics are the authority (judge cannot override); score variance across runs is reported. The alternative (code assertions) only works for structural properties — not behavior.

### 9.2 Pointwise scoring, not pairwise

Each test case is scored independently (1–5), not compared against a reference output. Pairwise is more reliable but requires a reference output for every case, which is expensive to maintain.

**Tradeoff:** Pointwise scores are noisier. Rubrics compensate by being specific. Pairwise comparison is used in `aces-compare` (before vs. after), where a reference naturally exists.

### 9.3 Golden set is versioned, not generated on demand

Test cases are committed to the repo alongside the artifact. They are not regenerated each run.

**Tradeoff:** The golden set can go stale if the artifact changes without updating the cases. This is a feature, not a bug — stale cases catch regressions. The author is expected to update the golden set when intentionally changing behavior.

### 9.4 Structural layer delegates to `audit-skill`

ACES does not re-implement structural checks. `aces-init` runs `audit-skill` first and surfaces failures before writing behavioral tests.

**Tradeoff:** Depends on `audit-skill` being available. In environments without it, structural layer is skipped with a warning.

### 9.5 `aces-compare` does not write results by default

Compare is a diff operation, not a recorded eval run. Writing a result for "before" would pollute the history with a result that doesn't reflect the current artifact state.

---

## 10. Open Questions

| # | Question | Impact |
|---|---|---|
| OQ1 | Should `aces-run` support running a subset of layers (e.g., trigger only)? | Affects `eval.md` schema and run performance |
| OQ2 | Should results be gitignored by default or committed? Results are useful for trend tracking but add noise to PRs. | Affects `aces-report` trend feature |
| OQ3 | Should `aces-judge` be a separate agent invocation or an inline prompt within `aces-run`? Separate agent adds isolation; inline is simpler. | Affects cost and latency per case |
| OQ4 | Should the threshold be global (in `eval.md`) or per-layer? Some layers are harder to score consistently. | Affects `eval.md` schema |
| OQ5 | Should `aces-compare` accept a git ref as "before" (not just HEAD~1)? | Affects `aces-compare` skill body |
| OQ6 | Should `aces-improve` auto-run `aces-compare` after edits, or wait for user to invoke it manually? | Affects `aces-improve` workflow |
