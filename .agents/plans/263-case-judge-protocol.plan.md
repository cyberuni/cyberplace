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

## Spec gate — RATIFIED by unional (Clearance). Both suites frozen, `status: approved`.

## The same defect class recurred THREE times, each time inside the fix for the last one

This is the mission's real lesson. Record it.

1. **The suite could not fail.** Cold R1: an impl could spawn the blind simulator, **discard its
   return**, and simulate-and-score in the rubric-aware context — passing all five blindness
   scenarios. Closed by binding the scored artifact to the returned transcript.
2. **The engine's suite could not fail.** Cold R3 proved by ablation: 15/15 green against a
   *leaking* engine, because a canonical rubric's lines never open with a step keyword — the
   `Given`'s apparatus made the `Then` unable to discriminate. Then the **mutation sweep** found
   **13 of 24 mutations survived** — including `an And under a Given is emitted`, which only ever
   asserted a *parse-level* field and never the output.
3. **The must-not-do gate could not fire.** An independent non-ACED reader: the fix severed the
   `Then` from the **scoring** context as well as the simulating one. Guards live only in `Then`
   steps, so the one hard fail in the frozen contract had **no input** and failed **green**.

## Engine defects found by building it (all fixed, all ablation-proven)

1. **The docstring leak.** A rubric ladder line opening with a step keyword parsed as a real step →
   leaked into the brief **and** overwrote `lastKeyword`, so the collapsing `And` leaked too. The
   first implementation's 17 tests all passed; its fixtures had no such line.
2. **The docstring over-correction** (found by the independent reader). Skipping docstrings wholesale
   gutted a `Given`'s docstring — routinely *the prompt under test* — at exit 0 with a non-empty
   brief, catching neither guard. Docstrings now inherit their owning step's fate.
3. **Fail-open on an orphaned `And`** → defaulted to `Given` = emitted.
4. **Empty-but-plausible brief** — exited 0 emitting `## Situation`.
5. **`in file order` was false** — output regrouped `given[]` then `when[]`.
6. **The CLI guard never fired on the declared Node floor.** `import.meta.main` is Node >=24.2;
   `engines.node` is `>=22`, where it is `undefined` → print nothing, **exit 0**. `case-judge` keyed
   its BLOCKER on a non-zero exit ⇒ silent empty brief. Moved to the portable form.

## Residuals (filed as follow-ups, not fixed here)

- A `Given`/`When` that itself leaks the verdict defeats the structural rule (`op6-m5`).
- **Retrieval**: a simulating context with file tools can read the rubric off disk. `judge.feature`
  states a dispatch *requirement*; enforcement awaits a tool-restricted transport. Note a warm unit
  can never satisfy it — tool restriction needs an agent def, which binds subagents only.
- `check-suite`'s `RUBRIC_EXEMPT_RE` is lexical with an accidental escape hatch (a step clears it by
  containing `pass`/`verdict` anywhere).
- **The spec gate has no ablation step** — `check-suite` proves form, the cold judge reads. Neither
  asks "does a `Given` exist under which this `Then` fails?" All three recurrences above hid there.
- **No node fences the results-JSON contract** between `run` (producer) and `report`/`compare`
  (consumers) — the artifact this CR reshaped hardest, and where its only cross-node break landed.
- ~23 repo scripts use the `import.meta.main` guard against a `>=22` engines floor.
- `apps/website/src/content/docs/aced/{run,report,overview}.md` publish the removed scalar contract.
- The impl-judge's independence is structurally degraded whenever `aced-case-judge` is the subject:
  its prescribed method is to invoke it. It correctly refused and read by hand — but that is weaker
  than the measurement its own bar calls for.

## NEXT

Impl gate round 3 on the current tree (rounds 1–2 graded stale trees). Then handoff: PR against
main, refs #263, states it completes node op6-m3; file the follow-ups above.
