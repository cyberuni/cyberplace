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
      floor: clearance — re-open of the four frozen behavioral `.feature` was ratified by the user in-session before any rewrite; the narrowing/rewrite clearance is pre-authorized. No Compatibility (no shipped semver bump this CR) or Conflict (no logical contradiction) floor fires.
      blast: high — cross-cutting AXI adoption touches all four behavioral nodes + a new `axi/` reference node + root spec; but each edit is contract-crispening or additive, no domain behavior removed.
      novelty: low — AXI is an external, well-specified contract; the change is applying it, not inventing.
      confidence: high — cold sdd-spec-judge 3-lens {oracle, builder, architect} all PASS, ALIGNED true (Builder failed round 1 on two coverage gaps — managed-scope positive + #6 no-prompts uniformity — both fixed then re-graded PASS). check-suite / check-spec-state / check-spec-structure (0/0) clean, 0 open markers, concept-index no drift. AXI #7 deferred to a follow-up CR (ADR-0003). Self-asserted (by agent) — ratify or kick back.
      cr: axi-conformance
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
| [`plugin/`](./plugin/README.md) | group | the `plugin` command group — build / validate / init |
| [`plugin/build/`](./plugin/build/README.md) | behavioral | `universal-plugin plugin build [--vendor] [--dry-run] [--clean]` — derive per-vendor manifests from the canonical `.plugin/plugin.json` |
| [`plugin/validate/`](./plugin/validate/README.md) | behavioral | `universal-plugin plugin validate [--vendor] [--strict]` — check the canonical manifest against schema + vendor rules |
| [`plugin/init/`](./plugin/init/README.md) | behavioral | `universal-plugin plugin init [--name] [--vendor] [--scaffold] [--force] [--yes]` — scaffold a new plugin project |
| [`governance/`](./governance/README.md) | behavioral | `universal-plugin governance show <name>` / `list` — resolve governance documents by name across scopes |
| [`axi/`](./axi/README.md) | reference | the **AXI** output contract — shared token-efficient CLI conventions (TOON default, aggregates, empty states, next-step, fail-loud, content-first, help) every command follows |

## Placement map

Where a new concept lives — slot here, do not invent placement (strategy = **capability-first**):

- **a new canonical-manifest op** (derive / check / scaffold the `.plugin/plugin.json`) →
  `plugin/<verb>/` (a new unit node under the `plugin` group).
- **a new name→document resolution op** (resolve or list governance by name across scopes) →
  `governance/`.
- **a new shared output / CLI convention** (TOON shape, aggregate, next-step, empty-state,
  truncation, help, content-first) → `axi/` (the reference contract), plus concrete scenarios in each
  behavioral node that exercises it. Never a per-command copy of the convention.
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
| `axi` | `axi/` (reference) · `governance/` (behavior) · `plugin/build/` (behavior) · `plugin/init/` (behavior) · `plugin/validate/` (behavior) |
| `canonical-manifest` | `plugin/build/` (behavior) · `plugin/init/` (behavior) · `plugin/validate/` (behavior) |
| `governance` | `governance/` (behavior) |

<!-- END generated: by-concept -->
