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
  - content: "Engine: scenario-map binding lint LANDED in check-suite (orphan/dangling/duplicate; coverage stays judged). confirm-read NOT built — see the finding below"
    status: in_progress
  - content: "Apply to ssa-lowering: #305 positive Oracle-gate companion + Given re-cut; #306 disjoint Given re-cut; #304 activation off node freeze (all Clearance)"
    status: pending
  - content: "Corpus sweep: new suite bar over every behavioral .feature (over-fire check) + the old-doctrine 'acceptance boundary/level' prose the subagent deliberately left"
    status: pending
  - content: "Spec gate + handoff: Closes #304/#305/#306; drain follow-ups"
    status: pending
---

# CR: test-framework rebuild — two-axis test doctrine

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

## NEXT — resume here

**Next action:** todo 7 — **engines**: the scenario-map coverage lint in `check-suite`, then the
confirm-read engine + wiring into the 5 roles. Both blocking decisions are RESOLVED and executed
(`86082a1e` record, `5bf88bfa` rename, `d753e189` actor bars); `pnpm verify` GREEN 34/34.

**Then:** ssa-lowering #304/#305/#306 (all Clearance — needs the same grant->record->edit flow used
for the rename re-cuts) -> corpus sweep -> spec gate + handoff.

**How a Clearance clears the align-spec engine (learned this session):** `align-spec.mts` diffs
scenarios against `DEFAULT_BASE = 'HEAD'`, so a ratified re-cut shows as a drift FAIL until it is
committed — committing after the recorded ratification IS the clearance step, not a suppression.
Do not chase it as a regression.

**`confirm-read` is unbuilt and under-specified — decide before claiming it.** It appears in exactly
one sentence (`suite-format-governance:212`: "verifies a role's read-attestation covers each point
below, in its own words") and nowhere else in the corpus — no spec node, no design doc, no engine.
Ten governances do carry `## Key points (read-check)`, so the *inputs* exist; the check does not.

Building it needs four decisions that are not made anywhere: what an attestation **is** (format, and
where it lives), how "in its own words" is verified (**semantic** — a judge, not a lint, since a lint
can only detect verbatim copying), **which** roles attest and at which gate, and whether a shortfall
**blocks**. Left unbuilt deliberately rather than invented.

Same class as the scenario-map lint this CR just fixed: a governance naming a mechanical check that
does not exist. The options are symmetrical — **build it**, or **stop claiming it** until built.

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

**Remaining CR work after the two decisions:** engines (scenario-map lint, confirm-read) -> ssa-lowering
#304/#305/#306 (Clearance) -> corpus sweep -> spec gate + handoff.
