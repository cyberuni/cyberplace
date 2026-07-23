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
  - content: "Owner call 2026-07-23: R4-restore chosen. Rule re-stated + confirmed over a 4-round adversarial pass (3 defects found+closed; convergence gate SURVIVED)"
    status: completed
  - content: "Rewrite the suite from R4-restore; drop R8 coverage scenarios, add empty-touchset/claimed-cap/wedge discriminators (79 scenarios)"
    status: completed
  - content: "Deliver: --project/--barrier on append node, 3-clause fence + INV-1/2/3 write guards in the ready fold"
    status: completed
  - content: "Impl gate: cold impl-judge conformed (31/31); mutation sweep hardened the suite (2 gaps closed). Committed e2e42856 + 2449dc87"
    status: completed
  - content: "Spec gate: cold spec-judge on the re-derived suite + README"
    status: in_progress
  - content: "RELAY both verdict packets + the ssa-lowering:116 Clearance ask to the owner (HITL — never self-ratify)"
    status: in_progress
  - content: "After ratification: PR closing #224; route out the ssa-lowering:116 + formation stale-ref follow-ups"
    status: pending
---

# CR github-224 — mission-graph honors barrier fences

Source: https://github.com/cyberuni/cyberplace/issues/224
Node: `.agents/specs/sdd/mission-graph/` · engine `plugins/sdd/skills/mission-graph/scripts/mission-graph.mts`

`formation/` **declares** a barrier · `ssa-lowering/` **detects** one · this node **honors** it.
Honoring only. hitl · high blast · opus. Never self-ratify.

## STATUS — R4-restore chosen (owner, 2026-07-23), built, cold-judged. BLOCKED on HITL ratification.

The rule stalemate is resolved: owner picked **R4-restore**. It was re-stated precisely against the real
engine helpers and survived a **4-round adversarial pass** — 3 real defects found and closed (barriers
exempt→R‴ hole; edge-time wedge guard→fold-then-check INV-2; open-only cap→count claimed), convergence
gate SURVIVED and judged narrowing. Rule of record: `scratchpad/r4-restore-rule.md` (this session).

**Delivered + committed** (`e2e42856` engine/spec/README, `2449dc87` suite hardening):
- 3-clause fence in the `ready` fold (exempt non-barriers only / at-most-one-barrier cap over open∪claimed
  / explicit hold), fold-time; `--project`/`--barrier` on `append node`; INV-1/2/3 fold-then-check write
  guards. WAW mutex + cycles unchanged. Suite re-derived from R4-restore (79 scenarios); README rewritten
  from the two-clause R8 model to the three clauses.
- **Impl gate**: cold sdd-impl-judge IMPLEMENTATION_PASS (31/31 barrier scenarios, independent oracles,
  every R4-vs-R8 discriminator). Mutation sweep closed 2 suite gaps (mis-bound WAW-tie-break fixture;
  missing barrier-as-another-barrier's-predecessor discriminator). `pnpm verify` green.
- **Spec gate**: cold sdd-spec-judge in progress.

**BLOCKED (HITL, leash auto-none — never self-ratify):** both gate verdict packets + the Clearance-floor
edit to `ssa-lowering.feature:116` need owner ratification. Relayed to handle `homa`.

## The rule ledger — the four earlier rules, all refuted (R4-restore = restore R4's offer clause, hardened)

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

**Blocked on owner (HITL) ratification — relayed to handle `homa`.** Resume once the owner responds:

1. **Ratify the two gates.** Cold impl-judge PASSED; cold spec-judge verdict attached in the relay. On
   owner approval, write the `gate:spec` and `gate:impl` `verdict:approve`/`by:<owner>` entries to
   `ledger/github-224.5293fc.jsonl` (the human's act, not the automaton's).
2. **Ratify the Clearance edit to `ssa-lowering.feature:116`.** Its line "no other lowered mission is
   scheduled to start before the barrier retires" is unqualified and false under R4-restore (exempt
   predecessors + let-through work of the fenced project start before the barrier retires; other
   projects run freely) — a scheduling guarantee living in the detection node. Recommended fix in the
   relay. Architect-owned, cross-node → apply only after ratification.
3. **Handoff.** PR closing #224 / feeding #263 op6-m6; file the `formation/README.md` stale-ref
   follow-up ("has no barrier semantics; issue #224" goes stale on merge). op6-m7 (seat op5-m2 + retire)
   follows.

The 4 blocking follow-ups the halt recorded are all addressed by R4-restore: fold-then-check store
guards → INV-1/2/3; barrier starvation → the bounded transient residual, frozen as a scenario;
Operation/RAW wedge → INV-2. Confirm-and-close them at ratification.
