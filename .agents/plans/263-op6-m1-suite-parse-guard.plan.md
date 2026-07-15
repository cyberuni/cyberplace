---
cr: github-263-op6-m1
source: https://github.com/cyberuni/cyberplace/issues/263
spec: .agents/specs/sdd/authoring/spec-gate
status: in-progress
todos:
  - content: Reproduce the three EPARSE fail-opens against a real unparseable suite
    status: completed
  - content: Draft spec-gate README + additive .feature scenarios for the parse guard
    status: pending
  - content: Spec gate — cold spec-judge, freeze the touched .feature
    status: pending
  - content: Deliver — parse guard in check-suite.mts and classify-edit-class.mts + regression tests
    status: pending
  - content: Impl gate — cold impl-judge over the frozen scenarios
    status: pending
  - content: Handoff — pnpm verify, PR referencing #263 / node op6-m1
    status: pending
---

# CR github-263-op6-m1 — fail-closed parse guard for the spec-gate suite checks

Node **op6-m1** of master plan #263 (folds closed issue #243). Foundational: nothing downstream
in `op6` is verifiable until the guard lands.

## The defect

Three spec-gate mechanical checks return their most reassuring answer when a `.feature` cannot be
parsed, instead of escalating:

| Check | Observed on an unparseable suite | Should |
|---|---|---|
| `plugins/sdd/skills/spec-gate/scripts/check-suite.mts` | prints `suite checks OK`, exit 0 | fail closed, report the parse failure |
| `gherkin-cli@0.0.1 diff` | `summary.addOnly: true`, 0 changes, per-file `error: {code: "EPARSE"}` | caller must read the `error` field as failure, never trust `addOnly` |
| `plugins/sdd/skills/spec-gate/scripts/classify-edit-class.mts` | `NO-CONTENT-CHANGE` → self-clears | escalate — cannot classify |

`check-suite` fails open because it uses its own lenient regex parser and never consults the
pinned Gherkin parser: `Feature:`-line presence is the whole of its "Gherkin validity". A
zero-scenario parse gives `diff` nothing to compare, so "no changes" / `addOnly` is **structurally
guaranteed rather than measured**.

Reproduced on this branch: deleting 60 lines from the frozen
`.agents/specs/cyberfleet-plugin/mechanic/mechanic.feature` classified as `NO-CONTENT-CHANGE`,
exit 0 — a narrowing that would self-clear with Clearance never firing.

## Principle

A check that cannot classify its input must **ESCALATE** (fail closed / route to Clearance-HITL),
never **EXEMPT**.

## Scope — the guard only

In: the three checks fail closed on EPARSE, plus regression tests proving each does.
Out: the content of the currently-unparseable suites (`mechanic`, `recruitment`, `spec-anchors`
here; `operator`/`pod`/`ssa-lowering` per the issue) — those are nodes **op6-m4 / op6-m5**.

The check fires at the spec gate on the suite being **changed**, so failing closed only bites when
someone touches an unparseable suite — it does not retroactively red untouched suites.

## Edit class

**Additive** — new scenarios on the frozen `spec-gate.feature`, no baseline scenario modified or
removed. Self-clears; no re-open, no Clearance.

## NEXT

Draft the README revision + additive scenarios, then run the spec gate.
