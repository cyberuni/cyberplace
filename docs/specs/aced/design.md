# Design: ACED — Agent Config Evaluation & Development

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

ACED applies spec-driven development (SDD) to agent configurations. In SDD, a spec (test cases + rubric) is written alongside the implementation and serves as the authoritative description of behavior. ACED does the same for agent configurations: the golden set is the spec, the agent configuration is the implementation, and `run` is the verification step. The current scope focuses on the **backfill path** — adding specs to existing agent configurations — but the full SDD lifecycle (spec first, then implement) is the intended end state.

---

## 2. Goals

- **G1** — Define a test case format for agent configurations that captures scenario, expected behaviors, prohibited behaviors, and a scoring rubric.
- **G2** — Specify a golden set convention: the scenarios in a configuration's frozen `.feature` — boolean, `@rubric`, and `@trigger` scenarios together — serve as ground truth.
- **G3** — Specify an eval run protocol: for each test case, score agent behavior against the rubric using an LLM judge, and produce a structured result.
- **G4** — Specify a regression gate: detect when an agent configuration change drops scores below a threshold before committing.
- **G5** — Specify a report format for project-wide eval health across all agent configurations.
- **G6** — Specify an improvement workflow: map failing test cases to patterns, propose targeted edits to the agent configuration.

## 3. Non-Goals

- **NG1** — Runtime monitoring of live agent sessions. ACED is an offline eval tool; online monitoring is a separate concern.
- **NG2** — Automated agent configuration repair. ACED proposes edits; the user approves them. No auto-apply without confirmation.
- **NG3** — Evaluation of agent tool use or MCP server calls. ACED evaluates instruction-following behavior, not tool integration.
- **NG4** — Cross-agent configuration conflict detection. Detecting that two skills give contradictory instructions is a future concern.
- **NG5** — Benchmark comparison across agent runtimes (Claude Code vs. Cursor vs. Codex). ACED evaluates within one runtime.

---

## 4. Concepts

### 4.1 Agent configuration

The collective term for all instruction agent configurations an agent runtime loads:

| Artifact | When loaded | Examples |
|---|---|---|
| `AGENTS.md` section | Every session (always-on) | Commit discipline, coding conventions |
| Skill (`SKILL.md`) | On demand when triggered | `create-skill`, `run` |
| Subagent definition | When explicitly invoked as sub-task | `aced-case-judge`, a researcher agent |
| Command | When user invokes named slash command | `/commit-work`, `/code-review` |

### 4.2 Eval layer

A category of behavior being tested. Layers are ordered from cheapest to most expensive:

| Layer | Question | Scored by | Evidence |
|---|---|---|---|
| **Structural** | Does the agent configuration have required fields and format? | `audit-skill` (static) | — |
| **Trigger** | Does the agent correctly decide when to invoke this agent configuration? | trigger accuracy (run-based) | `@trigger` `Scenario Outline` `Examples` rows |
| **Behavior** | When invoked, does the agent follow the steps and rules? | `aced-case-judge` (inline rubric / boolean `Then`) | boolean and `@rubric` scenarios in the `.feature` |
| **Quality** | Is the output the agent produces actually good? | `aced-case-judge` (inline rubric) | `@rubric` scenarios in the `.feature` |

The structural layer delegates to `audit-skill` and runs free. The trigger layer uses a different mechanism from behavior/quality: it runs real queries against the agent (one per `Examples` row) and measures whether the skill was invoked, not LLM simulation. Behavior and quality layers use `aced-case-judge`, which reads each scenario's inline rubric or boolean `Then` from the frozen `.feature`.

### 4.3 Test case

A single scenario in the frozen `.feature` that exercises one aspect of one agent configuration at one layer. A test case is one of three shapes:

- Which layer it tests (from its `@trigger` / `@behavior` / `@quality` tag)
- A concrete situation description (the `Given` / `When`)
- A **boolean** scenario whose `Then` asserts an observable action (a must-not-do guard is a `Then` asserting the agent *does not* do the prohibited action), **or**
- A **`@rubric`** scenario carrying its rubric inline — named dimensions, each with its own `max`, plus one `threshold`, **or**
- A **`@trigger`** `Scenario Outline` whose `Examples` rows each pair a query with its expected invoke decision

Boolean scenarios and graded scenarios are complementary. A boolean `Then` checks a mechanical property objectively ("stages only the related files"); a `@rubric` scenario scores holistic quality across its dimensions. A violated must-not-do prohibition (asserted as a boolean `Then` step) fails the case outright, whatever the rubric total.

### 4.4 Golden set

The complete test suite for one agent configuration is the set of scenarios in its frozen `.feature` — its boolean, `@rubric`, and `@trigger` scenarios together. The `.feature` is the single eval source; there is no separate directory of case files.

- **Trigger cases**: the `Examples` rows of the `.feature`'s `@trigger` `Scenario Outline` — each row a `{query, should_trigger}` pair, including near-misses.
- **Behavior/quality cases**: the boolean `Then` scenarios and the `@rubric` scenarios (rubric authored inline) in the same `.feature`.

