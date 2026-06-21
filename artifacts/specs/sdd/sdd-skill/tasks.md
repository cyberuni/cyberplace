# Tasks: SDD Gateway Skill Workflow

Each task is an executable unit; dependencies are noted. Order is emergent from dependencies.

## Phase 1 - Workflow artifacts

- [x] Write `spec.md` for the `sdd` gateway skill workflow — serves: gateway behavior, intake, routing surface, nested graph requirement
- [x] Write `sdd-skill.feature` scenarios — deps: spec.md — serves: activation, intake, context loading, routing, freeze enforcement, no project mutation
- [x] Write `plan.md` — deps: spec.md — serves: implementation approach and failure handling
- [x] Write `tasks.md` — deps: spec.md — serves: executable work tracking

## Phase 2 - Skill implementation

- [x] Expand `plugins/sdd/skills/sdd/SKILL.md` into decision-complete gateway guidance — deps: spec.md, scenarios — serves: all skill scenarios
- [x] Ensure the skill describes lifecycle-state reads and routing without mutating project files — deps: skill expansion — serves: no project mutation
- [x] Run mechanical skill audit for `plugins/sdd/skills/sdd` — deps: skill expansion

## Phase 3 - Nested spec graph support

- [x] Update `collectSpecs(root)` to find nested `spec.md` files recursively — deps: workflow path
- [x] Use root-relative folder paths as graph node slugs — deps: recursive discovery
- [x] Add `node:test` coverage for nested specs and unchanged flat slugs — deps: recursive discovery
- [x] Regenerate `artifacts/specs/graph.md` — deps: recursive discovery

## Phase 4 - Validation

- [x] Run `node --test plugins/sdd/skills/render-spec-graph/scripts/render-spec-graph.test.mts` — deps: nested graph support
- [x] Run `pnpm verify` — deps: all implementation tasks
