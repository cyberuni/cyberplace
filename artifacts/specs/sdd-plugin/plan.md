# Plan: Spec-Driven Development Plugin

## Architecture

**Three-layer split:**
- **Skills** — user-facing workflow coordinators; invoke `sdd-author`, never specialist agents directly.
- **`sdd-author`** — the Conductor delegate; orchestrates all specialist agents and contracts for a given phase. See below.
- **Specialist agents / contracts** — do one thing; return structured output to `sdd-author`.

```
User
  │
  ├── create-spec ────→ sdd-author ─┬─→ sdd-spec-designer  (writes spec.md + .feature)
  │                   (Conductor)   ├─→ sdd-spec-validator  (quality loop)
  │                                 ├─→ sdd-scenario-advisor (TBD, contract — domain plugin implements)
  │                                 └─→ sdd-implementer     (TBD, contract — domain plugin implements)
  │
  ├── validate-spec ──→ sdd-author (Conductor)
  │
  ├── init-sdd ──── (no agent; writes AGENTS.md section + registers hook)
  │
  ├── plan-spec ────→ sdd-author ──→ sdd-plan-designer  (TBD)
  │
  ├── create-tasks ─→ sdd-author ──→ sdd-task-planner   (TBD)
  │
  └── verify-implementation → sdd-author (dispatches via implementer contract)
```

## sdd-author: the Conductor delegate

`sdd-author` is the **codified Conductor** for the SDD workflow — the orchestrator-worker delegate pattern materialized as agent configuration. Per the Motive Model: "the orchestrator-worker pattern is already a *delegate*, not a human role."

It never does specialist work itself. It:

1. Reads context (spec.md, plan.md Plugin assignments)
2. Resolves which contracts apply for this domain
3. Dispatches to the right specialist agent or contract in the right order
4. Collects structured output and decides the next step
5. Reports to the calling skill

`sdd-author` knows about the **contracts** (what inputs/outputs they have) but never about their implementations (ACES, sdd-react, etc.). Domain plugins register by being named in `plan.md`'s `## Plugin assignments` table.

## Agent governance layer

Agent governance rules (`.feature` freeze, spec-owns-behavior, two-mode model) must live in AGENTS.md so every agent working in an SDD project sees them at session start. These rules cannot live only in skill bodies — skills run when invoked, not continuously.

**Pattern:** `init-sdd` skill writes an `## Spec-Driven Development` section to AGENTS.md and registers a SessionStart hook via `hook register --extract AGENTS.md --heading "Spec-Driven Development"`. This mirrors `init-commit-discipline` exactly. No new CLI command is needed — content is static.

## Lifecycle enforcement

| Rule | Where enforced |
|---|---|
| spec.md must have all required sections | `sdd-spec-validator` (checklist) |
| `.feature` frozen after Approved | Agent definition (AGENTS.md via `init-sdd`) |
| Spec owns behavior | Agent definition (AGENTS.md via `init-sdd`) |
| Approved → Implemented requires passing tests | `verify-implementation` skill (future) |
| Status accuracy | `sdd-spec-validator` status consistency checks |
| All artifacts in sync before commit | `aligned` field + `## Artifacts` section; `sdd-author` sets `aligned: false` at phase start, `aligned: true` at phase completion after all artifacts updated |

## Artifact alignment

Each `spec.md` carries an `aligned` field (boolean) and an `## Artifacts` section listing every artifact that belongs to the spec. Paths are project-root-relative; folder paths mean "all files under it."

**Unit-of-work rule:** touching any artifact sets `aligned: false`. The work unit is not complete — and a commit must not be made — until every listed artifact is reviewed, updated if needed, and `aligned: true` is set.

**Agent enforcement chain:**

```
sdd-author (phase start)    → set aligned: false
sdd-spec-designer            → writes/maintains ## Artifacts section; keeps aligned: false

Exploration / Approval:
  sdd-author (phase end)    → aligned: true when sdd-spec-designer reports all
                               spec artifacts created/updated

Implementation:
  sdd-author                → dispatches to implementer contract (via sdd-implementer)
  implementer contract      → reports IMPLEMENTATION_PASS: true | false
  sdd-author (phase end)    → aligned: true only when IMPLEMENTATION_PASS: true

create-spec / validate-spec → must not commit while ALIGNED is false
```