The `.feature` is version-controlled and `@frozen`; it grows over time as new failure modes are discovered (adding a scenario is additive and self-clears).

Coverage targets:

| Layer | Min scenarios | Composition |
|---|---|---|
| Trigger | ~20 `Examples` rows | 8–10 should-trigger, 8–10 should-not-trigger; include near-misses |
| Behavior | 15–25 | 1 per major rule/step + 3–5 edge cases + 2–3 must-not-do guards |
| Quality | optional | End-to-end output quality checks |

### 4.5 Eval run

A single execution of the eval suite against the current agent configuration. Two run shapes:
- **Trigger run**: executes each `@trigger` `Examples` row `eval.trigger.runs` times, measures invoke accuracy per row against `eval.trigger.activation_threshold`.
- **Behavior/quality run**: for each boolean or `@rubric` scenario in the `.feature`, invokes `aced-case-judge` blind, collecting per-dimension scores (for `@rubric`) or a pass/fail (for boolean), plus the judge's `WHAT WORKED` / `WHAT FAILED`.

Results are timestamped and written to `.agents/aced/results/<target-slug>/<ISO8601>.json` — the shared, git-ignored ACED results directory at the repo root, keyed by the target.

### 4.6 Pass threshold

The total at which a case counts as passing: the per-scenario boolean collapse `total ≥ threshold`, where the total sums every rubric dimension's score against its own `max`. Set per configuration as `eval.judge.default_threshold` in `eval.md` and overridable per scenario by an inline `threshold` in its `@rubric`. A violated must-not-do fails the case outright, whatever the total.

### 4.7 Regression gate

A check run by `compare` that blocks an agent configuration change if any scenario regresses vs. the previous version. A regression is a scenario that dropped from passing to failing, or lost points on any dimension, between two versions.

---

## 5. Workflows

### 5.1 Backfill path (current scope)

An existing agent configuration that has no spec yet gets one through `sdd:start-mission`, which resolves ACED's production chain (§8) for the artifact type:

1. **Author the spec** — the SDD conductor dispatches `aced-scenario-writer` (spec-producer) to write the node's `README.md` and its frozen `<node>.feature` (boolean, inline `@rubric`, and `@trigger` scenarios), and the impl-producer (`define-*` / `improve`) to author the colocated `eval.md` (subject + run policy). `aced-spec-validator` grades the suite at the spec gate.
2. **`run`** — score each scenario in the frozen `.feature` against the current configuration, blind, via `aced-case-judge`; write a timestamped result under `.agents/aced/results/<target>/`.
3. **Review** the failing scenarios (worst-by-margin first).
4. **`improve`** (if failing) — diagnose the failure pattern (§9) and propose configuration edits; apply after user approval.
5. **`compare`** (after edits) — blind A/B over the same suite; block on any regression.
6. Repeat from step 2 until the suite passes or the pass rate is acceptable.

### 5.2 Forward path (future scope)

Full SDD — spec before implementation: author the `.feature` for a not-yet-built configuration, implement the configuration to pass it, `run` to verify, `add-scenario` to extend coverage.

### 5.3 Ongoing maintenance

After the initial spec is established:

- **`add-scenario`** — append a scenario to the frozen `.feature` when a production failure or new edge case surfaces.
- **`run`** — re-run after any agent configuration edit to catch regressions.
- **`compare`** — verify an agent configuration change didn't regress before committing.
- **`report`** — project-wide health across all agent-config specs.

---

## 6. File Layout

An agent configuration's eval lives entirely in its project-spec node, discovered through the SDD spec tree:

```
.agents/specs/<project>/…/<node>/
  README.md             ← what the node specifies
  <node>.feature        ← the golden set: boolean, @rubric (inline), and @trigger scenarios; @frozen
  eval.md               ← subject + run policy (see §6.1)
```

The node's `eval.md` names the `subject` (the agent configuration under test). Run output is written **outside** the spec tree — to the shared, git-ignored ACED results directory at the repo root, keyed by the target: `.agents/aced/results/<target>/<ISO8601-timestamp>.json`.

### 6.1 `eval.md` schema

`eval.md` carries only the subject binding and run policy — never a rubric or case list, which live inline in the frozen `.feature`.

```markdown
---
subject: <relative path to agent configuration, or "AGENTS.md#section-heading">
eval:
  layers:                    # which layers run
    - trigger
    - behavior
  judge:
    model: claude-sonnet-4-6
    default_threshold: 4     # fallback total; an inline @rubric threshold overrides it
  trigger:
    activation_threshold: 0.5 # fraction of runs that must invoke for a should-trigger row to pass
    runs: 3                   # number of times each @trigger Examples row is executed
---
```

---

## 7. Skills

User-facing ACED capabilities (full reference: the ACED plugin docs). Each is specified by its own node under `.agents/specs/aced/` with a frozen `.feature`.

