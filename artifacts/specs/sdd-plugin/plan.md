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
| All artifacts in sync before commit | `aligned` field + `## Artifacts` section; `sdd-author` sets `aligned: false` at phase start, `aligned: true` at phase completion after all artifacts updated |

## Artifact alignment

Each `spec.md` carries an `aligned` field (boolean) and an `## Artifacts` section listing every artifact that belongs to the spec. Paths are project-root-relative; folder paths mean "all files under it."

**Unit-of-work rule:** touching any artifact sets `aligned: false`. The work unit is not complete — and a commit must not be made — until every listed artifact is reviewed, updated if needed, and `aligned: true` is set.

**Agent enforcement chain:**

```
sdd-author (phase start)   → set aligned: false
sdd-spec-designer           → writes/maintains ## Artifacts section; keeps aligned: false
sdd-author (phase end)      → checks all artifacts, sets aligned: true, reports ALIGNED: true
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

A `plan.md` for a cross-cutting feature declares which SDD plugin handles each sub-domain in a `## Plugin assignments` section:

```markdown
## Plugin assignments

| Sub-domain | SDD plugin |
|---|---|
| React component | sdd-react |
| Design token definitions | sdd-design-tokens |
| Utility functions | (base SDD plugin) |
```

**Why plugin selection belongs in `plan.md`, not `spec.md`:**

`spec.md` describes observable behavior — "the Banner displays a dismissible alert." This spec must survive rewriting from React to Web Components without changing. `plan.md` would change because the implementation tools changed. Plugin choice is strategy (the how), not contract (the what).

Consequence for `plan-spec`: the skill must read the frozen `spec.md`, identify sub-domains from the command surface and scenarios, ask or infer which SDD plugin applies to each, and write `plan.md` with a `## Plugin assignments` section. This is the bridge between "what" and "which tools."

## Open design questions

1. **Project-level quality config** — `verify-implementation` needs a config surface where projects declare their quality thresholds. No design yet.
2. **Backfill gap analysis** — `create-spec` backfill path needs a step that places existing code in exploration or implementation mode and seeds `tasks.md`. No design yet.
3. **`plan-spec` + `create-tasks`** — one combined skill or two? Unresolved.
4. **Plugin assignment inference** — how does `plan-spec` determine which SDD plugin applies to a sub-domain? User prompt, project config, or heuristic from spec content? No design yet.
