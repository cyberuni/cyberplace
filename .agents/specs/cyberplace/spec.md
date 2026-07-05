---
status: approved
project-path: packages/cyberplace
approval:
  spec:
    verdict: approve
    by: agent
    cause: dimension
    why:
      floor: none
      blast: low — spec-only, additive nodes + a purely-additive frozen-suite retrofit (tavern freeze preserved); impl gate withheld; reversible feature branch cyberplace-marketplace-axi
      novelty: low — mirrors the verified universal-plugin AXI adoption (ADR-0003 + governance.feature); charter reframe records tenants rather than deleting behavior
      confidence: high — two-round cold sdd-spec-judge, 3-lens {oracle,builder,architect} all PASS, ALIGNED true; check-suite / check-spec-state / check-spec-structure (0 blocking) / concept-index all green
---

# cyberplace — the client for the agentic plugin/skill marketplace

> Root project spec — the **descriptive** top index for cyberplace. Behaviors live in the capability
> folders below. Re-opened by CR `cyberplace-marketplace-axi` to reframe the charter around a single
> concern — **interacting with the cyberplace marketplace** — and to adopt the AXI output contract.

## What cyberplace is

cyberplace is the CLI client for the **cyberuni universal agentic plugin/skill marketplace**: agents
**discover, acquire, source, and share** skills, plugins, and crews across harnesses (Claude Code,
Cursor, Codex). One published package (`packages/cyberplace`, `bin: cyberplace`) ships the client;
`awesome-skills.json` is the curated catalog it reads.

That is the **whole** charter. The package still *contains* authoring/quality code it inherited from
two prior projects — **cyber-skills** (skill audit, commit discipline, agent hooks, skill authoring)
and **universal-plugin** (agent-tool governance contracts) — but that code is **not cyberplace's
concern**. It is recorded below as out-of-charter tenant code, flagged for relocation, and is **not**
specified here.

## Charter scope (marketplace interaction only)

The governed capability is **`marketplace/`** — discover, acquire, source, and the crew storefront —
plus the shared **`axi/`** output contract every marketplace command follows. Everything else in
`packages/cyberplace/src/` is tenant code (next section). `status: draft` — the touched `.feature`
suites re-open for the AXI retrofit and re-freeze at the spec gate; **impl is deferred** (the shipped
bin still emits prose + `--format json` and prompts interactively — the impl gate is withheld until a
follow-up mission, per the `axi/` node's "impl trails the contract").

## Out-of-charter tenants

These `src/` domains ship in the package today but fall **outside** the marketplace charter. They are
inherited code awaiting relocation; no behavior is specified for them here. A future migration mission
moves each to its rightful home:

| Tenant (`src/`) | What it does | Origin | Relocation target |
|---|---|---|---|
| `audit/` | skill S/Q/E structural audit (`audit validate`) | cyber-skills | cyberspace / aced |
| `commit/` | commit-discipline injection + resolve (`commit inject`) | cyber-skills | cyberspace |
| `governance/` | version-pinned agent-tool contracts (`governance show/list`) | universal-plugin | universal-plugin |
| `hook/` | agent session/tool hooks (`hook register/run`) | cyber-skills | cyberplace via **AXI #7** ambient context (deferred CR) |
| `skill/` | skill scaffold / lifecycle (`skill list/validate/repair/source`) | cyber-skills | cyberspace |

> `hook/` is the one tenant with a plausible cyberplace future: AXI **#7** (ambient context) wants a
> session-hook that installs cyberplace into an agent's loop. That is a deferred CR, not this one, so
> `hook/` stays a tenant for now.

## Project-path note

`project-path: packages/cyberplace` — the published CLI package and its catalog
(`awesome-skills.json`). The **Tavern** capability additionally surfaces on the docs site
(`apps/website/src/content/docs/tavern/`); that page is a rendered projection of the same catalog, not
a second governed source dir.

## Capability map

| Folder | Type | What |
|---|---|---|
| [`marketplace/`](./marketplace/README.md) | descriptive | discover (awesome-list), acquire + source (registry), and the crew storefront (tavern) |
| [`axi/`](./axi/README.md) | reference | the shared AXI output contract every marketplace command follows (#1–#6, #8–#10; #7 deferred) |

## Placement map

**Strategy: capability-first** — top-level folders by what cyberplace *does*. Slot a new concept
here; do not invent placement:

- a new **discovery** behavior (curated-list find / inspect / render / source config) →
  **`marketplace/awesome-list/`**.
- a new **acquire / source** behavior (install, remove, update, list installed, marketplace find,
  provider config, lock migration) → **`marketplace/registry/`**.
- a new **crew storefront** behavior (the reserved `crew` tag, `cyberplace tavern`, the roster page) →
  **`marketplace/tavern/`**.
- a new **shared output-shape** convention (a cross-command AXI rule) → the **`axi/`** reference node
  (state it once; the behavioral node carries the scenario).
- a **cross-capability e2e outcome** (spans ≥2 units) → `acceptance/`.
- a behavior for one of the **out-of-charter tenants** (audit / commit / governance / hook / skill) →
  it does **not** belong in this spec; it rides the tenant's relocation mission.

The nesting rule: capabilities at the top; any layering nests *inside* a capability, never as a
top-level folder. A node is `<capability>/<unit>` and **never three deep** — a sub-grouping inside a
capability is a `concept:` tag recovered by the by-concept index, not a third folder level.

<!-- BEGIN generated: by-concept (project-spec/concept-index) -->

## By concept

> Generated from `concept:` frontmatter by `project-spec/concept-index` — do not edit by hand.

| Concept | Facets |
|---|---|
| `acquire` | `marketplace/registry/` (behavior) |
| `axi` | `axi/` (reference) · `marketplace/awesome-list/` (behavior) · `marketplace/registry/` (behavior) · `marketplace/tavern/` (behavior) |
| `discovery` | `glossary/` (reference) · `marketplace/awesome-list/` (behavior) · `marketplace/tavern/` (behavior) |

<!-- END generated: by-concept -->
