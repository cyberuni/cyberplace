---
status: implemented
project-path: packages/cyberplace
approval:
  spec:
    verdict: approve
    by: agent
    cause: dimension
    why:
      floor: clearance — re-open of the frozen tavern.feature (root implemented->draft) was user-directed (the user drove the redesign live and confirmed keep-crews/marketplace-source); the narrowing/rewrite clearance is pre-authorized. No Compatibility bump this CR, no Conflict.
      blast: medium — one node (tavern) rewritten + crew-source neighbors reconciled (glossary/marketplace/awesome-list/design). Other cyberplace nodes untouched and stay frozen.
      novelty: low — keeps the crew concept + AXI surface; changes the roster SOURCE (awesome catalog -> marketplace manifest crew-tag) and adds website cards + top nav.
      confidence: high — cold sdd-spec-judge 3-lens {oracle,builder,architect} all PASS, ALIGNED true (round 1 architect FAIL on a leftover root-spec awesome-catalog framing + a stale source line + a tags-in-CLI mismatch; all fixed then re-graded PASS). check-suite / check-spec-state / check-spec-structure (0/0) clean, 0 open markers. Noted follow-up: malformed-manifest fail-loud scenario (repo-maintained input). Self-asserted (by agent) — ratify or kick back.
      cr: tavern-plugin-storefront
  impl:
    verdict: approve
    by: agent
    cause: dimension
    why:
      floor: none — no frozen scenario narrowed at impl; the AXI surface stays impl-deferred (standing tavern README banner), unchanged by this CR.
      blast: medium — repointed the tavern CLI roster source to the marketplace manifest crew-tag (deleted render.ts/lib.ts codegen) + new website top nav (SiteTitle override) + crew-card storefront component; awesome-list + other nodes untouched.
      novelty: low — behavior-preserving source change + presentation; recruit command `cyberplace add <name>`.
      confidence: high — cold sdd-impl-judge IMPLEMENTATION_PASS true; all 11 targeted behavioral scenarios verified against the real bin + built website HTML (cyberfleet crew card, top-nav active state, sidebar, boundary no-write); AXI scenarios recorded impl-deferred (not failures), consistent with the banner. Root pnpm verify green (typecheck/lint/test/knip/check-plan-safety/website build/verify:specs). Judge-flagged cleanup applied (removed the orphaned render:tavern package script). Non-blocking OBSERVATION: website TavernStorefront re-derives the crew filter (cyberplace exports no lib surface) — future CR. Self-asserted (by agent) — ratify or kick back.
      cr: tavern-plugin-storefront
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
- a **cross-capability e2e outcome** (spans ≥2 capabilities) → `acceptance/`.

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
