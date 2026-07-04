---
status: approved
project-path: packages/cyberfleet
approval:
  spec:
    verdict: approve
    by: agent
    cause: dimension
    why:
      leash: within — auto-spec; additive — two new behavioral persona nodes (recruitment/Crimp, tuning/Tuner) on the implemented cyberfleet project, no existing frozen scenario touched, the 5 prior nodes stay @frozen; reversible feature branch fleet-crew-personas; user directed continuation into Mission A; self-asserted by:agent into the async review queue. Root cycles implemented->approved for this CR (new unbuilt behavior); returns to implemented at the impl gate. Prior relocate-fleet-spec/add-fleet-comms provenance is the overwritten current-state twin; its durable record stays in the ledger/ shards.
      basis: two cold ACED spec-judges, both ALIGNED true, {oracle,builder,architect} all PASS — Crimp (Fit strong; @trigger balanced Examples, 3 @rubric, 7 @behavior; Tavern-by-intent per ADR-0021) and Tuner (Fit strong; @trigger balanced, 6 @rubric, 8 @behavior; thin-dispatcher routing to manage-model-runners / define-agent / autonomy-rubric). check-suite OK, check-spec-structure 0/0, concept-index regenerated (added the [crew] group). Both .feature frozen. Non-blocking follow-ups: a voice-rubric dimension across the three persona nodes; a concrete in-session handler for the leash route.
      cr: fleet-crew-personas
---

# cyberfleet — harness-agnostic agent sessions + messaging (MCP-free)

> Root project spec — the **descriptive** top index for cyberfleet. Behaviors live in the
> capability folders below. This project was split out of `../cyberspace/spec.md`'s `fleet/`
> capability by the `relocate-fleet-spec` change, to align the spec project with the
> `cyberfleet` plugin/CLI family (see "Project-path note" below).

## What cyberfleet is

cyberfleet creates new agent sessions and lets them talk to each other, across harnesses (a Claude
Code session ↔ a Cursor session ↔ a Codex session) and **without MCP** — no server, no port, no
daemon. The transport is the filesystem (a project-scoped `.cyberfleet/` directory), the interface
is one shell command (`cyberfleet`), and delivery is surfaced through the same per-harness hooks
`cyberspace` already wires. Nobody speaks a vendor-specific protocol — peers share files and one
CLI, so the mechanism ports to every harness by construction.

cyberfleet was originally authored as a `fleet/` capability inside the `cyberspace` foundation
project (change request `add-fleet-comms`). Once the `cyberfleet` CLI (`packages/cyberfleet`) and
the `cyberfleet` plugin (`plugins/cyberfleet`, Pod/Operator personas, ADR-0022) existed as their own
source families, keeping the spec nested under `cyberspace` no longer matched — this project is the
freeze-preserving relocation.

## Project-path note (flagged)

This capability spans **two** fixed source dirs, same shape as cyberspace's own plugin/spec split:

- **`packages/cyberfleet`** — the `cyberfleet` CLI: the engine for all 5 nodes (`identity`,
  `messaging`, `spawn`, `surfacing` run entirely here; `gateway`'s Pod/Operator skills call into it
  for every mechanic). This is the bulk of the governed source and the only piece all 5 nodes share.
- **`plugins/cyberfleet`** — the `cyberfleet` plugin: ships the `gateway` node's two persona skills
  (`skills/pod`, `skills/operator`) as distributable agent config.

`project-path` takes **one** declared value; `packages/cyberfleet` was chosen because it is the
CLI every node depends on (4 of 5 nodes live there entirely, and the 5th calls into it), matching
the precedent in `../cyberspace/spec.md` of naming the source family's dominant/CLI-bearing dir.
**Flag for the user:** if the plugin dir (`plugins/cyberfleet`) should instead be authoritative (as
`../cyberspace/spec.md` does for its own plugin-vs-runtime split, naming the plugin dir), or if this
project should record both dirs some other way, that is worth confirming — this call was made
without a live grill round.

## Status note (flagged)

Carried forward as `status: implemented` because all 5 nodes are `@frozen` and already built (the
original `add-fleet-comms` impl gate passed — see `ledger/add-fleet-comms.f1e2d3.jsonl`). No new
gate was run for this move since no spec or implementation content changed, only location. **Flag
for the user:** if project-split moves like this should always re-run a cold spec-judge pass on the
new root even when content is unchanged (to validate the new capability map/placement map
standalone rather than trust a carried-forward verdict), that policy isn't established yet.

## Capability map

| Folder | Type | What |
|---|---|---|
| [`gateway/`](./gateway/README.md) | behavioral | the `fleet` persona skills (Pod, Operator) — the only fleet unit a user triggers directly |
| [`identity/`](./identity/README.md) | behavioral | `cyberfleet register` / `who` — self-identify and discover peers |
| [`messaging/`](./messaging/README.md) | behavioral | `cyberfleet send` / `inbox` / `read` — the per-recipient file queue |
| [`spawn/`](./spawn/README.md) | behavioral | `cyberfleet spawn` — launch a new peer session in a git worktree |
| [`surfacing/`](./surfacing/README.md) | behavioral | `cyberfleet inbox --hook` — inject unread mail into a session at start |
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
- **a new identity/registry operation** (self-identify, peer discovery, liveness) → `identity/`.
- **a new message-queue operation** (send, inbox, read, ack) → `messaging/`.
- **a new peer-session-launch operation** (worktree creation, session backend, brief handoff) →
  `spawn/`.
- **a new hook/injection operation** (surfacing unread mail or a brief into a session's context) →
  `surfacing/`.
- **a cross-capability outcome** (spans ≥2 of the above) → a future `acceptance/` node — none
  exists yet (see the `README.md` "Scope" note); do not invent one folder-deep node for this.

The nesting rule: capabilities at the top; any layering nests *inside* a capability, never as a
top-level folder. A node is `<capability>` and never nested. Two cross-cutting concerns run through
the project (see the by-concept index below): `fleet` (the original session-coordination nodes —
gateway/identity/messaging/spawn/surfacing) and `crew` (the crew-management personas — recruitment
(Crimp) and tuning (Tuner)), the latter added with the `fleet-crew-personas` change.

<!-- BEGIN generated: by-concept (project-spec/concept-index) -->

## By concept

> Generated from `concept:` frontmatter by `project-spec/concept-index` — do not edit by hand.

| Concept | Facets |
|---|---|
| `crew` | `recruitment/` (behavior) · `tuning/` (behavior) |
| `fleet` | `gateway/` (behavior) · `identity/` (behavior) · `messaging/` (behavior) · `spawn/` (behavior) · `surfacing/` (behavior) |

<!-- END generated: by-concept -->
