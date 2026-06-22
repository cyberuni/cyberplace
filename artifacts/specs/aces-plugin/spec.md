---
status: draft
type: project
blocked-by: []
subtasks:
  - aces-skill-spec-schema
  - aces-spec-designer-composition
  - define-skill
---

# ACES Plugin

---

## What

ACES (Agent Config Examination & Specification) is the **SDD domain plugin for agent configuration** — the skills, `AGENTS.md` sections, subagent definitions, governance files, and commands that shape how AI agents behave. It registers as an SDD plugin (`.agents/universal-plugin.json`) for the domains `skill`, `subagent`, `command`, and `agents-section`, and supplies the delegates the `sdd-orchestrator` invokes to drive the spec-driven loop over those domains.

Agent configuration arrives from many sources: files written for one harness (Claude Code, Cursor, Codex, Copilot), scattered across harness-specific folders, or authored in harness-specific syntax. ACES brings any agent configuration under discipline through two roles — the SDD production-chain delegates it provides, and the authoring/evaluation skills users invoke directly.

### SDD delegates (the production chain)

ACES fills the SDD five-role production chain for its domains. The `sdd-orchestrator` resolves these from the registry and invokes them — ACES does not own the SDD loop or its `create-spec`/`validate-spec` skills:

| SDD role | ACES delegate | What it produces / judges |
|---|---|---|
| spec-producer | `aces-scenario-writer` | the `spec.md` body and a boolean `.feature` of trigger near-misses and behavior cases |
| spec-judge | `aces-spec-validator` | judges the `.feature` against the agent-scenario criteria (trigger context, near-miss balance, rule coverage, edge cases) |
| plan-producer | _none_ | agent configuration needs no separate plan stage |
| impl-producer | _none_ | the authoring skills (`define-agent`, `define-governance`) co-produce the artifact and its eval suite |
| impl-judge | `aces-implementer` | runs the scenario→rubric eval suite over N runs and collapses score-vs-threshold to a boolean per frozen scenario |

`aces-judge` is the scoring subagent the impl-judge (`aces-implementer`) drives — it scores one simulated behavior against a rubric for a given scenario and layer.

### Authoring

Scaffold new agent configuration artifacts following SDD discipline:

1. **Define** — create a new artifact (agent definition, governance file, skill) with the right structure, placement, and runtime wiring. Each `define-*` skill ends by suggesting the SDD spec/eval flow.

### Evaluation

Validate that artifacts behave as intended via a golden-set eval pipeline:

1. **Add** — capture a new failure or edge case as a golden-set test case.
2. **Run** — score the current artifact against the golden set using `aces-judge` on a 1–5 rubric.
3. **Compare** — diff scores before and after an edit; block commits on regression.
4. **Improve** — diagnose failing cases by pattern and propose specific edits.
5. **Report** — project-wide health dashboard across all eval suites.

Evaluation runs in four layers: structural → trigger → behavior → quality. Each layer is independently enabled per eval suite.

### Planned: migration and build (not yet built)

Two surfaces are designed but **not yet implemented** — no `normalize` or `build` skill exists on disk:

- **Normalize** (planned) — detect existing agent config files across harness folders; move them to the canonical `.agents/` layout; create harness-specific symlinks so all runtimes still resolve them.
- **Build** (planned) — read canonical harness-neutral definitions and emit harness-specific output files (e.g., MDC frontmatter for Cursor rules, Codex-specific format) without duplicating the source.

---

## Why

Agent configuration has no type-checker, linter, or test runner. Silent regressions are common:

- Editing a skill's `description:` field changes when the agent invokes it — with no signal that something broke.
- Vague rules in `AGENTS.md` cause inconsistent behavior that only surfaces in real sessions.
- Subagent definitions can silently diverge from what callers expect.
- New agent configuration gets written without a spec, so there's no baseline to regress against.
- Existing agent configuration is often scattered across harness-specific folders with no canonical source of truth; changes must be duplicated per harness (the planned `normalize`/`build` surfaces address this).
- Harness-specific syntax (MDC frontmatter, Codex YAML blocks) locks content to one runtime and makes cross-harness reuse manual and error-prone.

Code has CI. Agent configuration does not — until ACES.

SDD is the natural fit: by registering as the SDD plugin for agent-configuration domains, ACES lets the `sdd-orchestrator` drive the same spec-driven loop used for code — produce a `spec.md` and boolean `.feature` (spec-producer), judge the contract (spec-judge), co-produce the artifact and its eval suite, and verify behavior against a golden set (impl-judge). ACES applies that discipline end-to-end to the agent configuration layer.

---

## Design decisions

### SDD plugin via registry delegates, not an owned loop

ACES is a domain plugin, not an SDD reimplementation. The SDD `create-spec`/`validate-spec` skills and the `sdd-orchestrator` own the human-facing loop and the gate transitions; ACES only registers its delegates in `.agents/universal-plugin.json` and answers when the orchestrator dispatches a role. The direction is always SDD-orchestrator → ACES delegate. ACES does **not** own a `create-spec` skill, and it does not load SDD process governance to drive its own flow.

### Canonical `.agents/` layout as source of truth

All agent configuration lives canonically under `.agents/` (skills, agents, commands, governance). Harness-specific folders (`.claude/`, `.cursor/`, `.codex/`) hold symlinks or built outputs — never the source. This makes the canonical definition the single file to edit, review, and eval.

### Symlink vs. build (planned migration surfaces)

When `normalize`/`build` ship, two strategies will bridge canonical definitions and harness runtimes:

- **Symlink** (preferred) — harness folder contains a symlink to the canonical file. Works when the harness accepts the canonical format without modification.
- **Build** — harness folder contains a generated output file. Required when the harness demands a different syntax (e.g., MDC frontmatter for Cursor rules, Codex YAML blocks). The canonical file is still the source; the output is regenerated, never edited directly.

### All surfaces operate on the same domain

Authoring and evaluation operate on the same agent configuration artifacts, and the planned migration/build surfaces will too. One plugin covers the full lifecycle: define → (orchestrator-driven) spec → run → improve.

### SDD-first authoring

`define-*` skills end with a suggested next step that routes into the SDD flow (run `sdd:create-spec`, which the orchestrator resolves to the ACES delegates). This nudges authors toward specing and evaling an artifact immediately after defining it, before any behavior has drifted.

### Governance loaded as harness skills, never `governance show`

ACES delegates load SDD governance as harness-resident skills — `sdd:spec-governance`, `sdd:ownership-governance`, `sdd:lifecycle-governance`, `sdd:gate-validation-governance` — not via a runtime `governance show` call (removed from the loops by ADR-0013). The agent-scenario criteria ACES adds on top are encoded in the delegate definitions and judged by `aces-spec-validator`.

### spec-producer / spec-judge contract loop

The contract is produced and judged before implementation. `aces-scenario-writer` (spec-producer) writes the `.feature`; `aces-spec-validator` (spec-judge) judges it against the agent-scenario criteria at the spec gate. The rubric, threshold, and N-run scoring are the impl-judge's (`aces-implementer`) private detail and never appear in the `.feature`. This keeps low-coverage contracts from passing the spec gate.

### Golden-set evaluation over live simulation

ACES uses a static golden set of labeled test cases scored by an LLM judge, rather than launching live agent sessions. This keeps eval fast, reproducible, and free of session side effects. The tradeoff is that golden-set scores are probabilistic — the judge can vary — which is why results track mean ± standard deviation.

### Layered eval

Four independent layers (structural, trigger, behavior, quality) allow suites to opt in only to the layers relevant to their artifact type. A pure `AGENTS.md` section may skip trigger evaluation; a skill always needs trigger and behavior.

### Threshold per eval suite

Each `eval.md` sets a pass threshold (1–5). Different agent configurations warrant different bars — a simple commit-hook section is lower stakes than an autonomous subagent definition.

### Separate judge subagent

`aces-judge` is a dedicated subagent for scoring, not a general-purpose model call. This creates a stable, auditable scoring contract and allows the judge model to be pinned independently from the agent running the skill.

---

## Command surface

### Authoring skills

| Skill | Trigger situation | Core action |
|---|---|---|
| `define-agent` | User wants to create or improve an agent definition | Gathers requirements; scaffolds agent file + optional companion command; creates runtime symlinks; runs quality checks |
| `define-governance` | User wants to create or improve a governance file | Gathers requirements; scaffolds governance file; creates runtime symlinks; runs quality checks |
| `init-aces` | User wants to register ACES as the SDD plugin for this project | Writes the ACES role-map entry into `.agents/universal-plugin.json` |

The SDD `create-spec`/`validate-spec` skills (owned by the SDD plugin) drive contract creation and the gates; ACES supplies the delegates the orchestrator dispatches, so ACES ships no `create-spec` of its own.

### Evaluation skills

| Skill | Trigger situation | Core action |
|---|---|---|
| `add` | User has a new failure or edge case to capture | Scaffolds a test case file; writes to `golden-set/` |
| `run` | User wants to score the current artifact | Invokes `aces-judge` per case; writes `results/<timestamp>.json` |
| `compare` | User edited an artifact and wants a regression check | Runs eval on two versions; diffs scores; warns on regression |
| `improve` | Eval failures exist; user wants targeted fixes | Groups failures by pattern; proposes before/after diffs; runs `compare` after apply |
| `report` | User wants project-wide health across all suites | Reads all `eval.md` + latest results; prints health dashboard |

### Planned skills (not yet built)

| Skill | Trigger situation | Status |
|---|---|---|
| `normalize` | User has existing agent config scattered across harness folders | Planned — not implemented |
| `build` | User wants to emit harness-specific output from canonical definitions | Planned — not implemented |
| `define-skill` | User wants to author a new skill under SDD discipline | Planned — see `artifacts/specs/define-skill/spec.md` |

### Internal subagents (SDD delegates, not user-triggered)

| Agent | SDD role | Role |
|---|---|---|
| `aces-scenario-writer` | spec-producer | Writes the `spec.md` body and a boolean `.feature` of trigger near-misses and behavior cases |
| `aces-spec-validator` | spec-judge | Judges the `.feature` against the agent-scenario criteria; returns failing scenarios with the failed check |
| `aces-implementer` | impl-judge | Runs the scenario→rubric eval suite over N runs; collapses score-vs-threshold to a boolean per frozen scenario |
| `aces-judge` | (scoring subagent) | Scores one simulated behavior on a 1–5 rubric for a given scenario and layer; driven by `aces-implementer` |

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

Suites live in `artifacts/specs/` alongside SDD specs. Naming convention: `<plugin>-<skill>` (e.g., `aces-define-agent`) for skill evals, or `<domain>` for `AGENTS.md` section evals (e.g., `commit-discipline`).

---

**Gherkin scenarios:** _(not yet written — pending spec approval)_

---

## Related

- `artifacts/specs/sdd-plugin/spec.md` — SDD plugin spec; ACES applies SDD to agent configuration
- `apps/web/src/content/docs/concepts/agent-configuration.md` — what agent configuration is
- `apps/web/src/content/docs/aces/overview.md` — website overview
