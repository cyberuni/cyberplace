---
status: active
todos:
  - content: "explore: push-race scenario (additive) + scenario-3 Given tightening (re-open); prose"
    status: in_progress
  - content: "spec gate: additive self-clears; scenario-3 re-open ratified in-session, re-frozen"
    status: pending
  - content: "deliver: push-race re-rebase+re-verify prose in start-mission Step 3/4"
    status: pending
  - content: "impl gate: cold impl-judge static-inspects the realization"
    status: pending
  - content: "handoff: pnpm verify, changeset, branch + PR"
    status: pending
---

# CR: rebase-conflict refinements (follow-ups to #143)

Two follow-ups on `mission/conductor/` (rebase-before-impl-gate):

1. **Push-race (additive).** Target advances between the impl gate and the push → the conductor
   re-rebases onto the new tip and does NOT push until the impl gate passes on the re-rebased tree.
   Keeps re-verify in the conductor/deliver seam (Design A), not handoff. (Lived it while landing #143.)
2. **Scenario-3 Given tightening (re-open).** `a rebase conflict is resolved as deliver work` — Given
   was unqualified ("produces a merge conflict"); now "...the conductor can resolve confidently", to
   disambiguate against the unconfident-halt scenario. Modify of a frozen scenario → re-open,
   ratified in-session (operator directed the follow-up). Not a Clearance narrowing: the Then
   (guarantee) is unchanged; only the precondition is scoped.

**Edit class:** gherkin-cli diff 1 added / 1 modified / 0 removed.

## NEXT

Update start-mission Step 3/4 prose for the push-race loop; cold spec-judge; spec gate
(additive self-clears, scenario-3 re-open→re-approve in the same session); impl gate; PR.

CR source: bare prompt (operator follow-up on #143).
