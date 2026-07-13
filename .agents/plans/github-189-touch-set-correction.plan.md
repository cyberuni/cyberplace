---
cr: github-189
status: active
target: main
todos:
  - content: "explore + draft: spec.md + touch-set-correction.feature for the git-diff correction engine (node sdd/touch-set-correction)"
    status: completed
  - content: "spec gate: cold sdd-spec-judge ALIGNED, freeze .feature, ledger gate line, status approved"
    status: completed
  - content: "deliver: build touch-set-correction.mts engine + tests + SKILL/README; per-scenario verification; pnpm verify green"
    status: in_progress
  - content: "impl gate: rebase onto origin/main, cold sdd-impl-judge PASS, status implemented"
    status: pending
  - content: "handoff: finalize placement, PR referencing (not closing) #189, mail operator with outcomes"
    status: pending
---

# CR github-189 (Op2) — git-diff touch-set correction tool

Source: https://github.com/cyberuni/cyberplace/issues/189 (Op2 of cyberfleet-batch self-hosting-kernel)

**Scope (this mission only):** the **git-diff touch-set correction tool** — the first bullet of #189.
An SDD engine that, *post-hoc*, reconciles a mission's **declared** touch-set prediction against what
its git diff **actually** changed, so the mission graph's hazards are **computed, not hand-declared**.

Depends on Op1.M1 — the mission-graph store (PR #197, merged). Builds on top; does not re-create it.

Design: `.agents/plans/cyberfleet-batch.design.md` ("Finer-than-node granularity" → "Touch-set tool
placement") + ADR-0025 / ADR-0026. Own dogfood node: `op2-m1`, declared touch-set `sdd/mission-graph-touchset`.

## What it does (settled during explore)
- **Input:** a `<base>..<head>` git range + the mission's **declared** touch-set (node-id strings
  `<project>/<capability>`, e.g. `sdd/mission-graph`).
- **Mechanism (3 composed tools):** `git diff` (changed files) → **resolve-governances** (each file's
  artifact-type; gates the semantic rung) → node-id recovery (`<project>/<capability>` from path) →
  `gherkin-cli diff` (changed scenarios for touched frozen `.feature` files).
- **Output:** the **corrected** (actual) node-level touch-set + a reconciliation — **confirmed**
  (declared ∩ actual), **missed** (actual − declared, the false-negative the design warns of),
  **over-declared** (declared − actual) — plus per-node finer detail (changed files; changed scenarios).
- **Read-only w.r.t. the mission graph:** it *returns* the correction; the graph's single writer
  appends it at retirement (mirrors resolve-governances "writes nothing").

## Out of scope (later parts of #189 — flag if the spec pulls at them)
- finer-than-node **ladder** (file → region → semantic) + shared-thin-file **hard→soft downgrade** —
  this tool *produces* corrected touch-set data; it does **not** classify a collision hard/soft.
- ★ **SSA-lowering** criteria/automation + symbol-level produce/consume dep inference.
- Region/hunk tier; writing to the mission graph. PR **references** #189, does not close it.

## NEXT
Explore: author `.agents/specs/sdd/touch-set-correction/` (spec.md + touch-set-correction.feature),
provisional placement under the orchestration concept (sibling of mission-graph). Cold spec-judge each
round. Then spec gate.
