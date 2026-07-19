---
status: implemented
project-path: packages/cyberplace
approval:
  spec:
    verdict: approve
    by: agent
    cause: dimension
    why:
      floor: none — one ADDITIVE @frozen scenario (malformed-manifest fail-loud) that self-clears; no existing frozen scenario re-opened; root stays implemented. Item 1 is impl-only (no spec change).
      blast: low — one node (tavern), one additive scenario; sibling nodes untouched.
      novelty: low — closes the malformed-manifest fail-loud follow-up the tavern-plugin-storefront spec gate explicitly noted.
      confidence: high — cold sdd-spec-judge 3-lens {oracle,builder,architect} all PASS, ALIGNED true, zero required fixes; mechanical check-spec-state + check-suite green. Self-asserted (by agent) — ratify or kick back.
      cr: github-76
  impl:
    verdict: approve
    by: agent
    cause: dimension
    why:
      floor: none — no frozen scenario narrowed at impl; the tavern AXI surface is now BUILT (README impl-trails banner lifted); awesome/registry AXI surfaces stay impl-deferred per their own standing banners.
      blast: low-medium — rewrote the tavern CLI to the AXI output surface (TOON default + aggregate/truncation/--full/json-escape/next-step/fail-loud/help) via a new shared renderToonTable in output.ts + a malformed-manifest guard in plugins.ts; awesome/registry and all other nodes untouched.
      novelty: medium — first real TOON encoder in cyberplace (renderToonTable), sole encoder, tavern-only consumer.
      confidence: high — cold sdd-impl-judge IMPLEMENTATION_PASS true; 22/22 behavioral scenarios re-derived and verified against the real bin over 6 self-built marketplace fixtures (TOON rows/aggregate, truncation + --full, json never truncated, 0-crews-found, content-first, next-step on stderr, non-interactive, unknown-flag fail-loud, --help, malformed-manifest fail-loud). Root pnpm verify green (typecheck/lint/test/knip/website build/verify:specs). Non-blocking OBSERVATION: AXI adoption still tavern-only (awesome/registry follow-up CR). Self-asserted (by agent) — ratify or kick back.
      cr: github-76
---

# cyberplace — the agent skill/plugin marketplace + authoring CLI

> Root project spec — the **descriptive** top index for cyberplace. Behaviors live in the
> capability folders below. Backfilled **capability-first** and **narrow** (the `marketplace`
> capability only); the other cyberplace domains are named in the placement map as planned homes,
> not yet backfilled.

## What cyberplace is

cyberplace is the CLI and curated catalog behind the cyberuni skill/plugin marketplace: agents
**discover, install, and share** skills and plugins across harnesses (Claude Code, Cursor, Codex).
The same `npx cyberplace` binary also carries the authoring/quality tooling the library depends on —
skill audit, commit discipline, version-pinned governance contracts, agent hooks, and the skill
lifecycle. One published package (`packages/cyberplace`, `bin: cyberplace`) ships all of it.

## Backfill scope note (flagged)

This project had no project spec. It is backfilled **narrow**: only the **`marketplace`**
capability — the curated awesome-list discovery plus the **Tavern** crew storefront — is scaffolded,
because that is where the requested change landed; the `marketplace/tavern` node has since carried a
frozen `.feature` through two mission CRs to `status: implemented`. The remaining source domains
(`packages/cyberplace/src/`: `audit/`, `commit/`, `governance/`, `hook/`, `registry/`, `skill/`, plus
the CLI shell) stay unbackfilled — no node's `.feature` is authored for them yet — and are listed in
the placement map as **planned** capabilities to backfill by demand.

## Project-path note

`project-path: packages/cyberplace` — the published CLI package and its awesome catalog
(`awesome-skills.json`, the source for general discovery, `awesome-list`). The **Tavern** capability
additionally surfaces on the docs site (`apps/website/src/content/docs/tavern/`); that website page is
a rendered projection of the **marketplace manifest** (`.claude-plugin/marketplace.json`, the crew
roster source), read at build time — not a second governed source dir. Flag for the user if the
website should instead be its own backfilled project.

## Capability map

| Folder | Type | What |
|---|---|---|
| [`marketplace/`](./marketplace/README.md) | descriptive | skill/plugin discovery, the curated awesome-list, and the Tavern crew storefront |

**Planned (not yet backfilled)** — named here so a later mission slots them without re-deriving:
`audit/` (skill S/Q/E audit), `commit-discipline/` (Conventional-Commits staging + messages),
`governance/` (version-pinned agent-tool contracts, `governance show`), `hooks/` (hook register /
run), `registry/` (skill registry ops), `skill-authoring/` (scaffold + lifecycle), and a CLI/tooling
home (the `cyberplace` bin shell, build, packaging).

## Placement map

**Strategy: capability-first** — top-level folders by what cyberplace *does*. Slot a new concept
here; do not invent placement:

- a new **discovery / catalog / storefront** behavior (find, inspect, render, source config, the
  crew filter, the Tavern) → **`marketplace/`**.
- a new **skill-audit** behavior (S/Q/E checks) → future `audit/`.
- a new **commit-discipline** behavior (staging, message shape) → future `commit-discipline/`.
- a new **governance-contract** behavior (`governance show`, version pinning) → future `governance/`.
- a new **hook** behavior (register, run, extract) → future `hooks/`.
- a new **registry** behavior → future `registry/`.
- a new **skill-authoring** behavior (scaffold, validate, lifecycle) → future `skill-authoring/`.
- a **cross-capability workflow outcome** (spans ≥2 capabilities) → `workflows/`.

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
| `discovery` | `marketplace/awesome-list/` (behavior) · `marketplace/tavern/` (behavior) |

<!-- END generated: by-concept -->
