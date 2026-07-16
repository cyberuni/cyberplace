---
cr-ref: 295
source: https://github.com/cyberuni/cyberplace/issues/295
project-path: .agents/specs/sdd
todos:
  - content: Measure the corpus — does any rubric record its trade?
    status: completed
  - content: Test candidate 2 — does escalate-when-you-cannot-classify reach this case?
    status: completed
  - content: Add the recorded-trade duty to suite-format as the completion of "say it out loud"
    status: completed
  - content: State the residual soft spot the bar cannot catch, and stop looking
    status: completed
  - content: Freeze authoring-scoped scenarios; assert the check does NOT fire on the unrecorded corpus
    status: completed
  - content: Mirror bar edits into the shipped suite-format-governance + spec-producer-governance SKILL.md
    status: completed
  - content: Spec gate — cold judge charged to attack the over-fire and the #282 boundary
    status: pending
---

# 295 — the substitutability test's boundary case

#292 landed the selection rule (a criterion is a `@rubric` dimension **only if** you accept that
strength elsewhere pays for weakness here). #295 asks: the test is decisive on clear-cut criteria
and gives no traction on boundary cases, because a motivated producer can construct a plausible
trade narrative. Filed as an **observation**; "nothing, close it" is a legitimate landing.

## The argument is structural, not empirical — the corpus cannot speak yet

#292's operational form is **say the trade out loud**, and the bar provides **no artifact for the
utterance**. True by **inspection of the bar**, needing no corpus: the rule prescribes a spoken act
with no recorded output, so the judge has nothing to read and a reader has nothing to disagree with.
A rule whose compliance and violation look identical is not enforceable by anyone.

**The corpus measurement does not support this, and must not be leaned on.** 0 of 102 dimensions
record a trade and 0 thresholds record a reason — but **both duties landed with #292, merged the
same day**. That corpus was authored *before* the rule existed, so its silence is evidence about
neither producer compliance nor the duty rotting. It is **too early to tell**, in both directions.
Do not cite it as evidence; cite the structure.

## THE FINDING — selection has no backstop, and discrimination is barred from being one

The real shape of #295, found by the cold adversary, not by the issue:

Selection is guarded by **exactly one confident cold judgment, with no second reader.** The natural
backstop would be **discrimination** — smuggle `no_npx_dependency` in as a `max: 2` dimension, then
name the wrong subject that ships npx and check it lands under the threshold. **The bar explicitly
forbids naming that subject**: a subject right about everything except the one criterion is a
*blemished good subject*, the strawman the miss test bars. So the only subject that would expose a
smuggled rule is the one subject the miss test refuses to name. And the check ordering states
selection-before-discrimination as a feature — *"a criterion that leaves the sum needs no
discrimination analysis"* — which is true, and also means **if selection is wrong, nothing
downstream re-asks the question.**

This is not "nothing." It is a precisely-locatable soft spot, which is what the issue asked for.

## The landing — candidate 2 rejected (right verdict, wrong reason)

**Candidate 2 — REJECTED.** The escalate rule (`suite-format`, *Selection and discrimination are
judged, not linted*) is keyed on the judge's self-reported **inability**: *"a judge that ... cannot
say whether a dimension's trade is one it would accept, escalates it."*

**Not** because the producer persuades the judge — under a cold judge that re-derives its own oracle,
the producer's narrative barely reaches it, and that reasoning is wrong. The real reason:
**confidence is the judge's default state, not the persuaded state.** A genuinely contested criterion
does not produce inability — it produces **confident disagreement**, competent judges landing on
opposite sides, each sure. **Contestable-in-fact ≠ uncertain-to-this-judge.** Escalate triggers on
the second; the gap lives in the first. Record the rejection *and this reason* so nobody re-checks.

