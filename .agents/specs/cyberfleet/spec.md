---
status: implemented
project-path: packages/cyberfleet
approval:
  spec:
    verdict: approve
    by: agent
    cause: dimension
    why:
      leash: within — auto-spec; freeze-preserving relocation of an already-frozen, already-implemented capability (5 nodes gateway/identity/messaging/spawn/surfacing) off the cyberspace project onto its own project spec, no scenario content or frontmatter touched, only paths and cross-references; reversible feature branch
      basis: pure `git mv` of the 5 node folders + their ledger shard, reconciliation of intra-fleet relative-path cross-references broken by the move depth change, and a new project root `spec.md` carrying forward the original add-fleet-comms approval provenance verbatim (see below) — no re-grade performed because no spec content changed
      cr: relocate-fleet-spec
  impl:
    verdict: approve
    by: agent
    cause: dimension
    why:
      leash: within — same relocation; no implementation changed, `packages/cyberfleet` and `plugins/cyberfleet` sources untouched by this CR
      basis: carried forward verbatim from the original `add-fleet-comms` impl gate on the cyberspace project (two cold impl-judges PASS — see the relocated ledger shard `ledger/add-fleet-comms.f1e2d3.jsonl` for the full historical record); no re-verification performed because no implementation changed
      cr: relocate-fleet-spec
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

## Placement map

Where a new concept lives — slot here, do not invent placement:

- **a new user-facing fleet trigger or persona behavior** (when to spawn, message etiquette,
  mode-switch) → `gateway/`.
- **a new identity/registry operation** (self-identify, peer discovery, liveness) → `identity/`.
- **a new message-queue operation** (send, inbox, read, ack) → `messaging/`.
- **a new peer-session-launch operation** (worktree creation, session backend, brief handoff) →
  `spawn/`.
- **a new hook/injection operation** (surfacing unread mail or a brief into a session's context) →
  `surfacing/`.
- **a cross-capability outcome** (spans ≥2 of the above) → a future `acceptance/` node — none
  exists yet (see the `README.md` "Scope" note); do not invent one folder-deep node for this.

The nesting rule: capabilities at the top; any layering nests *inside* a capability, never as a
top-level folder. A node is `<capability>` and never nested — this project currently has no
sub-grouping needing a `concept:`-tag index (all 5 nodes already carry `concept: [fleet]`, kept as
an accurate historical trace of their shared origin capability; the by-concept index below is
generated for consistency with the corpus convention even though there is only one project-local
concept today).

<!-- BEGIN generated: by-concept (project-spec/concept-index) -->

## By concept

> Generated from `concept:` frontmatter by `project-spec/concept-index` — do not edit by hand.

| Concept | Facets |
|---|---|
| `fleet` | `gateway/` (behavior) · `identity/` (behavior) · `messaging/` (behavior) · `spawn/` (behavior) · `surfacing/` (behavior) |

<!-- END generated: by-concept -->
