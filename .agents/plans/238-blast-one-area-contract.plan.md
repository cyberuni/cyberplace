---
cr-ref: github-238
target-project: sdd
blast: medium
hitl: true
leash: auto-none
tier: fable
todos:
  - content: "intake — plan scaffolded; target project sdd; ledger leash line written"
    status: done
  - content: "explore — narrowed :123; added the 1-area scenario; README reconciled + 2 judge gaps closed"
    status: done
  - content: "spec gate — CLEARANCE floor: judge ALIGNED true; AWAITING unional's ratification"
    status: in_progress
  - content: "deliver — bind the additive 1-area scenario with a test; engine unchanged; pnpm verify"
    status: pending
  - content: "impl gate — cold sdd-impl-judge; STOP for human ratification"
    status: pending
  - content: "handoff — PR against main, Closes #238; refs #192"
    status: pending
---

# CR github-238 — blast-estimate's frozen suite is self-contradictory on a 1-area project

CR link: https://github.com/cyberuni/cyberplace/issues/238
Refs #192 (where a cold impl-judge found this and the owner directed **route, not fix**).
Node: `.agents/specs/sdd/blast-estimate/` (behavioral, concept `orchestration`) — shipped by #192, PR #239.

## Graph position

`op5-m3` — the third of Op5's three parts (#192 shipped two; #224 owns the scheduler fence).
Dep satisfied: the blast-estimate node did not exist on `main` before #239 merged.

## The defect — a SPEC defect, not a code defect

Two `@frozen` scenarios bind the **same input** on a 1-area project and demand opposite answers:

- `:16` "a single peripheral work area computes low blast" — *one work area, no fan-in, no marking* → `low`
- `:123` "a project-wide touch-set computes high blast" — *every work area of its project* → `high`

In a corpus holding **exactly one** work area, a touch-set naming that area satisfies **both** Givens.
No implementation can satisfy both. They are disjoint **only if** "a corpus" implies **>= 2** work
areas — which the suite never says.

## Why the code is not the defect

`blast-estimate.mts` carries a **`>= 2` work-area guard**: coverage never fires on a 1-area project,
so the input resolves to `low` (`:16` wins). Deliberate and documented in the engine header
(`blast-estimate.mts` "The `>= 2 work areas` guard on coverage is load-bearing, not a nicety").
That makes an **engine guard the de-facto spec**. This CR promotes the guard into the contract.

## Decision — option 2 (qualify `:123`), plus an additive pin

The issue proposed three options. Option 2 is taken. The evidence is mechanical, not argued:

**Both existing tests ALREADY live under the `>= 2` precondition** — the contract is the only
artifact that does not state it:
- `:16`'s test seeds a **3-area** corpus (`seedArea` + `seedFiller(dir, 2)`) and comments the exact
  contradiction: *"a 1-area corpus would satisfy both scenarios' Givens at once"*.
- `:123`'s test loops sizes **`[2, 3, 4, 7]`** — never 1.

**Option 1 is refuted, not merely dispreferred.** Qualifying `:16` instead would leave `:123`
demanding `high` at size 1, which the engine computes as `low` — so option 1 is a **code change that
flips shipped behavior**, not a contract correction. Option 3 (rule 1-area projects out of scope) is
declined: the estimator answers correctly at size 1 (`low`); there is nothing to exclude.

Three edits:

1. **Narrow `:123`** — state the `>= 2` precondition in its Given. **NARROWING a frozen scenario
   → CLEARANCE hard floor → HITL.** The only Clearance trip in this CR.
2. **Add** a scenario pinning the 1-area answer (`low`, because coverage is *relative* reach and a
   project of one has none to cover). **ADDITIVE → self-clears, stays `@frozen`, no re-open.**
   A decision argued in an engine header but not frozen in a scenario is **not specified** — this is
   the edit that actually makes the contract say what the code does.
