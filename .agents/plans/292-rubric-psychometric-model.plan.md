---
cr-ref: 292
source: https://github.com/cyberuni/cyberplace/issues/292
project-path: .agents/specs/sdd
todos:
  - content: Add the substitutability test to suite-format as the Form 1 / Form 2 selection rule
    status: completed
  - content: Adopt the psychometric vocabulary (compensatory, compensation, classification error, cSEM)
    status: completed
  - content: Delete every invented margin doctrine; replace with measure-your-judge (cSEM)
    status: completed
  - content: Name the cut a policy call the spec owner sets from error costs and records
    status: completed
  - content: Keep the three survivors — count-don't-zero, tie rule (strictly under), double-barreled
    status: completed
  - content: Add additive spec-producer scenarios freezing the selection rule
    status: completed
  - content: Mirror all bar edits into the shipped suite-format-governance SKILL.md
    status: completed
  - content: Spec gate — cold judge charged to argue FOR the Clearance floor on :171
    status: completed
---

# 292 — rubric thresholds: adopt the psychometric model

Supersedes #279 and #291. Six rounds of prose iteration on the `suite-format` discrimination bar
failed at four consecutive impl gates, each round's fix creating the next round's defect. The
problem is 40-year-old psychometrics and has names.

## The model

Summing N dimensions against one threshold is a **compensatory** model. Its documented failure —
a subject wholly failing one dimension still passes by banking points elsewhere — is
**compensation** / **false positive classification error**. It attaches to the **aggregation**,
not to any judgment method. Not "masking", not "a dead dimension" — searching the wrong word is
why the literature was never found.

## The missing rule — substitutability

Compensation is invalid where a dimension is not substitutable. A criterion belongs in a `@rubric`
**only if** strength elsewhere may legitimately pay for weakness here; otherwise it is a boolean
`Then`. The bar always had the Form 1 / Form 2 structure — it never had the **selection rule**.
#282 filed this first, in local vocabulary: re-grading a rule as a rubric dimension makes it
**tradeable**, the one thing a rule must never be. **Tradeable = substitutable.**

## Scope — the bar only

This CR changes the **bar**. The corpus fix (~13 tradeable dimensions) is **#282**; the scrutiny
rule on what legitimately remains a rubric is **#280**. Sequence: #292 selection → #282 corpus →
#280 scrutiny. Issue item 6 ("re-derive #291's audit") is reassigned to #282 by the issue's own
later comment; it is judgment work, not a script, and every attempt to lint it produced a defect.

## Frozen ground — checked, survives

`spec-producer.feature:151` reads like a threshold-margin rule but its `Then` rewrites the **free
dimensions** — a dimension-quality rule derivable from the per-dimension miss test with no
arithmetic. `:171`'s `Then` targets the **loseable** dimension instead, so the pair never
contradicts. The `+1` margin was never load-bearing. New scenarios are **additive** (self-clear).

## The Clearance question to put to the cold judge

`:171` ("an already-loseable dimension is left alone") overlaps a dimension that is
loseable-but-non-substitutable. The new rule moves it out of the sum. Read as
different-`When` (miss test vs substitutability test) and generic/specific, this exits `Conflict`
and needs no re-open — and `:171` is **not edited**, which is the blessed path. But the exception
was **not intended** when `:171` froze, so charge the judge to argue **for** the floor.

## Traps (do not re-enter)

- **Contrasting groups at n=1** — one wrong + one good subject with the cut between is a crude
  contrasting-groups instance. At n=1 per group there is no distribution, variance, or
  intersection. Two points give an **ordering**, never a separation. Sanity check, never a
  derivation.
- **Conjunctive scoring is LESS reliable** — the least-reliable subscore controls and it yields
  more false negatives. "Conjunctive minimum + compensatory total" was **refuted 0-3**. Do not
  reach for per-dimension hurdles. Substitutability is the opposite move: the criterion leaves
  the rubric entirely rather than gaining a floor.
- **"Zero each dimension in turn"** posits a subject right about everything but one thing — a
  blemished **good** subject, the strawman the miss test already bars. A score profile does not
  identify a subject.

## NEXT

Spec gate PASSED (self-asserted, auto-spec leash) — adversarial judge returned FLOOR DOES NOT FIRE
on re-attack. Remaining: commit, open PR, report to legate, file follow-ups (#282 threshold
re-derivation; the substitutability rule has no disambiguator for a producer motivated to
rationalize a trade).
