# Plan: SDD Gateway Skill Workflow

## Approach

Tighten `sdd` from a short list of SDD surfaces into a gateway skill that gives the agent enough operational rules to activate SDD, conduct intake, and route feature work without guessing.

The skill should remain documentation-only: no scripts, no CLI, no project-file writes. Its value is serving as the explicit SDD entrypoint: it loads the SDD lifecycle, frozen-contract rules, and routing table into context before an agent touches a feature.

## Skill behavior

The skill body should be organized around six decisions:

1. **Activate SDD** — recognize explicit `$sdd`, "use SDD", or Spec-Driven Development feature-work requests.
2. **Conduct intake** — when the request has no feature or action, ask which SDD route the user wants.
3. **Load context** — identify the SDD skills, agents, and `sdd:spec-governance` dependency that are active for the work.
4. **Read lifecycle state** — inspect existing `spec.md`, `.feature`, `plan.md`, and `tasks.md` when present.
5. **Route by state** — send draft work to `create-spec`, gate work to `validate-spec`, approved implementation to the frozen-feature path, and graph refreshes to `render-spec-graph`.
6. **Report next action** — tell the user which SDD path is active and which constraints apply.

## Graph support

Because this workflow is nested under `artifacts/specs/sdd/sdd-skill/`, `render-spec-graph` needs recursive discovery:

- Find every `spec.md` under the specs root, excluding the root `graph.md`.
- Use the spec folder path relative to the root as the node slug, such as `sdd/sdd-skill`.
- Keep existing flat slugs unchanged.
- Preserve deterministic output ordering.

## Failure handling

| Condition | Behavior |
|---|---|
| No spec exists | Route to `create-spec`; ask whether the work is new-feature or backfill only if source inspection cannot decide |
| `$sdd` has no argument | Ask whether the user wants to create, backfill, revise, validate, implement, deprecate, manage, or refresh SDD artifacts |
| `approved` with requested scenario change | Refuse direct `.feature` edit and route to draft re-open path |
| Missing or conflicting lifecycle frontmatter | Route to `validate-spec` for state validation before implementation |
| User asks to install SDD | Explain that `sdd` is a gateway for opt-in workflow execution; project setup belongs outside this skill |

## Test strategy

- Mechanical skill audit for `plugins/sdd/skills/sdd`.
- `node:test` coverage for nested spec discovery in `render-spec-graph`.
- `pnpm verify` after implementation.

## Out of scope

- Reintroducing `init-sdd` or hook registration.
- Creating an eval suite for this skill.
- Changing `create-spec`, `validate-spec`, or `sdd-orchestrator` behavior beyond the routing guidance documented here.
