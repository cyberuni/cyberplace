---
cr-ref: 263-op6-m4-persona-voice-dimension
source: https://github.com/cyberuni/cyberplace/issues/263
spec: .agents/specs/cyberfleet-plugin
status: complete
todos:
  - content: Validate brief premise — which persona nodes carry the pattern
    status: completed
  - content: Rebase onto origin/main (op6-m1 + op6-m2 must be in base)
    status: completed
  - content: Clearance (HITL) — granted, amended, then narrowed by the pivot
    status: completed
  - content: PIVOT — voice graded as one boolean per persona, not a rubric dimension
    status: completed
  - content: Spec gate — cold ACED spec-judge ALIGNED true (round 6)
    status: completed
  - content: Impl gate — cold ACED impl-judge 77/77, voice ran as booleans
    status: completed
  - content: Handoff — PR + drain follow-ups
    status: in_progress
---

# op6-m4 — the cyberfleet persona voice bar

Master #263, node op6-m4. Folds finding #233. Touch-set `cyberfleet/persona-voice`.

## The finding

`pod.feature` and `operator.feature` each had a `@quality @rubric` scenario whose **title claimed
"in voice"** while its rubric carried **no voice dimension** — a persona could score full marks
entirely out of voice. Voice is these personas' only real output: every mechanic is offloaded to a
CLI, so what they *say* is the whole of what they produce.

## Brief premise — corrected

The brief asks which "third persona node" the README deferral names. **Stale count**: written when
the project had `gateway/`, `recruitment/`, `tuning/`. `gateway/` has since split into
`pod/` + `operator/`, `tuning/` → `mechanic/`. **Four** persona nodes today.

## What shipped

**Voice is graded as one boolean `@quality` scenario per persona** — "does this run read as the
persona's register, or as default assistant prose?" — and as **no rubric dimension anywhere**.
Zero rubric dimensions and zero thresholds are touched. Two omnibus scenarios retitled to drop the
false claim. Four `SKILL.md` registers tuned (Pod warm+steady, Operator terse+flat, Crimp
warm+transactional, Mechanic plain/practical/irreverent), each naming **both** failure directions
where the register has two, since guarding one pole leaves the other a free pass.

## Why boolean, not a dimension — the load-bearing decision

Seven judge rounds measured it: **the coarse call is reliable, the fine call is noise.** Every judge
scored a default-assistant-prose persona 0 and a tuned one 2–3 — a wide, stable gap nobody disputed.
Nobody agreed on 2 vs 3. Thresholds pinned to max−1 (needed to keep dimensions decisive) left slack
1, so a one-point wobble on one hand-graded dimension flipped the verdict — four rubrics resting on
one dimension at exactly threshold is **one correlated coin flip, not four independent passes**. The
instrument was measuring judge variance. A weighted sum says *be worse here, better there*: coherent
for a gradient, incoherent where only the coarse call carries signal.

The round-6 judge ruled the form correct and added the argument un-made: **the boolean is strictly
stronger than the dimension fix originally chosen.** The gate requires every scenario to pass, so
voice is untradeable; a dimension inside a rubric can be zeroed and bought back on mechanics points.
*The fix that was reverted was weaker than the fix that shipped.*

## Gates

- **Spec** — ALIGNED true (round 6). Rounds 1–5 ALIGNED false on the rubric form; every round's root
  cause was the same: **fixing the rule at the site the judge named without re-running it against the
  corpus it polices.** It recurred to fourth order and cost five rounds.
- **Impl** — IMPLEMENTATION_PASS true, 77/77. The four voice scenarios are the corpus's first
  `@quality`-without-`@rubric`; the judge confirmed it graded them as **deterministic booleans**, not
  scored against `default_threshold` 4 with no rubric. Verified, because frozen ≠ ever ran.

## Follow-ups filed (ledger) — drain at handoff

1. **HIGH — the edit-class classifier is blind to `@rubric` DocString content.** A frozen rubric can
   be gutted (threshold → 0) and the gate reports `no-content-change`. Reproduced by ablation.
   Step-text edits are caught; DocStrings are not — where every rubric lives.
2. **HIGH — the miss test's floor is partial-credit-shaped but its example invites zeroing.** Three
   judges and one producer audit all reached for the weaker test.
3. **HIGH — a dimension with no boolean twin is the suite's only guard**; one redundant with a boolean
   cannot false-green. The two classes look identical and demand different scrutiny.
4. **MEDIUM — `aced-impl-judge` does not cleanly route `@quality`-without-`@rubric`.**
5. Rule-shaped dimensions duplicating boolean twins (low); mechanic's 11 decorative dims; three stale
   front-door sites; persona unloading.

## Out of scope

`ssa-lowering` (op6-m5), the case-judge protocol (op6-m3).

## NEXT

Node complete. PR open referencing #263. Drain the follow-ups as issues.
