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
  - content: "spec gate — ALIGNED true; ratified by unional DIRECTLY (relay refused per the seam); gate seq 4"
    status: done
  - content: "deliver — no SKILL.md edit: the current doctrine already scores the reasoning read 6/6; rebased"
    status: done
  - content: "impl gate — PASS 20/20; judge separated production from scoring itself; ratified by unional; seq 8"
    status: done
  - content: "handoff — PR against main, Closes #222; filed #252/#253/#254/#255/#256"
    status: in_progress
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

## Both gates ratified — by unional, DIRECTLY, on their own channel

Not on the `4ea603` relay. The relayed-ratification seam bars a spawned session writing a
human-attributed gate line off a coordinator's "the user approved", so the conductor stopped at
each gate and asked the human instead. The peer's mail ratification was **declined as insufficient**
at both gates. This is the seam working.

## Impl gate — the judge defeated #252 rather than enduring it

Briefed that it could mark the probe `CONTAMINATED` if it could not separate the roles, the cold
impl-judge took neither out: it refused `aced-case-judge` for the new scenario and built the split
itself — 3 producers given the SUBJECT + `Given`/`When` only (no title, no rubric, no `Then`, no
siblings, no knowledge of being graded), then 3 cold scorers each reading one plan + the rubric,
blind to the SUBJECT and each other. **6/6 × 3, zero variance**; all three scorers reached `(3,3)`
by the correct route. 20/20 overall; the 19 pre-existing ran single-context and were reported as
regression checks, not fresh evidence.

Its orthogonal read **caught a real overclaim in the conductor's own prose** (fixed, `bc987a41`):
the README bound "an impl-gate PASS is weaker than the table" to #252's contamination — a cause
that very gate falsified by separating the roles. Left as written, a future pass that separates the
roles reads the paragraph as *discharged* and equates its green gate with the table. Rebound to the
structural axis: **a green gate says the doctrine still reasons; only an ablation says the probe can
still fail.**

## NEXT

Handoff. PR against `main`, `Closes #222`. Then `unit clear` this mission's warm units.

Filed: **#252** (case-judge sees the answer key it scores), **#253** (sibling titles leak their
branch), **#254** (direction-fit taught only from a declared slogan), **#255** (anti-over-merge never
restated at the regroup step), **#256** (guards share vocabulary with the subject — 19 of 20
scenarios still untested against a memorizing subject; the successor finding to #222).
