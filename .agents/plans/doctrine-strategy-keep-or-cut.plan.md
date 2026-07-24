---
cr-ref: doctrine-strategy-keep-or-cut
status: draft
leash: auto-none
blast: medium
todos:
  - id: run-doctrine-loop
    status: completed
    note: Scanner distilled 28 unratified strategy lines (shard f5152c) across 4 ledgers
  - id: keep-or-cut-council
    status: completed
    note: Council reviewed; narrowed to Rule 1 (keep, qualified) + entry 5 (keep). Rest cut/untouched.
  - id: dogfood-rule1-closed-form-fold
    status: completed
    note: CONFIRMED via corpus's own recorded A/B (#192 by-example vs #224 rule-first). Codify narrow+qualified.
  - id: dogfood-rule2-per-cell-matrix
    status: completed
    note: CUT as separate rule — collapses into Rule 1 (matrix = draw every independent cell as a CFG branch). github-278 confirms.
  - id: codify-sdd-rule1-cr
    status: pending
    note: open sdd governance CR — Rule 1 + matrix corollary. NOT yet started.
  - id: codify-aced-entry5-cr
    status: pending
    note: open aced CR — producer pre-flight (verify harness claims vs primary docs; grep before coining a term). NOT yet started.
  - id: cut-a-cluster-seq42-pre-judge
    status: completed
    note: Council CUT the seq42 pre-judge use-case-coverage extension (A-cluster) as already-implemented — both checks shipped in check-spec-state.mts; recurrences do NOT land in an extendable prose/EARS form. See Resolved decisions.
---

# Doctrine-loop strategy keep-or-cut + rule dogfood

Strategist outer-loop (doctrine-loop) run to completion, then Council keep-or-cut, then a
one-rule-at-a-time dogfood of the two survivors before any governance edit.

## NEXT — resume here

**Next action:** open the **sdd** governance CR for Rule 1 (below) via `start-mission` against the
sdd project spec — target `authoring/suite-format` (+ `builder-spec-governance`); author the suite
CFG-driven. Then the **aced** CR for entry 5 via `start-mission` against the aced project spec —
target the aced spec-producer / builder-spec bar. Run them one at a time, sdd first.

**Blocking decisions:** none open. Council already ratified the narrowed keep-set below; the two CRs
are the ratified re-entry. Each CR is a governance edit → its own spec-gate + impl-gate.

**Findings the commits won't show (do not relitigate):**
- The two CRs are the **whole** actionable remainder of 28 distilled strategy lines — the dogfood
  cut the other redundancy. Do not re-open Rule 2, Item 3, or the ~23 untouched entries as CRs.
- Rule 1 must be codified **narrow + qualified**, not as the raw shard text (see Resolved decisions).
  Codifying the raw "state a fold rule closed-form" blanket would over-fire on simple folds.
- The strategy shards stay `ratified: false` forever (ledger is append-only, never edited). "Ratify"
  = the CR exists, not a field flip. That is why 0 of 34 lines are `ratified: true`.

**Working method / resolved decisions:** see `## Resolved decisions` below — do not relearn.

## Resolved decisions

### Doctrine-loop output (shard f5152c, all `ratified: false`)
28 strategy lines: `.agents/specs/sdd/ledger/strategy.f5152c.jsonl` (23),
`.agents/specs/aced/ledger/strategy.f5152c.jsonl` (2),
`.agents/specs/cyberplace/ledger/strategy.f5152c.jsonl` (2),
`.agents/specs/cyberfleet-plugin/ledger/strategy.f5152c.jsonl` (1). Zero Kill missions in the corpus.
~75 terminal missions were undistilled but have no combat log on disk (retired pre-`distills`); not
backfilled (prospective gate). Already captured by existing unratified entry `strategy.ba6a39` seq2.

### Council keep-or-cut (narrowed)
| Item | Verdict |
|---|---|
| Rule 1 — closed-form fold before by-example (from sdd `github-192` seq8) | **KEEP**, codify qualified |
| Rule 2 — per-cell miss-scenario for matrix claims (sdd `github-278` seq16) | **CUT as separate** — folds into Rule 1 |
| Item 3 — grep-count sweep check (sdd `github-237` seq13) | **CUT** — its trigger (7-kind ownership matrix) already fixed; too vague |
| Entry 5 — aced producer pre-flight (aced `133` seq1) | **KEEP** — cheap pre-flight, no divergence risk, no A/B needed |
| **A-cluster — seq42 pre-judge use-case-coverage extension** (`317dd8`/`ba6a39`/`9bb674`/`acaa41`/`f5152c`/`2d9bbc`/`364c83`) | **CUT** — already implemented (seq42 shipped both checks); recurrences not in an extendable form. See below |
| ~22 other entries | untouched, remain unratified |

Also cut as already-landed: cap-hit-to-owner half of Rule 1 (`start-mission` L44/L51), the specific
`user-invocable:false` fact of entry 5 (present at 3 sites in aced `define-skill`/`define-governance`/
`improve-skill`).

