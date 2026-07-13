---
cr-ref: github-140
status: active
todos:
  - content: "Explore: grill the gate-role naming rule/scope/enforcement; draft spec+.feature for define-agent & define-skill"
    status: pending
  - content: "Spec gate: cold aced-spec-validator; freeze both .feature; status approved"
    status: pending
  - content: "Deliver: build SKILL.md convention text in define-agent & define-skill against frozen suite"
    status: pending
  - content: "Impl gate: cold aced-impl-judge per frozen scenario; status implemented"
    status: pending
  - content: "Handoff: pnpm verify, PR Closes #140, mail legate"
    status: pending
---

# github-140 — codify gate-role naming convention (ACED define-agent / define-skill)

CR: https://github.com/cyberuni/cyberplace/issues/140

## Goal

A gate/case-scorer agent must be named by **role+scope it serves**
(`<domain>-<gate>-judge`, `<domain>-case-judge`), not a generic action verb
(`implementer`, `judge`). Motivated by 3 reactive renames across 2 plugins
(sdd-implementer→sdd-impl-judge PR#44; aces-implementer→aces-impl-judge;
aces-judge→aces-case-judge). Prevent at authoring time.

## Design questions (grill in explore)

1. Rule/pattern — general "role+scope, not bare verb" test; canonical forms
   `<domain>-<gate>-judge` / `<domain>-case-judge`.
2. Scope — only gate/case scorers (judge/verify), NOT all subagents. Both
   define-agent (judge agents) and define-skill (subagent partial-skill judges).
3. Enforcement — advisory authoring guidance as a quality-check row (evaluated
   in-skill like F/B checks), NOT a hard validate.mts mechanical check
   (semantic "is this a scorer?" → false positives).

## Touched units

- `.agents/specs/aced/config-authoring/define-agent/` (spec.md + define-agent.feature)
- `.agents/specs/aced/config-authoring/define-skill/` (spec.md + define-skill.feature)
- impl: `plugins/aced/skills/define-agent/SKILL.md`, `plugins/aced/skills/define-skill/SKILL.md`

## NEXT

Explore: run aced-scenario-writer to add gate-role-naming scenarios to both
.feature suites + convention prose to both spec.md; dispatch cold
aced-spec-validator each round.
