---
name: "aces-fit: make ACES fit an explicit, early decision"
overview: "Give ACES a first-class fit classifier (strong | partial | wrong-squad = which of ACES's 4 eval layers carry signal), decided in explore by the scenario-writer, enforced at the gate by the spec-validator, so the agent-behavior lens is never forced onto a subject it doesn't suit. Fixes the frozen unconditional near-miss rule that false-fails mechanical subjects; wrong-squad subjects recuse (consuming the CR-1 conductor seam). Revise CR against .agents/specs/aces/ (status implemented, frozen). Design: ~/.claude/plans/in-this-session-we-keen-kurzweil.md."
todos:
  - id: intake
    content: "Open the CR, scaffold this plan, emit the run-level strategy (aces ledger seq 3). DONE."
    status: in_progress
  - id: explore-spec
    content: "Explore + spec gate — DONE. Added design/fit.md + ADR 0001 + glossary fit term; made spec-validator.feature + scenario-writer.feature fit-aware (ratified re-open); READMEs + **Fit:** convention synced. Cold aces-spec-validator ALIGNED 3/3 on both units; aces ledger seq 4; commit 1e08a98."
    status: completed
  - id: deliver-impl
    content: "Deliver + impl gate — DONE. New aces-fit governance; aces-builder-spec + aces-spec-validator + aces-scenario-writer made fit-aware; readme 'When ACES fits'. Cold sdd-implementer: all 9 frozen scenarios PASS, false-fail fully removed, IMPLEMENTATION_PASS true; aces ledger seq 5; commit 81ba2ba. verify:specs-new green 206/206; audit clean (1 expected internal-governance warning)."
    status: completed
  - id: handoff
    content: "Handoff — DONE. commits 5980374→81ba2ba on next; the next→main PR (owner's call) carries CR-1 + CR-2 + the ACES rejudge work."
    status: completed
isProject: false
---

# Plan — aces-fit: make ACES fit an explicit, early decision

> Mission plan (portable handoff brief). Tracked, per-worktree.
> CR: give ACES a fit classifier decided in explore (scenario-writer), enforced at the gate
> (spec-validator). Target: `.agents/specs/aces/` (project-path `plugins/aces`), `status:
> implemented`. Runs on `next`. **Depends on** `sdd-recuse-fallback` (CR-1, landed `fe7e268`) — the
> wrong-squad recusal consumes that conductor seam. Design + two-CR context:
> `~/.claude/plans/in-this-session-we-keen-kurzweil.md`.

## The fit model (design/fit.md)

**FIT = which of ACES's 4 eval layers (Structural / Trigger / Behavior / Quality) carry real signal.**

| Tier | Diagnostic | Layers | ACES does |
|---|---|---|---|
| **strong** | genuine activation decision (fuzzy/confusable trigger) + non-deterministic judgment | all four | full bar — trigger-context + trigger-balance REQUIRED |
| **partial** | mechanically executes a predetermined path (no activation choice) | Structural + Behavior (+ Quality) | rule + edge + boolean apply; **near-miss N/A**; trigger-context only on firing scenarios |
| **wrong-squad** | deterministic script / engine; output assertable, not graded | Structural only (`cyber-skills audit`) | **recuse** — author no `.feature`; conductor falls back to SDD-default + a script harness (CR-1 seam) |

Decided in **explore by the scenario-writer** (before authoring); enforced at the **gate by the
spec-validator** (reads the declared tier — never re-decides). Recorded as `**Fit:** <tier>` in the
subject spec.md `## Use Cases`.

## Resolved decisions

- **Decision is upstream of the gate** — scenario-writer classifies first; the gate only enforces.
- **The bug is frozen** — the unconditional near-miss rule lives in the frozen role features; this CR
  ratified-re-opens + revises them (additive where possible; one genuine rule change: near-miss
  becomes conditional).
- **Governance, not a `.mts` engine** — fit is a judgment; `aces-fit` is a `user-invocable:false`
  governance, matching every other ACES bar.
- **Core scope** — user-facing surfacing (run/report/init-aces/improve) deferred to a follow-up CR.
- **Branch:** `next`. CR-1 landed; corpus quiescent.

## NEXT — resume here

**▶ MISSION COMPLETE (in-tree).** The ACES fit gate is specced (design/fit.md + ADR + fit-aware role
contracts, cold aces-spec-validator ALIGNED, aces ledger 4) and implemented (aces-fit governance +
tier-conditional bar + fit-aware validator/scenario-writer + readme, cold sdd-implementer all 9
scenarios PASS, aces ledger 5). The **false-fail is fixed**: a partial subject with no near-miss now
passes; wrong-squad subjects recuse via the CR-1 conductor seam. `verify:specs-new` green (206/206).
Commits `5980374`→`81ba2ba` on `next`. **Both CRs done** — the `next → main` PR (owner's call)
carries CR-1 + CR-2 + the earlier ACES rejudge + recuse-fallback work.
