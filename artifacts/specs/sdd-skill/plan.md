# Plan: SDD Gateway Skill Workflow

## Approach

Tighten `sdd` from a short list of SDD surfaces into a gateway skill that gives the agent enough operational rules to activate SDD, conduct intake, and route creation work without guessing.

The skill should remain documentation-only: no scripts, no CLI, no project-file writes. Its value is serving as the explicit SDD entrypoint: it loads the SDD lifecycle, frozen-contract rules, and routing table into context before an agent touches the artifact being created or changed.

## Skill behavior

The skill body should be organized around six decisions:

1. **Activate SDD** — recognize explicit `$sdd`, "use SDD", or Spec-Driven Development creation-work requests.
2. **Conduct intake** — when the request has no work item or action, ask which SDD route the user wants.
3. **Load context** — identify the SDD skills, agents, and `sdd:spec-governance` dependency that are active for the work.
4. **Read lifecycle state** — inspect existing `spec.md`, `.feature`, `plan.md`, and `tasks.md` when present.
5. **Route by state** — send draft work to `create-spec`, gate work to `validate-spec`, approved implementation to the frozen-contract path, and graph refreshes to `render-spec-graph`.
6. **Report next action** — tell the user which SDD path is active and which constraints apply.

## Failure handling

| Condition | Behavior |
|---|---|
| No spec exists | Route to `create-spec`; ask whether the work is net-new or backfill only if source inspection cannot decide |
| `$sdd` has no argument | Ask whether the user wants to create, backfill, revise, validate, implement, deprecate, manage, or refresh SDD artifacts |
| `approved` with requested scenario change | Refuse direct `.feature` edit and route to draft re-open path |
| Missing or conflicting lifecycle frontmatter | Route to `validate-spec` for state validation before implementation |
| User asks to install SDD | Explain that `sdd` is a gateway for opt-in workflow execution; project setup belongs outside this skill |

## Test strategy

- Mechanical skill audit for `plugins/sdd/skills/sdd`.
- `pnpm verify` after implementation.

## Vocabulary + signal-routing revision

A later revision tightens two gateway behaviors:

- **Workflow vocabulary** — user-facing routes are named by workflow action (Draft spec, Revise spec, Backfill spec, Review at the spec gate, Review at the impl gate, Refresh spec graph), never by the underlying skill or CLI name.
- **Complete-draft auto-routing** — a `draft` with all tasks checked and no open markers routes straight to "Review at the spec gate" without offering revise; open tasks or markers route to "Revise spec" naming the open items; inconclusive signals present both. The digest of what is being reviewed is surfaced by `validate-spec` at the gate, not by the gateway.

## Out of scope

- Reintroducing `init-sdd` or hook registration.
- Creating an eval suite for this skill.
- Changing `create-spec`, `validate-spec`, `sdd-operator`, or `render-spec-graph` behavior beyond the routing guidance documented here.
