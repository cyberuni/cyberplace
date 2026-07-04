---
status: implemented
project-path: plugins/cyberspace
approval:
  spec:
    verdict: approve
    by: agent
    why:
      leash: within — auto-spec; additive new behavioral node bootstrap/write-vendor-config on the implemented cyberspace spec (no existing frozen scenario narrowed); closes init.feature's dangling reference to the direct-write fallback; reversible feature branch cyberspace-direct-write-fallback; user directed autonomous completion; self-asserted by:agent into the async review queue
      basis: cold aced-spec-validator 3-lens {oracle,builder,architect} all PASS, ALIGNED complete, no blocker; fit strong (the by-hand path vs init's CLI-offload path); @trigger 4-yes/4-near-miss balanced (near-miss "sync via the CLI"→no, "initialize AGENTS.md"→no), @rubric well-formed (4 dims max 9, threshold 7), Use-Cases<->scenario mapped, sibling refs intent-not-slug (ADR-0021); parent-index misdescription fixed + advisory edge gaps (nothing-detectable, Cursor two-form) closed before freeze; write-vendor-config.feature frozen
      cr: add-write-vendor-config
  impl:
    verdict: approve
    by: agent
    why:
      leash: within — user directed autonomous completion (continue until merged); agent-config impl of plugins/cyberspace/skills/write-vendor-config on a feature branch, reversible; self-asserted by:agent into the async review queue
      basis: cold aced-impl-judge (ADR-0016, oracle re-derived per frozen scenario) over plugins/cyberspace/skills/write-vendor-config/SKILL.md — ALL 10 frozen scenarios PASS first pass (@trigger 8/8 rows accuracy 1.00; sibling-deferral; 7 @behavior; @rubric @quality 9/9 threshold 7); architect-impl clean fit, 4 sections map 1:1 to subject bullets, no scope creep. Harmless observation: Codex vendor→file row softer than pinned Claude/Cursor/Copilot (frozen suite pins no Codex filename)
      cr: add-write-vendor-config
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
| [`fleet/`](./fleet/README.md) | descriptive index | create agent sessions and message between them, harness-agnostic and MCP-free, via the `cyberfleet` CLI — `gateway`, `identity`, `messaging`, `spawn`, `surfacing` |
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
  mail — anything backed by the `cyberfleet` CLI) → `fleet/`.
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
| `fleet` | `fleet/gateway/` (behavior) · `fleet/identity/` (behavior) · `fleet/messaging/` (behavior) · `fleet/spawn/` (behavior) · `fleet/surfacing/` (behavior) |
| `glossary` | `glossary/` (reference) |

<!-- END generated: by-concept -->
