# SDD File Templates & Structures (June 2026)

## Question

What are the common templates/structures for SDD spec files (requirements, design, tasks, etc.) and what is each file's purpose?

## Scope

**In scope**: File names, section headings, content conventions, and purposes across the major SDD tools (Kiro, GitHub Spec Kit, cc-sdd, BMAD-METHOD).

**Out of scope**: Tool installation, pipeline orchestration mechanics, AI agent behavior.

## Source angles

- Amazon Kiro official docs and community prompts
- GitHub Spec Kit spec-driven.md and implementation
- cc-sdd (rhuss variant) — real spec examples from the repo
- BMAD-METHOD documentation and community writeups
- Augment Code and independent SDD guides (2026)

## Findings

### Core three-file pattern

All major tools converge on the same three-file pipeline:

| File purpose | Kiro | GitHub Spec Kit | cc-sdd (rhuss) | BMAD-METHOD |
|---|---|---|---|---|
| Requirements/What | `requirements.md` | `spec.md` | `spec.md` | PRD |
| Design/How | `design.md` | `plan.md` | `plan.md` | Architecture doc |
| Tasks/Steps | `tasks.md` | `tasks.md` | `tasks.md` | Story files |
| Research (optional) | — | `research.md` | `research.md` | — |
| Data model (optional) | — | `data-model.md` | `data-model.md` | — |
| API contracts (optional) | — | `contracts/` | — | — |
| Review gate (optional) | — | `review-summary.md` | `review-summary.md` | — |

The naming split is exactly two camps: Kiro uses `requirements.md` / `design.md`; Spec Kit and derivatives use `spec.md` / `plan.md`. Both mean the same thing.

### requirements.md / spec.md structure

The "What" — what the system must do, written from the user's perspective.

```
# Feature Specification: <Feature Name>

**Branch/Feature**: ...
**Status**: Draft | Review | Approved
**Created**: <date>

## Purpose / Overview
Why this feature. Business context. Problem being solved.

## Dependencies & Assumptions
External constraints. What must be true beforehand.

## Out of Scope
Explicit exclusions — prevents scope creep.

## User Stories

### User Story N - <Name> (Priority: P1/P2/P3)
As a [role], I want [goal], so that [benefit].
**Why this priority**: rationale
**Independent Test**: how to verify this story in isolation

**Acceptance Criteria (EARS notation)**:
- WHEN [event] THE SYSTEM SHALL [behavior]
- IF [condition] THE SYSTEM SHALL [behavior]
- WHILE [state] THE SYSTEM SHALL [behavior]

## Non-Functional Requirements
- Performance targets
- Security constraints
- Reliability / recovery behaviors
```

Key rules:
- EARS notation is dominant ("WHEN/THEN", "IF/THEN", "WHILE")
- Each AC must be independently testable
- Each user story includes an independent test description

### design.md / plan.md structure

The "How" — technical architecture, component breakdown, data models, implementation decisions.

```
# Implementation Plan / Design: <Feature Name>

**Branch**: ... | **Date**: ... | **Spec**: [spec.md](spec.md)

## Summary
One-paragraph narrative of what is being built.

## Technical Context
Language, framework, primary dependencies, constraints.
Storage mechanism. Target platform.

## Architecture
System context. Component interactions. Sequence diagrams.
Technology stack with rationale.

## Project Structure
Directory layout annotated with NEW / MODIFY labels.

## Components & Interfaces
Per component: purpose, responsibilities, interface, key decisions, notes.

## Data Models
TypeScript interfaces / schemas / DB schemas.
Validation rules. Relationships.

## API Design (if applicable)
Endpoint specs. Request/response examples. Error handling.

## Security Considerations
Auth/authz. Input validation. Data protection.

## Error Handling
Error categories. HTTP codes. Standard error format.

## Performance Considerations
Load targets. Response time goals. Optimization strategies.

## Testing Strategy
Unit / integration / e2e coverage targets.

## Implementation Approach
Per-component breakdown of what to build and why.

## Constitution Check
Any project-level rules verified. (Skipped if none.)
```

