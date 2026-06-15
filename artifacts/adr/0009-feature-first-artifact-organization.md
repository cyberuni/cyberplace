# ADR-0009: Feature-First Artifact Organization

## Status

Accepted

## Context

This repo accumulated three separate artifact roots organized by tool rather than by feature:

- `artifacts/adr/` — architecture decision records
- `artifacts/sdd/` — SDD spec artifacts (spec.md, .feature, plan.md, tasks.md)
- `artifacts/aces/` — ACES eval data (eval.md, golden-set/, trigger/, results/)

`artifacts/aces/` used a path convention mirroring the subject's location: `artifacts/aces/plugins/<plugin>/skills/<skill>/`. This tied the eval directory structure to the implementation directory structure, making it impossible to colocate SDD spec artifacts (spec.md) with ACES eval artifacts (eval.md) for the same feature — they lived under different roots.

ACES is a specialized form of SDD: both are driven by the same feature, just producing different artifact types (narrative spec + Gherkin vs. eval data). Separating them by tool created artificial distance between related work.

A flat, feature-first structure had an additional benefit: plugin skills from different plugins might share names (e.g., both `aces` and `sdd` plugins have a `create-spec` skill). The old convention resolved this through nesting; the new convention resolves it through prefixing.

## Decision

Single root: `artifacts/specs/<feature>/`

**Feature naming:**
- Plugin-level features: `<plugin>-plugin` (e.g., `sdd-plugin`, `aces-plugin`)
- Plugin skills: `<plugin>-<skill>` — always prefix, even when the name is currently unique, to prevent future collisions (e.g., `aces-create-spec`, `tmux-fork-right`)
- Package skills: `<package>-<skill>` (e.g., `cyber-skills-commit-work`)
- AGENTS.md sections and standalone features: `<section-slug>` or `<feature-name>` (no prefix needed; these don't share namespaces with plugin skills)

**Artifact placement within a feature folder:**
- SDD artifacts at root: `spec.md`, `<feature>.feature`, `plan.md`, `tasks.md`
- ACES eval artifacts at root: `eval.md`, `golden-set/`, `trigger/`, `results/`
- Supporting aspects in named sub-folders: `research/`, `docs/`, `adrs/`, `governances/`

`artifacts/adr/` is unchanged — ADRs are repo-level governance records, not feature specs.

## Consequences

- SDD and ACES artifacts for the same feature coexist in one directory
- `report` skill scans `artifacts/specs/` for immediate subdirectories with `eval.md` at root
- `aces-spec-designer` returns `EVAL_DIR` in its summary so downstream skills don't recompute the path
- Old roots `artifacts/aces/` and `artifacts/sdd/` removed
- ACES skill and agent files updated to reference `artifacts/specs/`
