# SDD freeze boundary & tasks artifact (June 2026)

## Question

For an agent-driven spec-driven-development (SDD) workflow with a five-artifact production chain (`spec.md` → `.feature` → `plan.md` → `tasks.md` → implementation) and a two-gate lifecycle, what does external practice baseline/freeze at "approved" — just the contract, or also plan and tasks? And what does a `tasks.md` artifact actually contain — is it just a prioritized todo list?

## Scope

In scope: AWS Kiro, GitHub spec-kit, RFC/design-doc and stage-gate processes, lean/agile (set-based concurrent engineering, last responsible moment), BDD/ATDD executable-specification practice. Out of scope: tool install/UX details, non-SDD project management frameworks.

## Source angles

- Vendor SDD tools (Kiro, spec-kit) — what artifacts, what gates, freeze vs living
- Lean / agile commitment theory — set-based design, last responsible moment vs design freeze
- BDD/ATDD — test independence and the spec-as-authority
- Practitioner commentary (Martin Fowler tools survey, dev.to walkthroughs)

## Findings

### Freeze boundary
- **spec-kit**: `specify → review-spec gate → plan → review-plan gate → tasks → implement`. Two human gates (after spec, after plan). Plan is reviewed, not frozen; tasks regenerate; `/speckit.reconcile` (issue #1063) amends spec+plan+tasks *after* implementation. Discussion #775: plan/tasks are currently treated as **peers** to the spec (a logged design gap); the emerging ideal is "the spec is the authority and everything else derives from it."
- **Kiro**: three files `requirements.md` / `design.md` / `tasks.md`; approval gates (Quick Plan bypasses). No separate plan.md — design.md is the plan. `tasks.md` is a live execution checklist (status tracking, dependency-graph "waves").
- **Lean / set-based / LRM**: delay irreversible commitment to the last responsible moment; early design freeze = premature commitment.
- Net: no surveyed system hard-freezes plan+tasks. They gate/review them and keep them derivable/live.

### What `tasks.md` contains
- Not a flat prioritized todo list. spec-kit template: tasks organized **by user story**, with IDs (`T001`), `[P]` parallel markers, `[US#]` traceability labels, exact file paths, dependencies. Kiro: discrete executable units, dependency graph → concurrent waves, live status.
- Priority/order is **emergent** from the dependency DAG + story grouping, not authored. Tasks are live/regenerable, not frozen.

### Model validation
- Contract-as-authority + derive-the-rest: validated; spec-kit has this as an *unsolved* defect, so our `.feature`-as-authority is ahead.
- Tests derived from spec, independent of implementation: ATDD/BDD — acceptance tests target observable behavior; executable spec is the single source of truth.
- Explore/spike before baseline: validated by tracer-bullet + set-based concurrent engineering.
- Per-phase review gates: present in spec-kit (two) and Kiro (approval gates).

## Contradictions

- External practice splits on gating granularity: spec-kit gates each phase (spec, plan) separately; Kiro gates with optional bypass; lean resists freezing at all. None hard-freeze plan+tasks, but they disagree on how much to gate.
- "Gate-don't-freeze the plan" is a synthesis across spec-kit + lean, not a single named source.

## Open questions

- Does Kiro treat requirements/design as frozen post-approval? Docs don't state it explicitly (inferred from live task tracking).
- How do teams using set-based design decide the "last responsible moment" for a plan in an agent context?

## Sources consulted

- Kiro Specs docs — https://kiro.dev/docs/specs/
- spec-kit workflows — https://github.com/github/spec-kit/blob/main/docs/reference/workflows.md
- spec-kit tasks template — https://github.com/github/spec-kit/blob/main/templates/tasks-template.md
- spec-kit refine discussion #775 — https://github.com/github/spec-kit/discussions/775
- spec-kit reconcile issue #1063 — https://github.com/github/spec-kit/issues/1063
- Martin Fowler, SDD tools (Kiro/spec-kit/Tessl) — https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html
- Set-based concurrent engineering — https://xp123.com/set-based-concurrent-engineering/
- Lean / Last Responsible Moment — https://www.leanessays.com/2003/08/concurrent-development.html
- BDD executable specifications — https://en.wikipedia.org/wiki/Behavior-driven_development
