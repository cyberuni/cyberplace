---
cr-ref: test-framework-rebuild
status: draft
target: .agents/specs/sdd/ (project spec: plugins/sdd)
touches:
  - plugins/sdd/skills/*-governance/SKILL.md   # the 9 rebuilt test-framework governances
  - .agents/specs/sdd/design/spec-structure.md  # the layout law (synced)
  - .agents/specs/*/workflows/                   # renamed from acceptance/ (5 projects)
  - .agents/specs/sdd/ssa-lowering/ssa-lowering.feature  # application case (#304/#305/#306)
sources:
  - https://github.com/cyberuni/cyberplace/issues/305
  - https://github.com/cyberuni/cyberplace/issues/306
  - https://github.com/cyberuni/cyberplace/issues/304
todos:
  - content: "9 governances rebuilt (acceptance-only/decision-graph; axis-2 level on impl bars; @pinned; key-points)"
    status: completed
  - content: "spec-format node model: ## What / ## Use Cases / ## Logic / ## Scenario map / optional ## References; plain-language a gate bar. AMENDED post-pilot: (path class, edge) unit + Path column, collapse rule, invariant-cut retired, scaffoldable Given"
    status: completed
  - content: ".feature->suite sweep across all 9 governances (verify green)"
    status: completed
  - content: "spec-structure.md sync: four-folder anatomy (design/rules, capabilities/behavior, workflows/usage, ledger/provenance); workflow<->use-case recursion; node-section model"
    status: completed
  - content: "Actor-bar reframe: judge the PROJECT/capability not the document; two-kinds duplication (knowledge=defect vs coincidental=leave). Applied to all four bars (architect-spec, oracle-spec, builder-spec, architect-impl)"
    status: completed
  - content: "acceptance/ -> workflows/ rename: COMPLETE. git mv x5 + 43 .md refs + concept-index code/label (e2e->workflow) + 2 ratified frozen re-cuts + 52 .feature comment no-ops + regenerated index; verify 34/34"
    status: completed
  - content: "Engine: scenario-map binding lint LANDED in check-suite (orphan/dangling/duplicate; coverage stays judged)"
    status: completed
  - content: "read-check: DROPPED 2026-07-19 (owner). Spec node + engine removed; the claim that named it removed. Relocated to universal-plugin#9 (governance loader, where a script-served fetch is observable)"
    status: completed
  - content: "Apply to ssa-lowering: #305 positive Oracle-gate companion (additive); #306 disjoint Given re-cut (Clearance). #304 deletion WITHDRAWN 2026-07-19 — outline restored, it was the node's own routing decision"
    status: completed
  - content: "Corpus sweep DONE: over-fire check measured 0 findings across 78 suites in 7 projects; old-doctrine 'acceptance/boundary' prose reframed on the two axes (ADR left as history)"
    status: completed
  - content: "Spec gate + handoff: Closes #304/#305/#306; drain follow-ups"
    status: pending
---

# CR: test-framework rebuild — two-axis test doctrine

> **Branch `test-framework-rebuild` carries THREE CRs that gate together** —
> `test-framework-rebuild`, `spec-organization-rebuild`, `partition-quality`.
> Read all three plan briefs before gating. **No blocking decision remains** — the former
> `confirm-read`/`read-check` question was resolved 2026-07-19 by dropping it from this CR and
> relocating it to `cyberuni/universal-plugin#9`; see this plan's read-check section.


## Resolved decisions (do not relitigate — see also commit 77fd05a8)

- **Axis 1** — a suite specifies **acceptance** only, STRICT: the capability's **decision graph**
  (one scenario per edge; guard/negative edge paired with a positive companion; each edge isolates a
  specific condition). Invariants/co-owned seams are out of scope.
- **Axis 2** — verification **level** (e2e>…>unit) is a test impl detail: **as high as it doesn't
  hurt** (pyramid; boundary the honest substitute where e2e is infeasible). Lives on the impl bars.
- **`@pinned`** — user-owned seed scenario; agent proposes, never executes change/removal without
  in-session user authorization; grounded in ownership (not freeze); a pin seeds graph growth.
