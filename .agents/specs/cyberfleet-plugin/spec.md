---
status: implemented
project-path: plugins/cyberfleet
approval:
  spec:
    verdict: approve
    by: agent
    cause: dimension
    why:
      leash: re-open — the former `gateway/` node (the two fleet personas bundled in one node) was split into two per-persona nodes, `pod/` (in-ship bridge) and `operator/` (out-of-ship dispatcher), by the `split-gateway-personas` change. Per ADR-0022 they were always two shipped skills; this gives each its own node, `.feature`, and design. The frozen `gateway.feature` was retired and re-authored as `pod.feature` and `operator.feature`, each scoped to one persona's real behavior (read faithfully from the built `plugins/cyberfleet/skills/{pod,operator}` SKILL.md) plus the shared etiquette and its half of the mode-switch. Both new `.feature` files are `@frozen`; `recruitment` and `tuning` are untouched. Prior project current-state (`split-cyberfleet-spec`) is the overwritten twin; its durable record stays in the ledger shards.
      basis: this is a re-partition of already-gated, already-built behavior — no new capability. Self-asserted by:agent (done directly in main at the Council's direction); structural checks green — concept-index no drift, check-spec-structure 0/0, both persona SKILL.md pass `audit validate`. Source-of-truth gates for the underlying behavior remain in `ledger/`: the gateway personas under `add-fleet-comms.f1e2d3.jsonl`. Non-blocking follow-up: a cold ACED spec+impl judge pass over the two new per-persona nodes to re-grade @trigger balance and @rubric thresholds standalone.
      cr: split-gateway-personas
  impl:
    verdict: approve
    by: agent
    cause: dimension
    why:
      leash: within — no implementation changed by the split; the two persona skills (`plugins/cyberfleet/skills/{pod,operator}`) already built and passing `audit validate`, and the new nodes were authored to match them. Root stays `implemented`.
      basis: `pod/` and `operator/` each map one-to-one onto the shipped skill; both remain `@frozen`. See the `ledger/` shards.
      cr: split-gateway-personas
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
project holds the four agent-behavior nodes; the four deterministic CLI nodes are the sibling
`cyberfleet` project. The plugin spec stays **central** (`.agents/specs/`) rather than co-located
under `plugins/cyberfleet` so it is not carried inside the distributed marketplace artifact.

## Capability map

| Folder | Type | What |
|---|---|---|
| [`pod/`](./pod/README.md) | behavioral | the **Pod** persona — the in-ship bridge: greet, clear inbox, run the mission, hail crew, fan out worktree-ships, HAL tell |
| [`operator/`](./operator/README.md) | behavioral | the **Operator** persona — the out-of-ship dispatcher: commission the first ship, list the fleet, route messages, prune dead ships |
| [`recruitment/`](./recruitment/README.md) | behavioral | the **Crimp** persona — recruit/discharge crew types from the Tavern (browse, install, register; uninstall, retire) |
| [`tuning/`](./tuning/README.md) | behavioral | the **Tuner** persona — adjust an automaton's program (governance/model/effort/leash), re-chip its loadout, hot-swap the unit |

## Placement map

Where a new concept lives — slot here, do not invent placement:

- **a new in-ship bridge behavior** (mission entry, inbox etiquette, hailing crew, worktree fan-out,
  the HAL tell — anything Pod does from inside a ship) → `pod/` (the Pod persona).
- **a new out-of-ship dispatch behavior** (commission a ship, list the fleet, route between ships,
  prune — anything Operator does from outside any ship) → `operator/` (the Operator persona).
- **a shared mode-switch concern** (how the two personas hand off on `cyberfleet mode`) belongs to
  whichever persona's activation it governs; each node carries its own half.
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
this project (see the by-concept index below): `fleet` (the session-coordination personas — pod and
operator) and `crew-ops` (the crew-operations personas that recruit and tune **crew** — recruitment (Crimp)
and tuning (Tuner)). Note the distinction: a **crew** is a recruited specialist automaton (what
Crimp signs on from the Tavern); `crew-ops` is the concern of *operating on* crew, not the crew
itself.

<!-- BEGIN generated: by-concept (project-spec/concept-index) -->

## By concept

> Generated from `concept:` frontmatter by `project-spec/concept-index` — do not edit by hand.

| Concept | Facets |
|---|---|
| `crew-ops` | `recruitment/` (behavior) · `tuning/` (behavior) |
| `fleet` | `operator/` (behavior) · `pod/` (behavior) |

<!-- END generated: by-concept -->
</content>
