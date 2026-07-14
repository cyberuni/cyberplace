---
status: implemented
project-path: plugins/cyberfleet
approval:
  spec:
    verdict: approve
    by: unional
    cause: dimension
    why:
      leash: auto-none — HITL-ratified live in-session. The CR fires the **Clearance hard floor**: it deletes acceptance scenarios from two `@frozen` suites. Genuine deletions are the mode-switch pair (`Operator activates when there is no ship marker`, `Operator defers to Pod when it is inside a ship`), `Pod defers to Operator when it is not in a ship`, Operator's commission pair, and Pod's intra-mission fan-out — all moot once the switch is retired. The remaining `removed` rows are title-keyed retitles that preserved behavior. Edit class vs `a414b9cd`: 17 added / 5 modified / 14 removed. Pivoted mid-flight (#225) from "mode is Pod's precondition" to "mode is deleted": the marker held only `{version:1}`, its sole reader was `detectMode`, whose sole caller was the `cyberfleet mode` command, whose sole callers were these two personas' mode guards — a closed loop gating no capability. Membership already lives in `cyberlegion unit register` → `AgentRecord`, which is what `missions` enumerates. Durable record in the `ledger/` shard `cyberfleet-mode-pod-precondition.440ca1.jsonl`.
      basis: cold ACED spec-judges over 8 rounds; final judge oracle PASS + builder PASS, architect FAIL on 7 sweep misses — all fixed (incl. `plugins/cyberfleet/readme.md`, the marketplace front door, untouched by any prior round and still asserting Pod spawns) then grep-gated. `pnpm verify` 21/21 green. Companion shard on the sibling `packages/cyberfleet` spec — one CR, two touched specs.
      cr: cyberfleet-mode-pod-precondition
  impl:
    verdict: approve
    by: unional
    cause: dimension
    why:
      leash: auto-none — HITL-ratified live in-session; no gate self-assertable. Both `SKILL.md` bodies conform to the frozen suites: no `Mode guard`, no probe, no marker, no commission; Operator's seat is asserted by invocation and Pod carries no precondition; all spawning is Operator's, so `unit spawn` left Pod's mechanic list. Both suites stay `@frozen`.
      basis: cold ACED impl-judge IMPLEMENTATION_PASS true across all 44 frozen scenarios (16 pod + 28 operator), oracles independently re-derived per ADR-0016, blocker null. It failed the first pass on two and verified both fixes itself — (1) Pod's `description` omitted the word *spawn*, leaving the frozen `start a worktree … | no` row underivable (the rule was in 5 places in the spec and missing from the only line a router reads); (2) `agents/headless-operator.md` + `merge-backstop-governance/{SKILL,README}.md` still asserted Pod's intra-mission fan-out, outside the persona-scoped touch set. The judge retracted its own advisory to tighten "bridge work" on finding it would break a passing row. `pnpm verify` 21/21; 43 cyberfleet tests green. Follow-up: `resync-local-plugins` after merge — the installed pin still serves the deleted `inside a ship` precondition.
      cr: cyberfleet-mode-pod-precondition
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
*when* and *how* an agent reaches for the fleet, recruits or discharges a crew, and builds or
re-tunes an automaton. Every node here is a per-situation persona gateway skill (ACED carries all four
eval layers — activation and judgment). Each persona offloads its mechanics to a CLI — `cyberlegion`
for identity, mail, and spawn; `cyberfleet` for missions — and keeps its voice only in what it says
around them. Where a mechanic belongs to neither (the merge backstop's `gh`/git/CI), it is offloaded
to that tool, never re-implemented.

The persona nodes depend on their CLIs by **intent** — register / send / spawn / inbox (the
`cyberlegion` CLI) and the missions view (the `cyberfleet` CLI) for the fleet personas, and the
Tavern query / define-agent / manage-model-runners for the crew personas — never by an exact command
slug (ADR-0021). The dependency is one-way: neither CLI knows anything of these personas.

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
| [`pod/`](./pod/README.md) | behavioral | the **Pod** persona — the ship's bridge: greet, clear inbox, run the mission, hail crew, HAL tell; no precondition, no probe; never spawns |
| [`operator/`](./operator/README.md) | behavioral | the **Operator** persona — the command-center dispatcher: any spawn, list the fleet, route messages, prune dead ships |
| [`recruitment/`](./recruitment/README.md) | behavioral | the **Crimp** persona — recruit/discharge crew types from the Tavern (browse, install, register; uninstall, retire) |
| [`mechanic/`](./mechanic/README.md) | behavioral | the **Mechanic** persona — build a new automaton or adjust an existing one's program (governance/model/effort/leash), re-chip its loadout, hot-swap the unit |

## Placement map

Where a new concept lives — slot here, do not invent placement:

- **a new bridge behavior** (mission entry, inbox etiquette, hailing crew, the HAL tell — anything
  Pod does while working a ship) → `pod/` (the Pod persona).
- **a new fleet-level dispatch behavior** (**any** spawn, list the fleet, route between ships, prune
  — anything the Council calls Operator for) → `operator/` (the Operator persona).
- **a "which persona am I" concern** → **nowhere — there is no such concern.** Neither persona probes
  its folder. Operator's seat is asserted by invocation; Pod is reached by the Council's ask. The ship
  marker and `cyberfleet mode` were deleted (#225) because the marker gated no capability and its only
  reader was the command that reported it. Do not reintroduce a location check in either node.
- **a new crew-acquisition persona behavior** (recruit/discharge a crew type — browse the Tavern,
  install/register, uninstall/retire) → `recruitment/` (the Crimp persona).
- **a new automaton-workshop persona behavior** (build a new automaton, or adjust an existing one's
  program — governance/model/effort/leash — re-chip its loadout, hot-swap the unit) → `mechanic/`
  (the Mechanic persona).
- **a new identity / message-queue / peer-launch / hook-injection CLI operation** → **not here** —
  that is the `cyberlegion` CLI project (`packages/cyberlegion`). A new mission-view / gate CLI
  operation is the `cyberfleet` CLI project (`packages/cyberfleet`).
- **a cross-capability persona e2e** (spans ≥2 persona nodes) → this project's own e2e; a future
  `acceptance/` node may formalize it.

The nesting rule: capabilities at the top; any layering nests *inside* a capability, never as a
top-level folder. A node is `<capability>` and never nested. Two cross-cutting concerns run through
this project (see the by-concept index below): `fleet` (the session-coordination personas — pod and
operator) and `crew-ops` (the crew-operations personas that recruit and tune **crew** — recruitment (Crimp)
and build+tune (Mechanic)). Note the distinction: a **crew** is a recruited specialist automaton (what
Crimp signs on from the Tavern); `crew-ops` is the concern of *operating on* crew, not the crew
itself.

<!-- BEGIN generated: by-concept (project-spec/concept-index) -->

## By concept

> Generated from `concept:` frontmatter by `project-spec/concept-index` — do not edit by hand.

| Concept | Facets |
|---|---|
| `crew-ops` | `mechanic/` (behavior) · `recruitment/` (behavior) |
| `fleet` | `operator/` (behavior) · `pod/` (behavior) |

<!-- END generated: by-concept -->
