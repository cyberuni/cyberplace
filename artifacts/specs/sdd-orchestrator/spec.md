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
4. **Plugin delegates** — `aces-scenario-writer`, `aces-implementer`, `quill-writer`, `quill-implementer` — each its own agent definition, so each chooses its own model, effort, and context to match its workload. A participating plugin always provides a writer; the default writer runs only when no plugin is declared.

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

### The interface is the act; criteria are the plugin's bar

The plug-in point is a **behavior** — "write the `.feature` for this domain in this folder" — not a data hand-off. A participating plugin **always provides a writer** (an agent definition); SDD never classifies a domain as simple or complex. This mirrors the implementer side exactly: a domain either declares a writer (it acts) or it doesn't, in which case `sdd-scenario-writer` (the default) runs as the **no-plugin fallback** for plain code/lib/config. Quill's writer is thin (emits straightforward doc scenarios); ACES's is heavy (generates trigger near-misses) — same interface, different weight, no branch in SDD.

Criteria do not survive as an alternative to acting. They are the plugin's **bar** — the backward face every delegation surface carries. So a plugin provides both faces: the **writer** (forward, the act, always present) and its **criteria** (backward, enforced by `validate-spec` against the produced `.feature`, keeping `producer ≠ judge`). SDD's own bar is the universal format gate (valid Gherkin, boolean scenarios, lifecycle); the plugin's bar adds domain criteria (e.g., every agent scenario carries trigger context).

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

## Runtime workflow

### Suspend/resume: the skill owns the user-loop, the orchestrator owns one autonomous segment

A subagent has no user channel, yet the loops hit user-input checkpoints (grilling, reviewer confirmation, mid-loop clarifications). So the loop splits across two layers. Each orchestrator invocation runs **one autonomous segment** — as far as it can without the user — then returns either `complete` / `blocked`, or `needs-input` with the questions **batched**. The skill (main thread, has a user channel) asks the user and **re-invokes the orchestrator to resume**. The skill owns the loop-with-user and the iteration cap (session-local); the orchestrator stays stateless across segments.

Batch within a segment (never one question per iteration); expect **waves** across segments, since some questions only emerge after earlier ones are answered.

### Files are the state store; the workflow cursor is derived, not stored

Re-invocation is cold, but SDD already persists everything to disk, so "resume" = read the current files + the new answers. The workflow position is a **function of artifact state**, not a separate variable:

| Where you are | Read from |
|---|---|
| which phase | `status:` field |
| work in progress | `aligned: false` |
| what's blocking | count of `<!-- open: -->` markers |
| design done | `.feature` exists and passes validate-spec |

So no `questions.md`, no workflow journal — the process is resumable across sessions for free. Only the iteration count is session-local in the skill (the cap guards thrashing within one sitting; a deliberate return next session resetting it is acceptable).

### Questions: two kinds, two homes

