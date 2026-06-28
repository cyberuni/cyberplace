---
status: draft
artifact-types:
  - skill
  - subagent
  - command
  - agents-section
spec-layout:
  strategy: capability-first
  location: hoisted
  placement-map: "#placement-map"
aligned: false
---

# ACES — Agent Config Examination & Specification

> Root project spec — the **descriptive** top index for ACES. Rules live in [`design/`](./design/README.md);
> behaviors live in the capability folders. Scaffolded by `backfill-project-spec` at `status: draft`; each
> behavioral node's `## Use Cases` + `.feature` are authored in per-unit explore.

## What ACES is

ACES brings LLM-eval discipline to **agent configuration** — skills, AGENTS.md sections, subagent definitions,
and commands. The same failure modes as LLM prompts (silent regression, trigger mismatch, ambiguous rules,
coverage gaps) with no built-in test runner; ACES is that runner. It is also the **SDD plugin for agent-config
domains** (`sdd-roles/`): it implements the production-chain delegates the conductor resolves for those
artifact-types.

This spec describes the **target** ACES (the agent-config plugin of SDD), not the current implementation —
the impl overhaul is a follow-up.

## Layout

This spec is organized **capability-first** (`spec-layout: capability-first`), hoisted to
`<repo>/.agents/specs/aces/` because the plugin's own folders (`plugins/aces/skills/`, `agents/`) are fixed by
the plugin format and the spec must not ship inside the distributable. A capability therefore spans several
fixed source folders — the accepted spec↔source divergence (`../sdd/design/spec-layout.md`).

## Capability map

| Folder | Type | What |
|---|---|---|
| [`eval-run/`](./eval-run/README.md) | descriptive index | score a config against its golden set — `run`, `compare`, `report` |
| [`config-authoring/`](./config-authoring/README.md) | descriptive index | author agent config — `define-agent`, `define-governance` |
| [`suite-authoring/`](./suite-authoring/README.md) | descriptive index | grow + improve the golden set — `add`, `improve` |
| [`sdd-roles/`](./sdd-roles/README.md) | descriptive index | the SDD production-chain delegates — `scenario-writer`, `spec-validator`, `implementer`, `judge` |
| [`registry/`](./registry/README.md) | behavioral | register ACES as the agent-config SDD plugin — `init-aces` |
| [`design/`](./design/README.md) | descriptive | the eval model + the `decisions/` ADR log |
| [`acceptance/`](./acceptance/README.md) | descriptive | the e2e behavior suite (author → run → improve → compare) |
| [`glossary/`](./glossary/README.md) | reference | the agent-config eval vocabulary |

## Placement map

Where a new concept lives — slot here, do not invent placement (`../sdd/design/spec-layout.md`):

- **a new way to *run or report* on evals** → `eval-run/` (a new behavioral unit beside `run`/`compare`/`report`).
- **a new agent-config artifact to *author*** → `config-authoring/`.
- **a new way to *grow or fix* the golden set** → `suite-authoring/`.
- **a new SDD delegate role** → `sdd-roles/` (matched to the plugin-contract roles).
- **plugin registration / discovery** → `registry/`.
- **a rule or model** (an eval layer, the mapping, a scoring convention) → `design/` (descriptive); a
  **decision + its rationale** → `design/decisions/` (ADR); a **unit's design fork** → that unit's
  `<unit>.solution.md`.
- **a cross-capability outcome** (spans ≥2 folders) → `acceptance/`, never a capability folder.
- **a term** → `glossary/`.

The nesting rule: capabilities at the top; any layering or doc-section structure nests *inside* a capability,
never as a top-level folder.
