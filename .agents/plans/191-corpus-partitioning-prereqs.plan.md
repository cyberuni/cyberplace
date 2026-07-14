---
cr-ref: github-191
target-project: sdd
blast: medium
hitl: true
leash: auto-none
tier: fable
todos:
  - content: "explore — author F1 doc-strengthening + F2 spec node + wire formation act"
    status: in_progress
  - content: "spec gate — sdd-spec-judge, then STOP for HITL ratification (doctrine)"
    status: pending
  - content: "deliver — build F2 detection engine + verifications against frozen suite"
    status: pending
  - content: "impl gate — sdd-impl-judge, then STOP for HITL ratification"
    status: pending
  - content: "handoff — Warden placement pass, PR against main referencing #191"
    status: pending
---

# CR github-191 — Op4: corpus partitioning prerequisites F1 + F2

CR link: https://github.com/cyberuni/cyberplace/issues/191
Design: `.agents/plans/cyberfleet-batch.design.md` §"Partitioning prerequisites" + `artifacts/adr/0025-mission-graph-compiler-scheduler-model.md` (F1/F2, false-conflict metric).

**HITL doctrine change** — at each SDD gate emit verdict and STOP for human ratification; do NOT self-ratify.

## Scope

**F1 — code partition (capability-first).** Strengthen the layout doctrine from "default" to
"strongly recommended; layered/framework-first discouraged".
- `.agents/specs/sdd/design/spec-layout.md` (reference, no suite) — S1 heading, selection compass, composition rule.
- `plugins/sdd/skills/place-node/SKILL.md` + `project-spec/place-node` node — align recommendation text.
- `plugins/sdd/skills/start-mission/SKILL.md` — explore-placement capability-first recommendation.
- Optional **Warden layout-quality signal** (false-conflict rate = partition-quality metric) → `formation` node + `sdd-warden` + `formation-loop` SKILL.

**F2 — spec partition (one behavior = one scenario in one owning node) ★.** New intra-project
cross-node scenario-overlap detection + dedup (spec-level SSA).
- NEW node `.agents/specs/sdd/project-spec/scenario-overlap/` (behavioral) + engine
  `plugins/sdd/skills/check-scenario-overlap/` (deterministic candidate-surface + Warden `@rubric` real-overlap judgment) — mirrors `check-spec-structure` house style.
- Wire into `formation` as a new act ("dedupe cross-node scenario overlap") — additive scenarios on
  the `@frozen` `formation.feature` (self-clear, no re-open) + `formation-loop` SKILL act table + `sdd-warden` act.

## Method
- SDD self-spec → ACED recuses → author boolean scenarios inline, dispatch `sdd:sdd-spec-judge`.
- Ledger shard: `ledger/github-191.57335d.jsonl`.
- Validate `pnpm verify` in this worktree before any gate commit/push.

## NEXT
Explore: draft F2 `scenario-overlap` node README + `.feature` (deterministic candidates + `@rubric`
overlap arm, mirror check-spec-structure); draft F1 spec-layout.md strengthening; add formation
additive scenarios (F1 layout-quality signal + F2 dedup act). Then run sdd-spec-judge and STOP at
spec gate for HITL.