| Skill | Purpose |
|---|---|
| `run` | Score a configuration's frozen `.feature` against its current text, blind, via `aced-case-judge`; report pass rate and failing scenarios. |
| `compare` | Blind A/B of two versions over the same suite; gate on regressions. |
| `improve` | Diagnose failing scenarios into patterns (§9) and propose configuration edits. |
| `add-scenario` | Append a new scenario to a frozen `.feature`. |
| `report` | Project-wide eval health across all configuration specs. |
| `define-agent` / `define-skill` / `define-governance` | Author a new configuration; as SDD impl-producer, co-author its `eval.md` against the frozen `.feature`. |

---

## 8. Internal Agents

ACED's production chain for an agent-config artifact type, resolved by the SDD conductor. None are user-triggered.

| Agent | Role |
|---|---|
| `aced-scenario-writer` | Spec-producer — in explore, classifies the subject's fit tier and writes the node's `README.md` / `spec.md` body and its frozen `.feature` (boolean, inline `@rubric`, `@trigger` `Scenario Outline`), rubric authored inline. |
| `aced-spec-validator` | Spec-judge — at the spec gate, grades the `.feature` against the agent-scenario criteria for the subject's declared fit tier. |
| `aced-case-judge` | Case scorer — simulates the agent **blind** (given the situation, never the scenario name, `Then`, or rubric), then scores that returned simulation in a separate context: one score per named dimension plus pass/fail and `WHAT WORKED` / `WHAT FAILED`. |
| `aced-impl-judge` | Impl-judge — at the impl gate, runs the frozen suite over N runs (each scenario judged blind by `aced-case-judge`) and collapses each to a boolean. |

The structural layer delegates to `audit-skill` (§10.4); ACED does not re-implement it.

---

## 9. Failure Patterns

`improve` groups failing cases into these patterns:

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

ACED uses a hybrid: verifiable **boolean `Then` steps** (pass/fail, graded by `aced-case-judge`) handle mechanical properties; a **`@rubric`** (named dimensions, each scored against its own `max`) handles holistic quality. A violated must-not-do — a boolean `Then` asserting the agent does not do a prohibited action — fails the case outright, whatever the rubric total; objective checks take precedence.

**Tradeoff:** LLM judges are non-deterministic and can be wrong. Mitigations: temperature 0 on judge calls; rubrics are the authority; the spec gate grades the suite (`aced-spec-validator`) so weak evals are caught before they run. The alternative (code assertions only) can't handle behavior that emerges from instruction-following.

### 10.2 Pointwise scoring, not pairwise

Each test case is scored independently — per rubric dimension against its own `max`, collapsed to pass/fail at the threshold — not compared against a reference output. Pairwise is more reliable but requires a reference output for every case, which is expensive to maintain.

**Tradeoff:** Pointwise scores are noisier. Rubrics compensate by being specific. Pairwise comparison is used in `compare` (before vs. after), where a reference naturally exists.

### 10.3 Golden set is versioned, not generated on demand

Test cases are committed to the repo alongside the agent configuration. They are not regenerated each run.

**Tradeoff:** The golden set can go stale if the agent configuration changes without updating the cases. This is a feature, not a bug — stale cases catch regressions. The author is expected to update the golden set when intentionally changing behavior.

### 10.4 Structural layer delegates to `audit-skill`

ACED does not re-implement structural checks. The spec-producer (`aced-scenario-writer`) runs `audit-skill` first and surfaces structural failures before writing behavioral scenarios.

**Tradeoff:** Depends on `audit-skill` being available. In environments without it, structural layer is skipped with a warning.

### 10.5 `compare` does not write results by default

Compare is a diff operation, not a recorded eval run. Writing a result for "before" would pollute the history with a result that doesn't reflect the current agent configuration state.

### 10.6 Blind comparison in `compare`

`compare` scores both versions **blind** via `aced-case-judge` — judging A vs. B without knowing which version is which. This prevents the judge from being biased toward whatever it believes is "newer" or "better" before seeing the output.

**Tradeoff:** Adds a round-trip through `aced-case-judge` for each scenario. Justified because bias in comparison scoring produces unreliable regression detection — the signal that drives whether to block a commit.

### 10.7 Trigger layer uses run-based detection, not simulation

For trigger testing, ACED actually runs the queries and detects skill invocation — it does not simulate with an LLM. This is more accurate because triggering depends on the agent runtime's skill selection logic, not on what any judge thinks is "correct".

**Tradeoff:** Trigger runs are more expensive (real agent calls × `eval.trigger.runs` per `@trigger` `Examples` row).

---

## 11. Open Questions

| # | Question | Impact |
|---|---|---|
| OQ4 | Should the threshold be global (in `eval.md`) or per-layer? Some layers are harder to score consistently. | Affects `eval.md` schema |
| OQ5 | Should `compare` accept a git ref as "before" (not just HEAD~1)? | Affects the `compare` skill body |
| OQ6 | Should `improve` auto-run `compare` after edits, or wait for the user to invoke it manually? | Affects the `improve` workflow |