### tasks.md structure

The "Steps" — discrete, trackable implementation tasks derived from the design. Consumed directly by an AI coding agent.

```
# Tasks: <Feature Name>

**Input**: Design from /specs/<feature>/
**Prerequisites**: plan.md (required), spec.md (required)

## Format: [ID] [P?] [Story] Description
- **[P]**: Can run in parallel (no shared-file conflict)
- **[Story]**: Linked user story (US1, US2…)

## Phase 1: Setup / Foundation
- [ ] T001 <Action verb> <exact file path>
- [ ] T002 [P] <parallel-safe task>

**Checkpoint**: Concrete verification step for this phase.

## Phase 2: Core Business Logic
- [ ] T003 [US1] <specific task with exact acceptance criteria>

## Phase N: ...

## Execution Checklist
Pre-start / during / completion / sign-off gates.
```

Key rules:
- Action verbs + specific paths — never vague
- `[P]` marks tasks safe to parallelize
- `[USN]` traces each task back to its user story
- Phases end with a **Checkpoint** — a concrete, runnable verification
- `[x]` marks completion during execution

### Optional satellite files

**research.md** — Pre-design investigation. Created when technical unknowns must be resolved before design. Captures: question, options considered, decision, links.

**data-model.md** — Schema extracted from design when complex enough to warrant a standalone doc. Contains entity definitions, relationships, migration notes.

**contracts/** — OpenAPI YAML files generated during the plan phase. Serve as stable interfaces tests are written against before implementation.

**review-summary.md** — Post-implementation (or post-review) gate. Documents what was built vs. spec, deviations, lessons learned.

**checklists/requirements.md** — Quality gate checklist: completeness, testability, EARS compliance.

### Pipeline flow

```
spec.md / requirements.md   (What)
    ↓  resolve technical unknowns
research.md                 (optional)
    ↓
design.md / plan.md         (How)
  + data-model.md           (optional)
  + contracts/              (optional)
    ↓  review gate
review-summary.md           (optional)
    ↓
tasks.md                    (Steps)
    ↓
implementation (code)
    ↓
review-summary.md           (post-impl)
```

## Contradictions

- Kiro calls the requirements file `requirements.md`; Spec Kit and cc-sdd call it `spec.md`. Both mean the same thing — user stories + acceptance criteria.
- BMAD-METHOD uses document names from Agile (PRD, Architecture, Story) rather than file-system conventions. Structurally equivalent but culturally different.
- No consensus on exact phase granularity for tasks.md — Kiro's template uses 6 phases; real cc-sdd specs use 3–7 depending on feature size.

## Open questions

- Is there a standard for task granularity (sub-day vs. multi-day units)?
- When exactly should `research.md` be created vs. inlined into the plan?
- Do any tools define a separate acceptance-test file distinct from the requirements AC?

## Sources consulted

- [Kiro Specs Documentation](https://kiro.dev/docs/specs/)
- [Kiro Templates README (jasonkneen)](https://github.com/jasonkneen/kiro/blob/main/spec-process-guide/templates/README.md)
- [GitHub Spec Kit - spec-driven.md](https://github.com/github/spec-kit/blob/main/spec-driven.md)
- [cc-sdd (rhuss) — real specs](https://github.com/rhuss/cc-sdd/tree/main/specs)
- [cc-sdd (pdoronila)](https://github.com/pdoronila/cc-sdd)
- [BMAD-METHOD](https://github.com/bmad-code-org/BMAD-METHOD)
- [Augment Code: AI Spec Template](https://www.augmentcode.com/guides/ai-spec-template)
- [Spec-Driven Development 2026 - BCMS](https://thebcms.com/blog/spec-driven-development)
- [SDD with GitHub Spec Kit - Microsoft](https://developer.microsoft.com/blog/spec-driven-development-spec-kit)
