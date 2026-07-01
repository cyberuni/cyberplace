# SDD freeze boundary & tasks content — validation against external practice (June 2026)

## Question
Should `approved` freeze spec+`.feature`+plan+tasks (Option B) or spec+`.feature` only (Option A)? What belongs in `tasks.md`, and does it freeze?

## Verdict
**Neither A nor B as stated. External practice = freeze the CONTRACT as the authority; GATE-review the plan but keep it derived; keep tasks LIVE.** Confidence: high for "don't hard-freeze tasks," medium-high for "gate-don't-freeze the plan."

### Q1 — Freeze boundary
- **GitHub spec-kit**: `specify → review-spec gate → plan → review-plan gate → tasks → implement`. Two human gates (spec, plan). Plan is **reviewed, not frozen**; tasks **regenerate**; `/speckit.reconcile` (issue #1063) amends spec+plan+tasks *after* implementation. Known design gap (discussion #775): plan/tasks are treated as **peers** to the spec, but the emerging ideal is "**spec is the authority and everything else derives from it**" → regenerate on change.
- **AWS Kiro**: `requirements.md / design.md / tasks.md` with approval gates (Quick Plan bypasses). No separate plan.md — design.md is the plan. `tasks.md` is a **live execution checklist** (real-time status, dependency-graph "waves"), not a frozen baseline.
- **Lean / set-based / Last Responsible Moment**: explicitly warns that early design freeze = **premature commitment**; delay irreversible commitment to the moment not-deciding costs more than deciding.
- **Net**: no surveyed system hard-freezes plan+tasks. They **gate** them and keep them **derivable/live**.

### Q2 — What is `tasks.md`
Not a flat prioritized todo list. Validated contents (spec-kit template, Kiro):
- discrete, independently executable units, each self-contained enough for an agent
- organized **by user story / scenario**, with task IDs (T001…), `[P]` parallel markers, `[US#]` traceability labels back to the contract
- exact **file paths**, **dependencies** (a DAG → concurrent "waves")
- **live status** (in-progress/done)
- **Priority/order is emergent** from the dependency DAG + story grouping — not the primary content.
- Tasks are **live/regenerable**, not frozen.

### Q3 — Other pillars (validated)
- **Contract-as-authority + derive plan/tasks**: strongly validated; we are *ahead* of spec-kit (its peer-vs-derived confusion is a logged defect). Our `.feature`-as-authority is the emerging best practice.
- **Tests derived from spec, independent of implementation**: ATDD/BDD — acceptance tests target observable behavior, the executable spec is the single source of truth. Backs our "impl-judge functional checks derive from the frozen `.feature`, not free-authored" and "four-eyes independence comes from the bar."
- **Explore/spike before baseline**: validated by tracer-bullet + set-based concurrent engineering.
- **Per-phase review gates**: validated (spec-kit 2 gates; Kiro approval gates).

## Recommendation for our model
- **(a)** Reject hard-freezing plan+tasks (Option B). Adopt: **freeze the contract** (`spec.md` intent + `.feature`); the **plan is gated-but-derived** (reviewed at the gate, regenerates if the contract changes); **tasks stay live/derived**. This satisfies the unease (the "how" is reviewed/committed at the gate) without the LRM premature-commitment cost. It is Option A + a plan review gate, not B.
- **(b)** `tasks.md` = scenario-grouped executable units with IDs, dependencies (DAG), `.feature` traceability, file paths, live status. Priority is emergent. Tasks do **not** freeze — they are the live execution surface, regenerated when the contract changes.

## Where we agree / disagree with the world
- **Agree / ahead**: contract is the authority and the rest derives; boolean `.feature` is a stronger authority than spec-kit's prose; tests derive from the contract; explore-before-baseline.
- **Disagree (and should change)**: hard-freezing plan+tasks at approval — no surveyed practice does this; it fights LRM and the derive-from-spec ideal. Gate the plan, don't freeze it; keep tasks live.

## Thin spots / check later
- Kiro docs don't state freeze-vs-living for requirements/design explicitly (inferred from live task tracking).
- "Gate-don't-freeze the plan" is a synthesis across spec-kit + lean, not a single named source.

## Sources
- Kiro Specs docs — https://kiro.dev/docs/specs/
- spec-kit workflows — https://github.com/github/spec-kit/blob/main/docs/reference/workflows.md
- spec-kit tasks template — https://github.com/github/spec-kit/blob/main/templates/tasks-template.md
- spec-kit refine discussion #775 — https://github.com/github/spec-kit/discussions/775
- spec-kit reconcile issue #1063 — https://github.com/github/spec-kit/issues/1063
- Martin Fowler, SDD tools (Kiro/spec-kit/Tessl) — https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html
- Set-based concurrent engineering — https://xp123.com/set-based-concurrent-engineering/
- Lean / Last Responsible Moment — https://www.leanessays.com/2003/08/concurrent-development.html
- BDD executable specifications — https://en.wikipedia.org/wiki/Behavior-driven_development
