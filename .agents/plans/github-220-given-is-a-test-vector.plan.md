---
cr: github-220-given-is-a-test-vector
project: sdd
status: active
todos:
  - content: "explore — suite-format: a Given is a test vector (semantic + spec-side authoring duty)"
    status: pending
  - content: "explore — impl-producer: owe the Then, not the Given + additive scenario"
    status: pending
  - content: "explore — impl-judge: absorption read (match=finding, mismatch=healthy, unclassifiable=escalate) + additive scenarios"
    status: pending
  - content: "spec gate — cold spec-judge; additive self-clears, stays @frozen; HITL ratify (high blast radius)"
    status: pending
  - content: "deliver — suite-format-governance + impl-producer-governance SKILL.md, sdd-impl-judge agent"
    status: pending
  - content: "impl gate — cold impl-judge; pnpm verify"
    status: pending
  - content: "handoff — PR closing #220; file prevalence-sweep follow-up CR"
    status: pending
---

# CR github-220 — a Given is a test vector, not specification

Root-cause follow-up from #211 (refs). Applies to SDD/ACED generally, not just `sdd/ssa-lowering`.

## The finding (settled — do not relitigate)

At #210 `ssa-lowering` scored 18/18. Git-verified: the `.feature` was frozen **42s before**
`SKILL.md` existed (`e075cd2f` 00:39:56 → `dd4e9608` 00:40:38, `--is-ancestor` true). So the worked
examples did **not** leak into the suite. The **impl-producer read the frozen suite and baked its
`@rubric` Givens into the doctrine as illustrations** — teaching to the test, performed by the
automated producer. The impl gate then graded the doctrine against the test it had absorbed.
**Passing is not evidence of reasoning.**

The missing rule:

> A `Given` is a test vector, not specification. The impl owes conformance to the `Then`; it owes
> nothing to the `Given`.

ADR-0016 established the **judge** must be independent of the contract. It never established the
narrower **producer** rule. The producer *must* read the `.feature` — it is the contract. The rule
is not producer-blindness; it is *don't quote the probes*.

Scope is **per-scenario dead weight**, not blanket blindness: the producer lifts *some* Givens (3 of
12 `@rubric` here); every unabsorbed scenario still bites. Nominal suite size 18, effective size
lower and unknown.

## Settled decisions

**Both copying directions are closed, each at the gate where it is detectable.** The rule is one
principle with a distinct duty per actor per gate — the shape this repo already uses (a lens is
split into `builder-spec-governance` / `builder-impl-governance`, one bar per gate). Not duplication.

| Gate | Bar | Duty |
|---|---|---|
| spec | `suite-format` | a Given is a probe; on revise/backfill never lift the artifact's illustrations into a Given |
| deliver | `impl-producer` | the impl owes the `Then`; don't quote the probes |
| impl | `impl-judge` | a match is the finding; unclassifiable escalates |

The **spec-side face is in scope** (user-ratified). At #210 the suite came first, but on a
**revise/backfill** CR the impl already exists, so the spec-producer writes Givens with the
artifact's worked examples in context and lifts them the same way, in reverse. Same result: a
scenario that cannot discriminate a reasoner from a copier. This is the mechanism #211's filer
*assumed* had fired — real, but at the other gate.

**`spec-producer` IS touched** (reversed at spec-gate R2 — the original decision was wrong). The
first read was "the spec-producer self-aligns against the same governances the spec-judge grades
with and already loads `suite-format`, so the bar reaches both actors." The cold judge refuted it:
the producer's *only* self-check scenarios run the **mechanical** form check, and this diff's own
suite-format text states probe independence has **no deterministic form** and is **not** in the
mechanical pre-filter. So the bar reached the producer as prose with **no scenario making
compliance observable** — asymmetric with the 5 scenarios `impl-producer` got for the mirror duty.
That was a plausible-sounding but unverified coverage claim: the exact defect class this CR exists
to catch. Fixed by covering it (4 additive scenarios + a Phase-2 duty), not by narrowing scope,
since both directions are user-ratified.

**No `spec-gate.feature` change.** Its pre-filter is mechanical; this check is semantic, so it
routes through the spec-judge's qualitative bars — which is how `suite-format` (a reference node)
is designed to be enforced.

**Prevalence (issue item 3) is deferred** to a follow-up CR filed at handoff. This CR stops *new*
absorption; measuring existing dead weight across already-frozen nodes is a retroactive corpus
audit — a distinct capability needing its own node + suite. A naive lexical probe is unfit
(shared 6-grams flag `ssa-lowering`'s legitimate Feature-description overlap and miss all three
real cases, which are paraphrases). The real check is semantic.

**No `align-spec` change** (considered, declined — keeps scope tight).

## Touch set — 4 nodes

- `.agents/specs/sdd/authoring/suite-format/README.md` — reference node, prose only, no `.feature`.
- `.agents/specs/sdd/authoring/spec-producer/{README.md,spec-producer.feature}` — `@frozen`.
- `.agents/specs/sdd/mission/impl-producer/{README.md,impl-producer.feature}` — `@frozen`.
- `.agents/specs/sdd/mission/impl-judge/{README.md,impl-judge.feature}` — `@frozen`.

All three `.feature` edits are **additive scenarios** → self-clear, stay `@frozen`, no re-open, no
Clearance floor.

Impl (deliver): `plugins/sdd/skills/suite-format-governance/SKILL.md`,
`plugins/sdd/skills/spec-producer-governance/SKILL.md`,
`plugins/sdd/skills/impl-producer-governance/SKILL.md`, `plugins/sdd/agents/sdd-impl-judge.md`.

## ⚠️ The trap (must survive into the spec)

#211's merge left `sdd/ssa-lowering` in the **correct** end state by accident: the doctrine keeps
its original examples (mailer, telemetry, rate-limiter) and the suite now probes with different
ones. Impl and suite are **decoupled** — which is what we want.

A naive reconcile loop reads "suite says X, impl says Y" as **drift to heal** and re-contaminates on
first pass. The polarity must be stated explicitly in the impl-judge's absorption read:

- impl illustration **matches** a scenario Given → **finding**
- impl illustration **differs** from a scenario Given → **healthy** (never a gap to heal)
- cannot classify → **escalate** (escalate-don't-exempt; a check that cannot classify must not pass)

## NEXT

Explore drafted across 4 nodes; 2 cold spec-judge rounds absorbed (R1 architect: section
misgrouping; R2 builder/oracle: spec-producer coverage gap). Both fixed. Run a fresh cold
spec-judge R3; on ALIGNED, present the verdict packet for HITL ratification (leash auto-none).
