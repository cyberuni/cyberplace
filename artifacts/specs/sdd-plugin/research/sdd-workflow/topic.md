# SDD Workflow — Artifact-Anchored Model (June 2026)

## Question

What is the proper SDD workflow, modeled with artifacts as the explicit input and output of each step?

## Scope

**In scope:**
- The artifact set for a complete SDD domain
- The two workflow modes (exploration / implementation)
- The single gate between modes
- Skill responsibilities per step
- Lifecycle rules for spec.md, .feature, plan.md, tasks.md

**Out of scope:**
- Specific tool implementations (Kiro, Spec Kit, etc.) — covered in [[spec-driven-development]]
- File templates and section content — covered in [[sdd-file-templates]]
- EARS vs. Gherkin notation choice — covered in [[ears-vs-gherkin]]

## Source angles

- This project's own governance docs (`sdd-principles.md`, `spec-lifecycle.md`, `specs/spec.md`)
- Existing research: [[spec-driven-development]], [[sdd-file-templates]]
- Cross-tool pipeline patterns (Kiro, Spec Kit, cc-sdd, BMAD, OpenSpec)
- XP spike concept as analogue for exploration mode
- Iterative refinement with project author (June 2026)

## Findings

### The Core Artifact Set

Every SDD domain produces a predictable artifact set:

| Artifact | Purpose | Lifecycle |
|---|---|---|
| `spec.md` | What + Why + Command surface | Draft → Approved → Implemented → Deprecated |
| `<domain>.feature` | Observable scenarios (Gherkin) | Living during exploration; frozen at Approved |
| `plan.md` | How (architecture, components, decisions) | No formal status; fluid until shipped |
| `tasks.md` | Steps (phased, traced, parallelizable) | Checkbox progress; no formal status |
| Source code + tests | Implementation | Validation bar rises at Approved |

Optional satellites: `research.md` (pre-design investigation), `data-model.md`, `contracts/`.

### Two Modes, One Gate

The workflow is not a strict linear pipeline. All artifacts can exist in either mode, in any order. What changes across modes is the **validation bar**, not which artifacts exist or whether code is "real."

**Exploration mode** (before `spec.md → Approved`):
- All artifacts may be created, in any order
- Code: high quality is still expected, but partial coverage and mock-heavy tests are acceptable
- Tests: unit-level and mock-heavy acceptable; goal is rapid development + discovering test cases
- `.feature`: living document — scenarios being discovered, may change
- `plan.md` / `tasks.md`: may be rough, may change, may become the implementation artifacts or serve as source material
- Primary goal: rapid understanding + identify all test cases

**Implementation mode** (after `spec.md → Approved`):
- All artifacts must be at implementation quality before the MR is merged
- Code: full scenario coverage, boundary-level tests (observable behavior)
- Tests: all `.feature` scenarios must pass
- `.feature`: frozen — scenario changes require a new Draft → Approved cycle
- `plan.md`: stable, decisions locked, sufficient for execution
- `tasks.md`: traced to user stories, phased, checkpointed

**The single gate:** `spec.md → Approved`. This is the only hard lifecycle transition that gates shipping. Everything else is quality guidance.

### Artifact Co-Evolution

Artifacts inform each other in all directions during exploration. There is no required creation order:

```
spec.md  ←─────────────────────────────────┐
   │  informs              ↑ discoveries    │
   ↓                       │               │
plan.md  ←──────────────┐  │               │
   │  informs            │  │               │
   ↓                  code + tests          │
tasks.md                   │  identify cases│
   │  informs               └──────────→ .feature
   ↓                                        │
code + tests ──────────────────────────────┘
```

Writing rough tasks can reveal the spec is underspecified. Exploration code can reveal the plan is wrong. Test case discovery can surface spec gaps. All feedback loops are expected and valid in exploration mode.

### Workflow Step by Step

```
[User Intent / Problem Statement]
          │
╔═════════════════════════════════════════════════════╗
║  EXPLORATION MODE  (validation bar: LOW)            ║
║                                                     ║
║  Any artifact may be created in any order:          ║
║    spec.md (Draft)    — evolving                    ║
║    <domain>.feature   — scenarios being discovered  ║
║    plan.md            — rough architecture          ║
║    tasks.md           — tasks being identified      ║
║    code + tests       — unit/mock, partial coverage ║
║                                                     ║
║  Artifacts inform each other in all directions.     ║
║  Goal: rapid understanding + identify test cases.   ║
╚═════════════════════════════════════════════════════╝
          │
          ▼  [validate-spec passes + peer review]
          │
   spec.md → Approved   ◄── THE SINGLE GATE
          │
          ▼
╔═════════════════════════════════════════════════════╗
║  IMPLEMENTATION MODE  (validation bar: HIGH)        ║
║                                                     ║
║  Each artifact promoted to implementation quality   ║
║  (reused as-is OR rewritten from source material):  ║
║    spec.md (Approved)  — frozen behavior contract   ║
║    <domain>.feature    — frozen; all scenarios set  ║
║    plan.md             — stable, decisions locked   ║
║    tasks.md            — traced, phased, ready      ║
║    code + tests        — full scenario coverage,    ║
║                          boundary-level tests       ║
╚═════════════════════════════════════════════════════╝
          │
          ▼  [all scenarios pass + verify-implementation]
          │
   spec.md → Implemented
```

