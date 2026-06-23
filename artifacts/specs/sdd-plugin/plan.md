# Plan: Spec-Driven Development Plugin

## Architecture

The SDD plugin is the installable workflow surface around `sdd-orchestrator`.

```text
User
  |
  |-- sdd
  |     gateway: activates SDD, conducts intake, classifies the action
  |     routes to create-spec, validate-spec, or render-spec-graph
  |     delegates the routed work to a subagent
  |
  |-- create-spec
  |     owns grilling, batched user questions, and resume
  |     invokes sdd-orchestrator for autonomous segments
  |
  |-- validate-spec
        owns gate confirmation and status/provenance writes
        invokes sdd-orchestrator and sdd-spec-judge for gate reports
```

`sdd-orchestrator` is not the user-facing command surface. It is the autonomous segment runner: read files, resolve delegates, dispatch roles, aggregate output, set `aligned`, and return status to the calling skill.

## Production Chain

SDD co-delivers five artifacts:

| Artifact | Producer | Notes |
|---|---|---|
| `spec.md` | human + spec-producer | intent, scope, decisions, surface |
| `.feature` | spec-producer | boolean contract |
| `plan.md` | plan-producer | solution shape |
| `tasks.md` | plan-producer | executable DAG |
| implementation + verification | impl-producer | built against draft in explore, frozen feature in implement |

The spec gate judges the contract end. The impl gate judges the implementation end. There is no plan gate and no task gate.

## Skills

### `sdd`

The user-invoked **gateway**. It activates SDD for the current request, conducts a two-level intake menu when invoked bare, classifies the requested SDD action against an inlined routing table, and delegates the routed work to a subagent. For routing it reads only `spec.md` frontmatter (and, conditionally, `tasks.md` and open markers) — never `plan.md`. It does not author documents, invoke `sdd-orchestrator` itself, or load authoring governances; and it does not write `AGENTS.md`, register hooks, or require the `cyber-skills` CLI.

The gateway's own contract is specified separately in `artifacts/specs/sdd/sdd-skill/spec.md`; this plan does not restate its behavior, to avoid drift. The reference bar that producers and judges load is `sdd:spec-governance` — loaded by those delegates through the harness, not by the `sdd` gateway and not via `governance show`.

### `create-spec`

Owns the user loop while a spec is in exploration:

1. Collect enough user intent to start.
2. Invoke `sdd-orchestrator`.
3. Ask batched questions when the orchestrator returns `needs-input`.
4. Resume the orchestrator with answers.
5. Surface content gaps and observations separately.

The skill writes user-owned frontmatter only when needed, such as `domain-plugin` after disambiguation. It does not call domain agents directly.

### `validate-spec`

Owns both gate transitions:

| Target | Transition | Checks |
|---|---|---|
| spec gate | `draft` -> `approved` | contract layer, open markers, spec-judge, reviewer acknowledgment |
| impl gate | `approved` -> `implemented` | frozen scenarios, implementation verification, impl-judge |

On human approval, `validate-spec` writes `status` and approval provenance. The orchestrator sets `aligned` for the judged layer.

## Agents

| Agent | Role |
|---|---|
| `sdd-orchestrator` | autonomous segment runner and synthesizer |
| `sdd-scenario-writer` | default spec-producer |
| `sdd-planner` | default plan-producer |
| `sdd-spec-judge` | default spec-judge, invoked by `validate-spec` |
| `sdd-implementer` | default impl-judge |

The generic Builder is the default impl-producer when no plugin fills that role.

## Delegate Resolution

Domain plugin resolution is setup-time, not runtime scanning.

Each plugin's `init-<plugin>` skill writes a resolved entry into `.agents/universal-plugin.json`:

```json
{
  "sdd-plugins": [
    {
      "name": "quill",
      "version": "1.2.0",
      "domains": ["documentation", "guide"],
      "roles": {
        "spec-producer": "quill-writer",
        "plan-producer": null,
        "spec-judge": null,
        "impl-producer": "quill-doc-writer",
        "impl-judge": "quill-implementer"
      },
      "governances": {
        "director": null,
        "builder": "quill-doc-bar",
        "architect": null
      }
    }
  ]
}
```

The orchestrator reads only this registry. It does not scan plugin directories and does not use `plan.md` for plugin assignments. If two plugins claim the same domain, the orchestrator returns `needs-input`; the skill asks the user and writes `domain-plugin` in `spec.md` frontmatter.

## Alignment

`aligned` is scoped to the active gate:

| State | Meaning |
|---|---|
| `draft` + `aligned: false` | contract is being explored or has unresolved markers |
| `draft` + `aligned: true` | contract layer is synced and ready for spec-gate review |
| `approved` + `aligned: false` | implementation layer is in progress |
| `approved` + `aligned: true` | implementation satisfies the frozen contract |

Illegal tuples are rejected by validation. `aligned: true` on a draft spec is not implementation completion.

## Backfill

Backfill is exploration, not reverse-approval. `create-spec` may inspect existing code, tests, and history to infer intent, but it must present the inferred contract for user confirmation before the spec-producer writes or freezes scenarios.

## Deprecated Material

The old scenario-advisor and implementer-contract governances are superseded by the five-role delegate model:

- `scenario-advisor` -> `spec-producer` plus `spec-judge`
- `implementer contract` -> `impl-producer` plus `impl-judge`
- `sdd-author` -> `sdd-orchestrator`
- `plan.md ## Plugin assignments` -> `.agents/universal-plugin.json` `sdd-plugins[]`

The `artifacts/specs/sdd-plugin/governances/` directory remains listed as a legacy artifact until implementation removes or migrates those files into `sdd:spec-governance`.

## Open Design Questions

1. Whether `plan-producer` should later split into separate plan and task producers.
2. How project-specific quality thresholds are represented for the default impl path.
3. How accepted architect and strategist observations should be routed when they target an external tracker.
