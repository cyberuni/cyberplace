# Tasks: SDD Gateway Skill Workflow

Each task is an executable unit; dependencies are noted. Order is emergent from dependencies.

## Phase 1 - Workflow artifacts

- [x] Write `spec.md` for the `sdd` gateway skill workflow — serves: gateway behavior, intake, routing surface
- [x] Write `sdd-skill.feature` scenarios — deps: spec.md — serves: activation, intake, context loading, routing, freeze enforcement, no project mutation
- [x] Write `plan.md` — deps: spec.md — serves: implementation approach and failure handling
- [x] Write `tasks.md` — deps: spec.md — serves: executable work tracking

## Phase 2 - Skill implementation

- [x] Expand `plugins/sdd/skills/sdd/SKILL.md` into decision-complete gateway guidance — deps: spec.md, scenarios — serves: all skill scenarios
- [x] Ensure the skill describes lifecycle-state reads and routing without mutating project files — deps: skill expansion — serves: no project mutation
- [x] Run mechanical skill audit for `plugins/sdd/skills/sdd` — deps: skill expansion

## Phase 3 - Validation

- [x] Run `pnpm verify` — deps: all implementation tasks

## Phase 4 - Vocabulary + signal routing revision

- [x] Add design decisions for workflow vocabulary and complete-draft auto-routing to `spec.md` — serves: vocabulary, signal-based routing
- [x] Add scenarios for complete-draft → spec gate and open-marker → revise to `sdd-skill.feature` — deps: spec.md
- [x] Update `plugins/sdd/skills/sdd/SKILL.md` routing table + report to workflow vocabulary and signal-based tiebreaker — deps: spec.md, scenarios
- [x] Replace lifecycle-governance load with inlined routing table in SKILL.md — deps: spec.md
- [x] Replace upfront file reads with conditional frontmatter-first reads in SKILL.md — deps: spec.md
- [x] Update SKILL.md to spawn a subagent for all downstream SDD work instead of loading sub-skills inline — deps: spec.md, delegation scenarios
- [x] Run mechanical skill audit and `pnpm verify` — deps: all skill updates
