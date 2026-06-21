---
status: draft
priority: 1
blocked-by: []
aligned: false
---

# SDD Orchestrator & the Plugin-Delegate Model

---

## What

SDD owns the spec-driven workflow and runs the loop. Domain plugins (ACES for agent configurations, Quill for documentation) augment that loop by supplying **delegates** for the roles SDD does not hard-code — producing and judging the `.feature`, and producing and judging the implementation against it (the 2×2 below).

The architecture has four moving parts:

1. **`sdd-orchestrator`** (renamed from `sdd-author`) — the lead delegate. It runs the loop, discovers plugin delegates from `plan.md` Plugin assignments, dispatches each act, and synthesizes results (sets `aligned`). It does discovery and dispatch itself; there is no separate dispatcher agent.
2. **Four roles in a 2×2** — two objects (the **spec** = `.feature`, the **impl** = the built artifact) × two faces (**produce** / **judge**). The orchestrator dispatches to whichever are declared:

   | | Produce (forward) | Judge (backward) |
   |---|---|---|
   | **Spec** | spec-producer | spec-judge |
   | **Impl** | impl-producer | impl-judge |

3. **Default delegates** — `sdd-scenario-writer` (spec-producer) and `sdd-implementer` (impl-judge) — the built-in fallbacks, invoked only when no plugin fills the cell.
4. **Plugin delegates** — each its own agent definition (own model/effort/context). A full domain plugin fills all four cells; thin domains let cells degenerate (see *The 2×2* under Design decisions).

Dispatch is uniform and per-cell: the orchestrator resolves each role to a plugin agent or the SDD default, and invokes it through one identical I/O surface.

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

### The interface is the act, not data

The plug-in point is a **behavior** — "produce the `.feature` for this domain" — not a data hand-off. SDD never classifies a domain as simple or complex: a cell is either filled by a plugin agent (it acts) or it isn't (it degenerates — see *The 2×2*). The **spec-producer** is always filled — by a plugin agent or the `sdd-scenario-writer` default; the other three cells fill or degenerate per domain.

Criteria do not survive as a separate plug-in path. They are the **bar** — the judge face of each object (spec-judge, impl-judge). SDD's own bar is the universal format gate (valid Gherkin, boolean scenarios, lifecycle), enforced by `validate-spec` and keeping `producer ≠ judge`. A domain's bar adds its own criteria (e.g., every agent scenario carries trigger context), enforced by its **spec-judge** — a judge agent when the bar needs judgment, static criteria when it does not.

### The 2×2: two objects × two faces — the four roles

The plug-in surface is not "two act-interfaces" but a **2×2**: two objects (the **spec** = `.feature`, the **impl** = the built artifact) × two faces (**produce** / **judge**). Four roles:

| | Produce (forward) | Judge (backward) |
|---|---|---|
| **Spec** | **spec-producer** — writes the `.feature` | **spec-judge** — judges the `.feature` against the domain bar |
| **Impl** | **impl-producer** — builds the artifact | **impl-judge** — judges the artifact against the frozen `.feature` |

Naming is **producer / judge**, not writer: the motive model's forward-face verb is *produce* and its named constraint is **`producer ≠ judge`** (the four-eyes echo). The role names make that constraint self-documenting — spec-producer ≠ spec-judge, impl-producer ≠ impl-judge. Concrete agents may keep readable names (`aces-scenario-writer` *is* the spec-producer); only the role keys are fixed vocabulary.

**Each row is a gate's inner loop** — produce ⇄ judge → gate. These are the two loops SDD is built on:

- **Exploratory loop** = the spec row: spec-producer ⇄ spec-judge → spec gate → freeze `.feature`.
- **Implementation loop** = the impl row: impl-producer ⇄ impl-judge → impl gate → Implemented.

**A full domain plugin fills all four cells; thin domains let cells degenerate:**

