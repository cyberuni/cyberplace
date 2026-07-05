---
status: implemented
project-path: packages/cyberfleet
approval:
  spec:
    verdict: approve
    by: agent
    cause: dimension
    why:
      floor: none
      blast: low — additive new CLI verb (decommission) in its own node; no existing behavior changed; unshipped package
      novelty: low — deterministic inverse of the existing spawn node, wiring primitives already present (worktree.remove, session.teardown, reverse pane index)
      confidence: high — three cold spec-judge rounds, ALIGNED true, deterministic check-suite/check-spec-state green
  impl:
    verdict: approve
    by: agent
    cause: dimension
    why:
      floor: none
      blast: low — one new command module + wiring; reuses existing worktree/session/identity primitives; prune sweep untouched
      novelty: low — deterministic teardown mirroring spawn
      confidence: high — cold sdd-impl-judge IMPLEMENTATION_PASS true, all 14 frozen scenarios satisfied under re-derived oracles, 139/139 tests + build + typecheck green
---

# cyberfleet — the CLI: harness-agnostic agent sessions + messaging (MCP-free)

> Root project spec — the **descriptive** top index for the `cyberfleet` **CLI** (the npm package
> at `packages/cyberfleet`). Behaviors live in the capability folders below. This project was split
> out of the combined `cyberfleet` project (now the sibling `.agents/specs/cyberfleet-plugin`) by the `split-cyberfleet-spec`
> change, so the spec maps one-to-one onto the CLI package. The agent-behavior half — the `fleet`
> persona gateway and the `crew` personas — lives in the sibling `cyberfleet-plugin` project
> (`../../.agents/specs/cyberfleet-plugin`, source `plugins/cyberfleet`).

## What this is

The `cyberfleet` CLI is the engine that creates new agent sessions and lets them talk to each other
across harnesses (a Claude Code session ↔ a Cursor session ↔ a Codex session) and **without MCP** —
no server, no port, no daemon. The transport is the filesystem (a project-scoped `.cyberfleet/`
directory), the interface is one shell command (`cyberfleet`), and delivery is surfaced through the
same per-harness hooks `cyberspace` already wires. Nobody speaks a vendor-specific protocol — peers
share files and one CLI, so the mechanism ports to every harness by construction.

Everything here is deterministic CLI behavior (SDD-default + a script harness — boolean scenarios,
no rubric). The persona layer that decides *when* and *how* an agent reaches for the fleet is not
in this package — it is the `cyberfleet-plugin` project, which depends on this CLI by **intent**
(register / send / spawn / inbox), never by its command slugs.

## Why this is its own project

The `cyberfleet` CLI and the `cyberfleet` plugin are **two packages that deploy differently** — the
CLI ships to npm, the plugin ships to the marketplace — and the plugin carries genuine agentic
behavior (spawn judgment, message etiquette, persona voice) the CLI cannot. Three axes agree on the
same cut: artifact-type (deterministic script vs agent-behavior), deploy target (npm vs
marketplace), and package (`packages/cyberfleet` vs `plugins/cyberfleet`). This project holds the
four deterministic CLI nodes; the three agent-behavior nodes are the sibling `cyberfleet-plugin`
project.

## Capability map

| Folder | Type | What |
|---|---|---|
| [`identity/`](./identity/README.md) | behavioral | `cyberfleet register` / `who` — self-identify and discover peers |
| [`messaging/`](./messaging/README.md) | behavioral | `cyberfleet send` / `inbox` / `read` — the per-recipient file queue |
| [`spawn/`](./spawn/README.md) | behavioral | `cyberfleet spawn` — launch a new peer session in a git worktree |
| [`decommission/`](./decommission/README.md) | behavioral | `cyberfleet decommission` — tear a ship down (worktree + session) and reap its state |
| [`surfacing/`](./surfacing/README.md) | behavioral | `cyberfleet inbox --hook` — inject unread mail into a session at start |

## Placement map

Where a new concept lives — slot here, do not invent placement:

- **a new identity/registry operation** (self-identify, peer discovery, liveness) → `identity/`.
- **a new message-queue operation** (send, inbox, read, ack) → `messaging/`.
- **a new peer-session-launch operation** (worktree creation, session backend, brief handoff) →
  `spawn/`.
- **a new peer-session-teardown operation** (hard per-ship worktree removal, session teardown,
  reaping id-keyed state) → `decommission/`. The *soft* liveness sweep (mark dead agents exited) is
  `prune`, which lives under `identity/`.
- **a new hook/injection operation** (surfacing unread mail or a brief into a session's context) →
  `surfacing/`.
- **a new persona / mode-switch / crew behavior** (when to spawn, message etiquette, recruit or
  tune a crew) → **not here** — that is the `cyberfleet-plugin` project (`plugins/cyberfleet`).
- **a cross-capability CLI e2e** (spans ≥2 CLI nodes — register → spawn → send → inbox → read) →
  this project's own e2e; a future `acceptance/` node may formalize it.

The nesting rule: capabilities at the top; any layering nests *inside* a capability, never as a
top-level folder. A node is `<capability>` and never nested. One cross-cutting concern runs through
this project (see the by-concept index below): `fleet` (session coordination).

<!-- BEGIN generated: by-concept (project-spec/concept-index) -->

## By concept

> Generated from `concept:` frontmatter by `project-spec/concept-index` — do not edit by hand.

| Concept | Facets |
|---|---|
| `fleet` | `decommission/` (behavior) · `identity/` (behavior) · `messaging/` (behavior) · `spawn/` (behavior) · `surfacing/` (behavior) |

<!-- END generated: by-concept -->
</content>
</invoke>
