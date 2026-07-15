---
cr-ref: github-224
status: active
todos:
  - content: "Explore: derive the fence rule; pressure-test the filed R'' for soundness"
    status: completed
  - content: "Decide the fold-time-vs-stored-RAW-edges fork the CR asks be evaluated"
    status: completed
  - content: "R''/R'''/R4/R8 all authored and all REFUTED — see the rule ledger below"
    status: completed
  - content: "HALTED round 4: pick the rule to carry forward (R4-restore recommended); owner call"
    status: in_progress
  - content: "Rebuild the falsifier so its generator cannot establish the premise under test"
    status: pending
  - content: "Rewrite the suite from the chosen rule; re-judge cold WITHOUT supplying the mutant list"
    status: pending
  - content: "Deliver: --project/--barrier on append node, fence in the ready fold"
    status: pending
  - content: "Impl gate: cold impl-judge + mutation sweep, then RELAY verdict packet (HITL)"
    status: pending
  - content: "Handoff: PR closing #224; route out the ssa-lowering + formation stale-ref follow-ups"
    status: pending
---

# CR github-224 — mission-graph honors barrier fences

Source: https://github.com/cyberuni/cyberplace/issues/224
Node: `.agents/specs/sdd/mission-graph/` · engine `plugins/sdd/skills/mission-graph/scripts/mission-graph.mts`

`formation/` **declares** a barrier · `ssa-lowering/` **detects** one · this node **honors** it.
Honoring only. hitl · high blast · opus. Never self-ratify.

## STATUS — HALTED at round 4. Four rules authored, four refuted.

The suite currently holds **26 additive scenarios written against R8, which is REFUTED**. They are
NOT safe to freeze. No gate advanced. No ratification written.

## The rule ledger — read this before proposing a fifth

