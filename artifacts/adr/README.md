# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for cyberplace — significant technical decisions with context, rationale, and consequences.

## Index

| ADR | Title | Status | Date |
| --- | --- | --- | --- |
| [0001](0001-governance-vs-discipline-taxonomy.md) | Governance vs Discipline Taxonomy | Accepted | 2026-05-25 |
| [0002](0002-external-governance-federation.md) | External Governance Federation | Proposed | 2026-05-25 |
| [0003](0003-agent-first-authoring.md) | Agent-first Authoring | Accepted | 2026-05-25 |
| [0004](0004-cyberplace-cli-output.md) | cyberplace CLI Output Architecture | Accepted | 2026-05-25 |
| [0005](0005-skill-taxonomy.md) | Skill Taxonomy | Accepted | 2026-05-25 |
| [0006](0006-agent-extension-terminology.md) | Agent Extension Terminology | Accepted | 2026-05-25 |
| [0007](0007-universal-plugin-spec.md) | Universal Plugin — Single-Source Spec with Vendor Derivation | Accepted | 2026-05-31 |
| [0008](0008-drop-skill-augmentations.md) | Drop SKILL.project.md and Skill Augmentation Layers | Accepted | — |
| [0011](0011-sdd-process-vs-agentic-workflow.md) | SDD is a Governed Process; Its Runtime Is an Agentic Workflow | Accepted | 2026-06-28 |
| [0012](0012-spec-frontmatter-schema.md) | Spec Frontmatter Schema for Status, Priority, and Dependencies | Superseded by 0017 | 2026-06-15 |
| [0013](0013-governance-skills.md) | Governance Skills (reference content as non-user-invocable skills) | Accepted | — |
| [0014](0014-sdd-governance-split.md) | Split SDD lifecycle/frontmatter knowledge into named governance skills | Accepted | 2026-06-21 |
| [0015](0015-three-tier-provenance-and-plan-handoff.md) | Three-tier provenance; the plan as a portable `*.plan.md` handoff artifact | Accepted | 2026-06-26 |
| [0016](0016-impl-judge-verification-independence.md) | Impl-judge verification independence — re-derive from the frozen contract, objective backstop, judge≠producer model | Accepted | 2026-06-28 |
| [0017](0017-frontmatter-is-the-router-index.md) | Spec frontmatter is the router's upfront index — minimal `status` + `project-path` | Accepted | 2026-06-28 |
| [0022](0022-cyberfleet-persona.md) | The cyberfleet persona — naming, mode-switch, and query-first fleet view | Proposed | 2026-07-04 |
| [0023](0023-dispatch-seam.md) | The `subagent \| channel` dispatch seam | Proposed | 2026-07-05 |
| [0024](0024-cyberlegion-cli-node-alignment.md) | cyberlegion spec nodes align to the command tree and the mux/legion layer split | Proposed | 2026-07-09 |
| [0025](0025-mission-graph-compiler-scheduler-model.md) | Mission-graph model — an optimizing compiler + CPU instruction scheduler, not an Agile taxonomy | Accepted | 2026-07-12 |
| [0026](0026-mission-graph-store.md) | Mission-graph store — SDD-native, per-repo, git-tracked; no beads/Dolt/global hub | Accepted | 2026-07-12 |

## Creating a new ADR

1. Copy [template.md](template.md) to `NNNN-title-with-dashes.md`.
2. Fill in all sections; keep the record to 1–2 pages.
3. Add a row to the index table above.
4. Link supporting surveys in [docs/research/](../research/README.md) when the decision rests on ecosystem evidence.
5. Submit a PR for review.

## Status legend

| Status | Meaning |
| --- | --- |
| **Proposed** | Under discussion |
| **Accepted** | Decision made; may or may not be fully implemented yet |
| **Deprecated** | No longer relevant |
| **Superseded** | Replaced by another ADR |
| **Rejected** | Considered but not adopted |
