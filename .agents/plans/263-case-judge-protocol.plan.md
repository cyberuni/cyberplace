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
  - content: "explore — judge.feature: 2 Clearance rewrites + additive; ALIGNED at spec-judge round 3"
    status: done
  - content: "explore — NEW node extract-situation (owner-requested engine); 88 tests, 6 real bugs fixed"
    status: done
  - content: "spec gate — RATIFIED by unional (Clearance); both suites frozen; node 2 recused from ACED grading"
    status: done
  - content: "deliver — case-judge body rewritten; run/compare/report/impl-judge/builder-impl/glossary reconciled"
    status: done
  - content: "impl gate — R4 30/30 + 27/27; RATIFIED by unional; independence DEGRADED (circular method, read not measured)"
    status: done
  - content: "handoff — PR refs #263, completes node op6-m3; 8 follow-ups recorded, drain pending"
    status: in_progress
---

# CR github-263-op6-m3 — the case-judge protocol cannot express its rubrics, and sees its own answer key

CR link: https://github.com/cyberuni/cyberplace/issues/263
Nodes: `.agents/specs/aced/sdd-roles/judge/` (revised) and `.agents/specs/aced/sdd-roles/extract-situation/` (new).
Subject: `plugins/aced/agents/aced-case-judge.md`.

## Graph position

`op6-m3`. Depends on `op6-m1` (#243 parse-guard, MERGED as PR #264). Folds two findings closed into
#263: **#245** (output contract) and **#252** (answer-key prime). Downstream `op6-m5` re-authors the
ssa-lowering scenarios — **out of scope here**.

## The defect — the shared measurement instrument, not any one suite

**A. The output contract could not express the rubrics ACED freezes.** `suite-format-governance`
Form 2 specifies a `@rubric` scenario as **named dimensions, each with its own `max`** (0..3, 0..2)
collapsed against one `threshold`. `aced-case-judge` documented `SCORE: <1-5>` — one number, on a
scale matching no rubric in the system. The #221 impl gate had to **override the documented output
format by prompt** to get per-dimension scores.

**B. The judge saw the answer key.** It was handed the scenario name, `Given`/`When`/`Then`, **and**
the inline `@rubric` — then **simulated** the agent and **scored** that simulation in **one context**.
A passing score could not separate an agent that reasons from one told the answer.

## Blast — narrower than the brief implied

`run.feature` and the `compare` node already **delegate** single-case scoring to `aced-case-judge`,
so their frozen suites never encoded the scalar — only their prose bodies did. The scalar was frozen
in exactly **two** `judge.feature` scenarios. The trigger layer's `5/3/1` ladder lived **only in the
agent body**; the contract already specified that layer boolean, so dropping it needed no re-open.

## Owner decisions (settled — do not relitigate)

| Question | Decision |
|---|---|
| Clearance on the frozen suite | **Granted** for the two output-contract scenarios **only**; the other nine stay frozen untouched |
| Where the blind protocol lives | **Inside `case-judge`** — callers invoke it **once**, contract unchanged, so no suite can bypass it locally |
| What the simulator sees | **`Given` + `When` only** — name, `Then`, rubric withheld. Structural, no discretion |
| How the brief is composed | **A deterministic engine** (`extract-situation`), not the judge's own judgment — the owner's call, and what made the redaction testable |
| Scope growth | Blessed: the engine, the protocol, and the caller reconciliation land in one PR |

## The same defect class recurred SIX times, each inside the fix for the last

This is the mission's real finding.

1. **The suite could not fail** — an impl could spawn the blind simulator, *discard its return*, and score its own rubric-aware simulation, passing all five blindness scenarios.
2. **The engine's suite could not fail** — 15/15 green against a *leaking* engine; the `Given`'s apparatus made the `Then` unable to discriminate.
3. **The must-not-do gate could not fire** — the fix severed the `Then` from the **scoring** context too; guards live only in `Then` steps, so the one hard fail had no input and failed **green**.
4. **The CLI guard never fired** — `import.meta.main` is Node >=24.2 against a `>=22` floor: print nothing, exit 0. Then the *fix* reintroduced it via `file://${argv[1]}` (percent-encoding), breaking on any path with a space.
5. **The `Examples` path was unbound** — every rendered-output assertion was negative; the positive ones tested the data structure, so `formatTable` could `return ''` at full green.
6. **Fail-closed was a proxy** — `assert.throws` on a pure function under a catching `main()` cannot see an exit code or stdout.

## Engine defects found by building it (all fixed, all ablation-proven)

The docstring leak (a rubric ladder line opening with a step keyword parsed as a real step, leaking
**and** corrupting `lastKeyword`); the docstring over-correction (skipping wholesale gutted a
`Given`'s docstring — *the prompt under test* — at exit 0); fail-open on an orphaned `And`; an
empty-but-plausible brief; `in file order` being false; and the CLI guard above.

## What the judging did and did not reach

- **Nobody ever executed the protocol.** All 30 `judge.feature` verdicts are a **static
  contract-binding read**. The impl-judge's method is to invoke `aced-case-judge` — the subject — so
  it refused as circular. Narrow and **solvable** (drive it from a non-ACED subagent with a
  sentinel-laced scenario, or grade with the previous version from `main`). Filed **blocking**.
- **Reading has low yield; mutation has high yield.** Reading found 1–2 per pass. Mutation sweeps
  found **13, 16, and 28**. Every one of the six died to mutation and survived every read.
- **The seam migrates each round** (rendering → `formatJson` → the CLI error path). The loop was
  stopped at convergence-of-*artifact* — 3 rounds, 0 engine/body defects — not at zero findings.
- **Ablation-by-author has a blind spot.** My own ablations held, and I also wrote an equivalence
  claim a 97-mutation sweep agreed with and a cold judge refuted in one shot: comments are legal
  anywhere, and a commented-out `Examples` row is a standard idiom — my rationale ("no step line
  follows an `Examples:` block") never considered that a comment is not a step line. **Mutants must
  not come from the author.**

## Residuals and follow-ups (8 recorded in the ledger; drain pending)

**Blocking:** name how ACED grades its own runner — the protocol has never been executed.
**Backlog:** the spec gate has no ablation step; the binding bar (bounded named operators for prose,
mechanical mutation score for engines, verdict **states its bound**, list **ratchets**); the
`import.meta.main` sweep (fix **mechanically** in `check:ci` — never a prose bar hand-reading syntax);
no node fences the results-JSON contract between `run` and `report`/`compare`; `check-suite`'s lexical
guard has an accidental escape hatch; a rubric under a `Given`/`When` would be emitted to the
simulator; docs/website/golden-set still ship the 1–5 scalar.

Owner-accepted, not filed as defects: a `Given`/`When` that leaks its own verdict (`op6-m5`), and
retrieval off disk (stated as a dispatch requirement; enforcement awaits a tool-restricted transport,
which a warm unit can never satisfy since tool restriction needs an agent def).

## NEXT

Handoff: PR against `main`, refs #263, states it completes node `op6-m3`. Drain the 8 recorded
follow-ups into issues (dedupe against open **and** closed first).
