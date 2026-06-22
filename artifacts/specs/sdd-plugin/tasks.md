# Tasks: Spec-Driven Development Plugin

Each task is an executable unit with an ID, dependency edges, and scenario traceability. Order is derived from deps, not authored priority.

## Done

- [x] `SDDP-001` Establish SDD plugin baseline artifacts and initial workflow skills — deps: none — serves: historical bootstrap
- [x] `SDDP-002` Add `.agents/universal-plugin.json` `sdd-plugins[]` registry support in plugin init paths — deps: SDDP-001 — serves: Domain plugin init writes the resolved role map
- [x] `SDDP-003` Replace `init-sdd` with `sdd` context skill entrypoint — deps: SDDP-001 — serves: Load SDD context for feature work; sdd does not modify project files

## Stream A — Orchestrator ownership and workflow boundaries

- [x] `SDDP-101` Rename remaining runtime `sdd-author` surfaces to `sdd-orchestrator` — deps: SDDP-001 — serves: create-spec resumes the orchestrator after batched answers
- [x] `SDDP-102` Constrain orchestrator runs to one autonomous segment with `STATUS: complete | needs-input | blocked` — deps: SDDP-101 — serves: create-spec resumes the orchestrator after batched answers
- [x] `SDDP-103` Move user questions and gate confirmations into `create-spec` and `validate-spec` only — deps: SDDP-102 — serves: Ambiguous domain coverage is resolved by the skill; validate-spec freezes scenarios after human approval
- [x] `SDDP-104` Add delegate synthesis with `QUESTIONS`, `CONTENT_GAPS`, and `OBSERVATIONS` output blocks — deps: SDDP-102 — serves: Explore-mode implementation discoveries become content gaps; Observations are surfaced without blocking the current spec
- [x] `SDDP-105` Enforce artifact write boundaries (`spec.md`, `.feature`, `plan.md`, `tasks.md`, implementation artifacts) — deps: SDDP-103, SDDP-104 — serves: Scaffold the co-delivered artifact chain for a new feature

## Stream B — Delegate role map and defaults

- [x] `SDDP-201` Resolve all five roles (`spec-producer`, `plan-producer`, `spec-judge`, `impl-producer`, `impl-judge`) from the registry and defaults — deps: SDDP-002, SDDP-102 — serves: Domain plugin init writes the resolved role map; Runtime resolution does not read plan.md plugin assignments
- [x] `SDDP-202` Set `sdd-scenario-writer` as default spec-producer — deps: SDDP-201 — serves: A plugin-written feature must pass the universal format bar
- [x] `SDDP-203` Set `sdd-planner` as default plan-producer — deps: SDDP-201 — serves: Scaffold the co-delivered artifact chain for a new feature; tasks.md is a DAG with scenario traceability
- [x] `SDDP-204` Complete rename from `sdd-spec-validator` to `sdd-spec-judge` across runtime surfaces — deps: SDDP-201 — serves: validate-spec runs the spec gate against the contract layer
- [x] `SDDP-205` Keep `sdd-implementer` as default impl-judge and generic Builder as default impl-producer — deps: SDDP-201 — serves: Implementation runs against the frozen feature; Impl gate passes only when every frozen scenario passes

## Stream C — Governance skills and legacy migration

- [x] `SDDP-301` Create non-user-invocable `sdd:spec-governance` skill — deps: SDDP-003 — serves: sdd loads governance from skill context
- [x] `SDDP-302` Move universal boolean Gherkin format and ordering rules into `sdd:spec-governance` — deps: SDDP-301 — serves: A plugin-written feature must pass the universal format bar
- [x] `SDDP-303` Move spec readability/enrichment rules into `sdd:spec-governance` — deps: SDDP-301 — serves: validate-spec runs the spec gate against the contract layer
- [x] `SDDP-304` Remove runtime dependency on `governance show` in SDD flows — deps: SDDP-301 — serves: sdd loads governance from skill context
- [x] `SDDP-305` Retire or migrate legacy files in `artifacts/specs/sdd-plugin/governances/` — deps: SDDP-302, SDDP-303, SDDP-304 — serves: sdd loads governance from skill context

## Stream D — Registry resolution and ambiguity handling

- [x] `SDDP-401` Update each `init-<plugin>` path to persist five-role map plus actor governances — deps: SDDP-201 — serves: Domain plugin init writes the resolved role map
- [x] `SDDP-402` Rewrite old-shape entries on plugin init rerun — deps: SDDP-401 — serves: Domain plugin init rewrites old registry shape
- [x] `SDDP-403` Resolve duplicate domain claims with `needs-input` and `domain-plugin` frontmatter choice — deps: SDDP-401, SDDP-103 — serves: Ambiguous domain coverage is resolved by the skill
- [x] `SDDP-404` Remove `plan.md` plugin assignment tables as a resolver input — deps: SDDP-401 — serves: Runtime resolution does not read plan.md plugin assignments
- [x] `SDDP-405` Enforce runtime delegate resolution from `.agents/universal-plugin.json` only — deps: SDDP-401, SDDP-404 — serves: Runtime resolution does not read plan.md plugin assignments

## Stream E — Gate behavior, lifecycle, and provenance

- [x] `SDDP-501` Validate legal `(status, aligned, markers, .feature)` tuples in gate flow — deps: SDDP-102 — serves: validate-spec accepts draft aligned true as ready for the spec gate
- [x] `SDDP-502` Route `validate-spec` to spec gate by default for `draft` status — deps: SDDP-501, SDDP-204 — serves: validate-spec runs the spec gate against the contract layer
- [x] `SDDP-503` Route `validate-spec` to impl gate by default for `approved` status — deps: SDDP-501, SDDP-205 — serves: Implementation runs against the frozen feature
- [x] `SDDP-504` Record spec approval provenance on Draft -> Approved transitions — deps: SDDP-502 — serves: validate-spec freezes scenarios after human approval
- [x] `SDDP-505` Record impl approval provenance on Approved -> Implemented transitions — deps: SDDP-503 — serves: Impl gate passes only when every frozen scenario passes
- [x] `SDDP-506` Keep deterministic checks optional with agent-level fallback when Node tooling is unavailable — deps: SDDP-502 — serves: validate-spec can run without NodeJS

## Stream F — Consumer plugin migration

- [x] `SDDP-601` Migrate Quill mapping from `quill-scenario-advisor` to `quill-writer` and `quill-doc-writer` role targets — deps: SDDP-401 — serves: Domain plugin init writes the resolved role map
- [x] `SDDP-602` Preserve Quill impl-judge mapping to `quill-implementer` — deps: SDDP-601 — serves: Impl gate passes only when every frozen scenario passes
- [x] `SDDP-603` Migrate ACES mapping from `aces-spec-designer` to `aces-scenario-writer` and keep `aces-spec-validator` as spec-judge — deps: SDDP-401 — serves: A plugin-written feature must pass the universal format bar
- [x] `SDDP-604` Shift ACES eval authoring to impl-producer and eval execution to `aces-implementer` — deps: SDDP-603 — serves: Implementation runs against the frozen feature

## Deferred

- [ ] `SDDP-901` Decide whether `plan-producer` should split into separate plan and task producers — deps: SDDP-203 — serves: tasks.md is a DAG with scenario traceability
- [ ] `SDDP-902` Define project-specific quality thresholds for the default impl path — deps: SDDP-205 — serves: Impl gate passes only when every frozen scenario passes
- [ ] `SDDP-903` Design external routing for accepted architect/curator observations — deps: SDDP-104 — serves: Observations are surfaced without blocking the current spec
