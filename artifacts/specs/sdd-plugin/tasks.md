# Tasks: Spec-Driven Development Plugin

## Phase 1 — Foundation

- [x] Research existing SDD tools and pipeline patterns
- [x] Research SDD workflow (two-mode model, artifact co-evolution)
- [x] Research EARS vs. Gherkin notation choice
- [x] Research SDD file templates and section content
- [x] Write `sdd-principles.md` governance
- [x] Write `spec-template.md` governance
- [x] Create `create-spec` skill
- [x] Create `validate-spec` skill
- [x] Create `sdd-spec-designer` subagent
- [x] Create `sdd-spec-validator` subagent
- [x] Write `plan.md` (this repo's SDD plugin design plan)
- [x] Write `tasks.md` (this file)

## Phase 2 — Agent governance

- [x] Fix `specs/spec.md` Process section (sequential-gate doc error)
- [x] Fix `spec-lifecycle.md` Draft section (same error)
- [x] Add `aligned` field + `## Artifacts` section to spec format (`spec.md`, `spec-template.md`)
- [x] Document artifact alignment rules and unit-of-work enforcement in `spec.md` and `plan.md`
- [ ] Update `sdd-spec-validator` to check `aligned` field, `## Artifacts` section, and artifact path existence
- [ ] Update `sdd-spec-designer` to write/maintain `## Artifacts` section and set `aligned: false` when writing
- [ ] Update `sdd-author` to set `aligned: false` at phase start, `aligned: true` at phase completion; add `ALIGNED` to output; block GOAL_ACHIEVED when `aligned: false`
- [ ] Update `create-spec` skill to surface ALIGNED status and not commit while `aligned: false`
- [ ] Update `validate-spec` skill to report `aligned` status
- [ ] Create `init-sdd` skill (include artifact alignment rule in the AGENTS.md section it writes)

## Phase 3 — Full lifecycle

- [ ] Design and create `plan-spec` skill
- [ ] Design and create `create-tasks` skill
- [ ] Design and create `verify-implementation` skill

## Phase 4 — Open design questions

- [ ] Resolve project-level quality config design (needed for `verify-implementation`)
- [ ] Resolve backfill gap analysis step in `create-spec`
- [ ] Decide: `plan-spec` + `create-tasks` as one combined skill or two separate
- [ ] Design plugin assignment inference in `plan-spec` (user prompt vs project config vs heuristic)
