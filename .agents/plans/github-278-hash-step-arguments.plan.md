---
name: github-278-hash-step-arguments
status: active
todos:
  - content: 'explore: reproduce #278 on a clean fixture; locate the defect; settle the fix locus'
    status: completed
  - content: 'upstream: fix gherkin-cli signature() to hash step arguments; tests + ablation + changeset'
    status: completed
  - content: 'spec: 7 additive classification scenarios in the frozen spec-gate.feature (ADDITIVE, self-clears)'
    status: completed
  - content: 'spec gate: cold sdd-spec-judge ALIGNED round 4 (3 FAIL rounds); gate approve recorded (shard 9f3e1a)'
    status: completed
  - content: 'deliver: 0.0.2 published; repinned the 10 plugins/sdd sites; 7 live tests bound + pin-ablated'
    status: completed
  - content: 'impl gate: cold sdd-impl-judge 7/7 PASS, re-ran the ablation itself; impl approve recorded (shard 9f3e1a seq6)'
    status: completed
  - content: 'handoff: PR #286 un-drafted, Closes #278; filed #287/#288/#289; ONE follow-up REFUSED, unfiled'
    status: completed
---

# CR github-278 — the edit-class classifier is blind to step-argument content

Source: #278 (filed by mission `263-op6-m4`).

## The defect (reproduced, not inherited from the brief)

The structural edit-class classifier routes a frozen `.feature` edit: additive / no-content-change
self-clears, narrowing fires Clearance. It classifies from `gherkin-cli diff`, whose scenario
signature hashes **step keyword + text only**. Every `@rubric` lives in a DocString, so a frozen
rubric can be renamed and its `threshold: 3` moved to `threshold: 0` — passing every subject — while
the diff reports `unchanged` / `addOnly: true` and the gate prints `NO-CONTENT-CHANGE`. A self-clear
route; Clearance never fires.

## Explore — SETTLED

Measured on clean fixtures, through the real pinned CLI:

| step argument | gutted content detected? |
| --- | --- |
| DocString (`@rubric`) | NO — reports `unchanged` |
| DataTable | NO — reports `unchanged` |
| Examples table (`@trigger`) | yes — `modified` |

- **The brief's premise was narrower than the defect.** #278 names the DocString. The rule is
  **step arguments are not hashed**: DataTable is equally blind and equally load-bearing. Fixed as
  one rule, not at the named site.
- **The fix locus is upstream, not in this repo.** The brief assumed the classifier; the classifier
  only wraps the differ. Per the gherkin-cli dependency design note, gherkin-cli owns the general
  parse/validate/diff and SDD owns only the doctrine lints over its manifest — a step's argument
  belonging to that step's structural identity is general Gherkin diffing. A local workaround in
  `classify-edit-class.mts` would violate that boundary and leave the other four consumers
  (`check-suite`, `touch-set-correction`, `verify-scenarios`, `collision-ladder`) blind.
- **Owner fork (put live, granted):** fix upstream, owner publishes. The sibling `gherkin-cli` repo
  has no git remote and no GitHub repo — it is published to npm from a local working copy — so there
  is no upstream PR to open. Fix is committed there on `fix/step-argument-signature` with a
  changeset (patch → 0.0.2).
- **Control (must survive):** rewriting a boolean `Then` was already detected (`modified: 1`). The
  blindness was specific to the argument.
- **Over-fire check:** the stricter signature run over this corpus (135 `.feature` files, 2878
  scenarios, clean tree) reports **zero** non-unchanged scenarios and zero parse errors. It does not
  re-classify existing content.
- **Ablation:** the four upstream defect tests fail with the fix reverted and pass with it applied; the
  cosmetic controls hold either way. One test initially passed under ablation — its fixture differed by
  a `@rubric` tag, so a tag delta marked the scenario modified without the DocString ever being read;
  fixture corrected.
- **Mutation:** each exclusion (delimiter, DataTable padding, source location) is an independent
  implementation choice, so each carries a control proven by planting the wrong identity and watching
  that control — and only that control — fail.
- **Pin sweep:** the real pin sites are the ten under `plugins/sdd/`. The `universal-plugin` hits are
  test *fixtures* (arbitrary strings in a fake fs), not pins — repinning them would corrupt the tests.
  `plugin bundle` leaves this pin alone: `gherkin-cli` is external to the workspace, so bundle reports
  it `skipped`. The pin is hand-maintained.

## Spec gate — ALIGNED round 4, after three FAIL rounds

Every FAIL round found the *same shape one order out*: a prose claim about the scenario identity that
no scenario could register a miss on. R1 the delimiter; R2 the source location (one sentence over);
R3 the DataTable form face (the DocString row swept on both faces, the DataTable row left half-done —
the sweep itself had the named-site shape). Closed by **enumerating the matrix** ({DocString,
DataTable} x {says, written} + location) instead of patching each named site. Round 4's judge derived
the matrix independently from the implementation, built nine mutants, and measured that each of the
seven scenarios kills at least one while a pristine control survives all seven.

## Not folded in (filed)

- **#287** — `Rule:`-nested scenarios are invisible to the differ (`scenarios: []` → the whole file
  reads `no-content-change`), and `Background:` steps are never diffed. Traversal, not signature.
  Corpus exposure: 0 files use `Rule:`, 8 use `Background:`. Latent.
- **#288** — tags / Examples / step keywords / scenario name are in the identity but frozen by no
  scenario. Pre-dates this CR; same class reached from the opposite direction.
- **#289** — the freeze covers a rewritten step argument but not a deleted one. Implementation is
  already correct and upstream-tested; the claim is just unfrozen.
- **#275** (rubric leaking to a blind simulator) — placement, not the freeze classifier. Per brief.

## The blocker — CLEARED

`gherkin-cli@0.0.2` published by the owner. Verified through npm (not the local build) that the
published package closes the original repro. Repinned, bound, both gates passed.

## Impl gate — 7/7 PASS, first round

The cold impl-judge re-derived every oracle before reading the tests, **re-ran the pin ablation
itself** rather than trusting the claim, and dumped all nine fixture pairs to confirm each differs
only in the axis its scenario names — the tag-delta contamination that slipped past an earlier
ablation in this mission is absent.

Its orthogonal read improved on the producer's own reasoning: the `universal-plugin` strings were
left alone as "test fixtures", but they are also bound by **that project's own frozen suite**, whose
`Then` asserts the string comes back untouched — bumping them would have been a narrowing edit on
another project's freeze.

## NEXT

Mission complete through both gates. PR #286 (`Closes #278`) awaiting review/merge.

**Outstanding — one follow-up recorded but NOT filed.** Filing was refused, so ledger seq 7 stands as
the durable record and a later drain re-derives it by dedupe: *a shipped classifier script cites a
spec-tree design note by a path that resolves to nothing* — pre-existing, and not a one-line repair,
since the spec tree is unpublished so any repo-resolving path dangles for installed users. Options
are drop the pointer, route it through a governance, or name the document without a path; sweep every
shipped script that references the spec tree rather than fixing the one site found.