**Path conventions:**

- Project-root-relative (no leading `/`)
- Folder paths for whole packages: `plugins/sdd/` means every agent and skill file under it
- File paths for individually tracked artifacts: `artifacts/specs/sdd-plugin/plan.md`
- No globs — keep paths readable by humans; agents can walk a listed folder

## Missing skills (future phases)

### `plan-spec`

**Input:** `spec.md` (Approved) + `.feature`
**Output:** `plan.md` + optional `research.md`

Reads the frozen spec and scenarios. Designs the implementation architecture: components, decisions, what was rejected and why. Creates `research.md` when the investigation depth warrants sharing (not just because unknowns exist — another builder must benefit from reading how the decision was reached).

### `create-tasks`

**Input:** `plan.md` + `spec.md`
**Output:** `tasks.md`

Breaks down the plan into phased, traceable tasks at the appropriate unit of work granularity for the domain. Tasks are checkboxes, not a formal lifecycle artifact — no `Draft → Approved` for tasks.

Whether `plan-spec` and `create-tasks` should be one combined skill or two separate ones is unresolved. The combined form is simpler to invoke; separate forms allow revisiting the task breakdown without regenerating the plan.

### `verify-implementation`

**Input:** source code + tests + `.feature` + `spec.md` (Approved)
**Output:** `spec.md` → Implemented (or a gap report)

Checks that passing tests exist for every scenario in the `.feature` file. Requires a project-level quality configuration to calibrate what "implementation quality" means (coverage floor, required test types, e2e requirements). Design of this config surface is unresolved.

## Artifact organization: feature-first, not plugin-first

SDD artifacts are organized by **feature/outcome**, not by SDD plugin. The feature is the subject — "Banner", "auth", "checkout flow". The SDD plugins involved are implementation choices, not the organizing axis.

```
specs/
  banner/
    spec.md          ← WHAT: observable behavior of Banner
    banner.feature   ← scenarios from the user's perspective
    plan.md          ← HOW: which SDD plugins, architecture, decisions
    tasks.md
```

A `plan.md` for a cross-cutting feature declares which SDD plugin handles each sub-domain in a `## Plugin assignments` section. Each sub-domain names both contracts it satisfies:

```markdown
## Plugin assignments

| Sub-domain | Scenario advisor | Implementer |
|---|---|---|
| Agent configuration | aces-scenario-advisor | aces-implementer |
| React component | sdd-react-advisor | sdd-react-implementer |
| Utility functions | (none) | sdd-generic-implementer |
```

`sdd-author` reads this table to resolve which contract implementations to invoke for each phase.

**Why plugin selection belongs in `plan.md`, not `spec.md`:**

`spec.md` describes observable behavior — "the Banner displays a dismissible alert." This spec must survive rewriting from React to Web Components without changing. `plan.md` would change because the implementation tools changed. Plugin choice is strategy (the how), not contract (the what).

Consequence for `plan-spec`: the skill must read the frozen `spec.md`, identify sub-domains from the command surface and scenarios, ask or infer which SDD plugin applies to each, and write `plan.md` with a `## Plugin assignments` section. This is the bridge between "what" and "which tools."

## Contracts

SDD defines two contracts that domain plugins implement. `sdd-author` invokes both; domain plugins register by being named in `## Plugin assignments`. Neither contract names a concrete implementation — DIP is preserved in both directions.

### Contract 1: Scenario Advisor

Invoked by `sdd-author` before `sdd-spec-designer` writes the `.feature` file. Provides domain-specific constraints that generic Gherkin writing cannot know.