**Candidate 1 — ADOPTED, but it does NOT close #295 and the "teeth" case for it is dead.**
The cold adversary ran **the bar's own miss test** on the proposal. Plausible wrong subject: the
motivated producer (#295's literal premise). Does he lose? **No** — he writes *"strength on
completeness pays for weakness here"*: two-sided, names what pays, passes. **The duty cannot register
a miss against the only subject #295 is about.** "Name what pays" separates the **lazy** producer
from the **careful** one; it never touches **motivated** from **honest**. Closing #295 on it would be
a false close.

What survives is a different, honest case — **reviewability, not detection**:

- An unrecorded trade is **unfalsifiable**. Nobody can disagree with a sentence never written. A
  dimension whose trade was never stated is an **unowned selection** — the bar's own words about the
  cut (*"a `threshold:` line with no recorded reason is an unowned policy"*), one paragraph up.
- It converts the judge's task from **generative to evaluative**: negate a stated proposition,
  instead of first reconstructing the producer's intended trade and then negating that.
- **Low rot / low bloat risk, measured:** producers **already** write rich inline prose beside
  dimensions unprompted (`ssa-lowering.feature`). The duty retargets a live habit (what a dimension
  *means*) at what it *trades* — not new machinery.
- **Cost, accepted and named:** it puts the producer's most persuasive sentence in the cold judge's
  context (anchoring). Taken anyway — the judge already reads and grades producer-authored prose
  beside dimensions; ADR-0016 governs **context carryover**, not artifact content; and an unrecorded
  decision is reviewable by **nobody**, which is strictly worse.
- **Fold into the existing "Record why"** — one record beside the rubric carrying both the cut and
  the trade. A second parallel duty is a second rot surface.

**Candidate 3 — ADOPTED, and this is the actual answer to #295.** The soft spot stays open by design.
Document it *with the no-backstop finding above* — that is the content the issue was missing.

## Scope — the authoring duty only

- Binds when a dimension is **authored or revised**. The 102 existing unrecorded dimensions are
  **#282**'s queue — mirrors #292's own *select before you author* scoping. A scenario must freeze
  that the check **does not fire** on an existing unrecorded dimension, or the rule over-fires into
  #282's ground.
- Touches **no threshold**. Re-derivation is **#294**.

## Traps (do not re-enter)

- **No numeric or mechanical disambiguator.** #292's whole thesis: six rounds failed deriving this
  from arithmetic over `max`/`threshold`. No arithmetic over the scores can see it.
- **No per-dimension hurdles.** Conjunctive scoring is **less** reliable — the least-reliable
  subscore controls, more false negatives. "Conjunctive minimum + compensatory total" refuted 0-3.
- **`threshold == sum` is not a tell to build on.** 8 of 37 rubrics have it (no trade is possible at
  all). It is confounded with the cut, which is a **policy** variable — a strict cut is legitimate.
  Observation for #282/#294; **file it, do not absorb it**.

## Follow-ups found (file at handoff)

1. **The completeness `Given` under-enumerates the judged bars.** `spec-producer.feature:127` lists
   *well formed, no entangled `Given`, no unloseable dimension* → `Then` **reports complete**. It does
   **not** enumerate **selection** (added by #292) or the trade record (this CR). A `.feature` summing
   a non-substitutable criterion satisfies it and the producer reports complete. **Pre-existing —
   created by #292, inherited here.** Adding a conjunct to a frozen `Given` is a **narrowing** →
   Clearance → needs ratification, so out of scope for this CR.
2. **Retired rubric syntax, drifted and frozen.** 3 rubric blocks use `dimension: X (max N)` instead
   of the prescribed `- name:`/`max:` (`corpus/discovery`, `corpus/spec-anchors`). The rule is old,
   universal, judge-enforced, and **not** in the mechanical form check — `spec-anchors.feature` is
   `@frozen`, was touched today, and is still nonconforming. Evidence an unlinted structural duty rots.
3. **8 of 37 rubrics have `threshold` == the full dimension sum** — every dimension must max, so **no
   trade is possible at all**. Confounded with the cut being a legitimate policy call, so not a defect
   on its face; a strong signal for **#282**'s sweep. Do not build a rule on it (arithmetic).
4. **The `threshold:` "Record why" duty (#292) has no frozen scenario.** A duty argued in prose and
   never frozen is not specified. This CR's trade record is folded into that same record.
5. **Lint the record's presence — after #282.** The trade's *truth* is unlintable; its *record* is a
   form check. Today it would fire on ~102 standing dimensions (#282's ground), so it must follow the
   backfill, not precede it.
6. **The judge-side presence check is blocked by a frozen scenario — RESOLVED IN-CR by foreclosing.**
   Any rule making a missing record reportable narrows frozen `a rubric whose dimensions a reviewer
   would genuinely trade passes selection`, whose `Given` is **silent on records**: on the base,
   **every** snapshot it covers records none, so the rule flips its whole extension with its text
   untouched → **Clearance**, invisible to `addOnly`. Round 2 caught this being carried by **agent
   prose** after round 1 removed it from a scenario — the seam migrated rather than closing.
   **Foreclosed on the merits, not for convenience:** a record's *presence* is a lexical fact, not a
   judgment about the domain, so no judge reports a missing record whoever authored it. The judge's
   behavior on an unrecorded dimension is exactly what it was pre-CR (reconstruct and rule), so the
   frozen scenario keeps its full extension and the judge only **gains** a case. Price, stated in the
   bar: the duty has **no judge-side enforcement** until item 5's lint lands.
7. **The recording duty is the only return-gate duty with no gate scenario.** Every other duty binds
   to *report complete* via `spec-producer.feature:127`'s `Given`, which is the closed enumeration of
   their negations. This one binds only via the weaker *before returning* idiom (compatible — the
   producer records, **then** reports complete). Binding it properly means retrofitting a conjunct
   into that frozen `Given` — a **narrowing → Clearance**. Same root as item 1; whoever finishes the
   job pays one Clearance for both.

## The gate — four judge rounds, three floors found and closed

The seam **migrated three times**, always onto the same frozen scenario **F2** (`a rubric whose
dimensions a reviewer would genuinely trade passes selection`). Its `Then` is a **NEGATIVE** — *does
not report failing* — so **any** new selection-failure ground reaches it. That is the whole lesson:

1. **R1 Conflict** — a new judge scenario shared F2's byte-identical `When` and negated its `Then`,
   aimed at F2's apparatus *by construction* (its `Given` needed "a trade the producer accepts", and
   the corpus's only such rubric is the exemplar a sibling frozen scenario mandates). Fixed with
   fresh apparatus.
2. **R2 Clearance** — the fix pushed it into **agent prose the freeze cannot read**: "a **standing**
   dimension recording no trade is not reportable" implied an **authored** one *is*, flipping F2
   wholesale (F2 is silent on records; on the base every snapshot it covers records none).
3. **R3 Clearance** — foreclosing the *missing* record left the *present-but-unfaithful* one. Proved
   **no scoped judge-side grading rule escapes**, since F2's negative `Then` catches any new failure.
4. **R4 + final** — closed by adding **zero new failure ground**: the record left the judge's path
   entirely. This is what the **first** adversary said on anchoring grounds ("record what the judge
   cannot derive; never record what it must") and the author dismissed. Three floors to relearn it.

**Own goals caught, not by the floors:** a `Given` that admitted the very case its `Then` contradicted
(a non-substitutable criterion forced to record a trade); an authored rule that **foreclosed a
permission the same file still grants** (record location); a claim stated twice; a false claim that
recording forces threshold re-derivation (it changes no `max` and no cut — **stripping** does).

## NEXT

Final confirmation judge running. Then: commit, PR, report to legate, drain the 6 recorded follow-ups.
