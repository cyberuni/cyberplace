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
  - content: "read-check (was confirm-read): rename + spec + build the read-attestation. OWNER-DECIDED 2026-07-18: build it in this CR. Mechanism absent in ALL 9 governances, not just suite-format"
    status: in_progress
  - content: "Apply to ssa-lowering: #305 positive Oracle-gate companion + Given re-cut; #306 disjoint Given re-cut; #304 activation off node freeze (all Clearance)"
    status: completed
  - content: "Corpus sweep DONE: over-fire check measured 0 findings across 78 suites in 7 projects; old-doctrine 'acceptance/boundary' prose reframed on the two axes (ADR left as history)"
    status: completed
  - content: "Spec gate + handoff: Closes #304/#305/#306; drain follow-ups"
    status: pending
---

# CR: test-framework rebuild — two-axis test doctrine

> **Branch `test-framework-rebuild` carries THREE CRs that gate together** —
> `test-framework-rebuild`, `spec-organization-rebuild`, `partition-quality`.
> Read all three plan briefs before gating. Blocking decision: `confirm-read`
> (build it, or stop `suite-format-governance` claiming it) — recorded in
> `test-framework-rebuild.plan.md`.


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

- **#304 — activation taken off the node freeze (Clearance).** Removed the `@trigger` Scenario
  Outline from `ssa-lowering.feature`. The issue's finding is now settled *by this CR's own rebuilt
  doctrine*: activation is owned by (description prose x harness x sibling set) and the node controls
  one of the three, so it is a **co-owned seam** — and `suite-format-governance` already says a
  co-owned seam ("activation/routing — does this config fire?") is **out of scope** for a per-node
  frozen suite. The outline froze a property the node cannot honour alone. A comment marks the spot
  so the removal reads as doctrine, not loss, and the spec README's structural claim was updated to
  match.
  **Corpus-wide implication, NOT swept:** 14 suites still carry `@trigger`. The same argument applies
  to every one, but sweeping them is a corpus-scale removal of frozen scenarios and belongs to an
  owner decision, not to this scoped todo. Trigger accuracy has a real instrument (`test-skill`'s
  labeled query corpus); until those suites move to it, removing their outlines would drop the
  measurement rather than relocate it.

## read-check — RATIFIED 2026-07-18 (owner): build the attestation in this CR

**The rename answers itself.** **Ten** governances already head the section `## Key points
(read-check)`; only `suite-format-governance:212` called the mechanism `confirm-read`. That one-off
name is renamed to **`read-check`**, agreeing with the ten headings. No new vocabulary.

> **Count correction.** An earlier pass of this section said "nine" twice, from an eyeballed grep
> that dropped `impl-producer-governance:66`. Measured: **10** files carry the heading —
> architect-spec, architect-impl, builder-spec, builder-impl, oracle-spec, impl-producer, ownership,
> spec-format, spec-structure, suite-format. Six governances carry **no** such heading
> (`lifecycle`, `gate-validation`, `combat-log`, `plugin-contract`, `solution-producer`,
> `spec-producer`) — so "every governance has key points" is false, and read-check must define what
> it does when the section is absent.

**The finding the plan understated.** The gap is not "one governance names an unbuilt check". Grep
for anything collecting an attestation — `spec-gate`, `sdd-spec-judge`, `sdd-impl-judge` — returns
**nothing**. All ten `## Key points (read-check)` sections are inert content; no role is ever asked
to restate them. `suite-format` merely *named* the missing check, which made a corpus-wide hole look
local. Any fix scoped to `suite-format` alone would have left nine silent instances.

**Constraint from `design/governance-resolution.md` (must not be broken).** The fixed-universal bars
are declared in the role/agent definition and loaded **lazily** — "a full governance **body** is read
**only at the decision or gate that invokes it**". So read-check must attest **what the role actually
loaded for the decisions it made**, never force eager loading of every declared bar; a rule demanding
attestation for all bars would silently convert lazy loading into eager loading.

**Purpose (owner's framing).** The check is not a comprehension grade — it verifies the agent was
**honest that it loaded and read** the governance. "In its own words" is the anti-parroting proof of
reading, not a paraphrase-quality score.

**Split, per this CR's own form-vs-judged doctrine:** attestation **presence** (a role named the
governances it loaded and produced a restatement) is mechanical and linted; **non-parroting** is
judged. A green lint clears no honesty question.

## Corpus sweep — measured, not asserted

**Over-fire check: 0 findings across 78 suites in 7 projects** (aced 24, sdd 42, cyberfleet 4,
cyberlegion 3, cyberplace 3, cyberspace 2, quill 0). The rebuilt bar — including the new
scenario-map binding lint — does **not** over-fire on the existing corpus. The map lint contributes
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

## NEXT — resume here

**State: gate-ready except one open decision.** Todos 1-6 and 8-9 are done. Todo 7 is **half** done —
the scenario-map binding lint landed in `check-suite`; **`confirm-read` is deliberately unbuilt**
(see the finding above: it needs four design decisions that exist nowhere).

**Next action — owner:**
1. **Decide `confirm-read`** — build it, or stop `suite-format-governance` claiming it. Until one of
   those, the bar names a check that does not exist, which is the exact toothlessness this CR fixed
   for the map lint.
2. **Gate both CRs together** with `spec-organization-rebuild` (owner decision: one gate, one
   handoff). Not self-asserted while unattended — see below.

**Why the gate was not self-asserted.** The skill permits self-assertion in leash, and the owner
pre-authorized Clearance, so the floor would not have blocked it. It was still left alone: todo 7 is
open (gating freezes suites while a todo is live — the thing this CR argued against), the CR carries
six-plus Clearance narrowings including a **scenario deletion** (#304), and running a gate on my own
work with a judge I spawn, unattended, is the independence the producer!=judge split exists to
prevent. The digest exists so a human sees what they approve.

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

**Remaining CR work after the two decisions:** engines (scenario-map lint, confirm-read) -> ssa-lowering
#304/#305/#306 (Clearance) -> corpus sweep -> spec gate + handoff.
