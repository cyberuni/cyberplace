---
status: implemented
project-path: plugins/cyberfleet
approval:
  spec:
    verdict: approve
    by: agent
    cause: dimension
    why:
      leash: within — freeze-preserving relocation. The three agent-behavior nodes — `gateway` (the fleet Pod/Operator personas) and the `crew` personas `recruitment` (Crimp) and `tuning` (Tuner) — were split out of the combined `cyberfleet` project into this narrowed `cyberfleet-plugin` project (`project-path: plugins/cyberfleet`) by the `split-cyberfleet-spec` change, so the spec project maps one-to-one onto the `cyberfleet` plugin distributed to the marketplace. The four deterministic CLI nodes (identity, messaging, spawn, surfacing) moved to the co-located `packages/cyberfleet/.agents/spec` root. No spec or implementation content changed — only the project boundary and location. All three `.feature` files stay `@frozen`.
      basis: no new gate was run for the split (content unchanged, location only). Source-of-truth gates are the durable record in `ledger/`: `gateway` under `add-fleet-comms.f1e2d3.jsonl` (cold spec-judge {oracle,builder,architect} PASS, ACED impl-judge over the gateway skill PASS @trigger 9/9 @behavior 5/5 @rubric over threshold), and `recruitment` + `tuning` under `fleet-crew-personas.845da1.jsonl` (two cold ACED spec-judges ALIGNED true, two cold ACED impl-judges IMPLEMENTATION_PASS — Crimp 13/13, Tuner 15/15). This project keeps only the agent-behavior (ACED) nodes; it depends on the `cyberfleet` CLI by intent, never by its command slugs.
      cr: split-cyberfleet-spec
  impl:
    verdict: approve
    by: agent
    cause: dimension
    why:
      leash: within — no implementation touched by the split; the persona skills (`plugins/cyberfleet/skills/{pod,operator,crimp,tuner}`) already built and passing `audit validate`. Root stays `implemented`.
      basis: the three nodes remain `@frozen` and their persona SKILL.md unchanged. See the `ledger/` shards.
      cr: split-cyberfleet-spec
---

# cyberfleet-plugin — the fleet & crew personas (agent behavior)

> Root project spec — the **descriptive** top index for the `cyberfleet` **plugin** (the marketplace
> distribution at `plugins/cyberfleet`). Behaviors live in the capability folders below. This
> project was split out of the combined `cyberfleet` project by the `split-cyberfleet-spec` change,
> so the spec maps one-to-one onto the plugin. The deterministic engine — the `cyberfleet` CLI —
> lives in the sibling `cyberfleet` project (`../../packages/cyberfleet/.agents/spec`, source
> `packages/cyberfleet`).

## What this is

The `cyberfleet` plugin ships the **persona layer** of the fleet: the agent-behavior that decides
*when* and *how* an agent reaches for the fleet, recruits or discharges a crew, and re-tunes an
automaton's program. Every node here is a per-situation persona gateway skill (ACED carries all four
eval layers — activation and judgment). Each persona offloads every mechanic to a `cyberfleet` CLI
call (or another engine) and keeps its voice only in what it says around them.

The persona nodes depend on the `cyberfleet` CLI (the sibling project) by **intent** — register /
send / spawn / inbox for the fleet personas, and the Tavern query / define-agent / manage-model-
runners for the crew personas — never by an exact command slug (ADR-0021). The dependency is
one-way: the CLI knows nothing of these personas.

## Why this is its own project

The `cyberfleet` plugin and the `cyberfleet` CLI are **two packages that deploy differently** — the
plugin ships to the marketplace, the CLI ships to npm — and the plugin carries genuine agentic
behavior (spawn judgment, message etiquette, persona voice, crew recruitment/tuning) the CLI cannot.
Three axes agree on the same cut: artifact-type (agent-behavior vs deterministic script), deploy
target (marketplace vs npm), and package (`plugins/cyberfleet` vs `packages/cyberfleet`). This
project holds the three agent-behavior nodes; the four deterministic CLI nodes are the sibling
`cyberfleet` project. The plugin spec stays **central** (`.agents/specs/`) rather than co-located
under `plugins/cyberfleet` so it is not carried inside the distributed marketplace artifact.

## Capability map

| Folder | Type | What |
|---|---|---|
| [`gateway/`](./gateway/README.md) | behavioral | the `fleet` persona skills (Pod, Operator) — spawn a peer, message etiquette, ship-vs-command-center mode |
| [`recruitment/`](./recruitment/README.md) | behavioral | the **Crimp** persona — recruit/discharge crew types from the Tavern (browse, install, register; uninstall, retire) |
| [`tuning/`](./tuning/README.md) | behavioral | the **Tuner** persona — adjust an automaton's program (governance/model/effort/leash), re-chip its loadout, hot-swap the unit |

## Placement map

Where a new concept lives — slot here, do not invent placement:

- **a new mode-switch persona behavior** (when to spawn, message etiquette, ship-vs-command-center
  mode) → `gateway/` (the Pod/Operator personas).
- **a new crew-acquisition persona behavior** (recruit/discharge a crew type — browse the Tavern,
  install/register, uninstall/retire) → `recruitment/` (the Crimp persona).
- **a new crew-tuning persona behavior** (adjust an automaton's program — governance/model/effort/
  leash — re-chip its loadout, hot-swap the unit) → `tuning/` (the Tuner persona).
- **a new identity / message-queue / peer-launch / hook-injection CLI operation** → **not here** —
  that is the `cyberfleet` CLI project (`packages/cyberfleet`).
- **a cross-capability persona e2e** (spans ≥2 persona nodes) → this project's own e2e; a future
  `acceptance/` node may formalize it.

The nesting rule: capabilities at the top; any layering nests *inside* a capability, never as a
top-level folder. A node is `<capability>` and never nested. Two cross-cutting concerns run through
this project (see the by-concept index below): `fleet` (the session-coordination personas — gateway)
and `crew-ops` (the crew-operations personas that recruit and tune **crew** — recruitment (Crimp)
and tuning (Tuner)). Note the distinction: a **crew** is a recruited specialist automaton (what
Crimp signs on from the Tavern); `crew-ops` is the concern of *operating on* crew, not the crew
itself.

<!-- BEGIN generated: by-concept (project-spec/concept-index) -->

## By concept

> Generated from `concept:` frontmatter by `project-spec/concept-index` — do not edit by hand.

| Concept | Facets |
|---|---|
| `crew-ops` | `recruitment/` (behavior) · `tuning/` (behavior) |
| `fleet` | `gateway/` (behavior) |

<!-- END generated: by-concept -->
</content>
