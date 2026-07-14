---
cr: github-189-ssa-lowering
status: active
target: main
todos:
  - content: "explore: settle artifact-type + placement (skill under sdd/ssa-lowering, concept orchestration); draft spec.md + ssa-lowering.feature via ACED scenario-writer — @rubric judgment scenarios"
    status: completed
  - content: "explore grill: cold aced-spec-validator each round (cap 3); iterate Oracle/Architect/SSA-cut/WAW-versioning coverage + near-miss balance"
    status: completed
  - content: "spec gate (HITL, high blast): spec-judge ALIGNED, freeze .feature, ledger gate line, status approved — user ratifies"
    status: completed
  - content: "deliver: write the doctrine skill against frozen suite (ACED impl-producer loop); rebase onto main"
    status: completed
  - content: "impl gate (HITL): aced-impl-judge N-run rubric-vs-threshold PASS per frozen scenario; status implemented — user ratifies"
    status: completed
  - content: "handoff: Warden placement pass; PR with Closes #189; append mission-graph op2-m4 retired + op2 close; plan retirement"
    status: in_progress
---

# CR github-189-ssa-lowering (Op2 ★ capstone, part 2 of 2) — the SSA-lowering doctrine

Source: https://github.com/cyberuni/cyberplace/issues/189 (Op2, ★ capstone third bullet — SECOND half).
Mission-graph node: `op2-m4` (claimed). **This mission closes #189.**

## What it is

The **reasoning front-end** of the CR→mission compiler: it *lowers* a change-request's write-set into a
partitioned set of executable missions — **SSA = one owning mission per spec-node** — applying two
judgment lenses and resolving contention by versioning:

- **Oracle lens** — CR legitimacy (kill/reshape a stale or misaligned CR before lowering).
- **Architect lens** — structural fit: node placement, barrier detection, cohesion of the cut.
- **SSA cut** — partition the write-set so each spec-node has exactly one owning mission (high cohesion,
  single-writer); crosses CR boundaries (regroup by ownership, not by originating CR).
- **WAW → versioned-RAW** — a same-node contention resolves by imposing an order (do-first, rebase/rework
  second) → a versioned RAW edge; irreducible-hard only for order-less concurrent co-writes.
- Emits RAW edges + the partitioned missions into the **mission-graph** store (the deterministic back-end
  — `mission-graph`, `touch-set-correction`, `collision-ladder` — already shipped in Op2 parts 1a–1c).

## Defining constraint (user directive 2026-07-13)

The doctrine's **judgment is tested via ACED** (agent-config `@rubric` scenarios that present a CR and
grade the produced partition), **NOT unit tests** — the design states the reasoning front-end "cannot be
unit-tested" (it is judgment / Oracle+Architect agent calls, not a pure function). So the artifact-type
is an **agent-configuration (skill)**; production chain = ACED (aced-scenario-writer → aced-spec-validator
→ aced-impl-judge).

## Design of record (repo-relative)

- `.agents/plans/cyberfleet-batch.design.md` — sections **"SSA lowering procedure"** (steps 1–6),
  **"Intake judgment — the Oracle gate + Architect's say"**, **"Planning provenance"** (the emitted
  decision-evidence — note SQ-F5 #194 automates the emit; keep this doctrine's scope to the *cut*, cite
  F5 for the evidence artifact).
- `artifacts/adr/0025-mission-graph-compiler-scheduler-model.md` — the compiler/CPU-scheduler model.
- Sibling nodes: `.agents/specs/sdd/{mission-graph,touch-set-correction,collision-ladder}` (concept
  `orchestration`).

## Scope boundaries

- **In:** the doctrine that guides an agent through lowering (the judgment + the cut), producing the
  missions/edges/touch-sets the mission-graph store records.
- **Out (cite, don't build):** the deterministic back-end (already shipped); the decision-evidence *emit*
  automation (SQ-F5 #194); the engine/capability name finalization (SQ-name #195); the Oracle/Architect
  *intake-vet automation* (SQ-intake #196) — this doctrine is the by-hand v1 lens the conductor applies.

## NEXT

**BOTH GATES PASSED — ratified by unional (2026-07-14).** Spec gate: `ssa-lowering.feature` @frozen (17
scenarios), ledger seq2. Impl gate: cold aced-impl-judge IMPLEMENTATION_PASS true, all 18 frozen scenarios
pass, no blocker, sound structural read; ledger seq3. `pnpm verify` green 21/21 on the origin/main-rebased
tree; `mg cycles` empty. Delivered `plugins/sdd/skills/ssa-lowering/{SKILL.md,README.md}`, registered in
sdd root spec.md. **op2-m4 retired → op2 progress 4/4** (capstone closed).

**HANDOFF (in flight):** placement already final (node in its blessed `sdd/ssa-lowering` home, sibling of
mission-graph/collision-ladder/touch-set-correction — no relocation). Push branch `sdd-ssa-lowering`, open
PR with **Closes #189** (this is the ★ capstone / Op2 part-2-of-2 — closing #189 closes Op2). After merge:
plan-retirement retires this brief. **Follow-up filed:** the judge's non-blocking weak-discriminator note
(a few @rubric Givens echo the skill's worked examples) → an add-scenario hardening pass, not a gate defect.
