---
cr-ref: github-322
project: sdd
project-spec: .agents/specs/sdd
source: https://github.com/cyberuni/cyberplace/issues/322
kind: revise
status: draft
todos:
  - id: explore
    status: completed
    content: Grill spec+suite for the suite-design/test-level doctrine; draft ADR + node edits
  - id: spec-gate
    status: completed
    content: Spec gate — ALIGNED round 2; additive scenarios self-clear on 3 frozen suites
  - id: deliver
    status: completed
    content: Built 3 governance SKILLs (suite-format, impl-producer, builder-impl, spec-producer) + pnpm verify green
  - id: impl-gate
    status: completed
    content: Impl gate — 13/13 PASS + structural read clean
  - id: handoff
    status: in_progress
    content: Commit unit; combined PR with CR-2 github-323; Closes #322; one backlog follow-up recorded
---

# CR github-322 — SDD suite-design / test-level doctrine

Sibling CR: **github-323** (ACED companion) runs next in this session, adopting this frozen doctrine.

## What changes (REVISE) and why

The acceptance `.feature` was doing a unit test's job → guaranteed cold-judge churn (13 rounds on
`github-315`). Establish the test-level doctrine: **`.feature` = acceptance/boundary only; inner-rule
combinatorics move down to unit tests owned by the impl-producer.**

## Touch-set

- **ADR** `artifacts/adr/0028-*.md` (new) — decision + rationale: test-pyramid; suite screams intents;
  Outline caution (DAMP>DRY); scenario SRP/dedup. Records the `deps` before/after as the worked example.
- **suite-format** — spec node `authoring/suite-format/README.md` (reference `## Subject`) + impl
  `plugins/sdd/skills/suite-format-governance/SKILL.md`: add suite-organization-screams-intents,
  `.feature`=acceptance/boundary, Outline caution (refine existing enumerated-cases convention), scenario SRP.
- **impl-producer** — `mission/impl-producer/impl-producer.feature` (+README `## Use Cases`) additive
  scenario: authors inner-rule unit tests for combinatorics beyond the per-frozen-scenario verification.
  Impl in `plugins/sdd/skills/impl-producer-governance/SKILL.md` (new procedure step).
- **impl-judge** — `mission/impl-judge/impl-judge.feature` (+README) additive scenario: gate checks
  acceptance at boundary + unit coverage of inner rules; never demands `.feature` enumerate a combinatorial space.
- **builder-impl** — `plugins/sdd/skills/builder-impl-governance/SKILL.md`: the unit-test duty as a bar line.

## Freeze note

impl-producer.feature + impl-judge.feature are `@frozen`. All additions are **additive** scenarios
(new duties, nothing narrowed) → self-clear, no re-open. suite-format is `reference` (no freeze).

## Open design questions for the grill

1. ADR + terse governance (recommended) vs governance-only.
2. Outline caution vs the sanctioned `@trigger` enumerated-cases convention — reconcile, don't reverse
   (must survive into ACED #323's @trigger outlines).
3. "acceptance/boundary only" framed as additive duty, not a narrowing of existing impl-producer scenarios.

## NEXT

Grill the user live on the three open design questions, then draft ADR 0028 + the additive scenarios.
