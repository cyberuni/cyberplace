---
name: sdd-durable-combat-log-footprint
status: active
todos:
  - content: "explore: RECONCILE against landed d2-correction-line-durability; scope CR B to the residual (non-conductor missions), do NOT rebuild d2"
    status: in_progress
  - content: "spec gate: cold sdd-spec-judge over the touched combat-log governance + consumer-suite scenarios"
    status: pending
  - content: "deliver: implement the residual footprint requirement + one verification per frozen scenario"
    status: pending
  - content: "impl gate: cold sdd-impl-judge"
    status: pending
  - content: "handoff: root pnpm verify, land, keep combat log"
    status: pending
---

# CR B — durable combat-log footprint (ratified cluster B, 2026-07)

Ratified doctrine strategy (Council, retro `local-doctrine-retro-2026-07`). Branch
`sdd-durable-combat-log-footprint` off `main`. Target spec: `.agents/specs/sdd`.

## The strategy (as ratified)

In-session / self-asserted missions were writing **no** `*.log.jsonl`; judge-iteration corrections got
folded into the gate `why` prose instead of a discrete `correction` line with a matchable `cause`,
starving the doctrine loop's PRIMARY input. The retro found only 8 of 34 briefs kept a log. Evidence
lines (sdd ledger, all unratified): `strategy.317dd8` seq2, `strategy.7668d1` seq1, `strategy.acaa41`
seq2, `strategy.ba6a39` seq2.

## RECONCILIATION — most of this already landed (verify before building; CR A had the same trap)

**`d2-correction-line-durability` LANDED** (see memory `project_referenced_artifact_escalation`). The
combat-log node — `.agents/specs/sdd/common-governances/combat-log/README.md` (a **reference artifact**,
`spec-type: reference`, so **NO `.feature`** — conformance is verified through the CONSUMER suites:
conductor + spec-gate + Scanner) — **already specs** the correction-line durability discipline:
> "a judge-reject→fix→pass self-assert appends a discrete `correction` line — `correction-kind:
> judge-iteration` + a matchable `cause` — before the gate `why`, never only prose; and at finalize a
> mission carrying an unflushed correction writes that `correction` line, creating the combat log if
> absent."

And `strategy.acaa41` seq2 itself records that two **live in-session conductor runs**
(sdd-remove-formation-autorun, sdd-check-structure-breadth-vs-depth) **DID** write combat logs post-d2 —
closing the "no log ⇒ purely structural gap" reading. So **conductor-run missions are covered.**

## The RESIDUAL gap CR B actually targets

Missions that conclude **WITHOUT a live conductor run** — hand-run / reconcile-forward / chore-tracked.
`strategy.7668d1` seq1: strategy.317dd8 (min durable footprint) was **"narrowed by
reconcile-forward-footprint to gate-line-existence only, leaving the underlying gap open."**
`pause-mission`'s reconcile-forward checkpoint only runs `checkGateFloor` (gate-line existence), not a
discrete correction/footprint line. `strategy.ba6a39` seq2/seq4: a genuine in-session Ship mission (aced
manage-model-runners) + two chore-tracked missions (local-retire-create-skill,
local-merge-audit-improve-skill) landed with **zero** durable trace.

**So CR B = the minimum durable footprint for the NON-conductor mission class**, NOT the conductor
discipline (that's d2). Likely shape (settle in explore): at minimum one durable line per concluded
mission of this class (outcome class + whether a gate cycle ran), and/or discrete `correction` lines for
by-hand judge-iterations — so the doctrine loop's PRIMARY input is never structurally absent for an
entire mission class. Confirm exactly what `reconcile-forward-footprint` already mandates vs the open
part.

## NEXT — resume here (post-compaction entry point)

1. Read in full: `.agents/specs/sdd/common-governances/combat-log/README.md` (correction-line
   durability + finalize backstop), `.agents/specs/sdd/design/provenance-model.md` (the three tiers +
   readers-split + why in-session missions differ), `plugins/sdd/skills/pause-mission/SKILL.md`
   §"Reconcile-forward checkpoint" (what `checkGateFloor` mandates), and the 4 evidence `strategy` lines
   verbatim in `.agents/specs/sdd/ledger/`.
2. Decide the residual scope precisely (what's genuinely open after d2 + reconcile-forward-footprint).
   Likely a governance-prose + consumer-suite-scenario change, since the combat-log node is reference
   (no own `.feature`) — the behavior is verified in the conductor / pause-mission / Scanner suites.
3. Then the mission loop: author additively → spec gate (cold judge) → deliver → impl gate → handoff.
   Watch the freeze: additive scenarios on the consumer `.feature`s self-clear.

## Guardrails carried

- Reason to the correct answer; d2 already landed — do NOT duplicate it (same trap CR A avoided vs d1).
- Contested working tree / shared branch: plain `git commit` only, never `--amend`; re-check
  `git log -1` before each commit; stage own files by path. See memory
  `feedback_concurrent_sessions_shared_tree`.
- Leave `M .agents/specs/cyberfleet-plugin/README.md` (another session's) untouched.
