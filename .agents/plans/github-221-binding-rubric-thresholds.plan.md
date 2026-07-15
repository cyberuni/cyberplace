---
cr: https://github.com/cyberuni/cyberplace/issues/221
status: active
todos:
  - content: "Explore: audit all 11 @rubric scenarios, derive the discrimination property"
    status: completed
  - content: "Explore: rework dimensions+thresholds on the correct (post-#215) base"
    status: completed
  - content: "Spec gate: cold judge ALIGNED, HITL-ratified, suite re-frozen"
    status: completed
  - content: "Deliver: doctrine drift fixed; two Oracle-lens reverts driven by measurement"
    status: completed
  - content: "Impl gate: full suite 19/19 N=3, discrimination measured by ablation + paired mutation"
    status: completed
  - content: "Handoff: PR Closes #221; 5 follow-ups filed"
    status: in_progress
---

# github-221 — make the ssa-lowering @rubric thresholds binding

CR: [#221](https://github.com/cyberuni/cyberplace/issues/221) (Refs #211). Precondition for #222.

## Outcome

All 11 `@rubric` scenarios reworked; **10 now provably bind** (ablation-measured). The 11th
(`cohesion`) proved unfixable without Given surgery and was demoted to the boolean guard it always
was — [#250](https://github.com/cyberuni/cyberplace/issues/250).

Evidence, measured not asserted:
- **Ablation** (delete a doctrine rule, re-score blind): barrier 6.00→**3.67** FAIL 3/3 · misaligned
  6.00→**2.33** FAIL 2/3 · irreducible 5.00→**3.33** FAIL 2/3 · cohesion 3.00→**3.00** PASS 3/3 (the
  finding that forced the demotion).
- **Paired mutation** (60 judge runs, two-stage so the rubric is the only variable): the *same*
  over-merged plan scores **OLD 8 ≥ 6 PASS** and **NEW 3 < 5 FAIL**, 3/3, controls green.

## Declared limits (not buried)

- `irreducible` binds only ~2/3 — its Given hands over both graded answers. Needs Given surgery.
- `misaligned` reds a correct doctrine ~1/3 — [#249](https://github.com/cyberuni/cyberplace/issues/249):
  the scenario's situation matches the suite's **own** `@trigger` do-not-run exclusion.
- N=3 cannot distinguish p=1.0 from p=0.9. The barrier guard fix is **supported, not proven**.
- Absorption (#220/#222) is untouched: this raises the bar against a *sloppy* doctrine, never a
  *memorizing* one.

## Findings that outlived the CR

- **The suite had never parsed** (EPARSE line 8, since creation) and every mechanical check failed
  OPEN — `check-suite` exit 0 "OK", `gherkin-cli diff` `addOnly:true`, `classify-edit-class`
  `NO-CONTENT-CHANGE` on a rewrite of every graded scenario. Six suites repo-wide
  ([#243](https://github.com/cyberuni/cyberplace/issues/243)). This is why #189's gate could sincerely
  record the thresholds as "genuinely discriminating".
- **A measured ceiling is not evidence a dimension works** — it is equally consistent with a dimension
  that cannot fail. The pre-registered trigger here ("demote if the mean drops below 3.0") could never
  fire: 3.00 was the floor. **Test loseability by ablating the rule**, never by watching the mean.
- **Mutant penetration is the hidden variable.** 3 of 4 mutants changed the doctrine's *text* without
  changing its *behavior*, so they measured nothing — a null result that means "my mutants were duds",
  indistinguishable from "the rubric doesn't bind".
- **Derived prose outlives the contract it describes** — three separate instances in one mission
  (SKILL.md's grading claim, the README's barrier numbers, the cohesion comment).

## NEXT

PR open, `Closes #221`. Await review. Follow-ups: #243 · #244 · #245 · #249 · #250.
