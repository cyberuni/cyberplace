---
cr-ref: github-224
status: active
todos:
  - content: "Explore: derive the fence rule; pressure-test the filed R'' for soundness"
    status: completed
  - content: "Decide the fold-time-vs-stored-RAW-edges fork the CR asks be evaluated"
    status: completed
  - content: "HALTED: R'' and R''' both refuted by an executable model; R4 proposed; relayed, awaiting owner"
    status: in_progress
  - content: "On R4 ratify: rewrite all 25 scenarios from R4 (8 carry Givens contaminated by the R''' defect)"
    status: pending
  - content: "Re-run the mutation sweep + re-judge cold, then RELAY a real spec-gate packet (HITL, no self-ratify)"
    status: pending
  - content: "Deliver: --project/--barrier on append node, fence in the ready fold"
    status: pending
  - content: "Impl gate: cold impl-judge + mutation sweep, then RELAY verdict packet (HITL)"
    status: pending
  - content: "Handoff: PR closing #224; route the ssa-lowering frozen tension out as its own CR"
    status: pending
---

# CR github-224 — mission-graph honors barrier fences

Source: https://github.com/cyberuni/cyberplace/issues/224
Node: `.agents/specs/sdd/mission-graph/` · engine `plugins/sdd/skills/mission-graph/scripts/mission-graph.mts`

`formation/` **declares** a barrier · `ssa-lowering/` **detects** one · this node **honors** it.
Honoring only — do not rebuild detection or call-out.

## Profile

hitl · high blast · opus. Both gates relay a verdict packet to the owner. Never self-ratify.

## STATUS: HALTED IN EXPLORE — blocked on an owner doctrine call

Relayed to `operator` (the spawning owner — **its pane is dead, the doorbell failed**) and to `homa`
(durable inbox, no doorbell). Nothing is committed beyond this record. No gate advanced. No
ratification written.

## Both candidate rules are REFUTED — measured, not argued

Executable model of each rule + a randomized driver, over 8000 random acyclic graphs each
(scratchpad, throwaway; lower is better, all three properties should be 0):

| property | R'' (as filed in #224) | R''' (prior notes: "shipped") | **R4 (proposed)** | R6 (R4 + deps-first) |
|---|---|---|---|---|
| WEDGE (acyclic deadlock) | **53** | 0 | **0** | **106** |
| >1 barrier of one project | **50** | **150** | **0** | 0 |

- **R'' (as filed)** — its termination proof assumes a single project, but it scopes exemption
  per-project while RAW closure is **not** project-scoped. Minimal case: 4 nodes / 2 projects, each
  barrier waiting on a mission the other project's fence holds. The graph is **acyclic**, so `cycles`
  reports a clean bill while nothing can ever start — the exact invisible-wedge trait the issue warns
  about, landing on the issue's own rule.
- **R''' (prior notes' "shipped" rule)** — lifting exemption graph-global fixes the wedge, but
  exemption covers **barriers** and **outranks** the offer, so any barrier upstream of an unrelated
  project's barrier escapes its own project's offer discipline: **two barriers of one project surface
  at once**, voiding clause 2 and the barrier's purpose. Both cold judges found this independently.
- **R4 (proposed)** — barriers are **never** exempt; exemption covers non-barrier missions only and
  does **not** outrank the offer; a project offers its lowest-id **RAW-satisfied** un-retired barrier.

## The principle R4 rests on

**The fence handles ORDERING; the WAW-mutex handles CONCURRENCY. Do not duplicate WAW in the fence.**

R4 drops R'''s "no barrier surfaces until EVERY un-retired barrier of the project is RAW-satisfied"
precondition — which is what encoded the issue's stated intended order (*dependencies first, then the
fences one at a time*). Keeping that precondition (R6) **re-introduces wedges (106/8000)** because it
hand-rolls WAW inside the fence. Measured: with a barrier declaring a touch-set covering its project
(what a project-wide refactor actually touches), R4 gives wedges **0/8000** *and*
barrier-alongside-own-project-mission **0/8000** — the frozen WAW-mutex already enforces it.

## Convergence — why I halted rather than iterate

| Round | Contradictions | Other defects | Introduced by |
|---|---|---|---|
| 1 (17 scenarios, 2 cold judges) | 1 (both judges, independently) | ambiguity, Operation-as-barrier wedge, 2 masked, reflexive-closure trap, ~7 gaps | the original draft |
| 2 (25 scenarios, 2 cold judges) | 1 root / 8 instances | rule-level clause1 x clause2 gap; per-event-vs-fold guard | **the round-1 FIX** |

Round 2 is **diverging** by this mission's own metric — the #192 signature (1 -> 1 -> 3, each round
refuting the last). Halted rather than patch Givens one counterexample at a time.

**Rule-first did NOT protect against sloppy Given authoring.** Round 1's 17 scenarios reproduced the
exact #192 failure: two scenarios gave opposite verdicts on one snapshot because one Given was a
strict superset of the other.

## Method note — mutation, not ablation

Ablation-by-deletion only catches scenarios guarding a clause's **absence**; a scenario guarding
against a *wrong-but-present* rule needs a **mutant**. My first ablation harness reported 7 masked
scenarios that were false positives of the method itself. The mutation sweep (14 wrong-rule mutants)
killed all 14 on the R''' set, 6 of them by exactly one scenario each.

## Forks (settled by evidence)

- **Fence scope is `project`** — not the Operation/`parent-child` grouping already in the store.
  Settled by frozen upstream evidence: `formation.feature` freezes *"a barrier CR names the project
  it fences"*. The store has no `project` field today; this CR introduces it (`--project`, default
  `''` = one default project -> the existing store folds identically).
- **Fold-time, not stored RAW edges** (the CR asks this be evaluated). Stored edges cannot express the
  offer clause without fabricating a real RAW cycle, and would break frozen `ready derives with no
  side effects` + `WAW and WAR relationships are not stored as edges`. The wedge-invisibility
  objection is answered by **prevention** (freeze the no-wedge property), not detection.

## Out of scope — route out, do not fix here

`ssa-lowering.feature`'s frozen `a barrier mission is not scheduled as a normal node-owning mission`
asserts an unqualified *"no other lowered mission is scheduled to start before the barrier retires"*.
Both the predecessor carve-out and project scoping falsify that read. A **honoring** claim living in a
**detection** node. Editing it is a **Clearance** hard floor and it is architect-owned -> its own CR.

## NEXT

Await the owner on: (1) ratify R4, or defend the deps-first precondition on grounds the model does not
capture; (2) confirm no prior ratification exists (the prior run left no ledger, PR, branch diff or
spec content — only notes claiming its forks were "owner-ratified"); (3) confirm the ssa-lowering
route-out; (4) permission to file the two recorded follow-ups.

On R4 ratify: rewrite all 25 scenarios from R4 — **they are additive (freeze self-clears) but NOT safe
to freeze as they stand**; 8 carry Givens contaminated by the R''' defect — then re-run the mutation
sweep, re-judge cold, and bring a real spec-gate packet.
