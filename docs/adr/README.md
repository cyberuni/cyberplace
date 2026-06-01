# Architecture Decision Records

This directory contains Architecture Decision Records (ADRs) for cyber-skills — significant technical decisions with context, rationale, and consequences.

## Index

| ADR | Title | Status | Date |
| --- | --- | --- | --- |
| [0001](0001-governance-vs-discipline-taxonomy.md) | Governance vs Discipline Taxonomy | Accepted | 2026-05-25 |
| [0002](0002-external-governance-federation.md) | External Governance Federation | Proposed | 2026-05-25 |
| [0003](0003-agent-first-authoring.md) | Agent-first Authoring | Accepted | 2026-05-25 |
| [0004](0004-cyber-skills-cli-output.md) | cyber-skills CLI Output Architecture | Accepted | 2026-05-25 |
| [0005](0005-skill-taxonomy.md) | Skill Taxonomy | Accepted | 2026-05-25 |
| [0006](0006-agent-extension-terminology.md) | Agent Extension Terminology | Accepted | 2026-05-25 |
| [0007](0007-universal-plugin-spec.md) | Universal Plugin — Single-Source Spec with Vendor Derivation | Accepted | 2026-05-31 |

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
