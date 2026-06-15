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
| `create-spec` | Build a golden-set eval suite for an agent configuration |
| `add` | Add a new test case from a real failure or edge case |
| `run` | Score the golden set against the current agent configuration |
| `compare` | Diff scores before/after an edit — regression gate |
| `improve` | Diagnose failing cases and propose targeted edits |
| `report` | Project-wide health dashboard across all eval suites |

## Agents

| Agent | Role |
|---|---|
| `aces-spec-designer` | Generates eval suites (trigger queries + golden-set cases) |
| `aces-spec-validator` | Validates eval suite quality; surfaces gaps and structural issues |
| `aces-judge` | Scores individual test cases on a 1–5 rubric |

## Workflow

```
create-spec → run → compare → improve → run
                                 ↑
                           add (new cases)
                                 ↑
                           report (project-wide)
```

1. **`create-spec`** — generates an eval suite by eliciting domain knowledge from the user and drafting trigger queries and golden-set cases through an `aces-spec-designer` / `aces-spec-validator` loop.
2. **`run`** — scores each case using `aces-judge` and writes results to `artifacts/specs/<suite>/results/`.
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
