# ADR 001: Use `spec/plan` as the Core File Name Pair

**Status:** Accepted  
**Date:** 2026-06-04

---

## Context

SDD tools use different file name pairs for the same two core artifacts:

| Convention | "What" file | "How" file |
|---|---|---|
| Kiro | `requirements.md` | `design.md` |
| GitHub Spec Kit, cc-sdd | `spec.md` | `plan.md` |
| BMAD | PRD | Architecture |

Research confirms the content and structure are identical across conventions — the split is cosmetic. We need one canonical pair to avoid ambiguity across skills, templates, and governance docs.

## Decision

We will use **`spec.md` / `plan.md`** as the canonical file name pair.

- `spec.md` — the "what": user stories, acceptance criteria, behavior. Human-readable intent.
- `plan.md` — the "how": technical architecture, components, data models, key decisions.

A third file, `tasks.md`, captures phased implementation steps and is not part of this pair but completes the core three.

## Rationale

- Aligns with cc-sdd and GitHub Spec Kit — the two most directly relevant reference implementations found in research.
- `spec` and `plan` are short, clear, and unambiguous as a pair. `requirements` and `design` are longer and carry more process-specific connotations.
- Consistent with the existing `specs/` folder convention already in use in this project.

## Consequences

- All templates, skills, and governance docs use `spec.md` and `plan.md` — never `requirements.md` or `design.md`.
- The `.feature` file (Gherkin scenarios) is not replaced by `plan.md`; it remains an optional artifact when executable scenarios are needed. `spec.md` links to it where present.
- Future ADRs or governance changes that introduce new file names must not conflict with this pair.
