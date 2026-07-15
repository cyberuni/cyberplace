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
  - content: 'deliver: BLOCKED — repin 0.0.1 -> 0.0.2 + live regression test, after the owner publishes'
    status: pending
  - content: 'impl gate: BLOCKED until gherkin-cli 0.0.2 is published (owner-held)'
    status: pending
  - content: 'handoff: PR #286 (draft, Refs not Closes — blocked on publish); filed #287/#288/#289'
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

## The blocker

This repo's fix arrives **only** via the version pin. The classifier's tests drive the real
`npx gherkin-cli@<pin>` subprocess, so the regression test cannot pass until **0.0.2 is published**
(owner-held). The mission stops at the impl gate until then; the PR opens as a draft.

## NEXT

**Blocked on the owner publishing `gherkin-cli@0.0.2`** (the fix is committed in the sibling repo on
`fix/step-argument-signature` with a changeset; run `changeset version` + `changeset publish` there).

Once published, in this repo:

1. Repin `gherkin-cli@0.0.1` -> `@0.0.2` at the ten sites under `plugins/sdd/` — NOT the
   `universal-plugin` fixtures, and NOT the historical plan briefs.
2. Bind the seven frozen scenarios with live regression tests in
   `plugins/sdd/skills/spec-gate/scripts/classify-edit-class.test.mts`. That suite drives the real
   `npx gherkin-cli@<pin>` subprocess in temp git repos, so the tests are meaningful — a mocked
   differ would prove nothing, which is why the defect survived the existing suite.
3. Ablate the new tests against the old pin: a rubric-gutting fixture must classify `NARROWING`
   with the fix and `NO-CONTENT-CHANGE` without it.
4. Run the impl gate (cold `sdd-impl-judge`), then `pnpm verify`.
