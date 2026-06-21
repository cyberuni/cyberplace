---
status: draft
blocked-by: []
aligned: true
---

# Spec-Driven Development Plugin

---

## What

The SDD plugin installs the spec-driven workflow into a project and exposes the user-facing skills that drive it. `init-sdd` installs the persistent project guidance and governance skill; `create-spec` and `validate-spec` own the human-facing loop; `sdd-orchestrator` owns one autonomous segment at a time; domain plugins supply delegates for the production chain through the project registry. A spec is not just `spec.md` plus `.feature`: SDD co-delivers `spec.md`, `.feature`, `plan.md`, `tasks.md`, and implementation artifacts, with the spec gate firming the contract end and the impl gate firming the implementation end.

---

## Why

The earlier plugin model encoded SDD as a two-artifact, single-gate practice and routed domain expertise through scenario advisors and implementer contracts. The orchestrator design now defines a richer production chain, role-based plugin delegates, actor governances, layer-scoped alignment, and suspend/resume through skills. The plugin spec must define the installable practice that makes those rules available to agents and users without contradicting the orchestrator model.

---

## Design decisions

### Skills own the user channel

User-facing skills (`create-spec`, `validate-spec`, and `init-sdd`) are the only SDD components that ask the user questions or write user-verdict frontmatter. The orchestrator is invoked by those skills, runs one autonomous segment, and returns `complete`, `needs-input`, or `blocked` with batched questions, content gaps, and observations.

### The orchestrator owns autonomous workflow synthesis

`sdd-orchestrator` reads the current artifacts, resolves delegates, dispatches producers and judges, aggregates uniform delegate output, writes coordination markers when needed, and sets `aligned` according to the layer being judged. It does not ask the user, scan plugin directories, or write gate verdict fields.

### The production chain has five artifacts

Every SDD work unit is modeled as a co-delivered chain:

| Artifact | Producer | Judged by |
|---|---|---|
| `spec.md` | human + spec-producer | spec gate context |
| `.feature` | spec-producer | spec-judge |
| `plan.md` | plan-producer | implementation result transitively |
| `tasks.md` | plan-producer | implementation result transitively |
| implementation + verification | impl-producer | impl-judge |

Plan and tasks have no separate gate. They are produced with the contract during exploration, updated as understanding changes, and validated transitively when the implementation passes.

### The plugin installs SDD governance as a skill

Reference rules are delivered as `sdd:spec-governance`, a non-user-invocable governance skill with an `Internal skill:` description. It contains the universal `.feature` format bar, scenario-ordering convention, and human-readable `spec.md` enrichment rules. SDD agents and plugin spec-producers load this skill through the harness. Runtime SDD work does not call `governance show`.

### `init-sdd` installs project guidance, not the whole contract

`init-sdd` writes or replaces the SDD section in `AGENTS.md` and registers the SessionStart hook so agents see the persistent freeze, ownership, and artifact-alignment rules. Detailed criteria live in `sdd:spec-governance`; `AGENTS.md` carries only the small always-on rules needed outside explicit SDD skill execution.

### Domain plugins register resolved delegates at setup

Each domain plugin's `init-<plugin>` skill writes a canonical entry to `.agents/universal-plugin.json` under `sdd-plugins[]`. The entry includes domain coverage, the five role bindings, actor-governance bindings, and the plugin version. Re-running init rewrites old-shape entries to the current role-map shape and reconciles version drift.

```json
{
  "sdd-plugins": [
    {
      "name": "<plugin>",
      "version": "x.y.z",
      "domains": ["..."],
      "roles": {
        "spec-producer": "<agent>",
        "plan-producer": null,
        "spec-judge": null,
        "impl-producer": "<agent>",
        "impl-judge": "<agent>"
      },
      "governances": {
        "framer": null,
        "builder": "<skill>",
        "architect": null
      }
    }
  ]
}
```

`null` means the role or governance degenerates to the SDD default. Missing role keys fall back to the `<plugin>-<role>` naming convention. Runtime resolution reads only this registry.

### `plan.md` is not a plugin assignment source

Plugin resolution is upstream of `plan.md`. The orchestrator resolves a domain from `.agents/universal-plugin.json` and any `domain-plugin` frontmatter disambiguation before dispatching the plan-producer. `plan.md` describes the solution and may record the chosen architecture, but it never controls delegate resolution.

### Ambiguous domain coverage suspends to the skill

When multiple registered plugins claim a domain and `spec.md` has no `domain-plugin` frontmatter choice, the orchestrator returns `needs-input`. The skill asks the user, writes the selected plugin into the `domain-plugin` frontmatter map, and resumes the orchestrator. The resolver reads that map before counting candidates, so resume is decisive.

### `aligned` is layer-scoped

At the spec gate, `aligned: true` means the contract layer is in sync: `spec.md` and `.feature` agree and the spec-judge bar passes. At the impl gate, `aligned: true` means the implementation layer conforms to the frozen `.feature`. Spec-gate validation must not require implementation artifacts to exist.

### Status transitions are gate decisions

