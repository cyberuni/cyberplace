---
status: implemented
project-path: plugins/cyberspace
approval:
  spec:
    verdict: approve
    by: agent
    cause: dimension
    why:
      leash: within — auto-spec; freeze-preserving structural change removing the fleet/ capability (5 nodes gateway/identity/messaging/spawn/surfacing) from the cyberspace spec, relocated to ../cyberfleet-plugin to align the spec project with the cyberfleet plugin/CLI; no retained scenario content touched; reversible feature branch add-fleet-comms; self-asserted by:agent into the async review queue
      basis: pure git mv of the 5 fleet node folders + their add-fleet-comms ledger shard off cyberspace onto a new ../cyberfleet-plugin project root; capability + placement maps updated to drop fleet (placement rule now points to ../cyberfleet-plugin/spec.md); by-concept index regenerated (concept-index --write, cyberspace now bootstrap+glossary only); check-spec-structure 0 blocking / 0 advisory on cyberspace; no re-grade — no retained cyberspace content changed. Historical add-write-vendor-config / add-fleet-comms gate detail remains in the ledger shards
      cr: relocate-fleet-spec
  impl:
    verdict: approve
    by: agent
    cause: dimension
    why:
      leash: within — same relocation; no cyberspace implementation changed, plugins/cyberspace sources untouched by this CR; self-asserted by:agent
      basis: structural spec move only (git mv of spec node folders + ledger shard); no frozen .feature edited, no plugins/cyberspace code touched, no re-verification because no implementation changed
      cr: relocate-fleet-spec
---

# cyberspace — the harness-agnostic agent-config foundation

> Root project spec — the **descriptive** top index for cyberspace. Rules live in [`design/`](./design/README.md);
> behaviors live in the capability folders. Scaffolded by `backfill-project-spec` at `status: draft`; each
> behavioral node's `## Use Cases` + `.feature` are authored in per-unit explore.

## What cyberspace is

cyberspace is the **foundation** plugin of the cyberuni family (cyberuni → cyberplace → cyberspace). Its
primary objective is to make agent configuration **harness-agnostic** — authored once, working across every
major agent harness (Claude Code, Cursor, Codex, GitHub Copilot CLI). It provides the fundamental skills and
baseline agent config a project needs to get going, and it brings **access to the `universal-plugin` npm CLI**
so the agent offloads cross-runtime scaffolding, publishing, and upgrades to the tool instead of spending
tokens doing that work by hand.

cyberspace does **not** author or evaluate skills — that is ACED's domain (`../aced/`). It is the layer the
specialized plugins (ACED, Quill, SDD) build on top of.

This spec describes the **target** cyberspace, not the current implementation: the skill-authoring skills that
still live under `plugins/cyberspace/skills/` (`create-skill`, `improve-agent-definition`, `test-skill`) are
migrating out to ACED as follow-ups and are **not** cyberspace capabilities.

## Layout

This spec is organized **capability-first**, hoisted to `<repo>/.agents/specs/cyberspace/` (derivable from
`project-path: plugins/cyberspace`) because the plugin's own folders (`plugins/cyberspace/skills/`, `agents/`)
are fixed by the plugin format and the spec must not ship inside the distributable. A capability therefore
spans several fixed source folders — the accepted spec↔source divergence (`../sdd/design/spec-layout.md`).

## Capability map

| Folder | Type | What |
|---|---|---|
| [`bootstrap/`](./bootstrap/README.md) | descriptive index | initialize harness-agnostic agent config for a project — `init` |
| [`plugin/`](./plugin/README.md) | descriptive index | author, publish, and upgrade a cross-vendor plugin via the `universal-plugin` CLI — `universal-plugin`, `publish-universal-plugin`, `upgrade-universal-plugin` |
| [`design/`](./design/README.md) | descriptive | the foundation model + the `decisions/` ADR log |
| [`acceptance/`](./acceptance/README.md) | descriptive | the e2e behavior suite (init → author → publish → upgrade) |
| [`glossary/`](./glossary/README.md) | reference | the harness-agnostic agent-config vocabulary |

## Placement map

Where a new concept lives — slot here, do not invent placement (`../sdd/design/spec-layout.md`):

- **a new way to *bootstrap or initialize* agent config** for a harness (write AGENTS.md, wire vendor config,
  suggest companion setup) → `bootstrap/`.
- **a new *cross-vendor plugin* authoring or lifecycle operation** (scaffold/build, publish, upgrade pinned
  versions — anything backed by the `universal-plugin` CLI) → `plugin/`.
- **a new *inter-session runtime* operation** (create a peer agent session, message between sessions, surface
  mail — anything backed by the `cyberfleet` CLI) → the separate `../cyberfleet-plugin/` project spec, not here (this
  capability relocated out of cyberspace; see `../cyberfleet-plugin/spec.md`).
- **a rule or model** (the harness-agnostic mapping, a baseline-config convention) → `design/` (descriptive); a
  **decision + its rationale** → `design/decisions/` (ADR); a **unit's design fork** → that unit's
  `<unit>.solution.md`.
- **a cross-capability outcome** (spans ≥2 folders) → `acceptance/`, never a capability folder.
- **a term** → `glossary/`.

The nesting rule: capabilities at the top; any layering or doc-section structure nests *inside* a capability,
never as a top-level folder. A node is `<capability>/<unit>` and never three deep — a sub-grouping is a
`concept:` tag recovered by the by-concept index, not a third folder level.

<!-- BEGIN generated: by-concept (project-spec/concept-index) -->

## By concept

> Generated from `concept:` frontmatter by `project-spec/concept-index` — do not edit by hand.

| Concept | Facets |
|---|---|
| `bootstrap` | `bootstrap/init/` (behavior) · `bootstrap/write-vendor-config/` (behavior) |
| `glossary` | `glossary/` (reference) |

<!-- END generated: by-concept -->
