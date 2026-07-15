---
cr-ref: github-263-op6-m3
target-project: aced
blast: medium
hitl: true
leash: auto-none
tier: opus
todos:
  - content: "intake — plan scaffolded; target project aced; ledger leash line written"
    status: done
  - content: "explore — judge.feature: 2 Clearance rewrites + 13 additive; node 1 ALIGNED at round 3"
    status: done
  - content: "explore — NEW node extract-situation (owner-requested engine); built, 26 tests, 2 real bugs fixed"
    status: in_progress
  - content: "spec gate — HITL ratify (Clearance); node 2 recused from ACED grading (boolean, node:test-bound)"
    status: pending
  - content: "deliver — rewrite case-judge body; reconcile impl-judge/run/compare/builder-impl prose"
    status: pending
  - content: "impl gate — cold judge; note the self-reference (judge grades its own scorer)"
    status: pending
  - content: "handoff — PR refs #263, completes node op6-m3; file 4 follow-ups"
    status: pending
---

# CR github-263-op6-m3 — the case-judge protocol cannot express its rubrics, and sees its own answer key

CR link: https://github.com/cyberuni/cyberplace/issues/263
Node: `.agents/specs/aced/sdd-roles/judge/` (behavioral, concept `sdd-roles`).
Subject: `plugins/aced/agents/aced-case-judge.md`.

## Graph position

