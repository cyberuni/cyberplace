# Tasks: Spec Digest

Each task is an executable unit; dependencies are noted. Order is emergent from dependencies.

## Phase 1 - Workflow artifacts

- [x] Write `spec.md` for the `spec-digest` skill — serves: digest content, read-only/decision-free boundaries
- [x] Write `spec-digest.feature` scenarios — deps: spec.md — serves: content, missing-.feature, open markers, no-mutation, no-verdict
- [x] Write `plan.md` — deps: spec.md — serves: approach, integration, failure handling
- [x] Write `tasks.md` — deps: spec.md — serves: executable work tracking

## Phase 2 - Skill implementation

- [ ] Create `plugins/sdd/skills/spec-digest/SKILL.md` as an internal, read-only digest skill — deps: spec.md, scenarios — serves: all skill scenarios
- [ ] Wire `spec-digest` into `validate-spec/SKILL.md` step 4 — deps: skill creation — serves: gate review integration
- [ ] Run mechanical skill audit for `plugins/sdd/skills/spec-digest` — deps: skill creation

## Phase 3 - Validation

- [ ] Run `pnpm verify` — deps: all implementation tasks