| Cell | ACES (agent config) | Quill (documentation) | Plain code (no plugin) |
|---|---|---|---|
| spec-producer | `aces-scenario-writer` | `quill-writer` | `sdd-scenario-writer` (default) |
| spec-judge | `aces-spec-validator` | static doc criteria | format gate (`validate-spec`) |
| impl-producer | `define-agent` / `improve` | **`quill-doc-writer`** (missing — to add) | the generic Builder (no agent) |
| impl-judge | `aces-implementer` | `quill-implementer` | `sdd-implementer` (default) |

Two cells commonly degenerate: **spec-judge** → static criteria when the bar needs no judgment; **impl-producer** → the generic Builder when the impl is ordinary code (there is no "generic code-writer agent" — open-ended building is the unstructured Builder act). So the interface is the 2×2; how many cells materialize as agents depends on how specialized the domain's objects are.

### Default delegates are agent definitions, not skills

`sdd-scenario-writer` and `sdd-implementer` are agent definitions so dispatch is uniform — the orchestrator invokes default and plugin delegates through one identical I/O surface, and each default can set its own model/effort like any plugin delegate.

### The rubric is a validation-detail, owned by the impl-judge

A scenario's outcome is **boolean**: the spec says the agent *does* X, not *does X some of the time*. For a non-deterministic subject, the impl-judge reaches that boolean through a rubric + judge + threshold over N runs — `score >= threshold` collapses the grade back to pass/fail. The rubric is the impl-judge's private evaluation suite, keyed to scenario by name, never embedded in the `.feature`. This mirrors implementation-detail: the scenario hides *how it is built* (code) and equally hides *how it is judged* (rubric). The three impl-judges are one interface, three verification methods:

| impl-judge | Scenario passes when | Subject |
|---|---|---|
| `sdd-implementer` (default) | a passing test exists | deterministic code |
| `quill-implementer` | static doc inspection holds | deterministic doc |
| `aces-implementer` | judge-score ≥ threshold over N runs | non-deterministic agent |

### `aligned` is layer-scoped to the gate

`aligned` conflates two sync relationships that belong to two different gates, so it is **scoped by layer** (the Artifacts table already tags each artifact's layer):

- **Spec gate** — `aligned: true` means the **contract layer** is in sync (`spec.md` ↔ `.feature`). Impl-layer is *not* required; a spec can be Approved with no code.
- **Impl gate** — `aligned: true` means the **impl layer** conforms to the frozen `.feature`.

**Exploratory artifacts are scaffolding** — plan drafts, feature drafts, spike code: the Explorer's generate-to-discard output, meant to *pressure-test* the spec, not be in sync with it. They are excluded from spec-gate alignment, and promoted at the freeze (draft `.feature` → frozen `.feature`; spike code → deliberate impl). This is why checking impl at the spec gate is forbidden — it would collapse Approved into Implemented. Layer-scoping keeps the two gates judging two objects (the gate section's result), giving two natural unit-of-work boundaries — two commits.

### The orchestrator is a delegate; the Conductor is the human

Per the motive model, the **Conductor is the actor** (the human holding motive and accountability) and the **orchestrator is the delegate pattern** it wields; collapsing them folds an actor into a delegate. `sdd-author` is that orchestrating delegate, so it is renamed `sdd-orchestrator`, not `sdd-conductor`. The human running SDD is the Conductor.

### Governances dissolve into delegates and validator checks

The SDD-family contract and criteria governances are removed. The interface I/O lives in the orchestrator definition plus the default delegates as reference implementations. `sdd-principles` becomes the static `## Spec-Driven Development` section in AGENTS.md (no `governance show`). Repo-wide governance retirement (`packages/cyber-skills/governances/`, the `define-governance` skill) is a separate, larger decision and is out of scope here.

### Discovery: the project registry is a resolved lockfile

The orchestrator must **not** scan plugin directories (user-global, project-global, project-local) at runtime — that is slow, token-heavy, and repeats on every cold subagent start. Resolution happens at **setup**, the lockfile pattern (cf. `.agents/cyber-skills-lock.json`):

