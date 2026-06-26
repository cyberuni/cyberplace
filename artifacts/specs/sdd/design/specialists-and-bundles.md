# Specialists & bundles

The selection model behind production: the **knowledge bundle**, the five delegate roles,
which governances each loads, and the **registry SHAPE** that stores it. This file owns the
bundle model and the `.agents/universal-plugin.json` role-map shape. The init-WRITE of an
entry lives in `../harness/`; READ/resolution from the registry lives in `../mission/`.

## The knowledge bundle

The producer/judge selection unit is the **knowledge bundle**, keyed by **artifact-type**:

```
artifact-type → { producer, judge, governances (actor + discipline), model, effort }
```

- **One bundle per spec.** No domain arrays, no producer composition, no "best match"
  producer race, never two producers on the same file.
- `type` ≡ **artifact-type** = the bundle key. It names the artifact / bundle
  (`npm-package`, `agent-plugin`, `agent-skill`, `agent-definition`, `react-component`,
  `docs`, …). The structural axis (`project | feature`) is **derived from graph edges** —
  root = nothing parents it, composite = has `subtasks` — not declared.
- **Disciplines (process/workflow) fold into governances.** "Basic knowledge" (React, TS,
  logic) is never *loaded* — it is just picking the right **model + effort**.
- **Language ≠ bundle.** "TS script for a skill" lives inside the *skill* bundle
  (skill-script rules: no deps unless packaged), NOT a generic `code` bundle. The
  artifact-in-context determines the knowledge, not the file extension.

A **specialist** = a producer + judge bundle. A CR summons the specialists for the
artifact-types it touches; the **operator** orchestrates them and delivers.

**`domain-plugin` stays distinct from `produced-by`.** `domain-plugin` = the chosen plugin
for an ambiguous artifact-type (forward input to resolution); `produced-by` = who actually
produced each artifact (after-the-fact record, see `provenance-model.md`). The produced-by
cutover wrongly conflated them — this was the original `sdd-plugin` impl-gate blocker.

## The five delegate roles (closed set)

A plugin covers a set of artifact-types by providing agents for these role keys. Any role
may be `null` (degenerates to the SDD default) or omitted (falls back to the convention
name `<plugin>-<role>`). A **producer** role may also name a model-tuned agent to run at
its own model/effort — the model-tuning escape valve; naming any agent (plugin delegate or
model-tuned) means the operator **spawns** it.

| Role key | Acts | SDD default |
|---|---|---|
| `spec-producer` | writes the `spec.md` body + the `.feature` | Operator loads `spec-producer-governance`, authors inline (`sdd:sdd-operator`) |
| `plan-producer` | writes `plan.md` + `tasks.md` | Operator loads `plan-producer-governance`, authors inline (`sdd:sdd-operator`) |
| `spec-judge` | judges the `.feature` at the spec gate | `sdd-spec-judge` — spawned cold agent |
| `impl-producer` | builds the artifact **and** its verification | Operator loads `impl-producer-governance`, builds inline (`sdd:sdd-operator`) |
| `impl-judge` | runs the verification against the frozen `.feature` | `sdd-implementer` — spawned cold agent |

**Producers run inline, judges spawn cold** ("conductor writes, cold judges grade"): an
SDD-default producer is a governance the operator loads and runs in its own warm context
(recorded `produced-by.<role>: sdd:sdd-operator`); an SDD-default judge is a cold agent the
operator spawns, because a grader must not share the author's context. A plugin delegate —
or a model-tuned producer agent named for the slot — is always spawned, producer or judge
alike. The judge stays a **distinct actor** (producer/judge separation), the surviving
invariant of the gate fold.

There is **no "generic Builder" fallback**: an unfilled producer is the operator authoring
inline; an unfilled judge is the cold SDD-default agent. The `<plugin>-<role>` naming
convention applies only when a role **key is omitted** and the plugin ships an agent at
that conventional name.

## Which governances each role loads

Every role loads the universal authoring/lifecycle governances below in addition to its
own domain criteria:

| Role | Loads |
|---|---|
| spec-producer | `spec-governance` (format bar), `ownership-governance`, the resolved `director` governance |
| plan-producer | `ownership-governance`, the resolved `architect` governance |
| spec-judge | `spec-governance`, `lifecycle-governance`, `gate-validation-governance` |
| impl-producer | `ownership-governance`, the resolved `builder` + `architect` governances |
| impl-judge | `ownership-governance` |

