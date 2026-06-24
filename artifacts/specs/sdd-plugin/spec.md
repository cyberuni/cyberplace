---
status: draft
type: project
blocked-by: []
aligned: true
approval:
  spec:
    verdict: approve
    by: unional
  impl:
    verdict: approve
    by: unional
reopened:
  - gate: spec
    from: implemented
    to: draft
    by: unional
    why: re-home the loop features as subtasks and reconcile sdd-operator project→feature (graph composition fix)
subtasks:
  - sdd-operator
  - sdd-mission-loop
  - sdd-doctrine-loop
  - sdd-campaign-loop
  - sdd-formation-loop
  - sdd-forge-loop
  - sdd-inject-channel
  - sdd-state-legality
  - sdd-stop-provenance
  - sdd-contract-registry
  - sdd-escape-hatch
  - sdd-gate-autonomy
  - sdd-provenance
  - sdd-spec-discovery
  - sdd-spec-graph
  - sdd/sdd-skill
  - sdd/spec-digest
  - sdd/split-spec
  - sdd/dedupe-specs
---

# Spec-Driven Development Plugin

---

## What

The SDD plugin packages the spec-driven workflow and exposes the user-facing skills that drive it. As the **project** spec for SDD, it stays high-level: it names the skills and agents the plugin ships, the lifecycle they enforce, and the **feature specs** that own each detailed rule. `sdd` is the user-invoked gateway that activates SDD, classifies the requested action, and routes the work to the right SDD skill; `create-spec` and `validate-spec` own the human-facing loop; `sdd-orchestrator` owns one autonomous segment at a time; domain plugins supply delegates for the production chain through the project registry. A spec is not just `spec.md` plus `.feature`: SDD co-delivers `spec.md`, `.feature`, `plan.md`, `tasks.md`, and implementation artifacts, with the spec gate firming the contract end and the impl gate firming the implementation end.

---

## Why

The earlier plugin model encoded SDD as a two-artifact, single-gate practice and routed domain expertise through scenario advisors and implementer contracts. The orchestrator design now defines a richer production chain, role-based plugin delegates, actor governances, layer-scoped alignment, and suspend/resume through skills. The plugin spec must define the installable practice that makes those rules available to agents and users without contradicting the orchestrator model — and it must do so by composing its feature specs rather than restating them, so the project spec cannot drift from the features it owns.

---

## Design decisions

### Skills own the user channel

User-facing skills (`sdd`, `create-spec`, and `validate-spec`) are the only SDD components that ask the user questions or write user-verdict frontmatter. The orchestrator is invoked by those skills, runs one autonomous segment, and returns `complete`, `needs-input`, or `blocked` with batched questions, content gaps, and observations.

### `sdd` is the workflow gateway

`sdd` replaces `init-sdd` as the plugin's default entry point. It is a lightweight gateway: it activates SDD for the current request, conducts a two-level intake menu when invoked bare, classifies the requested SDD action against an inlined routing table, and delegates the routed work to a subagent. It reads only `spec.md` frontmatter (and, conditionally, `tasks.md` and open markers) to route — never `plan.md` — and it does not load authoring governances or invoke `sdd-orchestrator` itself. It does not edit project guidance, register hooks, or require the `cyber-skills` CLI. It routes feature work to `create-spec` for draft contract creation, `validate-spec` for gates, and `render-spec-graph` for graph refreshes. The gateway's full contract is the feature spec `artifacts/specs/sdd/sdd-skill/spec.md`; this plugin spec does not restate its behavior.

### SDD workflow is active for feature work

When the user wants to add, change, backfill, validate, implement, or deprecate a feature under SDD, the agent first invokes the `sdd` gateway skill, which classifies the request and routes it to the right SDD action. The agent then follows the SDD lifecycle: draft the contract, pass the spec gate, implement against the frozen `.feature`, pass the impl gate, and keep `aligned` truthful for the current layer.

### The plugin exposes SDD governance as skills

Reference rules are delivered as non-user-invocable governance skills with `Internal skill:` descriptions: `sdd:lifecycle-governance` (lifecycle/routing rules and the frontmatter schema), `sdd:spec-governance` (universal boolean `.feature` and `spec.md` format bar), `sdd:ownership-governance` (artifact ownership boundaries), and `sdd:gate-validation-governance` (gate/judge validation rules). SDD skills and agents load these through the harness. Runtime SDD work does not call `governance show`.

### Specs are typed `project` and `feature`, composed by `subtasks`

Every spec declares a `type`. A `project` spec — like this one — is high-level: it composes a coherent body of work and owns no behavior beyond that composition. A `feature` spec owns one unit of behavior and its detailed scenarios. A project lists the features it owns in `subtasks`; each feature belongs to **exactly one** project, so composition stays a tree. `subtasks` is containment and is orthogonal to `blocked-by` execution dependency. This is why the project spec cross-references its feature specs (below) instead of restating their rules. The full schema and invariant live in `sdd:lifecycle-governance`; `render-spec-graph` renders the composition and enforces the single-parent tree.