- **Source of truth** — each plugin's `init-<plugin>` skill (ships with the plugin, knows its agents) writes a canonical entry to the project registry `.agents/universal-plugin.json`: domain coverage **plus** the resolved role→agent map **plus** the plugin version.
- **Runtime** — the orchestrator reads **only** `.agents/universal-plugin.json` (one small project-local file). No scanning, no cross-scope lookup, no per-session cost; the file is the persistent cache.
- **Drift** — the version stamp flags staleness; re-running `init-<plugin>` on upgrade re-resolves.

Readable agent names stay safe: the registry binds role→name explicitly, so the orchestrator resolves by role and invokes by the bound name (convention `<plugin>-<role>` is only a fallback when a cell is omitted; `null` means the cell degenerates — no agent). Entry shape:

```json
{ "name": "quill", "version": "1.2.0",
  "domains": ["documentation","guide","..."],
  "roles": { "spec-producer": "quill-writer", "spec-judge": null,
             "impl-producer": "quill-doc-writer", "impl-judge": "quill-implementer" } }
```

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

## The gate

**A gate** is a discrete status-transition decision where backward faces converge on one artifact level and emit a two-axis verdict (accept/block × change-request) under a decision rule, with `producer ≠ judge`. It is **not** the inner loop (which fires every iteration, advisory) and not continuous — it fires **once**, at a transition request via `validate-spec`. The decision is always the human's; delegates only advise.

SDD has **two gates**, judging **two different objects**:

| | Spec gate | Impl gate |
|---|---|---|
| Transition | Draft → Approved | Approved → Implemented |
| Object judged | the contract (`spec.md` + `.feature`) | the implementation |
| The bar is | each actor's surface criteria | the **frozen `.feature`** |
| Freezes | the `.feature` | "code meets contract" |
| Weight | Framer-heavy, multi-face | Builder-heavy |

(`none → Draft` is not a gate — scaffolding. `Implemented → Deprecated` is a Framer-kill gate.)

### One backward face per actor — the gates differ by object, not by face

An actor does **not** grow a second backward face for the second gate. Each keeps its single faculty (one backward face per motive). The two gates apply the **same faculties to two objects at two times**:

| Backward face | Spec gate (judges the contract) | Impl gate (judges the code vs frozen contract) |
|---|---|---|
| Framer — kill-or-ship | is the intent/scope worth committing? | rarely — fires only if building reveals the goal was wrong (→ revert to Draft) |
| Architect — fit-to-structure | does the spec fit conventions; no dup/conflict? | does the **code** fit structure (different object) |
| Builder — validate vs bar | is the `.feature` a complete, testable contract? (bar = domain criteria) | does the code pass every scenario? (bar = the `.feature`) |

### Why Approved ≠ Implemented

The backward face is a **faculty** (judge-against-criteria), not a verdict bound to an object. Applied to two objects it yields two verdicts:

- **Approved** = the *contract* passed — a claim about `spec.md` + `.feature`. A spec can be Approved with **no code at all**.
- **Implemented** = the *implementation* passed against the frozen `.feature` — a claim about the code.

Different objects → different verdicts → they never collapse. The pivot makes it precise: the **`.feature` is the object judged at the spec gate, then becomes the bar at the impl gate.** Graduating from artifact-under-judgment to criteria is exactly what makes Approved a prerequisite for Implemented without making them equal — you cannot judge code against a contract that isn't frozen.

### The spec-judge and the impl-judge are one actor's backward face

What looked like two interfaces are **Builder-backward at the two gates**:

- **spec-judge** (e.g., `aces-spec-validator`) = Builder-backward at the **spec gate**: bar = domain criteria, object = the `.feature`.
- **impl-judge** (e.g., `aces-implementer`) = Builder-backward at the **impl gate**: bar = the `.feature`, object = the code.

Same faculty, two gates (for ACES both use rubric → threshold → boolean, confirming one faculty). So `aces-spec-validator` is **retained** — it is the Builder's backward face at the spec gate, not absorbed by SDD; SDD's generic `validate-spec` cannot judge domain contract quality. When the domain bar is static (Quill), the spec-judge is declarative criteria `validate-spec` runs, and no judge agent is needed.

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

