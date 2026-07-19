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
  - content: "Handoff: PR + Clearance verdict packet (incl. dispatch re-tag)"
    status: completed
  - content: "COUNCIL: adjudicate the 3 Clearance asks (dispatch re-tag / ssa-lowering / promote to blocking)"
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

## Delivered (2026-07-19) — the additive half, ablated

| Commit | Unit |
| --- | --- |
| `b79f4dec` | spec: 5 scenarios frozen in `spec-gate.feature` + node prose + summary-table sweep |
| `c95346b5` | impl: advisory tier (`{findings, violations}`) + `checkTriggerContract` |
| `7ed52e0c` | governance: the contract + two tiers in `suite-format-governance` |
| `bf4e1ed8` | impl-gate blocker: the runbooks still said "exit 0 = form clean" |

**Ablation — 7 mutants, all killed, baseline green in every arm.** Delta on the real corpus is
5 -> 0 (non-zero). Control: the **10 canonical outlines stay unflagged in every arm**.

Two results worth keeping:

1. **The corpus cannot discriminate `require both columns` from `require either`** — both arms
   report the same 5, because every one of the 5 is missing *both*. Only the unit tests kill those
   two mutants. A corpus-only ablation would have scored this rule "fine" while it was half wrong.
2. **`drop isOutline guard` initially SURVIVED.** Its test named the guard but its fixture (a plain
   `Scenario` with no `Examples` table) was absorbed by the *no-table* clause, so the test never
   reached the guard it was named for — it passed for another clause's reason. The pinned parser
   *accepts* a plain `Scenario:` carrying an `Examples:` table (verified, 0 errors), so the binding
   fixture is reachable; with it, the mutant dies. **A test named for a clause is not a test of it.**

### Impl gate: 5/5 scenarios PASS; one structural blocker, accepted and closed

The cold judge passed every scenario but blocked on a gap the scenarios could not see: the *design*
docs described the new tier while the *operational runbooks* still read "Exit `0` = form clean". An
actor following them literally reports clean and never relays the `⚠` lines — defeating the
surfaced-for-judgment behavior the scenarios specify. Treated as a **rule, not a site**: swept every
doc stating the exit contract and found **two more** beyond the one the judge named, including
`spec-producer-governance` — the actor that authors `@trigger` outlines, and the only point where
the free repair is still free (before freeze).

## NEXT

**STOPPED AT THE CLEARANCE FLOOR.** The additive half has landed and is ablated. Everything that
remains narrows a frozen scenario, so it is the Council's call — see the verdict packet below.
Nothing past this line is self-asserted.

## VERDICT PACKET — for the Council

The check now names 5 mis-tagged outlines, advisory. Each needs a disposition. **The finding is
not in dispute; only the repair is** — which is precisely why the tier is advisory.

### Ask 1 — re-tag the 4 `cyberlegion-plugin/dispatch` outlines `@trigger` -> `@behavior`

These grade deterministic decision tables (strategy / wake-mode / transport / verdict), not
activation. They are intra-node, fully owned, and correctly frozen — the issue's cross-node thesis
does not reach them, and blanket-deleting "the @trigger outlines" as #304 reads would **destroy 4
sound contracts**.

- **Content-preserving:** the tag changes, not one scenario line, not one Examples row.
- Their use of `Scenario Outline` is *sanctioned* by suite-format `:598` (a genuinely uniform
  enumerated set). Only the tag is wrong.
- **Why it is still Clearance:** it edits a frozen file. Recommend **grant**. This is the cheapest
  correct repair on the table.

### Ask 2 — `sdd/ssa-lowering`'s outline (`situation` / `should_apply`)

The one outlier #304 correctly identified. Two live options; **this mission does not pick**:

| Option | Cost |
| --- | --- |
| **(a)** re-tag `@behavior`, keep as-is | content-preserving, same shape as Ask 1 |
| **(b)** adopt the `query`/`should_trigger` contract | rewrites the Examples rows — a **narrowing** |

Recommend **(a)** unless the Council wants ssa-lowering genuinely graded for activation, which is
the harder claim: it would need a query corpus that does not exist for this subject.

### Ask 3 — promoting the rule from advisory to blocking

**Do not grant yet.** It is only safe once Asks 1 and 2 land — until then it reds main. Sequencing,
not a separate judgment. It belongs to whichever CR closes the last mis-tag.

### The counter-argument, recorded (as the brief requires, BEFORE any deletion is granted)

The negative rows in the 10 canonical outlines **do encode real design intent** ("this config is for
X, not Y"). That is a genuine cost of deletion and is why no deletion is asked for here. Recording
intent is not the same as freezing a boolean the harness never promised: the intent belongs in the
**subject's description prose** — the field the harness actually routes on, and the only field the
node owns — with the **README** carrying the sibling-deference rationale. Any future ask to delete
the canonical outlines must land that prose in the same change, or the intent is simply lost.

### Explicitly NOT done, and why

- **The issue's proposed mechanism (eligibility flags) is DOMINATED — it was not landed.** It
  catches 1 of 5, needs the corpus's first spec->implementation crossing, and cannot resolve 3 of 12
  subjects. Its marginal delta over the form check measures **zero** on the real corpus. Routing on
  the form invariant catches 5 of 5, pure spec-side. #304 should be updated to say so.
- **The issue's premise "query-corpus files in this repo: zero" is FALSE** — nine tracked files
  exist for 3 subjects with a real 60/40 split. They are **orphaned, not absent**; wiring them is a
  separate node (#304's split 2), not this mission.

## Superseded plan (kept for provenance)

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
