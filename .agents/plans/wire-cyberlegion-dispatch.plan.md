---
cr: wire-cyberlegion-dispatch
status: active
target-spec: .agents/specs/sdd
todos:
  - content: "Grill design tension: warm vs cold-judge; /new reset boundary"
    status: completed
  - content: "Draft conductor dispatch-transport scenarios (intent seam + prefer-warm + fallback) — additive, addOnly"
    status: completed
  - content: "Draft warm-lifecycle scenarios + handoff warm-unit reset scenario"
    status: completed
  - content: "Promote harness-spawning.md ADR-0023 seam intent-only -> wired; README concern+prose"
    status: completed
  - content: "Spec gate: cold spec-judge ALIGNED (1 fix round), features self-clear frozen, ledger gate line"
    status: completed
  - content: "Deliver: skill edits (start-mission SKILL + sdd-automaton) + cold impl-judge APPROVE"
    status: completed
  - content: "Handoff: impl gate ratified (by:unional), PR #120 to main, /new"
    status: completed
---

# CR: wire SDD workflow with cyberlegion dispatch

Wire SDD's spawn seam to cyberlegion's `dispatch` routing brain (the "later CR" ADR-0023
deferred). SDD states a dispatch **intent** (role, brief, verdict schema); cyberlegion's
`dispatch/` picks `subagent | channel | run-inline`. Prefer **warm** units (the `channel`
peer strategy) for interactive roles. Units stay warm for one mission; reset with `/new`
at handoff.

## Fixed context
- Target spec: `.agents/specs/sdd` (SDD is the consumer; cyberlegion dispatch already exists).
- Seam already named by intent: `.agents/specs/sdd/design/harness-spawning.md` (ADR-0023).
- cyberlegion dispatch surface: `.agents/specs/cyberlegion-plugin/dispatch/README.md`.
- cyberlegion published (0.1.0) + in-repo `packages/cyberlegion` — "when available" = runtime.
- HARD invariant to protect: judges run **cold** (fresh context per judgment, grader
  independence, ADR-0016). "Prefer warm" cannot silently trade this away.

## Open design tension (grill)
- Does warm apply to judges? Candidate synthesis: warm **process/pane** + `/new` **per
  judgment** = fast start + fresh cold context. vs judges-always-cold-subagent. vs
  warm-judge-retains-round-context.
- `/new` boundary: only at handoff, or also at each cold-judgment inside a mission.

## NEXT
Grill the user on the warm/cold-judge tension and the `/new` reset boundary; then draft
revised conductor spawn scenarios.

## Blocking dependency — RESOLVED
- **#122 → landed as #141** — `cyberlegion unit clear <ref>` injects the harness's own
  fresh-context command (`/clear` on Claude/Codex/Copilot, `/new-chat` on Cursor, fail-loud
  otherwise) and keeps the pane warm.
- Rebased onto main; swapped every `/new`-reset realization for `cyberlegion unit clear <ref>`
  across start-mission SKILL, sdd-automaton, harness-spawning.md, conductor README. Frozen
  `.feature` untouched (intent-worded) → no re-gate. `pnpm verify` 19/19.

## CR link
This plan is the CR. Source: user change prompt (no external URL). PR #120.
