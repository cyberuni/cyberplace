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
  - content: 'deliver: repin gherkin-cli 0.0.1 -> 0.0.2; live regression test bound to the new scenario'
    status: pending
  - content: 'impl gate: BLOCKED until gherkin-cli 0.0.2 is published (owner-held)'
    status: pending
  - content: 'handoff: PR referencing #278; file the Rule/Background follow-up'
    status: pending
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
- **Ablation:** the three upstream defect tests fail with the fix reverted, pass with it applied; the
  two cosmetic controls (identical DocString, re-indented DocString) stay `unchanged` either way. One
  test initially passed under ablation — its fixture differed by a `@rubric` tag, so a tag delta
  marked the scenario modified without the DocString ever being read; fixture corrected.

## Not folded in (filed separately)

- **`Rule:`-nested scenarios are invisible to the differ** (`scenarios: []` → the whole file reads
  `no-content-change`), and `Background:` steps are never diffed. A different mechanism — traversal,
  not signature. Corpus exposure: 0 files use `Rule:`, 8 use `Background:`. Latent, so filed, not
  folded.
- **#275** (rubric leaking to a blind simulator) — placement, not the freeze classifier. Per brief.

## The blocker

This repo's fix arrives **only** via the version pin. The classifier's tests drive the real
`npx gherkin-cli@<pin>` subprocess, so the regression test cannot pass until **0.0.2 is published**
(owner-held). The mission stops at the impl gate until then; the PR opens as a draft.

## NEXT

Author the additive classification scenario in the frozen `spec-gate.feature`, run the cold
spec-judge, then repin + bind the live regression test.
