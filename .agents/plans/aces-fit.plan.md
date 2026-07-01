---
name: "aces-fit: make ACES fit an explicit, early decision"
overview: "Give ACES a first-class fit classifier (strong | partial | wrong-squad = which of ACES's 4 eval layers carry signal), decided in explore by the scenario-writer, enforced at the gate by the spec-validator, so the agent-behavior lens is never forced onto a subject it doesn't suit. Fixes the frozen unconditional near-miss rule that false-fails mechanical subjects; wrong-squad subjects recuse (consuming the CR-1 conductor seam). Revise CR against .agents/specs/aces/ (status implemented, frozen). Design: ~/.claude/plans/in-this-session-we-keen-kurzweil.md."
todos:
  - id: intake
    content: "Open the CR, scaffold this plan, emit the run-level strategy (aces ledger seq 3). DONE."
    status: in_progress
  - id: explore-spec
    content: "Explore + spec gate — add design/fit.md (the FIT model) + a decisions ADR + glossary 'fit' term; revise frozen spec-validator.feature (conditional near-miss: strong required / partial passes; missing-fit CONTENT_GAP; wrong-squad recused) + scenario-writer.feature (classify-first; strong-scoped near-miss; partial no fabricated near-miss; wrong-squad recuse) + READMEs; declare the **Fit:** Use Cases convention. Cold sdd:aces-spec-validator ALIGNED, re-freeze, ledger spec-gate line."
    status: pending
  - id: deliver-impl
    content: "Deliver + impl gate — NEW skills/aces-fit/SKILL.md governance; make aces-builder-spec (conditional trigger-context/balance + load aces-fit) + aces-spec-validator (step-0 read tier, conditional, wrong-squad recuse) + aces-scenario-writer (Step 1.5 classify, gate trigger bullets, wrong-squad recuse, write Fit line) fit-aware; readme 'When ACES fits' section. Cold aces impl-judge; ledger impl-gate line; verify:specs-new green; audit."
    status: pending
  - id: handoff
    content: "Handoff — pnpm verify + verify:specs-new green; commits on next; the next→main PR (owner's call) carries CR-1 + CR-2 + the ACES rejudge work."
    status: pending
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

**▶ NEXT ACTION — `explore-spec`.** Author `design/fit.md` (the model above) + a `design/decisions/`
ADR + a glossary `fit` term. Revise the two frozen role features (spec-validator + scenario-writer)
to make trigger-balance conditional and add the classify-first / recuse behaviors, syncing READMEs.
Cold `sdd:aces-spec-validator` ALIGNED, re-freeze, aces-ledger spec-gate line. Then `deliver-impl`.