`status: draft` means the contract is still forming. `status: approved` means the contract passed the spec gate and `.feature` is frozen. `status: implemented` means the implementation passed the impl gate against the frozen `.feature`. `status: deprecated` means the feature was removed or superseded and the spec is retained for history.

### The frozen `.feature` can reopen only through a gate

After approval, scenarios do not change to match implementation. A fatal behavior gap or invalid contract reverts the spec to `draft` through the Framer revert path; then the spec-producer may rewrite the contract and the spec must pass the spec gate again.

### Open questions are durable content gaps

Content gaps are persisted as inline `<!-- open: ... -->` markers in the artifact that owns the gap. Draft specs may contain open markers, but Draft -> Approved is blocked while any remain. Workflow-procedural questions are transient skill questions and are never written into artifacts.

### Observations spawn specs, not side queues

Delegates may return non-blocking `OBSERVATIONS` owned by `architect` or `curator`. The orchestrator bubbles them up; the skill surfaces them at the appropriate boundary; accepted observations become new specs or recurrence updates on existing candidate specs. The orchestrator never writes outside the current spec.

### `tasks.md` is a DAG

`tasks.md` contains executable units with IDs, dependency edges, scenario traceability, and target paths. Execution order emerges from the graph. The file is live during implementation and may be regenerated as the plan changes.

### The spec DAG is authoritative for cross-spec ordering

`blocked-by` in spec frontmatter is the only authored cross-spec dependency edge. `artifacts/specs/graph.md` is a derived Mermaid view generated from those edges and must not become a second source of truth.

---

## Spec format

Every `spec.md` has YAML frontmatter:

```yaml
status: draft | approved | implemented | deprecated
blocked-by: []
aligned: true | false
approved-by:
  spec:
    by: <name>
  impl:
    by: <name>
domain-plugin:
  <domain>: <plugin>
```

`approved-by` is written by the skill at gate time when approval is recorded. `domain-plugin` is written only after user disambiguation. Optional fields are omitted when not applicable.

Required body sections:

| Section | Required | Content |
|---|---|---|
| `What` | Yes | Observable behavior and scope |
| `Why` | Yes | Gap being closed and reason to do the work |
| `Design decisions` | Yes when choices exist | Normative rules and constraints |
| Surface section | Yes when public surface exists | CLI, API, props/events, file format, or equivalent |
| `Gherkin scenarios` | Yes | Link to the `.feature` file |
| `Artifacts` | Yes once artifacts exist | Project-root-relative paths belonging to this spec |

Specs must be formatted for human gate review. Use tables, diagrams, short paragraphs, and clear heading hierarchy when they make intent easier to inspect.

---

## Lifecycle

### Exploration

Exploration runs while the spec is `draft`. The spec-producer writes or revises `spec.md` and `.feature`; the plan-producer writes `plan.md` and `tasks.md`; forward producers may run in `explore` mode to spike the draft contract. Explore output is scaffolding that may be discarded or promoted. Discoveries return as content gaps and observations that feed back into the contract.

### Spec Gate

The spec gate moves `draft` to `approved`. `validate-spec` invokes `sdd-spec-judge`, which runs optional deterministic checks plus agent-level reasoning. The gate checks the contract layer only: required sections, no unresolved content gaps, valid ordered boolean Gherkin, domain criteria, reviewer acknowledgment, and legal state tuple. On pass, the skill records approval, sets status to `approved`, and the `.feature` becomes frozen.

### Implementation

Implementation runs while the spec is `approved`. Forward producers run in `implement` mode against the frozen `.feature`. The impl-producer writes the implementation and its verification, one check or evaluation per frozen scenario. The impl-judge runs that verification and adds structural or scope judgment as needed.

### Impl Gate

The impl gate moves `approved` to `implemented`. `validate-spec` invokes the impl-side path through the orchestrator, and the implementation passes only when every frozen scenario has a passing result. On pass, the skill records implementation approval and the orchestrator sets impl-layer alignment.

### Deprecation

Deprecation is a Framer decision. The spec remains in the graph for history, but downstream work must not treat it as an implementable ready node.

---

## Skill surface

No CLI surface is required. The plugin exposes skills and agents.

```text
init-sdd
  in: project root
  out: AGENTS.md SDD section, SessionStart hook registration, sdd:spec-governance available

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

The generic Builder is the default impl-producer when no plugin agent fills the role.

Uniform delegate output:

```text
STATUS: complete | needs-input | blocked
QUESTIONS: [batched user questions]
CONTENT_GAPS: [{ artifact, location, gap }]
OBSERVATIONS: [{ owner: architect | curator, note, evidence }]
```

---

**Gherkin scenarios:** [spec-driven-development.feature](./spec-driven-development.feature)

---

## Related

- `artifacts/specs/sdd-orchestrator/spec.md` — delegate model, production chain, gates, registry, and uniform I/O
- `artifacts/specs/sdd-gate-autonomy/spec.md` — legal state tuples and gate autonomy checks
- `artifacts/specs/sdd-provenance/spec.md` — approval and provenance frontmatter
- `artifacts/specs/sdd-spec-graph/spec.md` — derived spec DAG rendering
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
