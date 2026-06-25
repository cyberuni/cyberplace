---
status: draft
type: project
blocked-by: []
aligned: true
subtasks:
  - dag-tooling
  - governance-composition
produced-by:
  spec-judge: sdd:sdd-spec-judge
log:
  - seq: 1
    kind: report
    role: spec-judge
    agent: sdd:sdd-spec-judge
    outcome: pass
approval:
  spec:
    verdict: approve
    by: agent
    why:
      reversibility: "safe — edited two files in one draft spec folder, cheap git revert, nothing published or external"
      blast-radius: "safe — contained to the artifacts this spec owns (spec.md + its .feature); no shared/frozen contract, sibling spec, or installed surface touched"
      novelty: "safe — faithful backfill of the required Use Cases section from existing scenarios plus a negative mirror of an already-governed lifecycle rule; no new contestable choice"
      confidence: "safe — clean spec-judge pass, all scenarios passing, zero open markers, legal state tuple"
---

# Universal Plugin

---

## What

The universal plugin builds, composes, and distributes **agent configuration** — skills, governances, agent definitions, commands, and discipline hooks — so one authored source set can target many harnesses (Claude Code, Cursor, Codex, Copilot). It ships as the `universal-plugin` package (a CLI plus pure domain logic) and the skills that drive authoring and distribution. As the **project** spec it stays high-level: it names the capabilities the plugin delivers and the **feature specs** that own each one, rather than restating their rules.

The plugin's capabilities span build (emit per-harness output from one source), governance composition (embed required governance inline at build time), preparation and sync (stage and reconcile distributable assets), source/vendor registries (track where assets come from and go), publishing and marketplace surfaces, and reusable tooling shared across plugins. Detailed package architecture lives in `packages/universal-plugin/AGENTS.md`; detailed behaviors live in the feature specs.

---

## Why

Agent configuration is authored once but must run in many harnesses, each with its own file layout and conventions. Without a build-and-distribute tool, every author hand-duplicates artifacts per harness and re-resolves governance at runtime. The universal plugin makes the source set the single origin: it composes and emits per-harness output, embeds governance ahead of time, and distributes the result. Capturing it as a typed project spec lets shared, reusable concerns (like graph/DAG tooling) be split into feature specs and reused by other plugins instead of being re-implemented per consumer.

---

## Design decisions

### The project composes feature specs

This spec is the high-level project for the universal plugin. It owns no behavior of its own beyond composition; each capability is a `type: feature` spec listed in `subtasks`, and this spec cross-references those features instead of restating their rules. New capabilities are added as feature specs, not as sections here.

### Reusable tooling is shipped as skills that run bundled scripts

Cross-plugin reusable logic (for example, graph/DAG operations) is delivered as a universal-plugin-owned **skill** that runs a bundled `.mts` script, with an agent-level fallback when Node is unavailable. This avoids a CLI subcommand for shared primitives, because invoking a pinned-version CLI is an unsolved resolution problem; a skill with a local script runs without version pinning. The `dag-tooling` feature spec owns this.

### Distribution targets are detected, not assumed

The plugin emits output per target harness and embeds governance at build time so the agent has it from the first message. The build, governance-composition, and distribution rules are owned by their feature specs and the package domains under `packages/universal-plugin/src/`.

---

## Feature specs

This project composes the feature specs below; each owns its detailed rules and scenarios.

| Feature spec | Owns |
|---|---|
| `dag-tooling` | reusable graph/DAG primitives (cycle detection, topological order, single-parent tree validation, parent-from-children resolution, Mermaid rendering) as a skill-run script with an agent fallback |
| `governance-composition` | build-time embedding of contract/interface governance into worker agent configuration via `requires_governances` |

Capabilities still tracked only in `packages/universal-plugin/src/` (no dedicated feature spec yet): `build`, `governance` (resolution/`show`), `prepare`, `sync`, `source-registry`, `vendor-registry`, `marketplace`, `publish`, `self-update`.

---

## Use Cases

This is the **project** spec; its use cases are the project-level entry-points the plugin guarantees. Leaf-level build, sync, and registry entry-points belong to the feature specs and the package CLI, not here.

| Trigger | Inputs | Outcome |
|---|---|---|
| An author builds the plugin for a target harness | a source set of agent-configuration artifacts; the target harness | harness-specific output emitted from that single source set |
| The build composes governance into an artifact that declares it | an artifact declaring required governance | the governance content embedded inline in the built output, so the agent never runs a `governance show` at invocation time |
| A reader or tool renders the spec graph for this project | the `universal-plugin` project spec (`type: project`) and its `subtasks` | a Composition view showing `universal-plugin` owning its feature subtasks, each `type: feature` |
| A reader inspects the project spec for a capability owned by a feature | the project `spec.md`; the relevant feature spec (e.g. `dag-tooling`) | the capability is cross-referenced to its feature spec and not restated in the project spec |

Each use case is verified by one-or-more scenarios in [universal-plugin.feature](./universal-plugin.feature); the composition guarantee additionally carries a negative mirror (a parent's status may not outrun its children).

---

## Surface

No new public interface is defined by this project spec; surfaces belong to the feature specs and to the `universal-plugin` package CLI documented in `packages/universal-plugin/`. The plugin exposes skills (authoring and distribution) and a `universal-plugin` CLI.

---

**Gherkin scenarios:** [universal-plugin.feature](./universal-plugin.feature)

---

## Related

- `artifacts/specs/dag-tooling/spec.md` — reusable graph/DAG tooling feature
- `artifacts/specs/governance-composition/spec.md` — build-time governance embedding feature
- `packages/universal-plugin/AGENTS.md` — package architecture (screaming + clean architecture)

---

## Artifacts

| Label | Path |
|---|---|
| Spec | `artifacts/specs/universal-plugin/spec.md` |
| Scenarios | `artifacts/specs/universal-plugin/universal-plugin.feature` |
| Package | `packages/universal-plugin/` |