**spec-producer** (writes the `.feature`)
```
in:  DOMAIN, DOMAIN_PATH, SPEC_PATH, COMMAND_SURFACE, DESIGN_DECISIONS
out: writes <DOMAIN_PATH>/<DOMAIN>.feature (pure boolean Gherkin); SCENARIOS_WRITTEN, NOTES + uniform
rule: output must pass validate-spec; must not modify spec.md
```

**spec-judge** (judges the `.feature` against the domain bar; degenerates to static criteria)
```
in:  DOMAIN, DOMAIN_PATH, FEATURE_PATH, SPEC_PATH
out: SCENARIOS_PASSING, SCENARIOS_FAILING, BLOCKER + uniform
rule: judges contract quality (testability, coverage, domain criteria); must not modify spec.md or .feature
```

**impl-producer** (builds the artifact; degenerates to the generic Builder for code)
```
in:  DOMAIN, DOMAIN_PATH, SPEC_PATH, FEATURE_PATH, PLAN_PATH, TASKS_PATH
out: ARTIFACTS_WRITTEN, CHANGES_MADE + uniform
rule: builds against the frozen .feature; must not modify spec.md or the .feature
```

**impl-judge** (judges the artifact against the frozen `.feature`)
```
in:  DOMAIN, DOMAIN_PATH, SPEC_PATH, FEATURE_PATH, PLAN_PATH, TASKS_PATH, IMPLEMENTATION_PATHS
out: IMPLEMENTATION_PASS, SCENARIOS_PASSING, SCENARIOS_FAILING, CHANGES_MADE, BLOCKER + uniform
rule: owns the scenario→evaluation mapping; reports pass/fail per scenario;
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
- Establish the four roles (spec-producer, spec-judge, impl-producer, impl-judge); orchestrator resolves each per-cell to a plugin agent or SDD default.
- Make `aligned` layer-scoped: spec gate checks the contract layer, impl gate checks the impl layer; exploratory artifacts are excluded as scaffolding.
- Extend `init-<plugin>` to write the resolved role→agent map + version into `.agents/universal-plugin.json`; the orchestrator reads only that file at runtime (no plugin-dir scanning).
- Add default delegates `sdd-scenario-writer` (generic boolean Gherkin from criteria) and `sdd-implementer` (passing-tests check) as agent definitions.
- Repurpose `sdd-spec-designer` into the default spec-producer's (`sdd-scenario-writer`) generation logic.
- `validate-spec` enforces criteria against any `.feature`, plugin-written or default.
- Delete `governances/`; fold I/O docs into the orchestrator + default delegates. `sdd-principles` → static AGENTS.md section.
- Update `artifacts/specs/sdd-plugin` spec + `.feature` to the orchestrator model.

**2. Quill (cheap consumer, proves a thin spec-producer).**
- Replace `quill-scenario-advisor` with `quill-writer` (spec-producer) — a thin agent-def that emits doc scenarios; its doc criteria become the **spec-judge** bar, enforced by validate-spec (static, no judge agent).
- Add **`quill-doc-writer` (impl-producer)** — the missing cell; writes docs against the frozen `.feature`.
- Keep `quill-implementer` (impl-judge); confirm boolean-per-scenario output.
- Update Quill spec + `.feature`.

**3. ACES (act-override consumer, proves rubric-as-validation-detail).**
- Split `aces-spec-designer` → `aces-scenario-writer` (writes boolean Gherkin: trigger near-misses + behavior cases); delete its spec.md-authoring half.
- Add `aces-implementer` (Builder-backward at the impl gate) owning the scenario→rubric map; `aces-judge` becomes its internal.
- **Retain `aces-spec-validator`** as the **spec-judge** (Builder-backward at the spec gate) — not absorbed by SDD. Delete `aces:create-spec` (absorbed by SDD); `run`/`compare`/`report` become thin reporting over impl-judge output.
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