### Skill Responsibilities

| Step | Skill | IN | OUT |
|---|---|---|---|
| Specify | `create-spec` | intent, domain name | `spec.md` (Draft) + `.feature` |
| Validate spec | `validate-spec` | `spec.md` (Draft) + `.feature` | `spec.md` (Approved) |
| Plan | `plan-spec` *(missing)* | `spec.md` (Approved) + `.feature` | `plan.md` + optional `research.md` |
| Break down tasks | `create-tasks` *(missing)* | `plan.md` + `spec.md` | `tasks.md` |
| Implement | TDD loop (external) | `tasks.md` + `.feature` | code + tests |
| Verify implementation | `verify-implementation` *(missing)* | code + tests + `.feature` + `spec.md` | `spec.md` (Implemented) |

### Lifecycle Rules

**`spec.md` only — no formal lifecycle for plan or tasks:**
- `plan.md` and `tasks.md` are strategy artifacts, not contracts. They remain fluid and need no `Approved` status.
- Only `spec.md` functions as a behavioral contract. If implementation disagrees with `spec.md`, implementation is wrong.

**`.feature` freeze:**
- During exploration: scenarios may change freely.
- After `spec.md → Approved`: scenarios are frozen. Adding or removing scenarios requires a new Draft → Approved cycle.
- Enforcement: baked into agent definition (agents must not modify `.feature` unilaterally when spec is Approved); `verify-implementation` flags scenario drift.

**`research.md` creation:**
- Not determined by count of unknowns — determined by depth of the topic.
- Create `research.md` when the investigation itself is worth sharing: another builder would benefit from reading how the decision was reached, not just what was decided.
- Shallow unknowns: inline note in `plan.md`.

**Task granularity:**
- Tasks are units of work — the atomic unit appropriate for what is being built.
- No domain-specific rule. Builder judges based on the work.

### Backfill Workflow

When code exists and a spec is being backfilled:
1. `create-spec` (backfill path) infers `spec.md` + `.feature` from existing code, tests, commit history.
2. A **gap analysis** runs, comparing existing implementation against the spec's scenarios.
3. Gap analysis determines mode:
   - Small/zero gap → code is at implementation quality → spec advances toward Approved directly, remaining tasks close gaps.
   - Substantial gap → code is at exploration quality → spec starts as Draft, existing code is source material, tasks cover closing the gaps.
4. The gap analysis output seeds `tasks.md`.

### What Does Not Apply to plan.md

`plan.md` intentionally has no `Draft → Approved` lifecycle because:
- The plan is a strategy (the how), not a contract (the what).
- Strategies change during implementation as better approaches are discovered — that is normal, not a violation.
- Formal plan approval would penalize adaptation.
- Plan review happens naturally at MR review time alongside code and spec.

## Contradictions

- `specs/spec.md:104` ("Implementation begins only after Approved") contradicts `sdd-principles.md` rule 1 (co-delivered — not sequential) and the two-mode model. **Fix required:** update `specs/spec.md` and `spec-lifecycle.md` to describe exploration-mode code rather than a hard gate on implementation start.

## Open Questions

Three plugin design requirements identified but not yet resolved:

1. **Project-level quality configuration** — `verify-implementation` and promotion clarity depend on what "implementation quality" means for a given project. The plugin needs a configuration surface where projects declare their quality thresholds (coverage floor, required test types, e2e requirements). Without this, implementation-mode validation has no calibration point.

2. **Agent definition rule for `.feature` freeze** — The agent definition must include: do not modify `.feature` files when `spec.md` is Approved without triggering a new review cycle. Needs to be formalized in the plugin's agent governance.

3. **Gap analysis in backfill** — The `create-spec` backfill path needs a gap analysis step that places the existing implementation in the correct mode and seeds `tasks.md` with gap-closing tasks. Design of this step is unresolved.

## Sources consulted

- `governances/sdd-principles.md` (this repo)
- `apps/web/src/content/docs/methodology/spec-lifecycle.md` (this repo)
- `specs/spec.md` (this repo)
- [[spec-driven-development]] research (cross-tool pipeline patterns)
- [[sdd-file-templates]] research (artifact structure and content)
- Iterative author refinement session, June 2026
