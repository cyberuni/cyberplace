---
status: draft
priority: 1
blocked-by: []
---

# ACES Plugin

---

## What

ACES (Agent Config Examination & Specification) is a plugin that covers the full lifecycle of **agent configuration** — the skills, `AGENTS.md` sections, subagent definitions, governance files, and commands that shape how AI agents behave.

Agent configuration arrives from many sources: files written for one harness (Claude Code, Cursor, Codex, Copilot), scattered across harness-specific folders, or authored in harness-specific syntax. ACES provides four complementary surfaces to bring any agent configuration under discipline:

### Authoring

Scaffold new agent configuration artifacts following SDD discipline:

1. **Define** — create a new artifact (agent definition, governance file) with the right structure, placement, and runtime wiring.

### Migration

Normalize existing agent configuration — regardless of where it came from — into a harness-neutral canonical structure:

1. **Normalize** — detect existing agent config files across harness folders; move them to the canonical `.agents/` layout; create harness-specific symlinks so all runtimes still resolve them.

### Build

Transform canonical definitions to harness-specific syntax when symlinks alone are insufficient:

1. **Build** — read canonical harness-neutral definitions and emit harness-specific output files (e.g., MDC frontmatter for Cursor rules, Codex-specific format) without duplicating the source.

### Evaluation

Validate that artifacts behave as intended via a golden-set eval pipeline:

1. **Spec** — build a labeled test suite (trigger queries + golden-set cases) for one artifact.
2. **Run** — score the current artifact against the golden set using an LLM judge on a 1–5 rubric.
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
- New agent configuration gets written without a spec, so there's no baseline to regress against.
- Existing agent configuration is often scattered across harness-specific folders with no canonical source of truth; changes must be duplicated per harness.
- Harness-specific syntax (MDC frontmatter, Codex YAML blocks) locks content to one runtime and makes cross-harness reuse manual and error-prone.

Code has CI. Agent configuration does not — until ACES.

SDD is the natural fit: define the artifact in a canonical structure, normalize what already exists, build harness-specific outputs without duplicating content, and validate behavior via a golden set. ACES applies that discipline end-to-end to the agent configuration layer.

---

## Design decisions

### Canonical `.agents/` layout as source of truth

All agent configuration lives canonically under `.agents/` (skills, agents, commands, governance). Harness-specific folders (`.claude/`, `.cursor/`, `.codex/`) hold symlinks or built outputs — never the source. This makes the canonical definition the single file to edit, review, and eval.

### Normalize vs. Build

Two different strategies bridge the gap between canonical definitions and harness runtimes:

- **Symlink** (preferred) — harness folder contains a symlink to the canonical file. Works when the harness accepts the canonical format without modification.
- **Build** — harness folder contains a generated output file. Required when the harness demands a different syntax (e.g., MDC frontmatter for Cursor rules, Codex YAML blocks). The canonical file is still the source; the output is regenerated, never edited directly.

`normalize` migrates existing files into canonical paths and creates symlinks. `build` generates harness-specific outputs from canonical files. Both are idempotent.

### All surfaces operate on the same domain

Authoring, migration, build, and evaluation all operate on agent configuration artifacts. One plugin covers the full lifecycle: define (or normalize) → build → spec → run → improve.

### SDD-first authoring

`define-*` skills end with a suggested next step: run `aces:create-spec`. This nudges authors toward writing a spec immediately after defining an artifact, before any behavior has drifted.

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

### Authoring skills

| Skill | Trigger situation | Core action |
|---|---|---|
| `define-agent` | User wants to create or improve an agent definition | Gathers requirements; scaffolds agent file + optional companion command; creates runtime symlinks; runs quality checks |
| `define-governance` | User wants to create or improve a governance file | Gathers requirements; scaffolds governance file; creates runtime symlinks; runs quality checks |

### Migration skills

| Skill | Trigger situation | Core action |
|---|---|---|
| `normalize` | User has existing agent config scattered across harness folders | Detects files in harness-specific locations; moves them to canonical `.agents/` paths; creates symlinks back to harness folders; reports what moved |

### Build skills

| Skill | Trigger situation | Core action |
|---|---|---|
| `build` | User wants to emit harness-specific output from canonical definitions | Reads canonical files; transforms to harness-specific syntax per target (Cursor MDC, Codex YAML, etc.); writes to harness folders; never overwrites canonical source |

### Evaluation skills

| Skill | Trigger situation | Core action |
|---|---|---|
| `create-spec` | User wants an eval suite for an agent configuration artifact | Runs designer/validator loop; writes `eval.md` + golden-set cases |
| `add` | User has a new failure or edge case to capture | Scaffolds a test case file; writes to `golden-set/` |
| `run` | User wants to score the current artifact | Invokes `aces-judge` per case; writes `results/<timestamp>.json` |
| `compare` | User edited an artifact and wants a regression check | Runs eval on two versions; diffs scores; warns on regression |
| `improve` | Eval failures exist; user wants targeted fixes | Groups failures by pattern; proposes before/after diffs; runs `compare` after apply |
| `report` | User wants project-wide health across all suites | Reads all `eval.md` + latest results; prints health dashboard |

### Internal subagents (not user-triggered)

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

- `artifacts/specs/sdd-plugin/spec.md` — SDD plugin spec; ACES applies SDD to agent configuration
- `apps/web/src/content/docs/concepts/agent-configuration.md` — what agent configuration is
- `apps/web/src/content/docs/aces/overview.md` — website overview
