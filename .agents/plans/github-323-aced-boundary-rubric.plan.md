---
cr-ref: github-323
project: aced
project-spec: .agents/specs/aced
source: https://github.com/cyberuni/cyberplace/issues/323
kind: revise
status: draft
todos:
  - id: explore
    status: completed
    content: ACED test-levels design doc + decision 0002 (hypothesis) + Selection/#280 reconciliation scenarios
  - id: spec-gate
    status: completed
    content: Spec gate — ALIGNED round 1; 3 additive scenarios self-clear; control enforces same-object
  - id: deliver
    status: completed
    content: Built ACED Selection bar (aced-builder-spec + both agent files) + pnpm verify green
  - id: impl-gate
    status: completed
    content: Impl gate — 3/3 PASS; twin-scan structurally foreclosed
  - id: handoff
    status: in_progress
    content: Commit unit; combined PR with CR-322; Closes #323; one backlog follow-up recorded
---

# CR github-323 — ACED test-level doctrine (companion to github-322)

Depends on the CR-322 doctrine (already landed b7133a25): the deterministic half. Agent config has
**no deterministic inner layer** to push combinatorics down to, so it cannot offload the CR-322 way.

## What changes (REVISE)

1. **ACED test-level design doc** (`design/test-levels.md`, descriptive) — agent-config suites surface
   at the **boundary level**; `@rubric` absorbs the graded / non-deterministic space (non-determinism
   is what `@rubric` exists for). The **boolean-smuggling tell**: if ACED rubrics begin restating
   booleans, the boundary was set too high — some of it wanted a concrete scenario. Note ACED's
   `@trigger` activation Outline is the **uniform exception** CR-322 preserved (one varying query
   token, same `Then`).
2. **Recorded hypothesis** (`design/decisions/0002-*.md`, Proposed) — surface-more (a) vs boundary+
   `@rubric` (b); lean (b), unproven. Record for a future ACED mission to settle with corpus evidence
   — per the issue, RECORD not decide.
3. **Selection-bar reconciliation with #280** — additive scenarios: scenario-writer must not admit a
   dimension re-grading a property a **boolean scenario in the same suite** already decides (an
   untradeable boolean smuggled into a compensatory sum); spec-validator flags it. Discriminator is
   **same-object** (a boolean twin exists), NEVER same-criterion twin-scan (#280's rejected move).

## #280 reconciliation (load-bearing)

#280 (CLOSED): redundant (has a boolean twin → can't false-green, "noise") vs sole-guard (no twin →
must clear miss test alone); rejected the twin-scan (same criterion ≠ same object). The init-rubric
case is a **Selection** defect #280's discrimination lens rightly called noise: a rule (untradeable
boolean) in a compensatory sum. Catch it at **Selection** by the same-object test (boolean twin in
suite), respecting #280 — do NOT re-introduce the same-criterion twin-scan.

## Touch-set

- `.agents/specs/aced/design/test-levels.md` (new, descriptive) + `design/decisions/0002-*.md` (new)
- `.agents/specs/aced/sdd-roles/scenario-writer/` (README + .feature, additive) — no-boolean-smuggling authoring duty
- `.agents/specs/aced/sdd-roles/spec-validator/` (README + .feature, additive) — same-object boolean-smuggling flag
- Deliver: `plugins/aced/skills/aced-scenario-writer`, `aced-spec-validator`, `aced-builder-spec` SKILLs

## NEXT

Confirm the #280 reconciliation with the user, then author the design doc + additive scenarios.
