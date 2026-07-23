---
cr-ref: 304-m1-define-skill
source: https://github.com/cyberuni/cyberplace/issues/304
status: done
todos:
  - content: "Assess each legacy case for CURRENT relevance against the live skill (reference only)"
    status: completed
  - content: "CLEARANCE: a frozen scenario demands behavior the implementation deliberately removed"
    status: completed
  - content: "Additive repairs: companions for the do-nothing-passing scenarios, the unspecified severity band"
    status: completed
  - content: "Rebuild the node spec to the four-section shape; draw the control flow; bind every edge"
    status: completed
  - content: "Gates, then handoff (PR batched with the other specs, per owner)"
    status: completed
---

# CR 304-M1 — build up define-skill's suite

Second node under the one-spec-at-a-time reset. Same method as `define-governance`: the retired
corpus is **reference only**, nothing is migrated, and a legacy case is a claim to verify against the
implementation rather than evidence of current behavior.

## The corpus yields nothing — and that is the finding

Nineteen legacy cases against thirty-three frozen scenarios: **seventeen already covered, two stale,
zero real-and-uncovered.** No new scenario is owed to the corpus. Unlike the previous node, where
twelve cases described uncovered behavior, this corpus has been fully absorbed already.

The two stale ones both assert reversed rules, and would score a correct agent as failing:

- one demands a description prefix that a later change request renamed corpus-wide
- one demands the skill co-produce an eval suite, which the implementation deliberately stopped doing

## HARD FLOOR — Clearance. The second stale rule is also frozen in the live suite.

`dispatched against a frozen suite it co-produces the eval suite` asserts that the skill writes an
eval suite carrying one eval per frozen scenario. The implementation states the opposite in its own
opening: the frozen suite **is** the verification, so no separate eval suite is authored, and the
policy file carries only the subject binding and run policy. The reversal was deliberate and is
recorded in the history.

**A conformant implementation fails this frozen scenario.** It does not under-test — it actively
penalizes correct behavior, and a gate would enforce it. The same stale sentence sits in the node's
use-case table.

Correcting it means rewriting or deleting a frozen scenario. That is a narrowing, so it stops here
for the owner rather than being taken unattended. This scenario has been frozen since July, unlike
the one reverted on the previous node, which this mission had frozen minutes earlier.

## The rest is repairable ADDITIVELY — no floor

Six live scenarios read as unsound. Most can be fixed by **adding** a companion rather than editing
the frozen one, which self-clears:

- a negative-only scenario that a do-nothing implementation satisfies — wants its positive companion
- a scenario asserting a read happened rather than a postcondition — wants an outcome scenario
- a gate-role naming scenario that passes with no role check at all — wants its companion
- a severity band the implementation requires but no scenario covers — wants its own scenario

Two would need a rewrite rather than an addition, and are therefore Clearance-bound as well: one
scenario packs several assertions into a single boolean, and one is double-barreled. Neither
penalizes correct behavior, so both can wait rather than joining this ask.

## NEXT

Owner decides the Clearance ask below. The additive repairs and the control-flow rebuild proceed
either way, since neither touches a frozen scenario.

## Outcome — landed on the branch, PR batched

Both gates cleared; the impl gate was ratified by the owner (auto-spec leash). Two clearances, each
recorded before editing, held their bounds — removed=3, modified=1 — across five grill rounds with no
creep. The node spec was rebuilt to the four-section shape and its control-flow graph bound one-to-one
to the 41 scenarios.

Five follow-ups filed: #340 (no fail-loud catch-all for a future entry mode), #341 (fill-out vs
diagnose boundary invisible to description-only routing), #342 (two procedure-not-outcome scenarios),
#343 (mistitled severity band), #344 (add / add-scenario naming drift). All recorded in the ledger
before filing.

## The finding that generalizes across the corpus

The retired corpus yielded zero new scenarios — seventeen of nineteen cases already covered — yet the
node held a frozen scenario that FAILED a correct implementation, an uncovered entry point, and a
stale spec row. A well-mined corpus is not evidence of a healthy suite; it is a reason nobody re-read
the suite against the implementation. Every real defect on this node came from that re-read and from
drawing the control-flow graph, not from the corpus. The reset instruction — build the current suite
up using the old one as reference only — is what surfaced them.