- **Node model** — `## What` / `## Use Cases` (each named to its impl surface — CLI verb / function /
  endpoint) / `## Logic` (shared decision graph) / `## Scenario map` (grouped by use case) / optional
  `## References` last.
  **Amended after the pilot (see `spec-organization-rebuild.plan.md`):**
  - the map unit is a **(path class, edge)** pair, not an edge — `Given` = path, `When` = edge. The
    map is 1:1 **scenario<->row** and gains a **`Path`** column; one edge may carry several rows
    (permutation coverage). Duplicate = same edge **and** same path class.
  - **reconverged paths collapse** where the outcome does not differ; an over-specific `Given`
    manufactures a false permutation.
  - the invariant-cut heuristic is **retired** — the filter is "can you name the edge"; a constraint
    holding across every path is the **convergence** shape, not an invariant.
  - a `Given` must be a **scaffoldable state** (observable not evaluative, present not absent, one
    condition per step).
  - `## References` (optional, any spec-type) cites research backing a decision.
  - **Open:** "each use case named to its impl surface" does not fit a procedural skill, whose
    surface is one invocation; the pilot named them by entry condition instead.
- **Actors judge the PROJECT** (capability), not the document's prose (that's spec/suite-format).
- **Vocabulary** — "suite" = scenarios-as-behavior; "`.feature`" = the file/format only.
- **workflows/** (was acceptance/) — project-level workflow suite; a workflow is the project-level
  analog of a use case (a path through the composed capabilities); the capability map is the
  project's logic graph. `ledger/` is a fourth folder kind (provenance data, not a spec node).
- **Rename: COMPLETE (not revert)** — owner-decided 2026-07-18. Finish the facet label
  `'e2e'` -> `'workflow'`, the 2 frozen re-cuts, and the `.feature` comment sweep.
- **Actor-bar reframe: propagate to ALL THREE** — owner-decided 2026-07-18. `oracle-spec`,
  `builder-spec`, `architect-impl` join `architect-spec` on project-framing + two-kinds duplication.

## Clearance — recorded owner ratification (2026-07-18)

Owner ratified re-cutting two frozen scenarios as part of completing the `acceptance/` ->
`workflows/` rename (a narrowing that realigns the frozen contract with landed code):

- `concept-index.feature` — "acceptance/ node annotated as e2e" (~lines 33-44) -> `workflows/`
  node annotated as `workflow`.
- `scaffold-project-spec.feature` (`:78`) — scaffolds `design/, acceptance/, …` -> `workflows/`.

Basis: the rename already landed in `concept-index.mts` (`workflows/` path match, commit
`4a38a937`); these two frozen scenarios are the last sites still asserting the pre-rename
vocabulary, so they diverge from live behavior. No behavior is being widened.

## Clearance — ssa-lowering (2026-07-18, under the owner's standing grant)

- **#305 — the Oracle gate was all kills (ADDITIVE, self-clears, no Clearance needed).** Its four
  scenarios were stale->killed, misaligned->reshaped, two-asks->judged, killed->zero missions. Nothing
  asserted an **aligned** CR passing the gate, so a coordinator that killed everything scored full
  marks on all four. Added `a change request that fits the product direction clears the Oracle gate
  and is lowered`, with `clears-the-gate` + `lowers-the-work` dimensions — the positive companion
  driving the same path in its firing direction.
- **#306 — the Given was unbuildable (Clearance).** `two change requests that each touch the shared
  authentication spec-node **from a different angle**` fails the scaffoldable-`Given` bar: "a
  different angle" is evaluative, so two readers build different fixtures, and the disjoint nodes the
  `disjoint-nodes-not-fused` dimension grades were never named. Re-cut to name both touch-sets
  concretely (authentication+billing / authentication+search), and the rubric comment now names
  billing and search rather than gesturing at "the two nodes only one CR touches".

- **#304 — WITHDRAWN 2026-07-19. The deletion was wrong; the outline is restored.**
  This CR removed `ssa-lowering.feature`'s `@trigger` Scenario Outline, reasoning that activation is
  owned by (description prose x harness x sibling set) and the node controls only one, making it a
  co-owned seam that `suite-format-governance` puts out of scope.

  **That misread the category.** The out-of-scope rule targets *harness* activation — "does this
  config fire?", where a model matches a description to a user's query. The deleted outline's `When`
  is `the coordinator decides whether to apply the SSA-lowering doctrine`: an **applicability**
  decision made by an agent **reading this doctrine**. No harness is in the loop, and the deciding
  input is the node's own content. The node owns it.

  **This CR's own governance says so.** `suite-format-governance:177-178` admits the tag for exactly
  this case — layer tags include "`@trigger`, **where the node genuinely owns the routing decision**".
  The deletion contradicted an exception written in the same CR.

  **And it dropped a measurement rather than relocating one** — the standard this very plan invokes
  as the reason NOT to sweep the 14 sibling `@trigger` suites. The cited substitute (a labeled query
  corpus, `test-skill`) measures *model-triggered skill invocation*, which does not transfer to a
  coordinator-invoked doctrine. Nothing replaced the 8 balanced examples (4 apply / 4 do not).

  **Corroborating evidence the deletion was incomplete:** `ssa-lowering/README.md:316-325` still
  cited the outline as a live frozen claim ("the `@trigger` row asserts…", "Both frozen claims
  survive"), leaving a dangling reference to a scenario the CR had removed.

  **Restored** with its Examples table intact (additive -> self-clears, no Clearance needed), plus a
  comment recording why it sits there. The README's structural claim is corrected to match.

  **The 14 sibling `@trigger` suites: still NOT swept, and now for a better reason.** The question is
  per-node — does *that* node own its routing decision? — not a corpus-wide yes or no. Some are
  genuine harness activation and out of scope; some, like this one, are the node's own. Filed as
  follow-up work; a blanket sweep in either direction would repeat this error at scale.

## Corpus sweep — measured, not asserted

**Over-fire check: 0 findings across 78 suites in 7 projects** (aced 24, sdd 42, cyberfleet 4,
cyberlegion 3, cyberplace 3, cyberspace 2, quill 0) — **for the MECHANICAL bar only.**

> **Scope correction (spec-judge, 2026-07-19).** The framing "measured, not asserted" overstated what
> ran. The executed tool is `check-suite`, which implements Gherkin validity, boolean-`Then` form,
> rubric structure, and scenario-map binding — and **none** of this CR's *qualitative* rules
> (scaffoldable `Given`, the duplication reframe, decision-graph strictness). Those are judged, not
> linted, by the governance's own words, so no executed check backs a "0 findings" claim about them.
> Spot-checked candidates a strict qualitative pass would plausibly flag already exist in the
> untouched corpus: `spec-producer.feature:68` ("the correct reading cannot be established"),
> `scaffold-project-spec.feature:93` ("allows more than one valid location"), `aced/skillify.feature:75`
> ("whose scope is unclear"). The mechanical result stands; the qualitative sweep was **not run**.
> (The 78-vs-79 count gap is benign — a sibling CR added `partition-quality.feature` afterward.)

The rebuilt bar — including the new scenario-map binding lint — does **not** over-fire mechanically
on the existing corpus. The map lint contributes
zero because it skips specs with no `## Scenario map`, which is 36 of 37 sdd behavioral nodes; it
activates per node as the format lands, so this number will move as the node-format migration
proceeds and is not evidence about those nodes.

**Old-doctrine prose reframed** on the two axes, at the two sites that stated it as current doctrine:

- `authoring/suite-format/README.md` — "Test levels — the `.feature` is acceptance/boundary only"
  rewritten as "Two axes": the suite specifies **acceptance** and is silent on level; the
  **verification level** is a test implementation detail owned by the impl bars. "Boundary" is a
  *level*, not a category of scenario — naming one in the contract leaks axis 2 into axis 1. The
  combinatorics-move-down rule survives on a better reason: a suite is a decision graph, not a
  combinatorial cover.
- `mission/impl-producer/README.md` — "Two test levels — acceptance boundary + inner-rule units"
  reframed; the inner boundary is now the honest substitute where a higher level is infeasible, not
  the default the contract prescribes.

**Left as history:** `aced/design/decisions/0002-boundary-vs-surface-more.md` states the old framing,
but a decision record is an append-only account of what was decided when — rewriting it would forge
the record rather than correct doctrine.

## SPEC GATE — 2026-07-19: **NOT APPROVED** (cold spec-judge, ALIGNED: false)

Lenses `{oracle: FAIL, builder: pass, architect: pass}`. Structural band was clean
(`check-spec-state`, `check-suite` over 64 touched suites, referenced-artifact over 101 `.md`);
the Clearance ledger verified complete. The failure is judgment, not form.

**BLOCKER — #304 dropped a measurement it argued must be relocated. RESOLVED 2026-07-19 by restoring the outline; see the #304 record above.** The deleted `@trigger`
Scenario Outline was ssa-lowering's only frozen check on its own activation accuracy, and nothing
replaced it. `suite-format-governance`'s rule reads "Oracle **relocates or kills** it" — and this
plan's own text, arguing why the **14 sibling** `@trigger` suites must not be swept, says removing
them "would **drop the measurement rather than relocate it**". The CR states that principle and then
violates it for itself, distinguished only by effort-scope, not by any actual relocation. The cited
substitute (`test-skill`'s labeled query corpus) measures **model-triggered skill invocation**, which
does not transfer to a **coordinator-invoked** doctrine like ssa-lowering. **Owner decision needed.**

**FIXED at the gate:** the "0 over-fire findings across 78 suites" claim was scope-corrected — the
executed tool (`check-suite`) implements only the mechanical bar; the qualitative rules this CR
introduces are judged, not linted, and that sweep was never run.

**REJECTED — the judge's description finding does not hold.** It flagged the 9 governance
`description:` fields shortened to `"Partial Skill: invoke by name only"` as a regression against a
convention requiring identity + caller. **Owner ruled otherwise (2026-07-19): do not expand them.**
A `user-invocable: false` skill's description is not a trigger — it is invoked by name — so detail
there buys nothing at match time, which is exactly the rationale of the active
`sdd-trim-internal-descriptions` CR. The short form is the intended direction. (Measurement note:
8 were shortened by this CR; `suite-format` was already short at the merge-base.)

## NEXT — resume here

**State: GATE-READY. No open decision remains.** Every build todo is done. The last open question
(`confirm-read` / `read-check`) was resolved 2026-07-19 by **dropping it** from this CR and
relocating it to `cyberuni/universal-plugin#9` — see the read-check section above for the
measurements behind that call. `suite-format-governance` no longer claims a check that does not
exist, so the toothlessness this CR set out to remove is fully removed.

**Next action — owner:** **gate all THREE CRs together** (`test-framework-rebuild`,
`spec-organization-rebuild`, `partition-quality`) — one gate, one handoff. Not self-asserted while
unattended; the reasoning is below.

**Why the gate was not self-asserted.** The skill permits self-assertion in leash, and the owner
pre-authorized Clearance, so the floor would not have blocked it. It was still left alone: todo 7 is
open (gating freezes suites while a todo is live — the thing this CR argued against), the CR carries
six-plus Clearance narrowings including a **scenario deletion** (#304), and running a gate on my own
work with a judge I spawn, unattended, is the independence the producer!=judge split exists to
prevent (the todo-open reason no longer applies; the other two stand). The digest exists so a human sees what they approve.

**Clearance ledger for the gate** (all under the owner's standing grant, each recorded above):
`concept-index` + `backfill` re-cuts (rename) · gateway/gateway-manage/workflows identifier renames ·
"consolidated spec" retirement · the nested-vs-hoist re-cut · the unscaffoldable `Given` · ssa-lowering
#306 `Given` · ssa-lowering #304 **deletion** of the `@trigger` outline.

**Findings the diff won't show:**
- The `.md`-only blast estimate MISSED the rename's code + frozen-suite dependency; the propagation
  subagent (Sonnet) caught it and deliberately left doctrine-term "acceptance" (acceptance
  boundary/level) untouched — that belongs to the corpus sweep, not the rename.
- The frozen-contract divergence flagged at the last checkpoint is now RESOLVED by the two ratified
  re-cuts. Worth keeping: the facet-label change silently staled the generated by-concept block in
  `sdd/spec.md`, which surfaced only as a downstream `align-spec` FAIL — regenerate the index
  (`concept-index.mts --write --spec-dir`) whenever a facet label or folder name moves.
- Doctrine-term "acceptance" still stands corpus-wide (prose about the acceptance *level*), by
  design. That is todo 9's corpus sweep, and it must NOT be treated as leftover rename debt.

**Remaining CR work: the gate and handoff only.** Engines (scenario-map lint), ssa-lowering
#304/#305/#306, and the corpus sweep are all landed. At handoff, file the ADR number-collision
follow-up (0019 and 0025 each name two files) recorded above.
