---
cr: 294
source: https://github.com/cyberuni/cyberplace/issues/294
project: sdd
status: draft
todos:
  - content: "Intake: locate node, verify routing claim empirically, re-measure corpus"
    status: completed
  - content: "Explore: author the correction-procedure rule + scenarios; grill with cold spec-judge"
    status: completed
  - content: "Spec gate: freeze touched .feature; confirm additive self-clear"
    status: completed
  - content: "Deliver: build the vacuity lint into check-suite; verification per frozen scenario"
    status: completed
  - content: "Impl gate: cold impl-judge over frozen scenarios"
    status: completed
  - content: "Handoff: pnpm verify, PR, record follow-ups, mail legate"
    status: pending
---

# 294 — correcting a summed non-substitutable criterion forces the cut to be re-derived

Defines HOW the #282 corpus fix must be scoped: a **queue of per-rubric ratified decisions**, not a
mechanical sweep. Output is the PROCEDURE #282 consumes. **Do not do #282's sweep here.**

## Target

- `.agents/specs/sdd/authoring/suite-format/README.md` — reference node, the bar's spec
- `plugins/sdd/skills/suite-format-governance/SKILL.md` — the shipped bar
- `.agents/specs/sdd/authoring/spec-producer/spec-producer.feature` — **@frozen**; new scenarios are
  **additive** (self-clear, file stays frozen)
- `plugins/sdd/skills/spec-producer-governance/SKILL.md` — the procedure

## Verified at intake (not asserted)

**Routing — VERIFIED empirically** against the real `classify-edit-class.mts` with a fixture, plus
two controls that survived (delimiter reformat and untouched file both -> `no-content-change`).

| Correction shape | Measured class | Routes to |
|---|---|---|
| strip dimension, add boolean `Then` to the **same** scenario | `narrowing` | Clearance |
| strip dimension, add a **separate** boolean `Scenario` | `mixed` | Clearance |

=> The issue's "each is a **mixed** edit, so each routes to Clearance" is **unsound as stated**: the
common in-scenario shape is `narrowing`. The routing conclusion holds; the reason does not. A rule
encoding "mixed -> Clearance" lets a shape-A producer read "not mixed" and believe it self-clears.

**The freeze CAN see rubric content** — #278 (the DocString blindness) was fixed by PR #286; the
`gherkin-cli@0.0.2` pin hashes what a step argument *says*. Confirmed: `threshold: 6 -> 0` reports
`narrowing`, not `no-content-change`. **The pin is load-bearing** — moved backwards, every one of
these corrections silently self-clears.

**Corpus re-measured — the issue's "~19 rubrics" is stale.** 37 real rubrics corpus-wide (counted by
`threshold:` lines; most `@rubric` greps are prose in specs *about* rubrics). Cyberfleet holds 12,
of which ~9 carry a conjunctive dimension. "~13 conjunctive dimensions" is accurate, but one is in
**aced**, not cyberfleet, and **2 more are semantically conjunctive but escape the regex** — a
regex-driven sweep would look complete and leave the defect behind. That is itself evidence for the
queue shape.

**The hazard is real and worse than filed.** Naive deletion (strip, leave threshold):
- **4 rubrics become impossible** — surviving maxes < threshold. Nothing passes.
- **5 more become perfect-score-only** — surviving maxes **==** threshold. Not impossible, so the
  issue's "nothing can pass" framing misses them entirely. Same silent tightening, one notch weaker.

## The design constraint that nearly trapped me

The bar **bans** decreeing a slack constant: *"Any constant offered in place of that measurement —
`gap >= 2`, `max >= b + 2` — is a guess at an instrument property nobody measured. Every such
constant this bar has carried was wrong, and each one's repair produced the next."*

So the 5 zero-slack rubrics must **NOT** become a `slack >= 1` lint. That repeats the settled
mistake. Zero slack is not per se wrong — it is a legitimate (strict) policy **if the owner chose
it**. The defect is that nobody chose it: it is the **residue of a deletion**.

## The two rules (closed form — state ONCE, lint what is lintable)

**R1 — the re-derivation duty (process, no constant).** Removing a dimension changes the
**attainable maximum**. The `threshold:` left behind is therefore an **un-re-derived cut whether or
not its number still needs to change**. A correction that removes a dimension must, in the same
edit, re-derive the cut as a fresh policy call and record its reason naming the new attainable
maximum. Catches all 9 uniformly; decrees no distance.

**R2 — the vacuity lint (arithmetic, safe to mechanize).** `sum(max) < threshold` => no subject, not
even a perfect one, passes. That is not a strict bar, it is a **dead rubric** — equivalent to
`Then false`. No policy could intend it for a rubric meant to grade, so it is a safe hard lint. It
decrees **no slack** — only that the passing set is non-empty.

**R2 does not clear R1.** The 5 zero-slack rubrics pass every arithmetic check and are still
un-re-derived. The lint's verdict must name its bound: a green R2 is not evidence the cut was
chosen. (`feedback_fixing_an_unfalsifiable_eval_recurs`: a bounded check reporting clean IS the
defect.)

**R3 — no blanket ratification.** Each correction is one Clearance, one rubric, one recorded policy
call. Batching ~9-13 decisions into one approval collapses them into one unexamined one.

## Freeze posture

New scenarios in `spec-producer.feature` are **additive** => self-clear, file stays `@frozen`. The
"mixed" imprecision lives only in the **skill prose** (impl, not frozen) — #292's frozen scenario
:172 says "reports the correction as an edit needing clearance" and makes no `mixed` claim, so it is
correct and needs no narrowing. **Verify with classify-edit-class before the gate.**

## NEXT

Landed. Spec gate ALIGNED (round 2, after a builder-lens FAIL on leaked rubric nouns I had not
form-checked). Impl gate: 7/7 scenarios pass; its test-vector escalation was upheld and the three
digit-bearing Givens rewritten to express the relation rather than an instance. `pnpm verify` green.
Open: PR + follow-ups (multi-DocString scoping in `findDeadRubric`).
