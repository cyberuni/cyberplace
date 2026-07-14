---
cr-ref: github-192
target-project: sdd
blast: medium
hitl: true
leash: auto-none
tier: opus
todos:
  - content: "explore — blast-estimate node + formation barrier call-out authored; 5 judge rounds"
    status: done
  - content: "spec gate — sdd-spec-judge ALIGNED true (round 5); AWAITING human ratification"
    status: in_progress
  - content: "deliver — blast-estimate engine + tests; pnpm verify green"
    status: pending
  - content: "impl gate — sdd-impl-judge; rebase onto main; emit verdict packet and STOP"
    status: pending
  - content: "handoff — PR against main, Closes #192; mail legate that PR is ready to ratify"
    status: pending
---

# CR github-192 — Op5: ★ blast-field auto-compute + formation barrier call-out

CR link: https://github.com/cyberuni/cyberplace/issues/192
Design: `.agents/plans/cyberfleet-batch.design.md` §"Barrier missions" + §"Axis 4 — Risk / autonomy"
+ `artifacts/adr/0025-mission-graph-compiler-scheduler-model.md` + `.agents/specs/sdd/design/autonomy-rubric.md`.

**HITL doctrine change** — at each SDD gate emit the verdict packet and STOP for human ratification;
do NOT self-ratify past a barrier gate.

## Graph position

`ready` returned exactly `op5-m1` (blast medium, hitl, opus) — the sole frontier node. Op5 was authored
coarse (`operation --id op5` → 0/1). This CR delivers **two of Op5's three parts**; the third is #224.

## SCOPE CHANGE — the scheduler fence was CUT to #224 (owner-directed)

The mission-graph barrier **fence** was specced here and **failed 3 consecutive cold-judge rounds**
(scenarios 10→14→17, contradictions 1→1→3; rounds 2–3 each refuted the scenarios added to fix the round
before). Root cause = **method error**: the fence was specified **by example** with no stated fold rule,
and pairwise Given overlap grows quadratically. Owner call: **split**. `mission-graph/` reverted
byte-identical to `main`; the fence re-filed as **#224** with rule `R''` + its termination proof + the
three counterexample snapshots (S1/S2/S3), to be designed **rule-first**.

## Scope AS SHIPPED

**Carve B — ★ blast-field auto-compute.** NEW node `.agents/specs/sdd/blast-estimate/` (behavioral,
concept `orchestration`) — a top-level sibling mirroring `touch-set-correction/` / `collision-ladder/`.
Consumes a touch-set (declared pre-work, or corrected post-work); computes **count × centrality
(fan-in) × sensitivity (declared in opt-in `.agents/sdd/sensitive-paths.toml`)** per
`design/autonomy-rubric.md` §Testability harness; lines the computed level up against the declared one
(**agrees / under-called / over-called**, mirroring touch-set-correction's confirmed/missed/over-declared).
Read-only, **reports-never-writes** — the graph's single writer records it. Explicitly NOT compatibility,
NOT surface location. **No `mission-graph` change needed**: `blast` is already a free string defaulting
to `unknown`, and schema-v1 additive-tolerance is an existing frozen scenario.

**Carve A (partial) — the formation barrier call-out.** Additive on `@frozen` `formation/formation.feature`
(5 added / 0 modified / 0 removed → self-clears, stays `@frozen`, no re-open, no Clearance): an escalated
**project-wide** structural finding is called out explicitly as a **barrier**, states **hoist-early**,
**names the project it fences**, and **escalates on reach alone** regardless of contract impact; a
node-scoped finding is not. README names the **formation ↔ ssa-lowering seam** (formation calls out when
*producing* a fence at escalation; ssa-lowering recognizes when *receiving* a CR at lowering — both
sanctioned, not duplicates).

## Prior art already shipped — do NOT rebuild
- `ssa-lowering/` (#210) grades barrier **detection** at lowering time. This CR owns the **call-out** only.
- `touch-set-correction/` (#199) recovers work areas from a `git diff`; it never predicts a touch-set
  pre-work. blast-estimate **consumes** a touch-set; it does not produce one.

## Gate state — SPEC GATE AWAITING HUMAN RATIFICATION
Cold `sdd:sdd-spec-judge` **round 5: ALIGNED true** — oracle/builder/architect all PASS, no open markers.
Rounds 1–4 each found real defects (all recorded in `192-barriers-and-blast.log.jsonl`). Mechanical:
formation addOnly 5/0/0 · `mission-graph/` identical to main · `check-scenario-overlap` blocking[0] ·
`check-spec-structure` blocking[0] · `check-suite` OK · all README citations resolve · `pnpm verify` green.

Leash `auto-none` + HITL-for-barriers ⇒ **do not self-assert**. On ratification: add `@frozen` to
`blast-estimate.feature`, append the `gate` line to `ledger/github-192.1f8ad6.jsonl` (seq 2), set
`status: approved`, then deliver.

## Method
- SDD self-spec → ACED recuses (precedent #130/#191) → SDD default chain; boolean process-Gherkin.
- Ledger shard: `ledger/github-192.1f8ad6.jsonl`. Combat log: `192-barriers-and-blast.log.jsonl`.
- Validate `pnpm verify` in this worktree before any gate commit/push.

## NEXT
**STOP — spec gate needs unional's ratification.** Verdict packet mailed to the legate inbox. On approve:
freeze `blast-estimate.feature`, write the gate line + `status: approved`, then deliver the
`blast-estimate` engine (`plugins/sdd/skills/blast-estimate/`, self-contained `.mts`, node ≥23.6 / no
deps, mirroring `touch-set-correction`'s house style) with one verification per frozen scenario —
delegate the build to sonnet. Then impl gate (STOP again), then PR `Closes #192` (and note #224).