`op6-m3`. Depends on `op6-m1` (#243 parse-guard, MERGED as PR #264). Folds two findings
closed into #263: **#245** (output contract) and **#252** (answer-key prime).
Downstream `op6-m5` re-authors the ssa-lowering scenarios — **out of scope here**.

## The defect — the shared measurement instrument, not any one suite

**A. The output contract cannot express the rubrics ACED freezes.**
`suite-format-governance` and `aced-builder-spec` specify a `@rubric` scenario as **named
dimensions, each with its own `max`** (0..3, 0..2), collapsed against one `threshold`.
`aced-case-judge` documents `SCORE: <1-5>` — one number, on a scale that does not even match
the dimensions'. The #221 impl gate had to **override the documented output format by prompt**
to get per-dimension scores. ssa-lowering's thresholds and its pre-registered demote action are
keyed to a *specific dimension mean* — uncheckable from a scalar.

**B. The judge sees the answer key.**
`aced-case-judge` is handed the scenario name, its `Given`/`When`/`Then`, **and** the inline
`@rubric` — then **simulates** the agent and **scores** that simulation in **one context**. The
simulator has been told the correct call before it simulates; the rubric ladders are worked
answers, not neutral criteria. A passing score cannot separate an agent that reasons from one
told the answer — the eval-cannot-fail class.

## Blast — narrower than the brief implies

`run.feature` and the `compare` node already **delegate** single-case scoring to `aced-case-judge`,
so their frozen suites do **not** encode the scalar — only their prose bodies do. The scalar is
frozen in exactly **two** scenarios of `judge.feature`:

- `:11` "invoked for one case it emits the four-field result"
- `:60` "the output is exactly the four fields"

The trigger layer's `5/3/1` ladder lives **only in the agent body** — `judge.feature:28` already
specifies it boolean ("a pass-or-fail verdict on whether the agent would invoke the subject").
Dropping the ladder is a body fix, **not** a re-open.

## Decisions (settled with the owner in explore — do not relitigate)

| Question | Decision |
|---|---|
| Clearance on the frozen suite | **Granted** for the two scenarios above **only**; the other nine stay frozen untouched |
| Where the blind protocol lives | **Inside `case-judge`** — it builds a redacted brief, spawns a fresh subagent to simulate, then scores the transcript. Callers invoke it **once**, contract unchanged, so no suite can bypass it |
| What the simulator sees | **`Given` + `When` only.** Withhold the scenario name, the `Then`, and the rubric. A structural rule — no discretion to erode |

**Known residual (record as follow-up, do not fix here):** the structural rule cannot catch a
`Given`/`When` that itself leaks the verdict. Marking leaky steps is suite-authoring territory
(`op6-m5`), not the protocol's.

## Touch-set

- `plugins/aced/agents/aced-case-judge.md` — the subject
- `plugins/aced/agents/aced-impl-judge.md` — caller contract prose
- `plugins/aced/skills/run/SKILL.md` — caller contract prose (documents `Score this 1–5`)
- `plugins/aced/skills/compare/SKILL.md` — caller contract prose
- `plugins/aced/skills/aced-builder-impl/SKILL.md` — the "aggregate score ≥ threshold" bar
- `.agents/specs/aced/sdd-roles/judge/{README.md,judge.feature}`

## What the grill changed (rounds 1–4, do not relitigate)

Three cold spec-judge rounds. Each found something real; node 1 reached **ALIGNED** at round 3.

- **R1** — `check-suite` fail-closed on 3 `Then`s (rubric-noun guard); the **transcript-provenance
  hole** (an impl could spawn a blind context, *discard* its return, and simulate-and-score in its
  own rubric-aware context while passing every blindness scenario); a dropped trigger-output shape;
  a `PASS ≡ total ≥ threshold` contradiction against frozen `must-not-do`; missing `Fit:`.
- **R2** — the same contradiction still live on the README surface (fix applied to the suite only);
  a second uncovered arm (missed-expected-behavior); and **F1: blindness bound the *brief*, not the
  *simulator*** — a spawned context inherits file tools and can read the answer key off disk.
- **R3** — node 2 **recused**: a deterministic `.mts` engine is **not an ACED subject**
  (`aced-fit`: wrong-squad = assertable-not-graded), so it carries **no `Fit:` line**; `sdd`'s own
  engine node (`authoring/spec-gate`) is the precedent. And node 2's suite was **non-binding**:
  15/15 green against a *leaking* engine, because a canonical rubric's lines never open with a step
  keyword — the `Given`'s apparatus made the `Then` unable to discriminate.

## Owner decisions (settled — do not relitigate)

| Question | Decision |
|---|---|
| Clearance on the frozen suite | **Granted** for the two output-contract scenarios **only**; the other nine stay frozen untouched |
| Where the blind protocol lives | **Inside `case-judge`** — callers invoke it **once**, contract unchanged, so no suite can bypass it |
| What the simulator sees | **`Given` + `When` only** — name, `Then`, rubric withheld. Structural, no discretion |
| How the brief is composed | **A deterministic engine** (`extract-situation`), not the judge's judgment — owner's call, and it is what made the redaction testable |

## Engine defects found by building it (all fixed, all ablation-proven)

1. **The docstring leak.** A rubric ladder line opening with a step keyword (`When the agent stages
   X, award 3`) parsed as a real step → leaked into the brief **and** overwrote `lastKeyword`, so
   the collapsing `And ... at least the threshold` inherited `When` and leaked too. The one rule the
   fix rests on, broken by the exact input it exists to redact. The first implementation's 17 tests
   all passed — its fixtures had no keyword-leading rubric line.
2. **Fail-open on an orphaned `And`** (no step above to inherit) → defaulted to `Given` = emitted.
3. **Empty-but-plausible brief** — a scenario with no `Given`/`When` exited 0 emitting `## Situation`.
4. **`in file order` was false** — output regrouped `given[]` then `when[]`, so interleaved steps
   were reordered against the contract.

## Residuals (record as follow-ups, do not fix here)

- A `Given`/`When` that itself leaks the verdict defeats the structural rule (suite-authoring, `op6-m5`).
- **Retrieval**: a simulating context with file tools can read the rubric off disk. `judge.feature`
  states it as a *dispatch requirement*; enforcement awaits a tool-restricted transport.
- `check-suite`'s `RUBRIC_EXEMPT_RE` is a lexical guard with an accidental escape hatch — a step
  clears it by containing `pass`/`verdict` anywhere. It would exempt a genuine leak on the same accident.
- The spec gate has **no ablation step**: `check-suite` proves form, the cold judge reads. Neither
  asks "does a `Given` exist under which this `Then` fails?"

## NEXT

Round-4 mutation sweep on node 2 is running. Then: spec-gate HITL ratify (Clearance + node-2
recusal), freeze both `.feature`s, `status: approved`. Then deliver — rewrite the `case-judge` body
to the per-dimension + blind two-pass contract, and reconcile the caller prose in
`aced-impl-judge` / `run` / `compare` / `aced-builder-impl`.