### Rule 1 — dogfood verdict: CONFIRMED (codify narrow + qualified)
The corpus already ran the A/B as two landed missions:
- Arm A by-example = `#192` fence: contradictions 1→1→**3**, each from the prior round's fix, cap-hit,
  reverted (`.agents/plans/192-barriers-and-blast.log.jsonl`; issue #224 body has the trajectory table).
- Arm B rule-first = `#224` (folded into master `#263`): contradictions **0**, findings were 7
  coverage gaps from the original draft; froze a clean multi-scenario `mission-graph.feature`.

Three qualifications that MUST ride in the codified rule:
1. **Fire only when the fold combines ≥2 interacting sub-conditions.** Single-condition folds are
   fine by-example — WAW-mutex (`.agents/specs/sdd/mission-graph/mission-graph.feature:93-115`,
   touch-set intersection) converged in ~4 clean by-example scenarios. Blanket = over-fire.
2. **Closed-form ≠ sound.** R'' shipped with a termination proof and was still unsound cross-project
   (project-scoped exemption vs graph-global RAW closure → silent acyclic deadlock; fixed to R''').
   Re-derive the proof's assumptions against the real data model before authoring.
3. **Convergence ≠ coverage.** Rule-first kills contradiction divergence but not coverage gaps;
   reading judges catch ~1/round (one round returned ALIGNED with 5 gaps live), a mutation sweep
   found 5 in one pass, and a liveness guard cannot see over-permission (needs a safety dual).

**Codified form:** *A fold/aggregation node whose rule combines ≥2 interacting conditions must state
the rule in closed form — and re-derive its soundness against the real data model — before deriving
scenarios; single-condition folds may be specified by example. This buys iteration convergence, not
coverage: pair it with a mutation sweep and a safety dual.*

### Rule 2 — dogfood verdict: CUT as separate, fold into Rule 1
`github-278` (`.agents/plans/github-278-hash-step-arguments.log.jsonl`) dragged 4 judge rounds, each
closing the same cell-shape one row over. It converged into per-cell CFG branches
(`.agents/specs/sdd/authoring/spec-gate/spec-gate.feature:349-377` — one scenario per independent
form×operation cell), and round 4's degenerate "every form has an indentation exclusion" universal
claim was dropped. A standalone per-cell builder lens would over-fire on degenerate cells (round 4)
and duplicate the existing `one scenario per (path class, edge)` rule. So the matrix case is Rule 1
applied: draw every INDEPENDENT cell as a CFG branch (degenerate cells excluded), verify by mutation
sweep. Codify as a worked corollary under Rule 1, not a new bar.

### A-cluster (seq42 pre-judge use-case-coverage extension) — CUT verdict
The recurring "prose/spec asserts behavior with no backing scenario, caught only at the cold
spec-judge" pattern is filed across seven shards as *reinforcement of legacy ledger seq42*, each
recommending the Council ratify seq42's pre-judge mechanical extension. **Cut as already-implemented.**

- **seq42 already shipped — both halves.** Legacy ledger seq42 proposed exactly (a)
  referenced-artifact-exists and (b) use-case *rows* with no mapped scenario. Both are live in
  `plugins/sdd/skills/spec-gate/scripts/check-spec-state.mts` — `checkReferencedArtifacts` and
  `checkUseCaseCoverage`. The "reinforcement" lineage is reinforcing a proposal that already landed.
- **The pre-filter fires on one form only:** a `## Use Cases` **table with a `Scenario` column**,
  checking each **row → sibling `.feature` scenario**. Prose/EARS, or a table without a Scenario
  column, raise nothing (`SKILL.md:78-84`) — deliberately the cold judge's backstop.
- **Tally — 0 of ~21 cited coverage-gap / spec-feature-contradiction recurrences land in the covered
  tabular form; only ~3 land in the prose/EARS form an extension could target.** The rest split into
  forms a use-case pre-filter (current or extended) structurally cannot key off:

  | Form | Count | Owner |
  |---|---|---|
  | Covered (tabular `Scenario`-column row → missing scenario) | 0 | already caught if it occurred |
  | Extendable prose Use-Cases claim → no backing scenario (github-34 seq6/seq7, github-193) | ~3 | no mechanical anchor — prose has no `Scenario:` token to resolve |
  | prose-impl-contradiction (design/loops.md, github-237 matrix, plan-retirement-distill-gate) | ~3 | **separate** proposal: `prose-impl-contradiction` enum + sibling sweep (`strategy.acaa41` seq1, `strategy.364c83` seq2) |
  | `.feature`-internal form (orphaned assertion, Then restates rationale, DocString rubric gut) | ~4 | `check-suite.mts` / structural step-diff (`strategy.dae416` seq1) |
  | Generic missing scenario/test at builder/impl gate (no use-case anchor) | ~11 | irreducible cold-judge residue |

- **Why not EXTEND:** the ~3 extendable prose cases have no reliable mechanical anchor — you cannot
  mechanically decide which prose sentence is a behavioral claim owed a scenario without NLP. The one
  cheap move that exists (bidirectional coverage on the *table* form — every `Scenario:` needs a row)
  still catches none of the cited instances, whose targets were written in prose, not the table.
- **The real recurring mass belongs to two other, already-filed proposals** — the
  `prose-impl-contradiction` enum/sweep and the structural step-identity diff — which the seq42
  lineage was absorbing as "reinforcement," inflating its recurrence count with defects it never
  claimed to catch. Those two remain in the untouched-unratified set for their own keep-or-cut.

## Verification method (for the CRs)
A completeness/consistency bar is itself the class of thing that diverges producer-judge loops, so it
is dogfooded before codifying: (1) over-fire against its own approved corpus — fire only on true
holes; (2) producer-judge convergence — findings per round trend to 0. Rule 1 passed both via the
recorded corpus A/B; scenarios stay CFG-driven (re-derive the set from the drawn CFG per edge).