---

## Feature specs

This project composes the feature specs below; each owns its detailed rules and scenarios. The project spec does not restate them.

| Feature spec | Owns |
|---|---|
| `sdd-orchestrator` | autonomous segment, delegate resolution from the registry, the five-artifact production chain, uniform delegate I/O, observations, content gaps |
| `sdd-contract-registry` | the `.agents/universal-plugin.json` `sdd-plugins` file shape, the five-role entry map, and idempotent init-write |
| `sdd-escape-hatch` | the SDD scope boundary — recognizing non-spec-able representation/meta-work and letting it escape the lifecycle (mechanism undecided) |
| `sdd-gate-autonomy` | legal state tuples, status transitions as gate decisions, layer-scoped `aligned`, the frozen-`.feature` reopen path |
| `sdd-provenance` | approval and provenance frontmatter (`approved-by`) |
| `sdd-spec-graph` | the derived spec DAG and composition rendering |
| `sdd-spec-discovery` | discovering specs and their state |
| `sdd/sdd-skill` | the `sdd` gateway contract |
| `sdd/spec-digest` | condensed spec digests |
| `sdd/split-spec` | splitting an oversized spec into features |
| `sdd/dedupe-specs` | detecting and reconciling duplicate specs |

---

## Spec format

The frontmatter schema (`status`, `type`, `aligned`, `blocked-by`, `subtasks`, `approved-by`, `domain-plugin`) and the required body sections are defined by `sdd:lifecycle-governance`; the universal `.feature` and `spec.md` format bar is defined by `sdd:spec-governance`. This plugin spec does not restate them. Specs must be formatted for human gate review: tables, diagrams, short paragraphs, and clear heading hierarchy when they make intent easier to inspect.

---

## Lifecycle

Exploration → spec gate → implementation → impl gate → deprecation. The autonomous production chain that runs each phase is owned by `sdd-orchestrator`; gate mechanics, legal state tuples, and layer-scoped `aligned` by `sdd-gate-autonomy`; approval provenance by `sdd-provenance`. At a glance: exploration runs while `draft`; the spec gate moves `draft → approved` and freezes the `.feature`; implementation runs against the frozen `.feature`; the impl gate moves `approved → implemented`; deprecation is a Director decision that retains the spec for history.

---

## Skill surface

No CLI surface is required. The plugin exposes skills and agents.

```text
sdd
  in: user intent to work on a feature under SDD
  out: the requested SDD action classified and routed to create-spec, validate-spec, or render-spec-graph

create-spec <domain-or-path>
  in: user brief, existing artifacts if any, optional iteration cap
  out: spec.md, .feature, plan.md, tasks.md as available, batched questions when blocked

validate-spec <spec-path> [--target spec|impl]
  in: spec folder, target gate inferred when omitted
  out: gate report, status/aligned updates on human approval
```

`create-spec` and `validate-spec` invoke `sdd-orchestrator`; they do not call specialist domain agents directly.

---

## Agent surface

```text
sdd-orchestrator
  owns: one autonomous segment, delegate resolution, dispatch, synthesis

sdd-scenario-writer
  role: default spec-producer

sdd-planner
  role: default plan-producer

sdd-spec-judge
  role: default spec-judge; invoked by validate-spec

sdd-implementer
  role: default impl-judge
```

The generic Builder is the default impl-producer when no plugin agent fills the role. The uniform delegate I/O contract (`STATUS`, `QUESTIONS`, `CONTENT_GAPS`, `OBSERVATIONS`) is owned by `sdd-orchestrator`.

---

**Gherkin scenarios:** [spec-driven-development.feature](./spec-driven-development.feature)

---

## Related

- `artifacts/specs/sdd-orchestrator/spec.md` — delegate model, production chain, gates, and uniform I/O
- `artifacts/specs/sdd-contract-registry/spec.md` — the `sdd-plugins` registry file shape and init-write
- `artifacts/specs/sdd-escape-hatch/spec.md` — the SDD scope boundary and escape path for non-spec-able work
- `artifacts/specs/sdd-gate-autonomy/spec.md` — legal state tuples and gate autonomy checks
- `artifacts/specs/sdd-provenance/spec.md` — approval and provenance frontmatter
- `artifacts/specs/sdd-spec-graph/spec.md` — derived spec DAG rendering
- `artifacts/specs/sdd/sdd-skill/spec.md` — the `sdd` gateway contract
- `artifacts/adr/0013-governance-skills.md` — governance skills replacing `governance show`

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-plugin/spec.md` |
| Scenarios | `artifacts/specs/sdd-plugin/spec-driven-development.feature` |
| Plan | `artifacts/specs/sdd-plugin/plan.md` |
| Tasks | `artifacts/specs/sdd-plugin/tasks.md` |
| Legacy governances | `artifacts/specs/sdd-plugin/governances/` |
| Plugin agents | `plugins/sdd/agents/` |
| Plugin skills | `plugins/sdd/skills/` |
