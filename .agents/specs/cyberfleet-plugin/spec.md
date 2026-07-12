---
status: implemented
project-path: plugins/cyberfleet
approval:
  spec:
    verdict: approve
    by: agent
    cause: dimension
    why:
      leash: re-open (owner-ratified) — the frozen `pod.feature` scenario "handled mail is acked immediately" pinned its mechanic as `cyberlegion mail read`, which today only peeks (never acks), so the frozen scenario was self-contradictory. #173 rewrites the mechanic to `cyberlegion mail read --ack`; the acceptance criterion (acked immediately, never left unread) is unchanged — a stale-mechanic correction, not a narrowing, so no Clearance floor. Plus one additive scenario "Pod consumes its mission brief in one read-and-ack step" (brief consumed the same step it is read, no dangling unread mail). `operator`, `recruitment`, `tuning` untouched. Durable record in the `ledger/` shard `github-173-mail-read-ack.39e078.jsonl`.
      basis: cold ACED spec-judge ALIGNED true (oracle/builder/architect all PASS); the new brief-consume scenario is non-duplicative of the entry inbox-peek scenario. Pre-existing base parse breakage (line-wrapped Given + stray `</content>`) and a marker-path drift (`.agents/cyberfleet/` vs `.cyberfleet/config.json`) confirmed on `main`, unrelated to #173, left as hygiene follow-ups (see the ledger report entry).
      cr: github-173-mail-read-ack
  impl:
    verdict: approve
    by: agent
    cause: dimension
    why:
      leash: within — the Pod skill body (`plugins/cyberfleet/skills/pod/SKILL.md`) now names `cyberlegion mail read <msg-id> --ack` for both brief-receive and handled-mail ack, satisfying both changed scenarios; `pod.feature` stays `@frozen`.
      basis: cold ACED impl-judge IMPLEMENTATION_PASS true; both changed scenarios PASS, no regression on the unchanged frozen scenarios (mode-switch, @trigger, HAL, @rubric). See the `ledger/` shards.
      cr: github-173-mail-read-ack
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
