# ACES — Agent Config Examination & Specification

ACES is an SDD plugin specialized in **agent configuration** — the skills, `AGENTS.md` sections, subagent definitions, and commands that shape how AI agents behave.

It applies spec-driven development to the agent configuration layer: build a golden-set eval suite, score agent behavior against it, catch regressions before they ship, and improve configurations until they pass.

## What it does

Agent configuration has the same failure modes as prompts: silent regressions, trigger mismatch, ambiguous rules, coverage gaps. Unlike code, there is no type-checker, linter, or test runner for it. ACES fills that gap.

Evaluation runs in layers:

| Layer | What it checks |
|---|---|
| **Structural** | Required fields and format (via `cyber-skills audit`) |
| **Trigger** | Does the agent invoke this configuration at the right times? |
| **Behavior** | When invoked, does the agent follow the steps and rules? |
| **Quality** | Is the output actually good? |

## Skills

| Skill | When to use |
|---|---|
| `init-aces` | Register ACES as the SDD plugin for agent-configuration domain types |
| `add` | Add a new test case from a real failure or edge case |
| `run` | Score the golden set against the current agent configuration |
| `compare` | Diff scores before/after an edit — regression gate |
| `improve` | Diagnose failing cases and propose targeted edits |
| `report` | Project-wide health dashboard across all eval suites |

Spec creation is owned by the `sdd` plugin's `create-spec` / `validate-spec`: once ACES is registered, the operator resolves the ACES production-chain roles automatically. The `run`/`compare`/`add`/`report` skills are thin reporting over the impl-judge's eval suite.

## Agents (production-chain roles)

| Agent | Role |
|---|---|
| `aces-scenario-writer` | spec-producer — writes the spec.md body and a boolean `.feature` (trigger near-misses + behavior cases) |
| `aces-spec-validator` | spec-judge — judges the `.feature` against the agent-scenario criteria |
| `aces-implementer` | impl-judge — **runs** the scenario→rubric eval suite (authored by the impl-producer) over N runs, collapses to a boolean per scenario |
| `aces-judge` | internal scorer for `aces-implementer` — scores one scenario on a 1–5 rubric |

The impl-producer (writing the agent config **and its scenario→rubric eval suite**) is the `define-agent` / `improve` skills or the generic Builder; ACES does not bind a plan-producer (SDD default).

## Workflow

```
sdd:create-spec → sdd:validate-spec (spec gate) → implement → run/compare → improve
                                                                   ↑
                                                             add (new cases)
                                                                   ↑
                                                             report (project-wide)
```

1. **`sdd:create-spec`** — the operator resolves `aces-scenario-writer` to write the `.feature`; `aces-spec-validator` judges it at the spec gate.
2. **implement** — the impl-producer (`define-agent` / `improve`) authors the scenario→rubric eval suite alongside the agent config; `aces-implementer` (impl-judge) **runs** it, scoring each scenario via `aces-judge` and writing results to `artifacts/specs/<suite>/results/`.
3. **`compare`** — before committing an edit, diff the before/after scores. Warns on regressions.
4. **`improve`** — reads failing cases, groups by failure pattern, proposes before/after diffs to the agent configuration. Automatically runs `compare` after edits.
5. **`add`** — adds test cases from production failures, edge cases, or gaps. Writes to the golden set.
6. **`report`** — scans all eval suites and prints a health dashboard (healthy / degraded / critical / trending-down).

## Eval suite structure

```
artifacts/specs/<suite-name>/
  eval.md               # target path, judge model, threshold, enabled layers
  golden-set/
    001-<slug>.md       # trigger / behavior / quality test cases
    002-<slug>.md
    ...
  results/
    <ISO8601>.json      # run output: scores, pass rates, per-case results
```

## Installation

```bash
npx skills add cyberuni/cyber-skills --plugin aces
```

## Relationship to SDD

ACES is itself built with SDD: specs live in `artifacts/specs/aces-<skill>/`. It uses the same `spec.md` + `.feature` format as the `sdd` plugin and the same `artifacts/specs/` layout for eval suites.
