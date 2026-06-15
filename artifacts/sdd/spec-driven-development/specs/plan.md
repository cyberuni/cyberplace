# Plan: Spec-Driven Development Plugin

## Architecture

**Skill/agent split** — skills are user-facing workflow coordinators; agents are specialist workers invoked by skills, not directly by users.

```
User
  │
  ├── create-spec ──────────────→ sdd-spec-designer (writes spec.md + .feature)
  │                   └───────→ sdd-spec-validator (quality loop)
  │
  ├── validate-spec ───────────→ sdd-spec-validator
  │
  ├── init-sdd ──── (no agent; writes AGENTS.md section + registers hook)
  │
  ├── plan-spec ─────────────── sdd-plan-designer (TBD) → plan.md + research.md
  │
  ├── create-tasks ────────────  sdd-task-planner (TBD) → tasks.md
  │
  └── verify-implementation ──── sdd-impl-verifier (TBD) → spec.md → Implemented
```

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

## Open design questions

1. **Project-level quality config** — `verify-implementation` needs a config surface where projects declare their quality thresholds. No design yet.
2. **Backfill gap analysis** — `create-spec` backfill path needs a step that places existing code in exploration or implementation mode and seeds `tasks.md`. No design yet.
3. **`plan-spec` + `create-tasks`** — one combined skill or two? Unresolved.
