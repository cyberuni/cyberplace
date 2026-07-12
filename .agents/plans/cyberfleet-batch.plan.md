---
name: cyberfleet-batch
status: active
todos:
  - content: "explore/design: settle concept model (compiler/scheduler for missions) — DONE, see design.md"
    status: completed
  - content: "design: SSA lowering procedure — how the reasoning front-end cuts toward single-writer-per-symbol"
    status: in_progress
  - content: "design: ready-set -> dispatcher surface (how Operator/Legate consume the frontier)"
    status: pending
  - content: "name the engine + re-home files to the SDD target node; retire stale cyberfleet-batch naming"
    status: pending
  - content: "spec: draft the SDD node spec.md + .feature (SSA lowering, RAW/WAW/WAR, ready-set, Operation retirement)"
    status: pending
  - content: "spec gate: cold spec-judge ALIGNED, freeze .feature"
    status: pending
  - content: "deliver: build the zero-dep ready/cycles engine + per-scenario verification"
    status: pending
  - content: "impl gate: cold impl-judge PASS; root pnpm verify"
    status: pending
  - content: "handoff: PR, distilled summary, file deferred forks as follow-up CRs"
    status: pending
---

# cyberfleet-batch — (working ref; concept renamed pending)

> ⚠ **Concept evolved substantially during explore — see `.agents/plans/cyberfleet-batch.design.md`
> for the living design.** No longer "a cyberfleet batch verb." Now: an **SDD-native mission
> compiler/scheduler** that lowers CRs into individually-executable missions and schedules them for
> parallel work. Name + exact SDD node **pending**; file rename deferred until named.

An engine that takes change-requests and compiles them into a scheduled graph of **missions**,
using a dependency DAG + blast-radius hazard analysis (RAW/WAW/WAR), aiming decomposition toward
**SSA** (single owning mission per symbol), emitting a live **ready-set** (barrier-free, MIMD),
retiring in **Operation**-coherent order to keep trunk deployable. Hierarchy: **Campaign > Operation
> Mission > Task** (existing SDD Campaign product loop untouched).

- Placement: **SDD** (facts + schedule + blast); cyberfleet/cyberlegion consume + dispatch. Exact
  node pending.
- Store: SDD-native sharded append-only DAG log (ledger pattern) + plan briefs as live detail; ~1k
  ceiling; no DB. beads/beads_rust = design reference only.
- Design brief: `.agents/plans/cyberfleet-batch.design.md`.
- Research: `.research/work-decomposition-cr-parallelism/conclusion.md`.
- Settled forks: estimator SDD-native; v1 declared-edges-only (symbol inference = follow-up);
  Operation (not Campaign) for the release unit.

## NEXT

Design thread: the **SSA lowering procedure** — how the reasoning front-end cuts a CR into missions
that approach single-writer-per-symbol, scaffolded by spec-node/artifact-type ownership seams, done
lazily/monadically at the frontier. Then the ready-set→dispatcher surface, then name + spec draft.
