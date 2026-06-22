---
status: draft
type: project
blocked-by: []
aligned: false
subtasks:
  - dag-tooling
  - governance-composition
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
