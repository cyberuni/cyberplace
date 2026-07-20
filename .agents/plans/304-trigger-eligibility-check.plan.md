---
cr-ref: 304
source: https://github.com/cyberuni/cyberplace/issues/304
status: awaiting-clearance
todos:
  - content: "Re-measure the corpus; validate issue's 4 measurements before scoping"
    status: completed
  - content: "Locate the check's correct home (check-suite, not check-spec-structure)"
    status: completed
  - content: "BLOCKED: land plugins-as-projects refactor first (owner decision)"
    status: completed
  - content: "Explore: grill spec + suite for the advisory tier + @trigger form rule"
    status: completed
  - content: "Spec gate: freeze the suite, record gate line"
    status: completed
  - content: "Deliver: advisory tier in check-suite, then the @trigger form rule"
    status: completed
  - content: "Ablate: revert the rule, prove delta != 0; control (10 canonical outlines) MUST survive"
    status: completed
  - content: "Impl gate"
    status: completed
  - content: "REFUTED by 37fe2b0c (ssa-lowering restore) — rule reverted, ledger corrected"
    status: completed
  - content: "Handoff: PR + Clearance verdict packet (incl. dispatch re-tag)"
    status: completed
  - content: "COUNCIL: adjudicate Ask 1 only — the dispatch re-tag (Asks 2+3 retracted)"
    status: pending
---

# CR 304 — the @trigger form check

> **UNBLOCKED 2026-07-19.** The plugins-as-projects refactor landed: `plugins/*` are pnpm
> workspace members, each carrying its own `check:spec` -> `sdd-check-specs`, and turbo runs
> `check:spec` per project. `check-project-specs.mts:34` dispatches `check-suite` with
> `--root <project dir>`, so the sdd-only hardcoded scope is gone. Mission resumed.

Issue #304: `@trigger` outlines freeze activation = (description prose x harness x sibling set);
a node owns only the prose. Twelve suites carry one.

## Premise validation (measured this mission, NOT taken from the issue)

| Issue claim | Measured | Verdict |
| --- | --- | --- |
| twelve suites carry a `@trigger` outline | 12 (14 grep hits; 2 prose-only) | holds |
| ssa-lowering outlier (`Given the situation` / `When the coordinator`) | verbatim | holds |
| "Query-corpus files in this repo: **zero**" | **NINE**, tracked, 3 subjects | **FALSE** |
| never run, never gated | no reader outside `docs/specs/aced/design.md` prose | holds |

- 15 outlines total (`cyberlegion-plugin/dispatch` carries 4; rest 1 each); ~52 pos / ~52 neg rows.
- Corpora live at `artifacts/specs/<subject>/trigger/{eval,train,validation}_queries.json` for
  `define-skill`, `define-governance`, `aced-create-spec` — real 60/40 split, `{id,query,should_trigger}`.
  Stranded: `design.md` specifies `artifacts/aced/<subject-path>/trigger/`. Instrument is
  ORPHANED, not absent. "Build it" is really "adopt + relocate + wire, for 3 of 12 subjects".
- NOT deprecated: `artifacts/specs/define-skill/golden-set/017-no-legacy-trigger-query-file.md`
  bars a *skill* from embedding its OWN corpus as its test step and defers scoring to the ACED
  loop. It does not retire the ACED-owned corpus. Do not misread as retirement.

## Finding the issue did not have — dispatch is a SECOND outlier

`cyberlegion-plugin/dispatch` carries **4** `@trigger` outlines that do not grade activation at all —
deterministic decision tables (`Then the chosen strategy is "<strategy>"`, `the wake sub-mode is`,
`its report transport is`, `the verdict is`). The issue's cross-node/statistical thesis **does not
apply**: they are intra-node, fully owned, correctly frozen booleans. Deleting "the @trigger outlines
across twelve suites" as the issue reads would **destroy 4 sound contracts**.

True corpus: **10** canonical activation outlines + **1** ssa-lowering + **4** mis-tagged dispatch.

Owner decision: **re-tag `@trigger` -> `@behavior`, keep the scenarios** (content-preserving, not a
narrowing) — but it modifies a frozen scenario, so it goes in the **verdict packet**, not self-asserted.

## The issue's proposed mechanism is DOMINATED — do not land it

| | catches | crossing | unresolvable |
| --- | --- | --- | --- |
| eligibility flags (`user-invocable`) | ssa-lowering only (1/5) | first-ever spec->impl | 3 of 12 |
| **step form** (canonical activation shape) | **ssa-lowering + all 4 dispatch (5/5)** | none, pure spec-side | 0 |

Eligibility's **marginal delta over form is zero** on the real corpus => don't land a fix whose
ablation measures zero. Route on the **invariant** (form), not the reported class (flags).

