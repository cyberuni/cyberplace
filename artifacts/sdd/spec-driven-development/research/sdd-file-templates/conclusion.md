# Conclusion: SDD File Templates & Structures

## Last updated

June 2026

## Question

What are the common templates/structures for SDD spec files (requirements, design, tasks, etc.) and what is each file's purpose?

## Verdict

All major SDD tools converge on **three core files** following a "What → How → Steps" pipeline:

1. **requirements.md / spec.md** — user stories + EARS acceptance criteria. The "what."
2. **design.md / plan.md** — technical architecture, components, data models, decisions. The "how."
3. **tasks.md** — discrete, phase-grouped, parallelization-marked implementation tasks. The "steps."

Optional satellite files extend the core three for complex features: `research.md` (unknowns before design), `data-model.md` (schema), `contracts/` (OpenAPI), `review-summary.md` (gate after design or implementation), `checklists/requirements.md` (quality gate).

The naming split is cosmetic: Kiro uses `requirements.md` / `design.md`; GitHub Spec Kit and cc-sdd use `spec.md` / `plan.md`. Same content, different names.

## File structure quick reference

```
specs/<feature>/
  spec.md / requirements.md   # What (user stories + EARS AC)
  plan.md / design.md         # How (architecture + components)
  tasks.md                    # Steps (phased, traced, parallelizable)
  research.md                 # Optional: pre-design unknowns
  data-model.md               # Optional: schema standalone
  contracts/                  # Optional: OpenAPI YAML
  review-summary.md           # Optional: gate artifact
  checklists/
    requirements.md           # Optional: quality gate checklist
```

## Key format conventions

**requirements.md / spec.md sections**: Purpose, Dependencies & Assumptions, Out of Scope, User Stories (each with priority, independent test, EARS AC), Non-Functional Requirements.

**design.md / plan.md sections**: Summary, Technical Context, Architecture, Project Structure, Components & Interfaces, Data Models, API Design, Security, Error Handling, Performance, Testing Strategy, Implementation Approach.

**tasks.md sections**: Format key (`[P]` = parallel-safe, `[USN]` = user story ref), Phases (1–N with checkpoints), Execution Checklist. Tasks use action verbs + exact file paths.

## Confidence

**High** — Multiple independent tools (Kiro, Spec Kit, cc-sdd, BMAD) and real production specs all converge on the same structure. Real spec examples from cc-sdd confirm the templates match actual usage.

## Strongest supporting evidence

- Real cc-sdd specs (`specs/002-*` through `specs/008-*`) show consistent `spec.md` / `plan.md` / `tasks.md` layout with identical section conventions.
- Kiro's official docs and jasonkneen's community templates independently arrive at `requirements.md` / `design.md` / `tasks.md` with the same purpose mapping.
- GitHub Spec Kit's `spec-driven.md` documents the exact phase-to-file mapping (specify → spec.md, plan → plan.md + research.md + data-model.md + contracts/, tasks → tasks.md).

## Strongest weakening evidence

- No single normative standard exists — these are conventions, not a spec. Tools name files differently and may add/drop sections.
- BMAD-METHOD uses Agile document names (PRD, Architecture, Story) rather than file-system names, so the analogy requires translation.

## What is not supported

- No evidence of a universal schema (JSON Schema, YAML frontmatter) for validating these files — they are all free-form markdown.
- No tool enforces a required section list; sections are templates, not contracts.

## Where evidence is thin

- Task granularity norms — no data on whether sub-day or multi-day tasks are the community standard.
- Non-JavaScript ecosystems — most examples are TypeScript/JS projects.

## Check again later

- Whether EARS or Gherkin becomes the dominant AC format (currently EARS dominant; see [[ears-vs-gherkin]] research).
- Whether any tool introduces schema validation for spec files.
