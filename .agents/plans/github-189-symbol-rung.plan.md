---
cr: github-189
status: active
target: main
todos:
  - content: "explore + draft: revise sdd/collision-ladder README + .feature — add the symbol rung (RAW/WAW/disjoint), rewrite the deferred scenario to the un-inferable fallback"
    status: completed
  - content: "RE-OPEN ratification: confirm rewrite of the frozen symbol-rung-deferred scenario (narrowing edit) before touching it"
    status: completed
  - content: "spec gate: cold sdd-spec-judge ALIGNED, freeze .feature, ledger gate line, status approved"
    status: completed
  - content: "deliver: extend collision-ladder.mts with the symbol-rung derivation + thin diff→symbol seam; per-scenario tests; pnpm verify green"
    status: in_progress
  - content: "impl gate: rebase onto origin/main, cold sdd-impl-judge PASS, status implemented"
    status: pending
  - content: "handoff: PR referencing (not closing) #189, mail legate with outcomes"
    status: pending
---

# CR github-189 (Op2 ★ capstone, part 1 of 2) — the symbol rung

Source: https://github.com/cyberuni/cyberplace/issues/189 (Op2, ★ capstone third bullet — FIRST half only)

**Scope (this mission only):** the **symbol-level produce/consume dependency-inference rung** of the
finer-than-node ladder. Extends the merged `sdd/collision-ladder` node (PR #200); reuses its
composition. Clears the `symbol-rung-deferred` flag for the *inferable* case.

Split by user call (2026-07-13): the ★ third bullet is two missions. This is #1 (symbol rung,
deterministic engine). #2 = SSA-lowering doctrine (judgment front-end, **tested via ACED** per user) —
deferred, see memory `project_189_ssa_lowering_followup`. PR **references** #189, does NOT close it.

## What it does (to settle during explore)
Today: a shared **code** file with overlapping/unknown hunks stays **hard**, `symbol-rung-deferred`.
New: at the semantic rung, a code file **descends to the symbol rung** — parse each side's diff into
`{produced, consumed}` symbols and classify:
- **disjoint symbols** (no shared symbol) ⇒ **soft** (rung=symbol).
- **WAW** — both sides produce/modify the same symbol ⇒ **hard**.
- **RAW** — one side consumes a symbol the other produces ⇒ **hard** (true data dep, must serialize).
- **un-inferable** — symbols cannot be extracted (dynamic/parse-fail/absent detail) ⇒ stays **hard**,
  `symbol-rung-deferred` (conservative fallback — this is what the rewritten frozen scenario becomes).

Pure derivation over CONSTRUCTED `{produced,consumed}` sets (unit-tested); diff→symbol extraction is the
thin untested seam (mirrors the existing region/scenario seam). Confidence decays further at symbol rung.

## Out of scope (the ★ capstone's SECOND half — the deferred follow-up)
- SSA-lowering criteria/automation + partitioning a CR write-set into missions + WAW→versioned-RAW.
  That is judgment (design:240 "cannot be unit-tested"), tested by ACED. Separate mission.

## Freeze note
The frozen scenario `collision-ladder.feature:68` ("held hard and flagged deferred ... not classified
by symbol") is **narrowed** to the un-inferable fallback → a **re-open** needing ratification. New
WAW/RAW/disjoint scenarios are **additive** (self-clear).

## NEXT
Spec gate PASSED (cold sdd-spec-judge round 2 ALIGNED true; round 1 architect FAIL on 3 stale README
passages → fixed, judge-iteration logged). Re-open ratified + RAW→hard ratified by user. .feature frozen
(4 symbol scenarios: disjoint→soft, symbol-waw→hard, symbol-raw→hard, un-inferable→deferred). Ledger shard
5c7b1a. Deliver next: extend collision-ladder.mts — add SymbolSet to FileTouch (optional, null-safe),
'symbol' rung (deepest, low confidence), classifySymbols pure fn wired into classifyFile isCode branch,
thin diff→symbol extract seam (best-effort, null on unparsed lang). Update existing code-file test (rung
semantic→symbol for the deferred case). 4 new node:tests. Rebase onto origin/main. Cold impl-judge. Then
handoff PR referencing (not closing) #189.