- **Content gaps** (about the spec's content) → inline `<!-- open: ... -->` markers in the artifact that has the gap. Durable; they block Draft→Approved. The returned `QUESTIONS` batch is **derived** from these markers, not a parallel store. The marker rule generalizes by abstraction level: a spec-content gap → marker in `spec.md`; a plan/sequencing gap → marker in `plan.md`; a task ambiguity → marker in `tasks.md`.
- **Workflow-procedural questions** (reviewer set, mode, phase) → answered by the skill in the main thread; transient; never persisted; re-asked if unanswered.

### Four tiers of feedback, one per loop

The inner loop (writer → validator → implementer) is only one of three loops. Architect- and Curator-level concerns are `accept + deferred`, never blocking, and must **not** land in the triggering spec's markers:

| Tier | Loop | Owner | Blocks this spec? | Persists in |
|---|---|---|---|---|
| content gap | inner | Builder | yes | in-spec `<!-- open: -->` marker |
| workflow question | — | skill/human | no | nowhere (transient) |
| structural concern | product feedback edge | Architect | no (deferred) | product backlog (a new spec with `priority`/`blocked-by`, or `artifacts/backlog.md`) |
| durable lesson | outer loop | Curator | no (deferred) | append-only candidate queue → corpus (skill/governance/convention) |

Delegates emit a non-blocking **`OBSERVATIONS`** channel — the gate's `accept + deferred` axis — typed by owning actor (`architect` | `curator`). Detection is continuous and cheap (any delegate, as a side effect of its narrow job); the **decision is episodic and human**. Observations bubble plugin → orchestrator → skill → human; on accept the **skill** routes them out. The orchestrator never writes outside the spec it owns. Architect observations are surfaced at the spec's gate; Curator observations are appended to the candidate queue continuously but surfaced **only at boundaries** (the premature-codification guard — recurrence like "solved three times" needs the queue's memory to detect).

---

## Command surface / API

No CLI surface. The interface is the agent-dispatch I/O the orchestrator sends and each delegate returns.

**Uniform delegate output** — every delegate (writer, validator, implementer, plugin or default) returns these alongside its specific fields:
```
STATUS:       complete | needs-input | blocked
QUESTIONS:    [ batched user questions, derived from open markers ]   # when needs-input
OBSERVATIONS: [ { owner: architect | curator, note, evidence } ]      # non-blocking; may be empty
```
The orchestrator **aggregates** child `QUESTIONS` and `OBSERVATIONS` and returns them up to the skill; only the skill surfaces either to the user.

**scenario-writer delegate**
```
in:  DOMAIN, DOMAIN_PATH, SPEC_PATH, COMMAND_SURFACE, DESIGN_DECISIONS
out: writes <DOMAIN_PATH>/<DOMAIN>.feature (pure boolean Gherkin)
     returns SCENARIOS_WRITTEN, NOTES + uniform output
rule: output must pass validate-spec; must not modify spec.md
```

**implementer delegate**
```
in:  DOMAIN, DOMAIN_PATH, SPEC_PATH, FEATURE_PATH, PLAN_PATH, TASKS_PATH, IMPLEMENTATION_PATHS
out: IMPLEMENTATION_PASS, SCENARIOS_PASSING, SCENARIOS_FAILING, CHANGES_MADE, BLOCKER + uniform output
rule: owns the scenario→evaluation mapping; reports actual pass/fail per scenario;
      must not modify spec.md or the .feature
```

**Gherkin scenarios:** [sdd-orchestrator.feature](./sdd-orchestrator.feature)

---

## Change plan

Sequenced so the stable interface lands first, the cheap consumer proves it, then the complex consumer.

**1. SDD interface (do first).**
- Rename `sdd-author` → `sdd-orchestrator`; reduce it to one autonomous segment (discovery + dispatch + synthesis), no user interaction.
- **Extract the user-loop into the skills.** create-spec owns the grill; validate-spec owns the reviewer-confirm gate and the `status: approved` write. Each skill *is* its phase, so the `GOAL: auto` derivation drops out. The skill re-invokes the orchestrator to resume after each batched answer and owns the iteration cap.
- Add the uniform delegate output (`STATUS` / `QUESTIONS` / `OBSERVATIONS`); orchestrator aggregates and bubbles up. Skill routes `OBSERVATIONS` to backlog/corpus on human accept.
- Add default delegates `sdd-scenario-writer` (generic boolean Gherkin from criteria) and `sdd-implementer` (passing-tests check) as agent definitions.
- Repurpose `sdd-spec-designer` into the default writer's generation logic.
- `validate-spec` enforces criteria against any `.feature`, plugin-written or default.
- Delete `governances/`; fold I/O docs into the orchestrator + default delegates. `sdd-principles` → static AGENTS.md section.
- Update `artifacts/specs/sdd-plugin` spec + `.feature` to the orchestrator model.

**2. Quill (cheap consumer, proves a thin writer).**
- Replace `quill-scenario-advisor` with `quill-writer` — a thin writer agent-def that emits doc scenarios; its doc criteria become the plugin's bar enforced by validate-spec.
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
