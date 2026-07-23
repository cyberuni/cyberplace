---
cr: github-263-op6-m1
source: https://github.com/cyberuni/cyberplace/issues/263
spec: .agents/specs/sdd/authoring/spec-gate
status: implemented
todos:
  - content: Reproduce the three EPARSE fail-opens against a real unparseable suite
    status: completed
  - content: Repair the three unparseable suites (formatting, not corruption) so the guard needs no quarantine
    status: completed
  - content: Draft spec-gate README + additive .feature scenarios for the parse guard
    status: completed
  - content: Spec gate — cold spec-judge ALIGNED round 2, suite stays frozen (additive)
    status: completed
  - content: Deliver — parse guard in check-suite.mts and classify-edit-class.mts + regression tests
    status: completed
  - content: Impl gate — cold impl-judge APPROVE round 2, 14/14, all 5 mutations caught
    status: completed
  - content: Handoff — pnpm verify green, PR referencing #263 / node op6-m1
    status: completed
---

# CR github-263-op6-m1 — fail-closed parse guard for the spec-gate suite checks

Node **op6-m1** of master plan #263 (folds closed issue #243). Foundational: nothing downstream
in `op6` was verifiable until this landed.

## The defect (all three reproduced before any edit)

Three spec-gate mechanical checks returned their most reassuring answer when a `.feature` could
not be parsed, instead of escalating:

| Check | Was | Now |
|---|---|---|
| `check-suite.mts` | `suite checks OK`, exit 0 | fails closed, reports the parse failure and its line |
| `gherkin-cli diff` | per-file `error:{code:"EPARSE"}` beside an empty `scenarios` array | caller reads the error field first, never the empty array |
| `classify-edit-class.mts` | `NO-CONTENT-CHANGE` → self-clears | `unclassifiable` → escalates to Clearance, exit 1 |

`check-suite` failed open because it used its own permissive regex scan and never consulted the
pinned parser — `Feature:`-line presence was the whole of its "Gherkin validity". An unparseable
file yields **no scenarios**, so the differ's "nothing changed" was **structurally guaranteed
rather than measured**.

Repro: deleting 60 lines from a frozen suite classified as `NO-CONTENT-CHANGE`, exit 0. The same
input now returns `UNCLASSIFIABLE`, exit 1.

## Principle

A check that cannot classify its input must **ESCALATE**, never **EXEMPT**. Absence of evidence is
never evidence of no change.

## What the brief got wrong (corrected in-flight)

The brief listed six unparseable suites and assigned their repair to op6-m4/op6-m5. On validating
all 77 suites, only **three** still failed — `mechanic`, `recruitment`, `spec-anchors` — and those
are exactly the three **no downstream node owns** (op6-m4 is operator/pod, op6-m5 is ssa-lowering;
all three of those already parse).

The cause was **authoring formatting, never corruption**: seven steps soft-wrapped across two
physical lines (Gherkin has no step continuation) and one `Feature:` description line beginning
with `@rubric` (parsed as a tag). Repaired in commit 1 — whitespace-normalized text verified
word-for-word identical to the baseline. Owner ratified the Clearance in-session.

That repair is what let the guard fail closed corpus-wide with **no quarantine/allowlist
mechanism** — the alternative would have added a tracked exemption list plus drain logic, and left
three orphans with no forcing function.

## Edit class

**Additive** — 14 added / 0 modified / 0 removed on the frozen `spec-gate.feature`, verified
structurally. Self-clears; no re-open, no Clearance.

## The two judge rounds that mattered

- **Spec gate round 1 — builder FAIL.** Every drafted scenario asserted the guard *fails closed*;
  none asserted it raises no violation on input that parses. A constant fail-closed implementation
  would have satisfied the whole suite — the safety dual of the fail-open under repair. Closed with
  two discriminating scenarios.
- **Impl gate round 1 — CHANGE.** Three of fourteen scenarios rested on no verification, proven by
  **ablation**: reverting the tree-wide sweep to its pre-fix code left the suite green, as did
  rewriting the differ's failure branch. Closed by testing at the composition point and injecting
  the differ. The first replacement test was **itself unloseable** (its fixture was both unparseable
  and hedged, so it failed on the hedge with the guard reverted) — caught by re-running the ablation
  rather than trusting that adding a test closed the gap.

## Follow-up recorded (backlog, ledger seq 4)

The corpus drift detector (`align-spec`) consumes the edit-class classifier and branches only on
`narrowing`/`mixed`; `unclassifiable` falls through to "no drift" — the same fail-open class, one
capability removed. **Pre-existing**, not introduced: the old `no-content-change` fell through the
identical branch. Out of scope (separate capability, separate frozen contract).

## NEXT

Landed. Node op6-m1 retires on merge; op6-m2, op6-m3, op6-m4 unblock.