Why eligibility can't work cleanly: there is **no declared suite->subject seam**. Resolution by
`project-path` + node slug gets 9/12 (it does correctly disambiguate the real `init` collision:
`plugins/sdd/skills/init` vs `plugins/cyberspace/skills/init`). **3 miss** —
`cyberfleet-plugin/recruitment`, `cyberlegion-plugin/dispatch`, `cyberlegion-plugin/init` carry
**no `spec.md`** and their subject name differs from node slug AND feature basename (`dispatch` ->
`dispatch-governance`; `recruitment` -> the Crimp skill). Also: `ssa-lowering`'s node frontmatter has
no invocability field (only `spec-type` + `concept`), and a frozen scenario bars prose from reaching
a deterministic finding — so the flag is only readable from the **implementation**.

## Home: check-suite, NOT check-spec-structure

- `check-suite.mts` (in the `spec-gate` skill) is the **`.feature`-form authority** — the executable
  arm of `suite-format-governance`. It already enforces part of the `@trigger` convention (non-empty
  `Examples`, placeholder coverage). Correct home on remit.
- `check-spec-structure` is **node-shape** (untagged/oversized). A form rule violates its documented
  non-goals. Wrong home.

**Prerequisite:** `check-suite` is **binary — no advisory tier**. The rule fires on 5 existing
outlines, so blocking would red main by forcing a Clearance-bound narrowing. The advisory tier is a
*prerequisite unit*, not an alternative.

## Scope — what lands vs what stops

- **Lands (additive, no floor):** an **advisory tier** in `check-suite`, then the `@trigger` **form
  rule** emitted advisory. Fires 5; control = the 10 canonical outlines MUST survive.
- **Stops (Clearance):** deleting/moving outlines; the dispatch re-tag; promoting the rule to
  **blocking** (belongs to that same granted CR).
- **Own node, not this mission:** wiring the real query-corpus instrument (issue's split 2).

## Counter-argument, recorded (brief requires deciding this BEFORE any deletion)

Negative rows encode real design intent ("this config is for X, not Y"). Recording intent != freezing
a boolean the harness never promised. Intent lands in the **subject's description prose** (the field
the harness actually routes on, and the only one the node owns) with the **README** carrying the
sibling-deference rationale prose. Verdict packet must carry this before deletion is granted.

## Re-measured on rebased HEAD (2026-07-19) — the 2026-07-16 numbers HOLD

94 commits landed since the pause; every count above re-measured unchanged. 14 files grep
`@trigger`, 2 prose-only (`aced/sdd-roles/{impl-judge,scenario-writer}`), **12 suites / 15
outlines**. Baseline `check-suite --root .agents/specs` is **green**.

### The discriminator is sharper than recorded — THREE independent signals, all 10/0 vs 0/5

| Signal | 10 canonical | ssa-lowering | dispatch x4 |
| --- | --- | --- | --- |
| `Given a user query "<query>"` | all 10 | `the situation "<situation>"` | none |
| `Then invocation is "<should_trigger>"` | all 10 | `applying the doctrine is "<should_apply>"` | `the chosen strategy is`, ... |
| Examples header | `query \| should_trigger` | `situation \| should_apply` | `warm\|interactive\|mux\|seat\|strategy`, ... |

Route on the **Examples-column contract** (`query` + `should_trigger`): it is the least prose-fragile
of the three and it is the contract the governance already names.

### The rule is NOT an aesthetic convention — it has a mechanical consequence

`aced/sdd-roles/impl-judge` freezes: *"Given a frozen scenario tagged as a trigger-layer case / When
impl-judge runs it / Then it runs the scenario under the trigger-run policy"*. `@trigger` is a
**dispatch instruction to the impl-judge**, not a label. An outline tagged `@trigger` that carries no
`query`/`should_trigger` columns routes the judge into a policy it cannot execute. That is the
invariant the check defends.

`suite-format/README.md:597-611` already names it: layer tags are *"the evaluation layer a resolved
judge routes it through"*, and the sanctioned outline is *"a trigger-query corpus of `{ query,
should_trigger }`"*. The rule **lints a contract the governance already states in prose** — it adds
no new doctrine.

### Corollary: dispatch's OUTLINE is sanctioned; only its TAG is wrong

`:598` legitimizes a `Scenario Outline` for *any* genuinely uniform enumerated set — dispatch's four
decision tables qualify. So the defect is **only the `@trigger` tag**, and the fix is exactly the
recorded owner call: re-tag `@trigger` -> `@behavior`, scenarios untouched. This narrows the
Clearance ask.

### The advisory tier already has a precedent in its own sibling — mirror, don't invent

`check-spec-state.mts` (same `spec-gate/scripts/` dir) already runs a two-tier check: the
referenced-artifact check returns `{ findings, violations }`; `findings` print `⚠` to stdout and do
not touch the exit code, `violations` print `✗` to stderr and exit 1. Frozen at
`spec-gate.feature:218` ("surfaced for judgment, not hard-blocked"). The prerequisite unit is
therefore a **mirror of an established in-node shape**, not a new mechanism: widen `checkSuite` /
`checkFilePaths` from `string[]` to `{ findings, violations }`.

`spec-gate/README.md` carries **no `## Scenario map`**, so `checkScenarioMap` skips it — new
scenarios carry no map obligation.