| rule | idea | refuted by | how |
|---|---|---|---|
| **R''** (as filed in #224) | exemption per-project, outranks the offer | measurement | RAW closure is not project-scoped → two projects' barriers each wait on a mission the other's fence holds. **Acyclic**, so `cycles` reports clean while nothing starts. |
| **R'''** (prior session's "shipped") | R'' with exemption graph-global | measurement + 2 cold judges | exemption covers barriers AND outranks the offer → a barrier upstream of an unrelated project's barrier escapes its own project's offer → **two barriers of one project surface at once**. |
| **R4** | barriers never exempt; offer = lowest-id RAW-satisfied barrier per project | adversary | rests on "the WAW-mutex handles concurrency" — false: `intersects()` returns **false** on an empty set and `touchSet` defaults to `[]`, so a barrier declaring nothing is invisible to the mutex and runs beside its own project's work. |
| **R8** | writer guarantees a barrier's touch-set covers its project; delete the offer clause | 2 independent cold judges | the delegation does not hold — three ways, below. |

### Why R8 failed (both round-4 judges, independently)

1. **The invariant is vacuous when checked.** Coverage is validated when the *barrier* is written, but
   project membership **grows afterward** — and `formation` declares the barrier, *then* the fleet fans
   the project out. An ordinary mission appended later is unguarded.
2. **"Cover" has no sound reading.** An empty declared touch-set covers vacuously and `intersects()`
   returns false on it → two barriers of one project both surface. The other reading (intersect-each)
   makes a fence *unwritable* over legal empty-touch-set missions.
3. **The guard is on the wrong node class.** The invariant is a property of a **project**; every guard
   is keyed to a **barrier's own node**, so it structurally cannot see the appends that break it.

### Still open regardless of rule — found by the round-4 spec-judge

- **A barrier can be starved of its own turn.** Exemption confers no WAW priority, so a barrier
  competes with its own exempt prerequisites in the pinned lowest-id tie-break. A lower-id exempt
  sibling wins and the barrier is excluded. This breaks the unconditional `a barrier is not held by
  the fence of the project it fences` under **R4 as well as R8**. Transient (the sibling retires), not
  a wedge — but the scenario's Then is false as written. A barrier-priority tie-break is specified
  nowhere and would collide with the frozen `a WAW tie is broken by the pinned mission ref`.
- **Wedge via the Operation/RAW seam.** An Operation RAW-preceding a barrier never retires (`ready`
  filters `kind === 'mission'`), so the barrier is never RAW-satisfied and fences its project forever.
  Acyclic → clean `cycles`. The existing guard blocks a barrier *on* an Operation; nothing blocks a
  RAW edge *from* one.

## ★ The method failure that matters more than any of the rules

**My falsifier planted the conclusion twice in consecutive rounds.**

- For R4 I measured "barrier beside its own project's work = 0" using a generator that only ever
  produced project-covering touch-sets — the assumption under test.
- For R8 I reported "R4 vs R8: 0/8000 disagreement, the offer clause is provably redundant" using a
  generator that **enforced the covering invariant on every graph it produced**. It could not have
  found a disagreement. I gave that to the owner as proof.

A generator that establishes the premise cannot refute it. Both times the defect was found by an
adversarial pass told only "assume it is broken" — never by a reading pass, never by my sweep.

Related: I deleted the strict-closure qualifier as "dead text" because my sweep could not observe it —
but my sweep implemented a *strict* closure while the engine's `rawClosure` is **reflexive**
(`stack = [start]`). Against the real helper the qualifier is load-bearing: a reflexive closure puts
every barrier in its own exempt set and makes the HOLD clause vacuous. **Unobservable in my model is
not unobservable in the subject.**

Also: **do not hand the cold judge your own mutant list.** Round 3's lens judge killed all 12 mutants
I supplied and declared the rule clean; the free adversary broke it in one pass. Independence covers
the hypothesis, not just the context.

## Convergence — measured

| Round | Defects | Introduced by |
|---|---|---|
| 1 (17 scenarios) | 1 contradiction + wedge + 2 masked + reflexive trap + ~7 gaps | the original draft |
| 2 (25 scenarios) | 1 root / 8 instances + rule-level gap | **the round-1 fix** |
| 3 (25→27, rule → R4) | R4's delegation refuted | **the round-2 fix** |
| 4 (26, rule → R8) | delegation refuted 3 ways + starvation + Operation wedge | **the round-3 fix** |

Every round since the first has been refuted by the round before it — the #192 signature exactly
(1 → 1 → 3, diverging). Four rounds, no convergence.

## Forks settled (do not relitigate)

- **Fence scope is `project`** — frozen upstream: `formation.feature` freezes *"a barrier CR names the
  project it fences"*. The store has no `project` field; this CR introduces it.
- **Fold-time, not stored RAW edges** (the CR asked this be evaluated). Stored edges break frozen
  `ready derives with no side effects` + `WAW and WAR are not stored as edges`.
- **Exemption is graph-global, not project-scoped.** This one is *confirmed* by both round-4 judges —
  the two-project deadlock is genuinely resolved and it generalizes to N projects.

## Route out — do not fix here

- `ssa-lowering.feature`'s frozen `a barrier mission is not scheduled as a normal node-owning mission`
  asserts an unqualified *"no other lowered mission is scheduled to start before the barrier retires"*.
  Falsified by the predecessor carve-out and project scoping. Honoring claim in a detection node.
  **Clearance floor, architect-owned** → its own CR.
- `formation/README.md` states mission-graph *"has no barrier semantics; issue #224"* — goes stale the
  moment this ships. Fast-follow doc update.

## NEXT

**Owner call: which rule to carry forward.** Recommendation: **restore R4's offer clause** — it depends
on no touch-set invariant and enforces one-barrier-at-a-time in the fold itself. Its residual (a
barrier beside its project's *exempt* work) is real but bounded, and smaller than a delegation that
silently stops holding. The starvation defect and the Operation/RAW wedge must be pinned under any
rule.

Before authoring a fifth rule: **rebuild the falsifier so its generator cannot establish the premise**,
and keep the adversarial pass — it is the only thing that has found a real defect in four rounds.
