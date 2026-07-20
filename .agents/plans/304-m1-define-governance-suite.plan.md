---
cr-ref: 304-m1-define-governance
source: https://github.com/cyberuni/cyberplace/issues/304
status: draft
todos:
  - content: "Assess each legacy case for CURRENT relevance against the live skill (reference only)"
    status: completed
  - content: "Grill the relevant-and-uncovered behaviors into new scenarios on the live suite"
    status: in_progress
  - content: "Spec gate: freeze the added scenarios, record gate line"
    status: pending
  - content: "Impl gate, then handoff: PR referencing #304 (this spec only, issue stays open)"
    status: pending
---

# CR 304-M1 — build up define-governance's suite

Issue #304 M1. **Reset scope: one spec at a time.** A prior attempt tried to spec a corpus-wide
scenario<->case mapping contract plus a migration of every legacy corpus at once; it ran three grill
rounds without converging and was parked. This CR does one node, by judgment, with no engine work.

## Method — build up, do not copy

The legacy corpus at the retired `artifacts/specs/define-governance/` is **reference material only**.
Nothing is migrated or copied. For each legacy case: decide whether the behavior it describes is
**still relevant to the skill as it exists today**. Where it is relevant *and* the live suite does
not cover it, author a new scenario on the live suite. Everything else is discarded.

Adding scenarios is **additive — it self-clears and needs no freeze re-open**.

## Target

- Live node: `.agents/specs/aced/config-authoring/define-governance/`
- Live suite: `define-governance.feature` (18 frozen scenarios)
- Implementation: `plugins/aced/skills/define-governance/SKILL.md`
- Reference: `artifacts/specs/define-governance/golden-set/` (22 legacy cases)

## Measured going in

22 legacy cases against 18 live scenarios: 8 map to a live scenario, 2 are ambiguous, **12 describe
behavior no live scenario covers**. Those 12 are the candidate pool — each still needs its relevance
to the current skill confirmed before it earns a scenario. Separately, 8 live scenarios have no
legacy case; that is a coverage observation, not work for this CR.

## Carried forward from the parked attempt

- A legacy case can assert a rule the corpus has since **reversed** — one define-skill case still
  asserts a prefix that a later CR deliberately renamed, and it survived the sweep because nothing
  bound it to its contract. Treat every legacy assertion as a claim to verify against today's skill,
  never as evidence of current behavior.
- Squad resolution is **per touched file**. This CR touches a `.feature` and a `SKILL.md` — agent
  configuration, so the ACED squad genuinely fits here (unlike the parked node, whose implementation
  was a deterministic script).

## Assessment result — 14 candidates yield 6 scenarios

| verdict | count | disposition |
| --- | --- | --- |
| REAL-AND-UNCOVERED | 6 | earns a scenario (two legacy cases folded into one) |
| UNSUPPORTED | 4 | the current skill has no such rule — writing a scenario would spec aspiration as behavior |
| STALE | 3 | the legacy case asserts a rule the skill has since reversed |
| unassertable | 1 | "the consumers answer shapes the depth of the body" has no binding test |

**The three stale cases each penalize a correct agent today.** Two assert a description prefix a
later CR deliberately reversed corpus-wide; the third requires the agent to name a skill that was
deleted, where the current skill names its successor. All three survived because nothing bound them
to the contract they tested — the exact failure this work exists to end.

**The four unsupported cases are the discipline that matters:** three "out-of-scope request" cases
and one rejecting link-only content describe behavior the skill does not implement. If that rule is
wanted it belongs in the SKILL.md first, then earns one scenario — not three scenarios inventing a
contract the implementation never made.

The six that survive are each backed by a line in the current implementation: the five gather
questions, asking about an unclear scope, mixed criteria-and-steps content, atomic rule splitting,
kebab-case name normalization, and reporting quality findings below the fix bar.

## Grill round 1 — judge verdict

Not aligned. Four of six passed every attack (the judge documented what it tried and could not
break); the two that failed were the two the producer had **disclosed** rather than hidden, which
validates the disclosure.