```
Input:
  DOMAIN            — domain name
  COMMAND_SURFACE   — from spec.md Command surface / API section
  DESIGN_DECISIONS  — from spec.md Design decisions section

Output:
  REQUIRED_FIELDS      — context fields every scenario must carry
  FORBIDDEN_PATTERNS   — Gherkin patterns that won't be scoreable/evaluatable
  EXAMPLE_SCENARIOS    — 1-3 well-formed examples the designer should imitate
  NOTES                — any domain constraints not captured above
```

`sdd-author` passes the advisor output to `sdd-spec-designer` as ADVISOR_CONSTRAINTS. If no advisor is declared, `sdd-spec-designer` proceeds without constraints.

### Contract 2: Implementer

Invoked by `sdd-author` during the implementation phase. Owns everything domain-specific: reading `.feature`, running the implementation, verifying pass/fail against scenarios.

```
Input:
  DOMAIN                — domain name
  DOMAIN_PATH           — path to specs/<domain>/
  SPEC_PATH             — path to spec.md
  FEATURE_PATH          — path to .feature file
  PLAN_PATH             — path to plan.md (or null)
  TASKS_PATH            — path to tasks.md (or null)
  IMPLEMENTATION_PATHS  — paths from ## Artifacts table, layer=impl

Output:
  IMPLEMENTATION_PASS   — true | false
  SCENARIOS_PASSING     — list
  SCENARIOS_FAILING     — list
  CHANGES_MADE          — summary of what was changed
  BLOCKER               — reason if PASS is false, else null
```

`sdd-author` sets `aligned: true` only when `IMPLEMENTATION_PASS: true` from every declared implementer.

### sdd-implementer: the dispatcher

A concrete agent in the SDD plugin that routes the implementer contract invocation to the declared domain plugin. `sdd-author` invokes `sdd-implementer` with the plugin assignments table; `sdd-implementer` reads it, invokes the right implementer, and returns the contract output. This keeps `sdd-author` unaware of routing logic.

If no implementer is declared for a sub-domain, `sdd-implementer` falls back to checking that passing tests exist for every scenario — the pre-contract behavior.

## Defer / build model

An alternative to the runtime dispatch model. Instead of `sdd-author` resolving contracts via registry lookup at invocation time, domain plugin `init`/`update` skills generate concrete agent files into the project at setup time. `sdd-author` then invokes them by known name — no registry lookup, no dispatcher needed.

### What gets generated

When `aces init-sdd` runs under the defer model, it writes two files into the project:

```
.agents/
  aces-sdd-implementer.md    ← generated from plugins/aces/agents/aces-sdd-implementer.md
  aces-scenario-advisor.md   ← generated from plugins/aces/agents/aces-scenario-advisor.md
```

These files contain the same content as the plugin source. After generation they are project files — editable, committable, and surviv­able without the plugin installed.

### How sdd-author uses generated files

`sdd-author` invokes the agent by the name declared in `plan.md ## Plugin assignments` or resolved from the registry. With the defer model, it makes the same call — the difference is that the file exists locally rather than being loaded from the plugin. The dispatch model and defer model are compatible with the same `sdd-author` logic.

### Update story

Re-running `init` or `update` regenerates the files from the plugin source, overwriting local edits. A project that has customized a generated file should track the diff and re-apply after updates, or switch to the runtime model for that domain.

### Mix-and-match

A project may use defer-generated files for some domains (offline use, customization) and registry-resolved agents for others (always-current). The resolution order in `sdd-author` handles both: `plan.md ## Plugin assignments` names the agent; if a matching local file exists it is used, otherwise the plugin-loaded agent is used.

## Open design questions

1. **Project-level quality config** — `verify-implementation` needs a config surface where projects declare their quality thresholds. No design yet.
2. **Backfill gap analysis** — `create-spec` backfill path needs a step that places existing code in exploration or implementation mode and seeds `tasks.md`. No design yet.
3. **`plan-spec` + `create-tasks`** — one combined skill or two? Unresolved.
4. **Plugin assignment inference** — how does `plan-spec` determine which SDD plugin applies to a sub-domain? User prompt, project config, or heuristic from spec content? No design yet.
