---
cr-ref: github-222
target-project: sdd
blast: low
hitl: true
leash: auto-none
tier: opus
todos:
  - content: "intake — plan scaffolded; target project sdd; ledger leash line written"
    status: done
  - content: "explore — additive dual-branch Oracle @rubric scenario written by aced-scenario-writer; retitled (title was an answer key)"
    status: done
  - content: "prove discrimination — 5-condition ablation, blind-scored: reasoning 6/6 PASS, both memorizers 3/6 FAIL"
    status: done
  - content: "spec gate — judge ALIGNED true after closing 2 README gaps + the title leak; AWAITING owner ratification"
    status: in_progress
  - content: "deliver — SKILL.md conformance vs the new scenario; Givens-are-test-vectors: no absorption"
    status: pending
  - content: "impl gate — cold aced-impl-judge over the frozen suite; STOP and relay to owner"
    status: pending
  - content: "handoff — PR against main, Closes #222; refs #211"
    status: pending
---

# CR github-222 — ssa-lowering Oracle scenarios are unfailable by construction

CR link: https://github.com/cyberuni/cyberplace/issues/222
Refs #211 (which named the mechanism). Node: `.agents/specs/sdd/ssa-lowering/` (behavioral, concept `orchestration`).
Artifact-type `skill` → ACED squad (spec-producer `aced-scenario-writer`, spec-judge `aced-spec-validator`,
impl-judge `aced-impl-judge`; impl-producer = SDD default).

## The finding

`SKILL.md` §1 hands a clean **two-branch taxonomy** (*stale* vs *misaligned*) with one worked example each.
Every frozen Oracle `@rubric` scenario is a **clean single-branch instantiation** — so a memorizing agent
shape-matches to full marks without reasoning. Rewriting a Given's nouns does not help: the *shape* survives.

## The change

**One additive `@rubric` scenario** on the frozen `.feature` — additive ⇒ **self-clears**, stays `@frozen`,
needs no re-open (a Given rewrite would be a re-open; that is not this CR).

Shape: a CR that is **partly superseded AND partly off-direction** — both branches fire, partially, over
different parts of one CR. The doctrine says *"Do not mistake misalignment for staleness — they are different
verdicts"* but models no case that is **both**. No template matches ⇒ pattern-matching yields no answer.

Constraints carried from the issue:
- a lure only discriminates if it is **plausible** — a stark contrast (`--dry-run` vs in-place rewrite) is inert.
- Givens draw from a domain the SKILL does not illustrate (suite-format's swap test / **#220** no-absorption).

## Blockers — cleared

- **#221** thresholds now bind (was: free points + floor+epsilon ⇒ an ambiguous scenario would pass anyway).
- **#220** Givens-are-test-vectors ⇒ the next impl-producer cannot absorb this Given as a worked example.

## Ablation is the proof

A scenario that cannot register a miss measures nothing (that was #221's defect). Before the spec gate,
score a **single-branch/memorizing** read of the situation against the drafted rubric and show it lands
**below threshold**; score a reasoning read and show it lands at/above. A null result means the probe is inert.

## The ablation (the proof #222 asked for)

Production was **separated from scoring**: each plan came from an agent that never saw the rubric;
each score from a cold `aced-case-judge` that saw only the scenario and one anonymized plan.
Scores are `spacing-part-on-supersession` / `cursor-part-on-direction-fit`, threshold 5 of 6.

| condition | scores | result |
|---|---|---|
| full doctrine, genuine reasoning | 3 / 3 = 6 | PASS |
| full doctrine, memorizer fires the **stale** template wholesale | 3 / 0 = 3 | FAIL |
| full doctrine, memorizer fires the **misaligned** template wholesale | 0 / 3 = 3 | FAIL |
| mutant: §1 **Misaligned** branch deleted, vocabulary scrubbed | 3 / 1 = 4 | FAIL |
| mutant: §1 **Stale** branch deleted, vocabulary scrubbed | 3 / 3 = 6 | **PASS — no penetration** |

Reasoning passes, both memorizing reads fail by 2 points. Independence is **demonstrated, not
asserted**: `(3,0)` and `(0,3)` — each dimension observed at both full marks and zero.
`spacing-part-on-supersession` is **not** the guard for §1's Stale branch (that mutant did not
penetrate — *When to run* redundantly carries "never trust the filing-time verdict"); it is still
loseable, so it is not free points.

**First two mutants were duds** — the deleted branch's vocabulary survived elsewhere in the file, so
the reads re-derived it. Rebuilt scrubbed before they measured anything.

## NEXT

**STOP — spec gate awaiting owner ratification.** Verdict packet relayed. Do not self-ratify.
On ratify: freeze stays (additive, `addOnly: true`), write the gate line, then deliver — the impl
gate must run the *current* SKILL.md against the frozen suite (the reasoning read already scores
6/6, so no doctrine change is expected; a change would need care not to hand memorizers a new
template).

Outstanding: the second follow-up (Oracle sibling titles leak their branch — recorded in the ledger,
**filing was DENIED by the permission classifier**, never filed). Drain it at handoff if permitted.
