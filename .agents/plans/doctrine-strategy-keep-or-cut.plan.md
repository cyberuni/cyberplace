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
| ~23 other entries | untouched, remain unratified |

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

## Verification method (for the CRs)
A completeness/consistency bar is itself the class of thing that diverges producer-judge loops, so it
is dogfooded before codifying: (1) over-fire against its own approved corpus — fire only on true
holes; (2) producer-judge convergence — findings per round trend to 0. Rule 1 passed both via the
recorded corpus A/B; scenarios stay CFG-driven (re-derive the set from the drawn CFG per edge).
