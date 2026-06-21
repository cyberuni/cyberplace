# Plan: SDD Skill Context Workflow

## Approach

Tighten `sdd` from a short list of SDD surfaces into a context skill that gives the agent enough operational rules to route feature work without guessing.

The skill should remain documentation-only: no scripts, no CLI, no project-file writes. Its value is loading the SDD lifecycle, frozen-contract rules, and routing table into context before an agent touches a feature.

## Skill behavior

The skill body should be organized around four decisions:

1. **Load context** — identify the SDD skills, agents, and `sdd:spec-governance` dependency that are active for the work.
2. **Read lifecycle state** — inspect existing `spec.md`, `.feature`, `plan.md`, and `tasks.md` when present.
3. **Route by state** — send draft work to `create-spec`, gate work to `validate-spec`, approved implementation to the frozen-feature path, and graph refreshes to `render-spec-graph`.
4. **Report next action** — tell the user which SDD path is active and which constraints apply.

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
| `approved` with requested scenario change | Refuse direct `.feature` edit and route to draft re-open path |
| Missing or conflicting lifecycle frontmatter | Route to `validate-spec` for state validation before implementation |
| User asks to install SDD | Explain that `sdd` loads context only; project setup belongs outside this skill |

## Test strategy

- Mechanical skill audit for `plugins/sdd/skills/sdd`.
- `node:test` coverage for nested spec discovery in `render-spec-graph`.
- `pnpm verify` after implementation.

## Out of scope

- Reintroducing `init-sdd` or hook registration.
- Creating an eval suite for this skill.
- Changing `create-spec`, `validate-spec`, or `sdd-orchestrator` behavior beyond the routing guidance documented here.
