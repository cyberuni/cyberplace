---
cr-ref: 304
source: https://github.com/cyberuni/cyberplace/issues/304
status: paused
todos:
  - content: "Re-measure the corpus; validate issue's 4 measurements before scoping"
    status: completed
  - content: "Locate the check's correct home (check-suite, not check-spec-structure)"
    status: completed
  - content: "BLOCKED: land plugins-as-projects refactor first (owner decision)"
    status: completed
  - content: "Explore: grill spec + suite for the advisory tier + @trigger form rule"
    status: in_progress
  - content: "Spec gate: freeze the suite, record gate line"
    status: pending
  - content: "Deliver: advisory tier in check-suite, then the @trigger form rule"
    status: pending
  - content: "Ablate: revert the rule, prove delta != 0; control (10 canonical outlines) MUST survive"
    status: pending
  - content: "Impl gate"
    status: pending
  - content: "Handoff: PR + Clearance verdict packet (incl. dispatch re-tag)"
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

## NEXT

Explore is done (see the re-measurement above). Freeze scenarios in
`.agents/specs/sdd/authoring/spec-gate/spec-gate.feature`, under the existing
`# ---- Feature-form pre-filter ----` section, for two units:

**Unit 1 — advisory tier** (mirrors `check-spec-state`'s settled shape):
- an advisory feature-form finding is surfaced for judgment, not hard-blocked
- positive companion (the tier must not swallow blocking): a form violation still fails closed —
  already frozen at `:160`/`:166`, so the negative is NOT orphaned

**Unit 2 — the `@trigger` form rule:**
- a `@trigger` outline whose Examples carry no `query`/`should_trigger` column is surfaced advisory
- **control that MUST survive:** a `@trigger` outline carrying both columns raises no finding
- **scope guard:** an *untagged* Scenario Outline is not held to the activation contract (this is
  what keeps the 4 dispatch tables clean once re-tagged, and every non-trigger outline clear)

Then ablate: revert the rule, prove delta != 0 (5 findings -> 0); control = the 10 canonical
outlines stay unflagged in both arms.
