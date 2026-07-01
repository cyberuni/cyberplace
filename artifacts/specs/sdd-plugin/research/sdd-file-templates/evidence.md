# Evidence: SDD File Templates & Structures

## E001

- **Claim**: All major SDD tools use a three-file core: requirements/spec, design/plan, tasks
- **Date**: June 2026
- **Status**: Confirmed
- **Confidence**: High
- **Source**: Kiro docs, GitHub Spec Kit, cc-sdd (rhuss) real specs, BMAD-METHOD docs
- **Source type**: Official docs + real production usage
- **Notes**: Real cc-sdd specs (002–008) consistently show spec.md / plan.md / tasks.md with the same structure described in Kiro and Spec Kit docs. Independent convergence across four tools.

## E002

- **Claim**: EARS notation (WHEN/THEN, IF/THEN, WHILE) is the dominant format for acceptance criteria
- **Date**: June 2026
- **Status**: Confirmed
- **Confidence**: High
- **Source**: Kiro docs, jasonkneen templates, Augment Code guide, cc-sdd specs
- **Source type**: Official docs + community
- **Notes**: Every tool that documents AC format names EARS explicitly. Gherkin is mentioned as complementary but EARS is primary. See also [[ears-vs-gherkin]].

## E003

- **Claim**: GitHub Spec Kit generates research.md, data-model.md, and contracts/ in addition to the core three files
- **Date**: June 2026
- **Status**: Confirmed
- **Confidence**: High
- **Source**: [spec-driven.md](https://github.com/github/spec-kit/blob/main/spec-driven.md)
- **Source type**: Official docs
- **Notes**: The /speckit.plan command creates all five artifacts. cc-sdd (rhuss) confirms research.md and data-model.md appear in real specs (e.g. specs/005-*, specs/008-*).

## E004

- **Claim**: tasks.md uses [P] markers for parallel-safe tasks and [USN] for user story traceability
- **Date**: June 2026
- **Status**: Confirmed
- **Confidence**: High
- **Source**: rhuss/cc-sdd specs/002-traits-infrastructure/tasks.md (real file)
- **Source type**: Real production spec
- **Notes**: Directly observed in the actual tasks.md file fetched via GitHub API. Format line: "## Format: [ID] [P?] [Story] Description". Phases end with explicit Checkpoint.

## E005

- **Claim**: Kiro names files requirements.md / design.md; Spec Kit names them spec.md / plan.md — same purpose
- **Date**: June 2026
- **Status**: Confirmed
- **Confidence**: High
- **Source**: Kiro docs + Spec Kit docs
- **Source type**: Official docs (both)
- **Notes**: Both describe the same two-document structure: user stories + AC, then technical architecture. Naming is the only difference.

## E006

- **Claim**: BMAD-METHOD uses Agile document names (PRD, Architecture, Story) rather than file-system conventions
- **Date**: June 2026
- **Status**: Confirmed
- **Confidence**: Medium
- **Source**: BMAD-METHOD GitHub, SoloDev.app writeup, DEV Community article
- **Source type**: Community docs
- **Notes**: BMAD is structurally equivalent (what → how → tasks) but uses persona-based agent roles that produce PRD, Architecture, Story files. Less direct analogy than Kiro/Spec Kit.
