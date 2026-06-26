# plugin/ — SDD's plugin nature

SDD's **plugin nature**, two-faced: SDD **ships as a plugin** to a host agent runtime, and
SDD **is extended by domain plugins** that fill its production-chain roles. This folder owns
the packaging/manifest face and the plugin-contract + registry **init-WRITE** face. The
registry **shape** lives in `../design/specialists-and-bundles.md`; the registry
**READ/resolution** lives in `../mission/`; only the **init-WRITE** lives here.

## SDD ships as a plugin

The SDD plugin is authored as markdown skills and agents plus TypeScript verification
scripts — not a compiled npm package — and is distributed through agent marketplaces, not
`npm publish`.

- **Public manifest.** `plugins/sdd/.plugin/plugin.json` declares `name: "sdd"`, its
  description, and the `skills: ./skills` and `agents: ./agents` pointers — the contract for
  which skills, agents, and commands the plugin exposes to a host agent runtime.
- **Marketplace listings.** Listings live in `.claude-plugin/marketplace.json` and
  `.cursor-plugin/marketplace.json`; `plugins/sdd/package.json` is `private` (no npm
  publish).

The `plugin.json` shape is the spec-level contract; the actual manifest and marketplace
files are the code-level artifacts it abstracts. The universal-plugin format itself is
external (`governance show universal-plugin`); this folder is the SDD layer on top.

## SDD is extended by domain plugins

A domain plugin teaches SDD to produce and judge a new artifact-type. It implements the
**plugin contract** and registers itself into the project registry.

### The plugin contract — the five delegate roles

A plugin covers a set of artifact-types by providing agents for these role keys (source:
`plugins/sdd/skills/plugin-contract-governance/SKILL.md`; bundle model:
`../design/specialists-and-bundles.md`). Any role may be `null` (degenerates to the SDD
default) or omitted (falls back to the convention name `<plugin>-<role>`). A **producer**
role may also name a model-tuned agent; naming any agent means the operator **spawns** it.

| Role key | Acts | SDD default |
|---|---|---|
| `spec-producer` | writes the `spec.md` body + the `.feature` | operator loads `spec-producer-governance`, authors inline (`sdd:sdd-operator`) |
| `plan-producer` | writes `plan.md` + `tasks.md` | operator loads `plan-producer-governance`, authors inline (`sdd:sdd-operator`) |
| `spec-judge` | judges the `.feature` at the spec gate | `sdd-spec-judge` — spawned cold agent |
| `impl-producer` | builds the artifact **and** its verification | operator loads `impl-producer-governance`, builds inline (`sdd:sdd-operator`) |
| `impl-judge` | runs the verification against the frozen `.feature` | `sdd-implementer` — spawned cold agent |

**Producers run inline, judges spawn cold** ("conductor writes, cold judges grade"). The
judge stays a **distinct actor** (producer/judge separation). Which governances each role
loads is owned by `../design/specialists-and-bundles.md`.

### Contract-registry init-WRITE

A domain plugin's `init-<plugin>` skill writes that plugin's `sdd-plugins[]` entry into
`.agents/universal-plugin.json` at install/upgrade/re-run time. This folder owns the
**write**; the entry **shape** (the five-role map and governance bindings) is owned by
`../design/specialists-and-bundles.md`, and **resolving** an entry at runtime is owned by
`../mission/`.

The write is idempotent and self-reconciling:

1. Read `.agents/universal-plugin.json`; create it as `{}` if missing.
2. If the file exists but contains malformed JSON, **fail with an error and stop — do not
   overwrite** (a partial write could destroy other plugins' valid entries; fail loudly and
   let a human repair it).
3. Find the entry whose `name` matches this plugin; replace it if present, append it if not.
4. Reconcile a stale entry against the plugin's own version: on a `version` mismatch, update
   `version` and bring `roles`/`governances` to the current plugin shape; rewrite an
   old-shape entry to the role-map shape.
5. Write back without reordering or reformatting other entries.

Version reconciliation is the init skill's job at install/upgrade/re-run, so the runtime
resolver in `../mission/` only ever reads a current-shape entry and never compares versions.

## Scenarios

Unit scenarios for plugin behavior (manifest validity, idempotent init-write,
fail-closed on a corrupt registry, version reconciliation) **colocate** in this folder.
Cross-capability outcomes (a plugin registers and the operator later resolves its delegates)
live in `../acceptance/`.

## Source

- `sdd-plugin` — packaging/distribution + the public manifest (the SDD project description
  itself moved to `../spec.md` and `../design/`)
- `sdd-contract-registry` — the init-WRITE behavior only (shape → `../design/`; read →
  `../mission/`)
- `plugin-contract-governance` — the five-role plugin contract