- **Dropped one scenario entirely.** The mixed criteria-and-steps scenario was a fifth instance of
  the UNSUPPORTED class this CR rejected four legacy cases for. Its derivation had a **branch point
  the skill never took** — for such a document the implementation equally supports authoring a
  criteria-only governance, redirecting the whole document, or splitting it in two. The scenario
  froze the option that silently discards user-supplied content. Second, independent reason: the
  implementation already defines "Mixed" over content *shapes*, so the title reused a defined term
  for a different axis, and a freeze would make that permanent.
- **Split a double-barreled scenario.** Its `Then` gated drafting on all five gathered requirements
  while also asserting the asking — two postconditions with independent failure modes. Only four are
  load-bearing: the file template has a genuine data dependency on them, whereas the consumers answer
  only informs depth, so an implementation that never asked it would violate the scenario but no
  line of the implementation.
- Lesser: a fixture left vague exactly where the value carries the verdict, step vocabulary that
  forked from the frozen suite's wording for the same operations, and an over-stuffed README row.

## Follow-up this CR will file, not fix

The dropped scenario's behavior may well be wanted. It requires stating a disposition in the
implementation **first** — which document a mixed criteria-and-steps input becomes — and only then
earns a scenario. That is a skill change, not a spec addition, and it routes as its own unit.

## The drafting-gate derivation — recorded here, deliberately NOT in the durable spec

The gate ("no file is drafted until the name, content type and rules are gathered") is not stated in
the implementation; it is derived from the required fields of the file template, which cannot be
filled without those answers. **The derivation has no branch point** — unlike the scenario dropped in
round 1, where three defensible behaviors existed and the implementation chose none. The judge
independently confirmed the backing is *stronger* than claimed: the implementation's own section
ordering puts gathering before drafting, and the name field cannot be written without the name.
Deliver adds the stating line to the implementation.

Two scoping notes so a later CR does not misread an omission as a ruling:

- **Topic** is outside the gated set only because the fixture supplies it, making it true by
  construction. Not a ruling that topic can never gate.
- **Consumers** is outside it because the implementation says that answer only informs structure and
  depth, so it cannot block a write — though the file template's description field does reference it.
  A weaker gate is still a true gate, and the asking of consumers is covered by its own scenario.

An earlier draft put this reasoning in the node's README, where it severed the use-case table and
lodged transient CR narration in a durable spec. It belongs here.

## Measured on owner's instruction — the eval loop's fail-open oracle

Investigated before closing this node rather than deferred. **Verified against the run skill's own
text, not inferred:** a scenario is skipped when its layer is absent from the declared layer list,
and **nothing anywhere warns when a declared layer matches zero scenarios.** The only guard runs the
opposite direction — the add-scenario skill warns when a scenario's layer is not enabled. A
declared-but-empty layer is a silent no-op.

**This does not affect either gate in this mission.** The impl-gate runner never reads the declared
layer list at all, so all twenty-five scenarios were genuinely exercised. The fail-open path is the
manual eval loop.

- **Declared-but-unreachable:** two of seven pairable suites declare a trigger layer with zero
  scenarios that could route to it — fifty-eight scenarios silently degrading to the default layer.
- **The reverse direction is far wider:** twenty-one suites carry trigger or rubric scenarios with no
  eval policy file at all, including the spec-producer and spec-validator suites and the doctrine
  node — the eval loop reports no suite initialized and stops.
- **A live silent defect:** the quality layer is declared by no policy file anywhere, yet two suites
  carry a quality-tagged scenario each. Both are skipped, and nothing reports that they were.

Out of scope to fix here; this node is one instance of a corpus-wide defect and fixing it in one
place would hide it everywhere else.

## Follow-ups to file at handoff

1. **The atomicity pair does not exclude a proxy criterion.** The two frozen scenarios are both
   satisfied by "split only when the conjuncts name different objects". The unbracketed case is
   *same object, separably falsifiable* — one object, two demands that each fail independently,
   which must split but which the proxy leaves alone. Needs one additional scenario; do not retrofit
   the frozen two.
2. **The fix bar's lower boundary is unassertable.** That a below-bar failure is left unfixed lives
   only as a presupposition inside one scenario's Given; no scenario asserts it.
3. **A disposition for mixed criteria-and-steps input** — the round-1 drop. Requires stating the
   behavior in the implementation first, then a scenario.

## NEXT

Targeted re-judge of the corrected README, then the spec gate.