## REFUTED 2026-07-19 — the rule was landed, then reverted the same session

The sections above (`## The issue's proposed mechanism is DOMINATED`, `## Scope`, and the
re-measurement) are **explore-phase reasoning kept for provenance**. Two of their conclusions are
now retracted; the ledger's `correction` line is authoritative.

**What refuted it: `37fe2b0c`, on main, landed the same day inside #329** — the merge this branch is
rebased onto. A CR deleted `ssa-lowering`'s `@trigger` outline citing #304's ownership argument. The
**spec gate blocked it, the block was ruled right, and the outline was restored**, with the
adjudication now written into the `.feature` itself:

- #304's argument targets **harness activation** — a model matching `description` prose to a user
  query. That is co-owned (description × harness × sibling set); the node holds one of three.
- `ssa-lowering`'s outline is a **coordinator applicability decision**: an agent reading the doctrine
  decides whether it governs the situation. No harness in the loop, the deciding input is the node's
  own content — **the node owns it**, which is the exception `suite-format-governance` already grants
  ("where the node genuinely owns the routing decision").
- Standing rule from that restore: *"whether a node owns its routing decision is a **per-node
  question**, and a blanket sweep either way would repeat this error at scale."*

**Three consequences:**

1. The landed check fired an advisory finding **against an owner-ratified decision**, hours after it
   was ratified. `situation`/`should_apply` is the *correct* shape for an owned applicability case.
2. It **contradicted an exception this CR's own governance rewrite kept** three sections away — the
   exact fault the restore commit charged to the previous CR.
3. **A mechanical form check is that blanket sweep, automated.** Harness-activation and
   owned-applicability differ only in *who decides*, never in step form. **Judged, never linted.**

### Retracted

- **"Eligibility is DOMINATED, Δ=0"** — ill-posed. The two mechanisms answer different questions.
  Form caught `ssa-lowering` only because its author *also* used a non-canonical shape: one
  coincident sample is not domination. Under the restore, `ssa-lowering` is not a defect at all, so
  neither mechanism has a live target.
- **Ask 2 (ssa-lowering)** — withdrawn; already adjudicated on main.
- **Ask 3 (promote to blocking)** — moot.
- The impl-gate approve — it graded an implementation that no longer exists.

### What #304 looks like now

- **M4 (the outlier)** — resolved by the restore, in the opposite direction from the issue's read.
- **M2 (statistical vs deterministic)** — **weakened** by the two-axis doctrine (#322/#323, in #329):
  the suite freezes the *criterion*; the measurement *level* is the judge's implementation, so
  `Then invocation is "no"` may be measured as a rate < 0.5 over N runs and collapsed to one boolean.
- **M1 (the real instrument has never run)** — **stands.** Nine corpora still orphaned;
  `test-skill` (`plugins/cyberspace/`) still specifies the rate design.
- **M3 (cross-node negative rows)** — **strengthened.** Per-project `check-scenario-overlap` reports
  **10 exact-duplicate `@trigger` sibling-deference scenarios** (cyberfleet-plugin 6, aced 3,
  cyberspace 1); #314 holds that check out of the per-project set until the Clearance-bound cleanup
  lands.

## What this branch actually ships

Engine and spec node are **byte-identical to main**. What remains is vocabulary:

- **Tag-set index** in `suite-format-governance/SKILL.md`, framed by **DIP** (owner's call): SDD
  defines what a tag **means**; the resolved plugin (ACED for agent-config domains) owns run counts,
  thresholds, corpora and pass bars. Carries the **two-deciders test** for `@trigger` vs `@behavior`
  and states the classification is judged, never linted.
- **Glossary**: `layer tag`, `owned routing decision`, `rubric`, `pin`. The invented
  "at most one layer tag" rule is gone — it came from misreading ACED's four *config-eval* layers as
  BDD stages.

## VERDICT PACKET — one ask

**Ask 1 — re-tag the 4 `cyberlegion-plugin/dispatch` outlines `@trigger` → `@behavior`.**
They select *what an already-invoked Legate does* — strategy, wake sub-mode, transport, verdict —
not *whether anything engages*. Under the two-deciders test they are conduct, not engagement, and
neither decider applies. Content-preserving: the tag changes, no scenario line and no Examples row.
Still Clearance, because it edits a frozen file. **Recommend grant.**

This is a **per-node judged call**, offered as such — consistent with the restore standard, not a
sweep. The other 11 suites stay untouched, deliberately.

**Counter-argument, recorded:** the negative rows *do* encode real design intent. No deletion is
asked for here. Any future deletion must land that intent in the subject's **description prose** —
the only field the node owns — in the same change.

## NEXT

Council: Ask 1 only. Everything else on this branch is additive vocabulary that self-clears.

Then **#304 gets its own node**, as the issue asks ("a corpus-wide change and wants its own node; it
blocks nothing currently in flight"), scoped to what survived: **M1** — adopt the nine orphaned
corpora + `test-skill`'s rate design — and **M3** — the 10 duplicates, then wire
`check-scenario-overlap` into the per-project set.
