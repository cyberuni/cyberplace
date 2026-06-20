---
status: draft
priority: 1
blocked-by: []
aligned: false
---

# SDD Orchestrator & the Plugin-Delegate Model

---

## What

SDD owns the spec-driven workflow and runs the loop. Domain plugins (ACES for agent configurations, Quill for documentation) augment that loop by supplying **delegates** that perform two acts SDD does not hard-code: writing the `.feature` scenarios and verifying the implementation against them.

The architecture has four moving parts:

1. **`sdd-orchestrator`** (renamed from `sdd-author`) — the lead delegate. It runs the loop, discovers plugin delegates from `plan.md` Plugin assignments, dispatches each act, and synthesizes results (sets `aligned`). It does discovery and dispatch itself; there is no separate dispatcher agent.
2. **Two act-interfaces** the orchestrator dispatches to, symmetric to each other:
   - **scenario-writer** — produces the `.feature` (pure boolean Gherkin) for a domain.
   - **implementer** — verifies the implementation and returns a **boolean pass/fail per scenario**.
3. **Default delegates** — `sdd-scenario-writer` and `sdd-implementer` — the built-in fallback implementations of those two interfaces, invoked only when no plugin delegate is declared for a sub-domain.
4. **Plugin delegates** — `aces-scenario-writer`, `aces-implementer`, `quill-implementer` — each its own agent definition, so each chooses its own model, effort, and context to match its workload.

Dispatch is uniform: the orchestrator invokes a writer-delegate (plugin-named or the `sdd-scenario-writer` default), then an implementer-delegate (plugin-named or the `sdd-implementer` default). Same input/output contract either way.

---

## Why

The existing design split each act into a dispatcher agent plus a contract governance plus an advisory agent. Three problems:

- **The dispatcher layer is dead weight.** A plugin knows how heavy its own work is, so it must own its delegation surface — an agent definition that picks its own model and effort. Routing through a generic dispatcher agent adds an indirection that owns nothing.
- **The write side was asymmetric to the verify side.** Verification already delegated the *act* to a plugin implementer; scenario-writing kept the act in SDD and let plugins only *advise* with data. The two sides should be the same shape.
- **Governances had nothing left to be.** Once the interface is "an agent the orchestrator invokes," the contract is just the orchestrator's documented I/O plus the default delegates as reference implementations. Criteria-style governances become either delegate behavior or `validate-spec` checks. So the `governances/` layer dissolves — which also removes a `governance show` runtime call, a step toward eliminating the NodeJS dependency from the loop.

---

## Design decisions

### Format authority is validation, not a write monopoly

SDD owning the `.feature` format means SDD owns the **validation gate** — any `.feature`, whoever wrote it, must pass `validate-spec` (valid Gherkin, boolean scenarios, lifecycle rules). It does **not** mean SDD writes the file. Once format authority is located in validation, the act of writing can safely be delegated, because SDD still polices the output.

### The interface is the act; information is its criteria

The plug-in point is a **behavior** — "write the `.feature` for this domain in this folder" — not a data hand-off. The former advisory data (required fields, forbidden patterns, examples) is demoted to two non-interface jobs: the **input to the default writer**, and the **criteria `validate-spec` enforces** even against a plugin-written `.feature`. Information survives as discipline, not as the contract. Simple domains (Quill) plug in by supplying criteria and using the default writer; domains that must *generate* scenarios (ACES near-misses) override the act with their own writer.

### Scenario-writer and implementer are symmetric act-interfaces with default fallbacks

Both interfaces have the same shape: a plugin delegate may implement them, or the SDD default delegate runs. The implementer side already had this fallback ("when no implementer declared, check passing tests exist"); the writer side now gets the same — a default writer driven by criteria.

### Default delegates are agent definitions, not skills

`sdd-scenario-writer` and `sdd-implementer` are agent definitions so dispatch is uniform — the orchestrator invokes default and plugin delegates through one identical I/O surface, and each default can set its own model/effort like any plugin delegate.

### The rubric is a validation-detail, owned by the implementer

A scenario's outcome is **boolean**: the spec says the agent *does* X, not *does X some of the time*. For a non-deterministic subject, the implementer reaches that boolean through a rubric + judge + threshold over N runs — `score >= threshold` collapses the grade back to pass/fail. The rubric is the implementer's private evaluation suite, keyed to scenario by name, never embedded in the `.feature`. This mirrors implementation-detail: the scenario hides *how it is built* (code) and equally hides *how it is judged* (rubric). The three implementers are one interface, three verification methods:

| Implementer | Scenario passes when | Subject |
|---|---|---|
| `sdd-implementer` (default) | a passing test exists | deterministic code |
| `quill-implementer` | static doc inspection holds | deterministic doc |
| `aces-implementer` | judge-score ≥ threshold over N runs | non-deterministic agent |

