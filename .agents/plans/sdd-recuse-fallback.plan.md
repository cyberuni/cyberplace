---
name: "sdd-recuse-fallback: a resolved producer that recuses falls back to the SDD default"
overview: "Add a general control-flow seam to the SDD conductor: when a resolved producer recuses from a subject (declares it outside its domain), the conductor falls back to the SDD-default chain for that role for that unit, instead of failing closed. Sibling of the existing no-resolvable-producer fail-closed rule. Enables ACES (CR-2) to recuse wrong-squad subjects cleanly. Revise CR against .agents/specs/sdd/ (status approved, frozen features). Design: ~/.claude/plans/in-this-session-we-keen-kurzweil.md."
todos:
  - id: intake
    content: "Open the CR, scaffold this plan, emit the run-level strategy (ledger seq 26). DONE."
    status: completed
  - id: explore-spec
    content: "Explore + spec gate — revise frozen conductor.feature (+README) with the recuse→fallback scenario paired beside 'a required role with no delegate fails closed' (line ~78); add the recusal rule to design/lifecycle-model.md as a sibling of 'No-resolvable-producer fails closed' (line ~140); note per-unit re-resolution in mission/resolution if observable. Ratified re-open, cold sdd:sdd-spec-judge ALIGNED, re-freeze, ledger gate line."
    status: in_progress
  - id: deliver-impl
    content: "Deliver + impl gate — implement recusal handling in start-mission/SKILL.md + sdd-automaton.md (a recused unit re-runs the SDD-default producer + uses SDD-default bars/judges; recorded as a combat-log line, not a halt). Confirm impl-producer-governance already covers deterministic-subject verification. Impl gate green."
    status: pending
  - id: handoff
    content: "Handoff — pnpm verify:specs-new green; commits on next; unblocks CR-2 (the ACES fit gate)."
    status: pending
isProject: false
---

# Plan — sdd-recuse-fallback: conductor recuse→fallback seam

> Mission plan (portable handoff brief). Tracked, per-worktree.
> CR: general change request — enable a resolved producer to recuse from a subject and have the
> conductor fall back to the SDD default, instead of failing closed.
> Target: `.agents/specs/sdd/` (project-path `plugins/sdd-new`), `status: approved`. Runs on `next`.
> **Blocks** the sibling ACES fit-gate CR (CR-2 in the design plan) — its wrong-squad path consumes
> this seam. Design + full two-CR context: `~/.claude/plans/in-this-session-we-keen-kurzweil.md`.

## What we are doing

Today the conductor's production chain has exactly two outcomes for a role: a real delegate runs, or
**no resolvable delegate → fail closed** (`design/lifecycle-model.md` "No-resolvable-producer fails
closed", ~line 140; `mission/conductor/conductor.feature` "a required role with no delegate fails
closed", ~line 78). There is **no** path for a delegate that *exists but recuses* — declares the
subject outside its domain at runtime. This CR adds it: **resolved-but-recused → fall back to the
SDD default for that role, for that unit** (and consequently the SDD-default bars + judge). It is
the general seam that lets a domain plugin (ACES, in CR-2) decline a deterministic/wrong-squad
subject without halting the mission.

## The seam (the one new rule)

- A resolved producer may **recuse** from a subject: it produces no artifact and emits a recusal
  signal naming the subject + reason (out-of-domain).
- Recusal is **not** a structural error (distinct from no-resolvable-producer fail-closed). The
  conductor **re-resolves that unit's chain to the SDD defaults** (default producer + default bars +
  default judge) and proceeds.
- Recusal is recorded as a **combat-log line** (a routing fact), never a halt.

## Resolved decisions

- **Recusal is a sibling of fail-closed, not a replacement** — a missing delegate still fails closed;
  only a *resolved* delegate may recuse.
- **Per-unit, not per-mission** — recusal re-resolves one unit's chain; other units keep their squad.
- **Reuse the default chain** — no new harness skill; `impl-producer-governance` already authors one
  verification per frozen scenario (a `node:test`-style check for a deterministic subject).
- **Branch:** `next`. Fork's `formation-intra-spec-structure` mission has landed (6d63501); corpus
  quiescent; CR-1 target files untouched by it.

## NEXT — resume here

**▶ NEXT ACTION — `explore-spec`.** Revise the frozen `mission/conductor/conductor.feature`: add
`a resolved producer that recuses from a subject falls back to the SDD default for that role`
beside the existing fail-closed scenario. Add the recusal rule to `design/lifecycle-model.md`
(sibling of No-resolvable-producer fails closed). Ratified re-open (this CR), cold `sdd:sdd-spec-judge`
ALIGNED, re-freeze, ledger gate line. Then `deliver-impl`.