For an **SDD-default producer** role, the operator additionally loads the matching
`spec-producer-governance` / `plan-producer-governance` / `impl-producer-governance` — the
procedure it runs inline. A plugin delegate carries its own procedure and loads these bars
directly. The `sdd` gateway loads `lifecycle-governance`; the gate skill `validate-spec`
loads `lifecycle-`, `ownership-`, and `gate-validation-governance`; `sdd-operator` loads
all three.

## Registry SHAPE

The registry lives in `.agents/universal-plugin.json` as a top-level `sdd-plugins[]`
array — a project-level map from each installed domain plugin to the SDD production-chain
roles it fills. It is the **single resolution source** the operator reads; there is no
`plan.md` assignment fallback. The operator reads **only** this file — it does not scan
plugin directories. Each entry:

```json
{
  "name": "<plugin>",
  "version": "<semver>",
  "domains": ["<artifact-type>", "..."],
  "roles": {
    "spec-producer": "<agent | null>",
    "plan-producer": "<agent | null>",
    "spec-judge":    "<agent | null>",
    "impl-producer": "<agent | null>",
    "impl-judge":    "<agent | null>"
  },
  "governances": { "director": "<name | null>", "builder": "<name | null>", "architect": "<name | null>" }
}
```

| Field | Required | Description |
|---|---|---|
| `name` | Yes | Plugin name; matches the plugin's `.plugin/plugin.json` `name` |
| `version` | Yes | Installed plugin version |
| `domains` | Yes | Open-string **artifact-type**s this plugin covers (e.g. `skill`, `subagent`, `command`, `agents-section`) — never folder names; new types need no schema bump |
| `roles` | Yes | Map of the five production-chain roles to spawned agents; `null` or omitted = SDD default (a producer role → operator authors inline as `sdd:sdd-operator`; a judge role → operator spawns the cold SDD-default judge agent) |
| `governances` | Yes | Actor-governance bindings (`director`, `builder`, `architect`); the block is required, each binding may be `null` = SDD default |

**Degeneration of `null` / missing keys** (this file guarantees only what is a valid
*stored* shape; the traversal is the operator's):

- **A producer role** (`spec-producer`, `plan-producer`, `impl-producer`) that is `null`
  or absent → the operator **loads the producer governance and authors inline**; the
  recorded `produced-by.<role>` is `sdd:sdd-operator`.
- **A judge role** (`spec-judge`, `impl-judge`) that is `null` or absent → the operator
  **spawns the SDD-default cold judge agent** (`sdd-spec-judge`, `sdd-implementer`). A
  judge default is never loaded inline — grader independence requires a cold context.

**Resolution** (owned by `../mission/`, shown here because the shape is its direct input):
match the spec's **`domain-type`** frontmatter field (the artifact-type axis, **not** the
domain/folder name) against each entry's `domains[]`. An absent or unmatched `domain-type`
→ zero matches → all roles degenerate to SDD defaults. One match → resolve each role and
governance key (name = use it; `null` = SDD default; missing role key = `<plugin>-<role>`).
Two or more matches → read the `produced-by` resolution cache; if it names the owner, use
it, else return `needs-input` for the producing path to ask (the answer is written to
`produced-by`, decisive on resume — the legacy `domain-plugin` map is retired here).

## Init-write behavior (owned by `../harness/`)

A domain plugin's `init-<plugin>` skill writes its own entry idempotently:

1. Read `.agents/universal-plugin.json`; create with `{}` if missing.
2. **If the file exists but contains malformed JSON, fail with an error and stop — do not
   overwrite** (a partial write could destroy other plugins' valid entries; let a human
   repair).
3. Find the entry whose `name` matches this plugin; replace it, or append if absent.
4. Reconcile a stale entry against the plugin's own version: on a `version` mismatch,
   update `version` and bring `roles`/`governances` to the current plugin shape.
5. Write back; do not reorder or reformat other entries; rewrite an old-shape entry to the
   role-map shape.

The operator never compares versions at runtime — version reconciliation is the init
skill's job at install/upgrade/re-run, so the operator only ever reads a current-shape
entry.
