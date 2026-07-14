---
status: active
todos:
  - content: intake — open CR against .agents/specs/sdd, scaffold brief + leash
    status: completed
  - content: explore — grill the gate design (signal reuse vs new; no-log branch generalization)
    status: completed
  - content: explore — revise plan-retirement spec + .feature (additive scenarios)
    status: completed
  - content: spec gate — freeze the .feature, record gate line
    status: completed
  - content: deliver — extend retire-plans.mts + tests to sweep transient CR artifacts
    status: completed
  - content: impl gate — cold impl-judge over frozen scenarios
    status: completed
  - content: handoff — pnpm verify, PR with Closes #193, mail legate
    status: in_progress
---

# github-193 — codify transient CR-planning artifacts + retire-sweep

CR: https://github.com/cyberuni/cyberplace/issues/193 (SQ-F4, self-declared Independent)
Design source: `.agents/plans/cyberfleet-batch.operations.md` (Side-quests SQ-F4)

## Subject

Codify `<cr-ref>.design.md` / `.operations.md` / `.evidence.md` as recognized **transient CR-level
planning artifacts** in SDD, and extend the `plan-retirement` sweep to remove them so a retired CR
leaves no orphan. Today the sweep globs only `<cr-ref>.plan.md` + `<cr-ref>.log.jsonl`, so these
briefs strand in the tree — the root cause behind the 53 ghost `status:active` briefs.

Target project spec: `.agents/specs/sdd` (project-path `plugins/sdd`).
Touched nodes: `.agents/specs/sdd/doctrine/plan-retirement/` (revise — behavioral, frozen suite).
Artifact-types: `skill` (the plan-retirement skill + its `.mts` engine).

## Boundary (from the mission brief)

Build the **capability** + codify the artifact types. Do **not** retire the
`cyberfleet-batch.{design,operations,evidence}.md` briefs — they are still being read by live
missions (#192 op5-m1, #196 when it runs). Codify + wire the sweep only.

## Design settled (explore grill, user-confirmed)

1. **Gate signal — reuse, briefs ride along.** No new mechanism. The retirement decision is
   **unchanged** (`cleared AND present(plan.md) AND (distilled OR !logPresent)`); only the deleted
   file set widens from the plan pair to all five files. A `migrated` field was rejected: it would
   be caller-asserted, the exact hole the clearance boundary says buys nothing but silent data loss.
2. **Briefs do not widen the gate.** Only the combat log **owes** a distillation (its `cause`s are
   owed to the ledger's `strategy`). A brief owes nothing — its content was consumed by the mission
   itself. Gating on one would re-strand the no-log mission class the no-log branch exists to
   rescue.
3. **Briefs do not anchor presence.** `plan.md` stays the sole presence signal. Widening it would
   have narrowed the frozen *no-plan-is-a-no-op* scenario (a re-open), and a filesystem check
   confirmed **zero existing orphans**, so it would buy nothing.
4. **`.evidence.md` sweeps with the rest** — transient as it stands today; a future SQ-F5 that gives
   decision-evidence a durable home carves it back out.

## Outcome

Both gates passed and self-asserted within the `auto-all` leash. Round-1 cold spec-judge failed
oracle+builder (the briefs-do-not-anchor-presence use case had **no covering scenario** — an impl
treating a brief as an alternate presence signal would have passed the whole suite); fixed, and
round 2 returned ALIGNED true. Cold impl-judge IMPLEMENTATION_PASS true, 17/17 against an
independently re-derived oracle plus 3 self-authored adversarial probes. Root `pnpm verify` green.

## NEXT

Mission complete pending merge. The **boundary held**: the `cyberfleet-batch.{design,operations,
evidence}.md` briefs were NOT retired — they are still read by live missions (#192 op5-m1, #196).
This CR builds the capability only; retiring those briefs is the caller's later act once their
missions land.
