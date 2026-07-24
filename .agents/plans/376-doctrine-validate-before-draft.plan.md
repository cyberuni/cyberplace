---
cr-ref: 376
source: https://github.com/cyberuni/cyberplace/issues/376
node: doctrine/scanner
touch-set: sdd/authoring, sdd/design, sdd/workflows
blast: medium
status: in-progress
todos:
  - content: "Explore: freeze validate-before-draft gate + issue-emission in scanner.feature"
    status: completed
  - content: "Update scanner/README.md Use Cases + prose for the validation gate and issue output"
    status: completed
  - content: "Spec gate — cold spec-judge ALIGNED (3 rounds); disposition field added to combat-log + gateway; frozen; gate line recorded"
    status: completed
  - content: "Deliver: update doctrine-loop SKILL.md + sdd-scanner.md agent + gateway sdd/SKILL.md against frozen suite"
    status: in_progress
  - content: "Impl gate — cold impl-judge; pnpm verify green"
    status: pending
  - content: "Handoff — PR, note op6-m14 retired overlap, followups"
    status: pending
---

# 376 — doctrine loop validates plan/log gaps against current code before drafting

## Problem (from #376)

The Scanner treats persisted plans/logs/ledger as **present truth** and drafts `strategy` from
them directly. That reinforced a stale cache: it drafted "BUILD a coverage-gap mechanism" strategy
for a mechanism (`referenced-artifact-exists` + `use-case-row-has-scenario` in `check-spec-state.mts`)
that was **already built** and runs at the spec-gate.

## The contract change (three parts)

1. **Validate-before-draft gate.** Each gap/defect a plan or log surfaces is a *hypothesis*, not a
   fact. Before drafting, validate against CURRENT code: still-open, or built/fixed/superseded?
   A candidate current code already resolves is **CUT (recorded resolved)**, never drafted as work.
   This is the repo's `a-source-read-is-a-hypothesis` principle baked into the loop.
2. **Improvement plan from validated-still-open findings** — grounded in current code.
3. **Emit validated-open findings as NEW tracked issues** (`gh issue create`, deduped) — one issue
   per real improvement, cross-linking evidence. Issue = actionable output; ledger `strategy` line =
   provenance.

Preserve: draft-only + Council-ratifies; retro distillation; no self-ratify/self-dispatch.
The gate sits BEFORE the draft; issue-emission is the improvement output.

## Method

Dogfood SDD. Freeze behavior in `scanner.feature` first (spec gate), THEN edit the skill + agent
(impl gate). Node: `.agents/specs/sdd/doctrine/scanner/` (revise, already exists).

## Coordination

Mission-graph node `op6-m14` shares this exact touch-set but is **retired** (disposed as phantom by
pod-op6-m14 — no plan, no spec, no description). Not folding into a retired node; running standalone.
Surfaced here per brief.

## NEXT

Run explore: draft the new scenarios (validation gate CUT/keep, issue emission, dedupe) onto
`scanner.feature` and the matching Use Cases + prose in `scanner/README.md`. Then cold spec-judge.
