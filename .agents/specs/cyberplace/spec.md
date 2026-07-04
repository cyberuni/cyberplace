---
status: implemented
project-path: packages/cyberplace
approval:
  spec:
    verdict: approve
    by: agent
    cause: dimension
    why:
      leash: within — auto-spec; additive new marketplace/tavern node on a freshly-backfilled draft cyberplace project, no existing frozen scenario touched, reversible feature branch cyberplace-backfill-tavern; user directed the Tavern design live in-grill; self-asserted by:agent into the async review queue
      basis: cold sdd-spec-judge 3-round re-grade, 3-lens {oracle,builder,architect} all PASS, ALIGNED true; 11 boolean scenarios verified against the real deriveInstallCommand + tags[] schema (crew as reserved tag — highlights only on RepoEntry, so a tag is the only marker a skill entry can carry); rounds 1-2 architect contradiction (siblings said `awesome find --crew`) reconciled across marketplace/awesome-list/glossary/decisions; check-spec-state + check-suite OK; tavern.feature frozen
      cr: cyberplace-backfill-tavern
  impl:
    verdict: approve
    by: agent
    cause: dimension
    why:
      leash: within — tavern impl built to keep from the frozen suite on the reversible cyberplace-backfill-tavern branch, no frozen scenario edited; user directed the mission live; self-asserted by:agent into the async review queue
      basis: two-round cold sdd-impl-judge → IMPLEMENTATION_PASS true, all 11 frozen scenarios verified (round 1 false → 2 code-only fixes: wire renderTavernPage via a real `tavern render` subcommand + website prebuild + turbo build-order so scenario 9 holds end-to-end; de-dup deriveInstallCommand onto the awesome/lib.ts export); judge ran an exercise backstop (CREW_TAG mutation) confirming scenario 9 is non-vacuous; 272 cyberplace tests green, typecheck + biome + knip clean, website builds with the prebuild regen; awesome-skills.json schema untouched. Advisory follow-up (non-blocking): pre-existing duplicate deriveInstallCommand in awesome/render.ts, out of scope
      cr: cyberplace-backfill-tavern
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

This project had no consolidated spec. It is backfilled **narrow**: only the **`marketplace`**
capability — the curated awesome-list discovery plus the new **Tavern** crew storefront — is
scaffolded now, because that is where the requested change lands. The remaining source domains
(`packages/cyberplace/src/`: `audit/`, `commit/`, `governance/`, `hook/`, `registry/`, `skill/`,
plus the CLI shell) are listed in the placement map as **planned** capabilities to backfill by
demand. `status: draft` — no node's `.feature` is authored here; the per-unit explore grill fills
them.

## Project-path note

`project-path: packages/cyberplace` — the published CLI package and its catalog
(`awesome-skills.json`). The **Tavern** capability additionally surfaces on the docs site
(`apps/website/src/content/docs/tavern/`); that website page is a rendered projection of the same
catalog, not a second governed source dir. Flag for the user if the website should instead be its
own backfilled project.

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
- a **cross-capability e2e outcome** (spans ≥2 capabilities) → `acceptance/`.

The nesting rule: capabilities at the top; any layering nests *inside* a capability, never as a
top-level folder. A node is `<capability>/<unit>` and **never three deep** — a sub-grouping inside a
capability is a `concept:` tag recovered by the by-concept index, not a third folder level.

<!-- BEGIN generated: by-concept (project-spec/concept-index) -->

## By concept

> Generated from `concept:` frontmatter by `project-spec/concept-index` — do not edit by hand.

| Concept | Facets |
|---|---|
| `discovery` | `glossary/` (reference) · `marketplace/awesome-list/` (behavior) · `marketplace/tavern/` (behavior) |

<!-- END generated: by-concept -->
