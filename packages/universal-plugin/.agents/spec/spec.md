---
status: approved
name: universal-plugin
project-path: packages/universal-plugin
approval:
  spec:
    verdict: approve
    by: agent
    cause: dimension
    why:
      leash: within — all-additive backfill. A brand-new SDD project spec migrated from the legacy non-SDD `packages/universal-plugin/specs/` tree; no pre-existing frozen scenario is narrowed. The one breaking change (re-nesting `universal-plugin build` → `universal-plugin plugin build`) was authorized by the user when approving the mission plan, so Compatibility does not fire. Self-asserted (by agent) — ratify or kick back.
      basis: cold sdd-spec-judge, 3-lens {oracle, builder, architect} all PASS, ALIGNED true (one Builder blocker fixed then re-graded — governance.feature merged from two `Feature:` blocks to one). check-spec-state OK, check-suite OK, check-spec-structure 0 blocking / 0 advisory, concept-index no drift, referenced-artifact checks OK. Four `.feature` frozen; `plugin/validate` + `plugin/init` are spec-first / impl-deferred by ADR-0001.
      cr: backfill-universal-plugin-spec
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
  from the canonical one; `plugin validate` **checks** the canonical manifest against the schema and
  each vendor's rules; `plugin init` **scaffolds** a new plugin project.
- **`governance`** — `universal-plugin governance show <name>` / `list` **resolves** governance
  documents by name across a fixed scope precedence, so agents reference governance by name, not by a
  fragile filesystem path.

Everything here is deterministic CLI behavior (SDD-default + a script harness — boolean scenarios,
no rubric).

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
| [`plugin/`](./plugin/README.md) | group | the `plugin` command group — build / validate / init |
| [`plugin/build/`](./plugin/build/README.md) | behavioral | `universal-plugin plugin build [--vendor] [--dry-run] [--clean]` — derive per-vendor manifests from the canonical `.plugin/plugin.json` |
| [`plugin/validate/`](./plugin/validate/README.md) | behavioral | `universal-plugin plugin validate [--vendor] [--strict]` — check the canonical manifest against schema + vendor rules |
| [`plugin/init/`](./plugin/init/README.md) | behavioral | `universal-plugin plugin init [--name] [--vendor] [--scaffold] [--force] [--yes]` — scaffold a new plugin project |
| [`governance/`](./governance/README.md) | behavioral | `universal-plugin governance show <name>` / `list` — resolve governance documents by name across scopes |

## Placement map

Where a new concept lives — slot here, do not invent placement (strategy = **capability-first**):

- **a new canonical-manifest op** (derive / check / scaffold the `.plugin/plugin.json`) →
  `plugin/<verb>/` (a new unit node under the `plugin` group).
- **a new name→document resolution op** (resolve or list governance by name across scopes) →
  `governance/`.
- **a cross-capability CLI e2e** (spans ≥2 nodes) → `acceptance/`.
- **marketplace / plugin-install / lifecycle-hook op** → **not here** — that is the `cyberplace`
  package.
- **cross-vendor sync / self-update / publish / asset-store op** → **not a capability here** — the
  shipped sync engine is a non-goal **destined to leave** `universal-plugin` (destination TBD; see
  `design/decisions/`).
- **post-install artifact-copy (`prepare`)** → **dropped** — not chartered in this spec.

The nesting rule: capabilities at the top; a command group (`plugin/`) may hold unit nodes
(`plugin/build/`), but no node is three deep — any further sub-grouping is a `concept:` tag, not a
folder. The `plugin/` group index carries no `spec-type` marker (it is a descriptive index, not a
scanned node).

<!-- BEGIN generated: by-concept (project-spec/concept-index) -->

## By concept

> Generated from `concept:` frontmatter by `project-spec/concept-index` — do not edit by hand.

| Concept | Facets |
|---|---|
| `canonical-manifest` | `plugin/build/` (behavior) · `plugin/init/` (behavior) · `plugin/validate/` (behavior) |
| `governance` | `governance/` (behavior) |

<!-- END generated: by-concept -->