### The orchestrator is a delegate; the Conductor is the human

Per the motive model, the **Conductor is the actor** (the human holding motive and accountability) and the **orchestrator is the delegate pattern** it wields; collapsing them folds an actor into a delegate. `sdd-author` is that orchestrating delegate, so it is renamed `sdd-orchestrator`, not `sdd-conductor`. The human running SDD is the Conductor.

### Governances dissolve into delegates and validator checks

The SDD-family contract and criteria governances are removed. The interface I/O lives in the orchestrator definition plus the default delegates as reference implementations. `sdd-principles` becomes the static `## Spec-Driven Development` section in AGENTS.md (no `governance show`). Repo-wide governance retirement (`packages/cyber-skills/governances/`, the `define-governance` skill) is a separate, larger decision and is out of scope here.

---

## Command surface / API

No CLI surface. The interface is the agent-dispatch I/O the orchestrator sends and each delegate returns.

**scenario-writer delegate**
```
in:  DOMAIN, DOMAIN_PATH, SPEC_PATH, COMMAND_SURFACE, DESIGN_DECISIONS
out: writes <DOMAIN_PATH>/<DOMAIN>.feature (pure boolean Gherkin)
     returns SCENARIOS_WRITTEN, NOTES
rule: output must pass validate-spec; must not modify spec.md
```

**implementer delegate**
```
in:  DOMAIN, DOMAIN_PATH, SPEC_PATH, FEATURE_PATH, PLAN_PATH, TASKS_PATH, IMPLEMENTATION_PATHS
out: IMPLEMENTATION_PASS, SCENARIOS_PASSING, SCENARIOS_FAILING, CHANGES_MADE, BLOCKER
rule: owns the scenario→evaluation mapping; reports actual pass/fail per scenario;
      must not modify spec.md or the .feature
```

**Gherkin scenarios:** [sdd-orchestrator.feature](./sdd-orchestrator.feature)

---

## Change plan

Sequenced so the stable interface lands first, the cheap consumer proves it, then the complex consumer.

**1. SDD interface (do first).**
- Rename `sdd-author` → `sdd-orchestrator`; absorb discovery + dispatch + synthesis into it.
- Add default delegates `sdd-scenario-writer` (generic boolean Gherkin from criteria) and `sdd-implementer` (passing-tests check) as agent definitions.
- Repurpose `sdd-spec-designer` into the default writer's generation logic.
- `validate-spec` enforces criteria against any `.feature`, plugin-written or default.
- Delete `governances/`; fold I/O docs into the orchestrator + default delegates. `sdd-principles` → static AGENTS.md section.
- Update `artifacts/specs/sdd-plugin` spec + `.feature` to the orchestrator model.

**2. Quill (cheap consumer, proves the default path).**
- Reframe `quill-scenario-advisor` as the criteria contribution to the default writer; Quill uses the default writer.
- Keep `quill-implementer`; confirm boolean-per-scenario output.
- Update Quill spec + `.feature`.

**3. ACES (act-override consumer, proves rubric-as-validation-detail).**
- Split `aces-spec-designer` → `aces-scenario-writer` (writes boolean Gherkin: trigger near-misses + behavior cases); delete its spec.md-authoring half.
- Add `aces-implementer` owning the scenario→rubric map; `aces-judge` becomes its internal.
- Delete `aces-spec-validator` and `aces:create-spec` (absorbed by SDD); `run`/`compare`/`report` become thin reporting over implementer output.
- Reframe `aces:skill-spec-schema` as agent-scenario criteria inside `aces-scenario-writer`. Retire `aces:define-governance` deferred to the repo-wide call.
- Update ACES specs + `.feature` files.

**4. NodeJS sweep.**
- `init-sdd` drops `governance show`; principles go static in AGENTS.md.
- Keep NodeJS only for CI-time numeric aggregation (pass-rate, threshold math), which never re-enters the runtime loop.

---

## Related

- `artifacts/specs/sdd-plugin/spec.md` — the SDD practice this orchestrates
- `artifacts/specs/motive-model/spec.md` — Conductor (actor) vs orchestrator (delegate pattern); the delegation-surface vocabulary
- `artifacts/specs/aces-skill-spec-schema/spec.md` — agent-scenario criteria, to be reframed into `aces-scenario-writer`
- `plugins/sdd/governances/` — to be dissolved
- `plugins/quill/` , `plugins/aces/` — the two consumer plugins to migrate

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/sdd-orchestrator/spec.md` |
| Scenarios | `artifacts/specs/sdd-orchestrator/sdd-orchestrator.feature` |
