---
status: draft
priority: 1
blocked-by: []
---

# ACES Plugin

---

## What

ACES (Agent Config Examination & Specification) is a plugin that applies spec-driven evaluation to **agent configuration** — the skills, `AGENTS.md` sections, subagent definitions, and commands that shape how AI agents behave.

It provides a golden-set evaluation pipeline:

1. **Spec** — build a labeled test suite (trigger queries + golden-set cases) for one agent configuration artifact.
2. **Run** — score the current agent configuration against the golden set using an LLM judge on a 1–5 rubric.
3. **Compare** — diff scores before and after an edit; block commits on regression.
4. **Improve** — diagnose failing cases by pattern and propose specific edits.
5. **Report** — project-wide health dashboard across all eval suites.

Evaluation runs in four layers: structural → trigger → behavior → quality. Each layer is independently enabled per eval suite.

---

## Why

Agent configuration has no type-checker, linter, or test runner. Silent regressions are common:

- Editing a skill's `description:` field changes when the agent invokes it — with no signal that something broke.
- Vague rules in `AGENTS.md` cause inconsistent behavior that only surfaces in real sessions.
- Subagent definitions can silently diverge from what callers expect.

Code has CI. Agent configuration does not — until ACES.

SDD is the natural fit: write a behavioral spec (golden set) before or alongside the artifact, then run the spec to validate correctness. ACES is SDD applied to the agent configuration layer.

---

## Design decisions

### Golden-set evaluation over live simulation

ACES uses a static golden set of labeled test cases scored by an LLM judge, rather than launching live agent sessions. This keeps eval fast, reproducible, and free of session side effects. The tradeoff is that golden-set scores are probabilistic — the judge can vary — which is why results track mean ± standard deviation.

### Layered eval

Four independent layers (structural, trigger, behavior, quality) allow suites to opt in only to the layers relevant to their artifact type. A pure `AGENTS.md` section may skip trigger evaluation; a skill always needs trigger and behavior.

### Threshold per eval suite

Each `eval.md` sets a pass threshold (1–5). Different agent configurations warrant different bars — a simple commit-hook section is lower stakes than an autonomous subagent definition.

### Separate judge subagent

`aces-judge` is a dedicated subagent for scoring, not a general-purpose model call. This creates a stable, auditable scoring contract and allows the judge model to be pinned independently from the agent running the skill.

### `aces-spec-designer` / `aces-spec-validator` quality loop

Eval suite generation is itself validated before use. `aces-spec-designer` produces a draft; `aces-spec-validator` checks completeness and diversity; the loop repeats up to 3 times before accepting with `accepted-pending-review`. This prevents low-coverage evals from producing false confidence.

---

## Command surface

All entry points are user-facing skills in the `aces` plugin namespace:

| Skill | Trigger situation | Core action |
|---|---|---|
| `create-spec` | User wants an eval suite for an agent configuration | Runs designer/validator loop; writes `eval.md` + golden-set cases |
| `add` | User has a new failure or edge case to capture | Scaffolds a test case file; writes to `golden-set/` |
| `run` | User wants to score the current agent configuration | Invokes `aces-judge` per case; writes `results/<timestamp>.json` |
| `compare` | User edited an agent configuration and wants a regression check | Runs eval on two versions; diffs scores; warns on regression |
| `improve` | Eval failures exist; user wants targeted fixes | Groups failures by pattern; proposes before/after diffs; runs `compare` after apply |
| `report` | User wants project-wide health across all suites | Reads all `eval.md` + latest results; prints health dashboard |

Internal subagents (not user-triggered):

| Agent | Role |
|---|---|
| `aces-spec-designer` | Generates trigger queries and golden-set cases for one artifact |
| `aces-spec-validator` | Validates eval suite quality; returns structured pass/fail per dimension |
| `aces-judge` | Scores one test case on a 1–5 rubric; returns score + pass/fail + explanation |

---

## Folder structure

```
artifacts/specs/<suite-name>/
  eval.md               # target path, judge model, threshold, enabled layers
  golden-set/
    NNN-<slug>.md       # one test case per file; NNN = sequence number
  results/
    <ISO8601>.json      # run output: pass rate, mean score, per-case results
```

Suites live in `artifacts/specs/` alongside SDD specs. Naming convention: `<plugin>-<skill>` (e.g., `aces-create-spec`) for skill evals, or `<domain>` for `AGENTS.md` section evals (e.g., `commit-discipline`).

---

**Gherkin scenarios:** _(not yet written — pending spec approval)_

---

## Related

- `artifacts/specs/sdd-plugin/spec.md` — SDD plugin spec; ACES is SDD applied to agent configuration
- `apps/web/src/content/docs/concepts/agent-configuration.md` — what agent configuration is
- `apps/web/src/content/docs/aces/overview.md` — website overview
