# Evidence — SDD freeze boundary & tasks artifact

## C1 — spec-kit gates spec and plan separately; does not hard-freeze plan/tasks

- date: 2026-06
- status: confirmed
- confidence: high
- source label: GitHub spec-kit — workflows reference
- source url: https://github.com/github/spec-kit/blob/main/docs/reference/workflows.md
- source type: official docs / repo
- notes: Full SDD Cycle = `specify → review-spec gate → plan → review-plan gate → tasks → implement`. Gates pause for human review ("Review the plan before generating tasks"); reject aborts. No baseline/lock semantics on plan or tasks.

## C2 — spec-kit treats plan/tasks as peers; emerging ideal is derive-from-spec

- date: 2026-06
- status: confirmed
- confidence: medium-high
- source label: spec-kit discussion #775; reconcile issue #1063
- source url: https://github.com/github/spec-kit/discussions/775
- source type: maintainer/user discussion
- notes: "the spec as the authority and everything else derives from it." `/speckit.reconcile` amends spec.md+plan.md+tasks.md after implementation — i.e., living, not frozen. Current ad-hoc refinement via `/speckit.clarify` and direct edits.

## C3 — Kiro produces requirements/design/tasks; tasks.md is a live dependency-graph checklist

- date: 2026-06
- status: confirmed
- confidence: high
- source label: Kiro Specs docs
- source url: https://kiro.dev/docs/specs/
- source type: official docs
- notes: Three files form the spec. tasks.md = discrete executable tasks with clear outcomes; dependency graph groups independent tasks into concurrent "waves"; real-time status updates during execution. Approval gates exist; "Quick Plan" bypasses them. Freeze-vs-living not stated explicitly for requirements/design (inferred living from task status tracking).

## C4 — Lean/set-based delays commitment to the last responsible moment; early freeze = premature commitment

- date: 2026-06
- status: confirmed
- confidence: high
- source label: Set-based concurrent engineering; Lean concurrent development
- source url: https://xp123.com/set-based-concurrent-engineering/ ; https://www.leanessays.com/2003/08/concurrent-development.html
- source type: practitioner/method literature
- notes: Delay a decision until the cost of not deciding exceeds the cost of deciding; keep options open; freezing all design decisions early is explicitly discouraged.

## C5 — tasks.md is structured (IDs, [P], [US#] traceability, file paths), not a flat todo

- date: 2026-06
- status: confirmed
- confidence: high
- source label: spec-kit tasks template
- source url: https://github.com/github/spec-kit/blob/main/templates/tasks-template.md
- source type: repo template
- notes: Tasks organized by user story; IDs T001…; `[P]` for parallelizable (different files, no deps); `[US#]` labels for traceability; exact file paths. Each task must be executable without extra context. Priority/order emergent from deps + story grouping.

## C6 — ATDD/BDD: acceptance tests target behavior, independent of implementation; executable spec is the single source of truth

- date: 2026-06
- status: confirmed
- confidence: high
- source label: BDD (Wikipedia); ATDD/executable-specifications commentary
- source url: https://en.wikipedia.org/wiki/Behavior-driven_development
- source type: encyclopedic / practitioner
- notes: Acceptance tests focus on outcome/behavior not implementation; Gherkin scenarios serve as a single source of truth and living documentation. Supports "impl-judge functional checks derive from the contract, not free-authored."

## C7 — Martin Fowler tools survey corroborates the Kiro/spec-kit artifact splits

- date: 2026-06
- status: corroborating
- confidence: medium
- source label: martinfowler.com — SDD with Kiro, spec-kit, Tessl
- source url: https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html
- source type: practitioner analysis
- notes: Independent comparison of the three tools' phase/artifact models; used as a cross-check, not deep-quoted.