3. **Reconcile `README.md`** — the barrier claim ("reaches across its whole project by definition, so
   its computed blast is `high` … agree **by construction**") has a **hole at size 1**: under the
   guard, a barrier on a 1-area project computes `low`. README is the node's prose spec — kept in
   sync, never frozen → **no Clearance**.

## Scope — what this CR does NOT touch

- **No engine change.** `blast-estimate.mts` ships as-is; the guard is already correct.
- **No existing-test change.** Both tests already encode the precondition (above).
- Not #224's scheduler fence. Not the formation barrier call-out (#192 shipped it).

## Method
- SDD self-spec → ACED recuses (precedent #130/#191/#192) → SDD default chain; boolean process-Gherkin.
- Edit class read **structurally**, never from a raw line diff: `gherkin-cli diff --format json`
  (or spec-gate's `classify-edit-class.mts`) to prove `:123` = modified (narrowing) and the new
  scenario = added.
- Ledger shard: `ledger/github-238.<hash>.jsonl`. Combat log: `238-blast-one-area-contract.log.jsonl`.
- Run `pnpm verify` in **this worktree** before any gate commit/push.
- Leash `auto-none` + HITL ⇒ **do not self-assert past the Clearance gate**. Emit the verdict packet
  and leave the human ratification owed.

## Gate state — SPEC GATE AWAITING HUMAN RATIFICATION

Cold `sdd:sdd-spec-judge` **round 1: ALIGNED true** — oracle/builder/architect all PASS, no open markers.
It verified every conductor claim independently rather than on report, and **strengthened two**:

- The old `:123` contradicted **three** scenarios at size 1, not one — the breaking-semver (`:65`) and
  surface-location (`:70`) scenarios also assert `low` on a single-area touch-set. Option 1 would have
  required narrowing **three** frozen scenarios; option 2 fixes all three with one edit.
- It hypothesized a cross-node collision (formation's self-clear vs escalate, activated by pinning
  size-1 to `low`) and **disproved it independently**: `formation.feature` carries no blast reference,
  and `formation/README.md` disclaims the dependency outright.

It reproduced the size-1 spike on its own harness (`computed: low`, `projectWide: []`).

**Structural edit class** (`gherkin-cli diff --base origin/main --format json`): **added 1 / modified 1 /
removed 0** — `:123` modified (**narrowing → CLEARANCE**), the 1-area scenario added (self-clears),
`:16` unchanged.

**Mechanical:** `check-spec-state` OK · `check-suite` OK · `concept-index` no drift ·
`check-spec-structure` no blocking · `check-scenario-overlap` no duplicates · root `pnpm verify` 19/20.
The one red is `//#check:specs` → `align-spec --check`, whose `DEFAULT_BASE` is **HEAD**: it flags
*uncommitted* scenario changes and goes green once the gate commit stages the `.feature`. Guard firing
as designed, not a defect.

**Judge gaps 2 + 3 were fixed BEFORE the gate** (README glossary row for `coverage`; Use Cases row
homing the barrier agreement), so the tree awaiting ratification is **not** the tree the judge graded —
both edits apply its own prescriptions verbatim (#192 precedent). Gap 1 (the added scenario has no test)
is build-to-keep → a **hard condition on deliver**.

Leash `auto-none` + HITL ⇒ **not self-asserted**. On ratification: gate line `by: unional`,
`status` stays `approved` (node already frozen), commit staging the whole `.feature`, then deliver.

## NEXT
**STOP — spec gate needs unional's ratification** (Clearance: the `:123` narrowing).
On approve: write the gate line to `ledger/github-238.f8a4cc.jsonl`, commit (staging the whole
`.feature`), re-run `pnpm verify` to confirm align-spec goes green, then deliver:
1. **Bind the added scenario with a size-1 test** — asserting `low` + `projectWide: []`. The judge's
   hard condition: the harness's `seedFiller` is *built* to avoid size 1, so a frozen-but-unbound
   scenario would read `UNBOUND` and never run. Engine unchanged.
2. Reconcile the engine header comment (corpus-level prose → project-level code). Comment-only.
3. Fix `blast-estimate.smoke.test.mts:11`'s stale "21 scenarios" → 22.
Then impl gate (**STOP again**), then PR `Closes #238`.
