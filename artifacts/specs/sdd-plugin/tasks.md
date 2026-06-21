# Tasks: Spec-Driven Development Plugin

## Done

- [x] Research existing SDD tools and pipeline patterns
- [x] Research SDD workflow and artifact co-evolution
- [x] Research EARS vs. Gherkin notation choice
- [x] Research SDD file templates and section content
- [x] Write legacy `sdd-principles.md` governance
- [x] Write legacy `spec-template.md` governance
- [x] Create initial `create-spec` skill
- [x] Create initial `validate-spec` skill
- [x] Create initial SDD authoring and validation agents
- [x] Create `sdd` context skill
- [x] Create Quill plugin prototype with SDD registry entries
- [x] Add `.agents/universal-plugin.json` `sdd-plugins` registry support in plugin init paths

## Wave 1: Orchestrator Model Migration

- [ ] Rename remaining `sdd-author` references and implementation surfaces to `sdd-orchestrator`
- [ ] Reduce `sdd-orchestrator` to one autonomous segment with `complete`, `needs-input`, and `blocked` returns
- [ ] Move all user questions and gate confirmations into `create-spec` and `validate-spec`
- [ ] Add uniform delegate output aggregation: `QUESTIONS`, `CONTENT_GAPS`, and `OBSERVATIONS`
- [ ] Enforce the write boundary for `spec.md`, `.feature`, `plan.md`, `tasks.md`, and implementation artifacts

## Wave 2: Delegate Roles

- [ ] Add role resolution for `spec-producer`, `plan-producer`, `spec-judge`, `impl-producer`, and `impl-judge`
- [ ] Add default `sdd-scenario-writer` agent for the spec-producer role
- [ ] Add default `sdd-planner` agent for the plan-producer role
- [ ] Reframe `sdd-spec-validator` as `sdd-spec-judge`
- [ ] Keep `sdd-implementer` as the default impl-judge
- [ ] Use the generic Builder as the default impl-producer

## Wave 3: Governance Skills

- [x] Replace `init-sdd` with `sdd` context skill
- [ ] Create `sdd:spec-governance` as a non-user-invocable governance skill
- [ ] Move universal `.feature` format rules into `sdd:spec-governance`
- [ ] Move scenario-ordering rules into `sdd:spec-governance`
- [ ] Move `spec.md` human-readability and enrichment rules into `sdd:spec-governance`
- [ ] Stop runtime SDD paths from calling `governance show`
- [ ] Retire or migrate legacy files under `artifacts/specs/sdd-plugin/governances/`

## Wave 4: Registry and Resolution

- [ ] Update each `init-<plugin>` path to write the five-role map and actor governances
- [ ] Rewrite old-shape registry entries on plugin init
- [ ] Resolve duplicate domain claims through `needs-input` and `domain-plugin` frontmatter
- [ ] Remove `plan.md ## Plugin assignments` as a resolution source
- [ ] Ensure runtime resolution reads only `.agents/universal-plugin.json`

## Wave 5: Gates and Validation

- [ ] Validate legal `(status, aligned, markers, .feature)` tuples
- [ ] Make `validate-spec` target the spec gate for `draft` specs
- [ ] Make `validate-spec` target the impl gate for `approved` specs
- [ ] Record spec approval provenance when moving to `approved`
- [ ] Record impl approval provenance when moving to `implemented`
- [ ] Keep NodeJS deterministic checks optional with an agent-level fallback

## Wave 6: Consumer Plugins

- [ ] Update Quill from `quill-scenario-advisor` to `quill-writer`
- [ ] Add `quill-doc-writer` as impl-producer
- [ ] Keep `quill-implementer` as impl-judge
- [ ] Update ACES from `aces-spec-designer` to `aces-scenario-writer`
- [ ] Retain `aces-spec-validator` as spec-judge
- [ ] Move ACES eval authoring into the impl-producer and eval execution into `aces-implementer`

## Deferred

- [ ] Decide whether `plan-producer` should split into plan and task producers
- [ ] Design project-specific quality thresholds for the default impl path
- [ ] Design external routing for accepted architect and curator observations
