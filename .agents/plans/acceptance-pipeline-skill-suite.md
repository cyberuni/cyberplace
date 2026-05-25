# Acceptance Pipeline Skill Suite

## Summary

Build this as a **published public skill suite** in this repo, not as a new top-level `cyber-skills` product area. The suite should let an agent install Uncle Bob's Acceptance Pipeline into a target project by following a portable workflow, while using **TypeScript/Node reference assets** for the deterministic pieces in v1.

The suite should have one user-facing skill plus three explicit internal sub-skills/persona skills:

- `acceptance-pipeline`
  Public entrypoint. Detects the target repo, chooses the install path, and coordinates the rest.
- `acceptance-pipeline-architect`
  `Internal skill:` role focused on mapping the spec to target-project contracts and artifact layout.
- `acceptance-pipeline-implementer`
  `Internal skill:` role focused on scaffolding parser, IR, runtime, generator, mutator, scripts, and test hooks.
- `acceptance-pipeline-critic`
  `Internal skill:` role focused on conformance review, mutation-survivor analysis, and hardening gaps.

Keep these sub-skills under `skills/`, not `.agents/skills/`, so they ship in the npm package. Their descriptions should use the internal-skill prefix to avoid accidental activation.

## Key Changes

### Skill package shape

Add a new public skill folder under `skills/acceptance-pipeline/` with:

- `SKILL.md` for the user-facing orchestrator workflow.
- `reference.md` capturing the portable Acceptance Pipeline contracts and conformance checklist.
- `templates/typescript-node/` containing the v1 reference implementation assets.
- `scripts/` with deterministic helpers for repo detection, template rendering, and scaffold validation.

Add three sibling internal skills in `skills/` for the persona/subagent phases above. The main skill should call them explicitly in this order:

1. `architect`
2. `implementer`
3. `critic`

### Public interfaces and contracts

The skill suite should standardize these target-project artifacts and commands:

- Feature source: `features/*.feature`
- Base IR output: `build/acceptance/*.json`
- Mutation work dir: `build/acceptance-mutation/`
- Generated tests: `acceptance/generated/`

Required command contracts in the installed project:

- `gherkin-parser <feature-file> <json-output>`
- `acceptance-generator <json-ir> <generated-test-output>`
- `gherkin-mutator [options]`
- `acceptance` for the normal acceptance run
- `acceptance:mutation` for the mutation run

The TypeScript reference assets should define stable IR/report types matching the spec:

- `FeatureIR`
- `ScenarioIR`
- `StepIR`
- `ExampleObject`
- `MutationDescriptor`
- `MutationResult`
- `MutationSummary`
- `RunnerResult`

The v1 reference implementation must cover the full spec, including:

- Supported Gherkin subset
- Pretty-printed JSON IR
- Generated tests from IR only
- Runtime with fresh world per scenario execution
- Exact-text step handler matching as portable baseline
- Deterministic mutation IDs, paths, descriptions, and value rules
- Text and JSON mutation reports
- Differential mutation with feature stamp and scenario manifest
- Periodic status lines to stderr

### Governance and audit updates

Codify persona skills instead of leaving them implicit.

Add an explicit persona convention to `governances/skill-design.md`:

- Allow role-specific behavior only when frontmatter includes `metadata.persona: true`.
- Require persona skills to stay workflow-scoped and not override system/developer/user instructions.
- Prefer "adopt this role/responsibility" language over prompt-injection phrasing.

Update `skills/audit-skill/SKILL.md` and `src/audit/validate.ts` so E2/Q3 rules understand declared persona skills. Add validator tests for:

- Persona skill passes with `metadata.persona: true`
- Same language fails without persona metadata
- Internal sub-skill prefix still required

### Delivery sequence

Implement in four increments:

1. Ship the governance/audit support for persona skills.
2. Ship the public orchestrator skill plus the three internal persona skills and reference docs.
3. Ship the TypeScript/Node reference templates and helper scripts.
4. Validate against a fixture repo and then document the install workflow in the package README.

Do not add a new `cyber-skills acceptance ...` CLI surface in v1. If the helper scripts prove too heavy for skill-bundled assets, that can be a later extraction.

## Test Plan

- Run `pnpm verify`.
- Add unit tests for persona-skill validation changes in the audit module.
- Add fixture tests for the TypeScript reference parser:
  - valid feature/background/scenario/examples parsing
  - missing feature rejection
  - examples-outside-scenario rejection
  - mismatched example-row width rejection
- Add fixture tests for runtime/generator behavior:
  - scenarios without examples execute once
  - background steps prepend correctly
  - unsupported step text fails
  - missing/invalid example values fail
- Add fixture tests for mutator behavior:
  - deterministic IDs/paths/descriptions
  - all value mutation rule classes
  - deep-copy isolation per mutation
  - killed/survived/error classification
  - text report ordering
  - JSON report schema
  - stderr status output not corrupting stdout JSON
  - `full`/`hard`/`soft` differential reuse rules
  - manifest and feature-stamp refresh on success
- Add one end-to-end sample project test:
  - normal acceptance run passes
  - mutation run produces at least one survivor in the weak baseline
  - strengthening step handlers/scenarios converts that survivor to killed

## Assumptions

- The goal is a **skill that installs the Acceptance Pipeline into other repos**, not an acceptance-testing engine for this repo itself.
- v1 is portable at the workflow/spec layer, but the only shipped executable reference assets are for **Node 22 + TypeScript + Vitest + POSIX shell**.
- Internal helper/persona skills must be published under `skills/` because package publication currently includes `skills/` but not `.agents/skills/`.
- The implementation should follow the contracts in the Acceptance Pipeline Specification, especially the parser/generator/runtime/mutator/reporting/differential-mutation sections.

## References

- https://github.com/unclebob/Acceptance-Pipeline-Specification
- `governances/skill-design.md`
- `skills/audit-skill/SKILL.md`
