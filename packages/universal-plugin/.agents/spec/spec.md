---
status: implemented
name: universal-plugin
project-path: packages/universal-plugin
approval:
  spec:
    verdict: approve
    by: agent
    cause: dimension
    why:
      floor: Clearance — narrows `plugin/build/`, deleting the pin-resolution scenarios + the `--registry`/`--range`/`--package`/`--allow-major`/`--skip-pins` flags from the frozen `build.feature` (pin resolution relocates to the new `plugin/bundle/` node). PRE-AUTHORIZED by the user in-session this run; `build.feature` re-opened for the narrowing and re-frozen at this gate. Compatibility n/a (impl unbuilt this CR — no shipped semver bump). Conflict none — the root maps route pins to `bundle` only and narrowed `build.feature` retains zero pin references.
      blast: moderate — one narrowed node (`plugin/build/`) + one new node (`plugin/bundle/`) + root capability/placement/concept maps. The pin machinery relocates via the existing `RegistryClient` DIP seam (a workspace-version source reading local `packages/<pkg>/package.json`); workspace-only, offline — removes build's former network dependency rather than adding one.
      novelty: moderate — a structural `build`/`bundle` split along the dev-vs-release axis (new verb) realizing #84's "pinning belongs to release, not build" thesis; the pin mechanics themselves are established (relocated, not invented). Workspace resolution fixes the off-by-one registry lookup at `changeset version` time; a doc-example ignore protects `upgrade-universal-plugin`'s illustration strings; external (non-workspace) pins are skipped.
      confidence: high — cold sdd-spec-judge 3-lens {oracle, builder, architect} ALIGNED true (all three PASS first round). check-spec-state OK / check-suite OK (boolean throughout, correct sectioning) / concept-index updated (new `release` concept), 0 open markers. One non-blocking coverage gap (bundle lacked build's missing-manifest precondition) closed with a mirror scenario before freeze. Self-asserted (by agent) — ratify or kick back.
      cr: build-bundle-split
  impl:
    verdict: approve
    by: agent
    cause: dimension
    why:
      floor: none — purely additive impl against a frozen contract. No Clearance (no scenario narrowed/deleted), no Compatibility (the AXI output surface was newly built, not a shipped semver bump), no Conflict (the frozen suite stayed self-consistent).
      blast: small — closes the last standing impl gap in the #84/#85 build/bundle split: `plugin build`'s output surface (`src/build/build.ts` + `src/build/cli.ts`) re-implemented to the frozen AXI contract; e2e scenarios added; build node README's impl-trails disclaimer removed. No spec/suite change.
      novelty: low — mechanically models `plugin bundle`'s AXI form (#85): default TOON table + `built N, skipped M, failed K` aggregate, `--format json` with a top-level `built` array, stderr next-step `→ universal-plugin plugin validate`.
      confidence: high — cold sdd-impl-judge re-derived every scenario's oracle and drove the built CLI by hand across fixtures: all 18 frozen `build.feature` scenarios PASS, 0 failing, no regressions; pnpm verify green (171 tests). One judge-iteration correction (`--format json` initially lacked the frozen `built` array) recorded and fixed pre-gate. Self-asserted (by agent) — ratify or kick back.
      cr: github-89-build-axi
---

# universal-plugin — the cross-vendor plugin build/derivation engine (CLI)

> Root project spec — the **descriptive** top index for the `universal-plugin` **CLI** (the npm
> package at `packages/universal-plugin`). Behaviors live in the capability folders below. This spec
> was backfilled from the legacy `packages/universal-plugin/specs/` tree and **realigned**: the
> package is the deterministic build/derivation engine, not the marketplace, the authoring-skill
> layer, or the cross-vendor sync engine. `spec.md` is itself the human-readable index — there is no
> sibling `README.md`.

## What this is

One canonical `.plugin/plugin.json` is the single source of truth for a plugin. The `universal-plugin`
CLI turns that canonical manifest into what each AI-agent runtime (Claude Code, Cursor, Codex,
Copilot CLI) expects, and resolves shared governance documents by name. Two concerns:

- **The `plugin` command group** — `universal-plugin plugin build` **derives** per-vendor manifests
  from the canonical one; `plugin bundle` **materializes** the release form (pins the plugin's skill
  `npx <cli>@<version>` references to the shipping workspace versions); `plugin validate` **checks** the
  canonical manifest against the schema and each vendor's rules; `plugin init` **scaffolds** a new
  plugin project.
- **`governance`** — `universal-plugin governance show <name>` / `list` **resolves** governance
  documents by name across a fixed scope precedence, so agents reference governance by name, not by a
  fragile filesystem path.

Everything here is deterministic CLI behavior (SDD-default + a script harness — boolean scenarios,
no rubric).

Every command follows the **AXI** ([Agent Experience Interface](https://github.com/kunchenguid/axi))
output contract — token-efficient [TOON](https://toonformat.dev/) output by default, minimal schemas,
pre-computed aggregates, definitive empty states, structured/fail-loud errors, content-first group
commands, next-step suggestions, and consistent help — stated once in [`axi/`](./axi/README.md) and
exercised by each behavioral node (ADR-0003). AXI principle #7 (session-hook setup + installable
skill) is deferred to a follow-up CR: it crosses the charter boundary (hooks → `cyberplace`, skills →
`cyberspace`/`aced`).

## Why this is its own project

The old `universal-plugin` spec advertised a monolith (build, validate, init, prepare, governance,
plugin-install, hook, marketplace). The repo's concern split broke that apart:

- **marketplace / plugin-install / lifecycle-hook** ops belong to the **`cyberplace`** package (the
  agent skill/plugin marketplace + authoring CLI).
- **agent-facing authoring skills** (create/publish/write-vendor-config) belong to the **`cyberspace`**
  and **`aced`** plugins.
- the **cross-vendor sync engine** currently shipping under this package (`prepare <vendor-id>`
  detect → `sync apply` → `self-update` / `publish sync-version`, backed by the asset-store and the
  source/vendor registries and state) is a **separate concern destined to leave** — see the Placement
  map non-goals and `design/decisions/`.

What remains here — deriving, validating, and scaffolding the canonical manifest, plus resolving
governance by name — is the deterministic engine. It ships to npm as one `universal-plugin` bin and
is a peer of the `cyberfleet` CLI.

## Capability map

| Folder | Type | What |
|---|---|---|
| [`plugin/`](./plugin/README.md) | group | the `plugin` command group — build / bundle / validate / init |
| [`plugin/build/`](./plugin/build/README.md) | behavioral | `universal-plugin plugin build [--vendor] [--dry-run] [--clean]` — derive per-vendor manifests from the canonical `.plugin/plugin.json` (dev-consumable form; no pins) |
| [`plugin/bundle/`](./plugin/bundle/README.md) | behavioral | `universal-plugin plugin bundle [--dry-run] [--full] [--format]` — materialize the release form: pin the `npx <cli>@<version>` references in the plugin's skills to their shipping workspace versions |
| [`plugin/validate/`](./plugin/validate/README.md) | behavioral | `universal-plugin plugin validate [--vendor] [--strict]` — check the canonical manifest against schema + vendor rules |
| [`plugin/init/`](./plugin/init/README.md) | behavioral | `universal-plugin plugin init [--name] [--vendor] [--scaffold] [--force] [--yes]` — scaffold a new plugin project |
| [`governance/`](./governance/README.md) | behavioral | `universal-plugin governance show <name>` / `list` — resolve governance documents by name across scopes |
| [`axi/`](./axi/README.md) | reference | the **AXI** output contract — shared token-efficient CLI conventions (TOON default, aggregates, empty states, next-step, fail-loud, content-first, help) every command follows |

## Placement map

Where a new concept lives — slot here, do not invent placement (strategy = **capability-first**):

- **a new canonical-manifest op** (derive / check / scaffold the `.plugin/plugin.json`) →
  `plugin/<verb>/` (a new unit node under the `plugin` group).
- **a new op resolving/pinning the version pins in the plugin's own skills** (the
  `npx <cli>@<version>` references a plugin's skills carry) → **`plugin/bundle/`** — pinning is a
  release-time **materialization** step (resolve each workspace CLI to the version in its local
  `packages/<pkg>/package.json` at `changeset version`, skipping doc-example and external pins),
  distinct from `build`'s dev-time manifest derivation. `build` no longer touches pins. It is **not**
  the `self-update` hook-file concern (updating `universal-plugin`'s own pin across a project's hook
  files departs with the sync engine — see the non-goals below).
- **a new name→document resolution op** (resolve or list governance by name across scopes) →
  `governance/`.
- **a new shared output / CLI convention** (TOON shape, aggregate, next-step, empty-state,
  truncation, help, content-first) → `axi/` (the reference contract), plus concrete scenarios in each
  behavioral node that exercises it. Never a per-command copy of the convention.
- **a cross-capability CLI workflow** (spans ≥2 nodes) → `workflows/`.
- **marketplace / plugin-install / lifecycle-hook op** → **not here** — that is the `cyberplace`
  package.
- **cross-vendor sync / self-update / publish / asset-store op** → **not a capability here** — the
  shipped sync engine is a non-goal **destined to leave** `universal-plugin` (destination TBD; see
  `design/decisions/`).
- **post-install artifact-copy (`prepare`)** → **dropped** — not chartered in this spec.

The nesting rule: capabilities at the top; a command group (`plugin/`) may hold unit nodes
(`plugin/build/`, `plugin/bundle/`), but no node is three deep — any further sub-grouping is a
`concept:` tag, not a folder. The `plugin/` group index carries no `spec-type` marker (it is a descriptive index, not a
scanned node).

<!-- BEGIN generated: by-concept (project-spec/concept-index) -->

## By concept

> Generated from `concept:` frontmatter by `project-spec/concept-index` — do not edit by hand.

| Concept | Facets |
|---|---|
| `axi` | `axi/` (reference) · `governance/` (behavior) · `plugin/build/` (behavior) · `plugin/bundle/` (behavior) · `plugin/init/` (behavior) · `plugin/validate/` (behavior) |
| `canonical-manifest` | `plugin/build/` (behavior) · `plugin/init/` (behavior) · `plugin/validate/` (behavior) |
| `governance` | `governance/` (behavior) |
| `release` | `plugin/bundle/` (behavior) |

<!-- END generated: by-concept -->
