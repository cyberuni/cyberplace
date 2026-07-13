---
name: cyberfleet-batch
status: active
todos:
  - content: "design: full compiler/scheduler model captured in design.md (DONE)"
    status: completed
  - content: "spec: name + exact SDD node placement (finalize in-context during spec authoring)"
    status: completed
  - content: "spec: write the SDD node spec.md + .feature for the v1 KERNEL (store w/ touch-sets + ready w/ WAW-mutex + cycles + manual authoring); scenarios over authored fixture graphs incl. the #135/#136/#137 fixture; re-emit the run-start leash shard under the SDD node (was removed from the cyberfleet ledger)"
    status: in_progress
  - content: "spec gate: cold spec-judge ALIGNED, freeze .feature"
    status: pending
  - content: "deliver: build the git-tracked mission graph (in-tree files, single-writer, no sharding, tombstone kind) + ready/cycles .mts engine (write-guard + fold-time cycle quarantine) + tests"
    status: pending
  - content: "impl gate: cold impl-judge PASS; root pnpm verify"
    status: pending
  - content: "self-host: author the active Operation(s) into the store as its first Campaign; amend deferred Operations back into the CR source"
    status: pending
  - content: "distill the design into durable homes: project spec (spec.md + DESIGN-NOTES) for the WHAT; 2 ADRs for the WHY (1 model/architecture: compiler mapping + axes + lifecycle loop; 1 store: mission graph SDD-native/per-repo + beads/Dolt/GasTown rejection + orphan-ref F3); research survey docs/research/2026-07-work-decomposition.md from the .research dossier"
    status: pending
  - content: "handoff: PR; file the deferred backlog + F1/F2/F3/F4 as follow-up CRs; delete cyberfleet-batch.design.md once distilled to spec + ADRs (by hand this time; deterministic via F4 going forward)"
    status: pending
---

# cyberfleet-batch — CR→mission compiler/scheduler (working ref; concept rename pending)

> **Design is captured in `.agents/plans/cyberfleet-batch.design.md` — read it first.** This brief is
> the actionable handoff. Concept renamed a long way from "cyberfleet batch verb": it is now an
> **SDD-native system that compiles change-requests into a scheduled graph of executable missions.**
>
> **The big-picture Operation/Mission plan (hand-authored self-host seed) is in
> `.agents/plans/cyberfleet-batch.operations.md`** — Op1 (self-hosting kernel) is active; Op2–5 are
> far-horizon. The todos below drive Op1.M1 (the current mission).

## The model (one paragraph)

**Not a new engine** — it *formalizes + enriches the existing intake→plan(s)→Explore→post-mission
loop* with a persisted DAG, criteria, and queries. A **CR lowers into one or more Operations, or a
standalone Mission** (side quest). **The project works one-or-few Operations at a time**: only the
active Operation(s) enter the local **mission graph** (store) + `.agents/plans/*.plan.md` mission
briefs; **deferred Operations are amended back into the CR + its source** (GitHub/Asana — the tracker
is the far-horizon store; opt-in tracker marker = human bookkeeping). **"Active" is not a runtime
toggle** — activeness = presence in the local graph, decided at ingress; the concurrent set is small
by construction, so no active-flag/prioritizer is needed. **Operation progress = completed/total
declared missions** (derived readout + soft near-floor signal). The machinery unit shifts from
CR-shaped to **Mission-shaped** (**PR = Mission**): CR = stakeholder intent, Missions = the local
decomposition into manageable, deliverable, ideally parallel-executable pieces — generally **without**
tracker refs (mission-ref minted locally = node id; originating CR(s) kept as provenance). Hierarchy **Campaign > Operation > Mission > Task**
(Campaign = existing SDD product loop, untouched; Operation = a **declared set of missions + a
designated capstone**, its release floor = the capstone's dependency closure, support members share
priority but don't gate release; Mission = executable node w/ a `.plan.md`; Task = its todos). Relationships = the three CPU data hazards: **RAW** (dep →
serialize), **WAW** (hard, same spec-node → serialize at issue), **WAR** (soft → parallel + rebase).
Lowering aims for **SSA** (one owning Mission per spec-node — the stable, artifact-neutral atom,
contract = its frozen suite). Before lowering, the front-end **judges, not just cuts**: the **Oracle**
vets CR **legitimacy** (kill stale/misaligned CRs — re-checked as far CRs approach) and the
**Architect** judges structural fit / barriers / placement — both with strong say (the spec-gate bars
pulled forward to intake/Explore; conductor applies them by hand in v1). The DAG is **monadic/dynamic**
(discovered through Explore, not known up front); execution is **barrier-free dataflow**
(fire-when-ready, MIMD; "waves" are a view, not a barrier); ordering only at **Operation-coherent
retirement**.

## Placement & store

- **SDD owns it** (facts + schedule + blast); **cyberfleet Operator** consumes the `ready` frontier +
  runs the **lifecycle loop** (above the mission loop: merge PR → tear down pod → write graph →
  dispatch next; Operator-owned near-term, dedicated-agent split deferred); **cyberlegion** =
  per-mission mechanism (`unit spawn`/Legate).
- **Store** = the **mission graph** (name settled; "DAG log" retired) — SDD-native, **git-tracked,
  per-repo**; **mission-graph management is SDD work** (same layer as `ready`/`cycles`, NOT
  cyberfleet). **Single write-decider** (conductor v1 / Operator's lifecycle loop F3) ⇒ **no
  sharding**; append-only for audit only. **v1 = in-tree files** (single session, no cross-branch
  problem); **F3 = the `sdd/mission-graph` orphan ref** — an *in-repo* git-backed queryable datastore
  ("our Dolt, in-repo not global"), read/query/write via an **SDD engine** behind a git-access seam so
  the v1→F3 swap never touches `ready`/`cycles`. cyberfleet only consumes `ready` + calls the SDD write
  path from the lifecycle loop. ~1k ceiling → no DB. **Rejected: the cyberlegion global hub** (=
  GasTown HQ+Beads+Dolt; wrong locality — mail is global by nature, the graph is per-repo).
  beads/beads_rust = design reference only.
- **Status authority = the graph** (open/claimed/retired); the brief keeps detail + the human dispatch
  clearance (`approved`) — different axes, graph wins on conflict, stale brief = plan-retirement sweep.
- Target project spec: `packages/cyberfleet/.agents/spec`? — **REVISIT: placement moved to SDD**, so the
  node likely lives under `.agents/specs/sdd` (confirm exact node at spec time via discover-specs).

## v1 carve = the self-hosting kernel (dogfood)

Build only the minimum to plan its own remaining work, then self-host:
1. **Store** — the git-tracked mission graph, **in-tree files, single writer ⇒ no sharding**
   (Operations/Missions, RAW+parent-child edges, status, **declared node-level touch-sets**).
2. **`ready` + `cycles`** — zero-dep `.mts` behind a git-access seam: fold the store → frontier incl.
   the **node-level WAW-mutex** (declared touch-set intersection with an in-flight mission ⇒ held
   back); cycles = write-guard + **fold-time quarantine** (never crash, surface repair item) +
   **tombstone** retract kind.
3. **Manual node authoring** — conductor (the single writer) writes nodes/edges/touch-sets by hand
   during intake/Explore.
Then: author the active Operation(s) into the store, amend deferred Operations back into the CR
source → drive the rest via `ready`. Validation = per-scenario **authored fixture graphs**
(engine-suite convention — never the live store; it mutates every retirement, snapshots churn too
fast to freeze) + the **#135/#136/#137 worked example (GitHub issues in this repo — reconcile-against-
mux: RAW #135→#136, #137 WAW-pairs #136)** distilled into a fixture; dogfood self-host = the
acceptance bar at handoff, not a frozen scenario; live-graph checks = state-independent invariants only.

## Backlog (deferred out of v1 → each a Mission in the self-hosted graph)

- git-diff touch-set **correction** tool (SDD engine = `git diff` + `gherkin-cli diff` + `resolve-governances`)
- finer-than-node ladder: file (default signal) → region → semantic (scenarios/symbols); shared-thin-file
  hard→soft downgrade (node-level touch-sets + WAW-mutex moved INTO v1)
- SSA-lowering criteria/automation; symbol-level produce/consume dep inference
- barrier-mission handling (fences; from formation loop)
- **F3**: cyberfleet **headless-operator** + the lifecycle loop (merge/teardown/graph-write/dispatch;
  none exists today) + the `sdd/mission-graph` orphan-ref store engine (**SDD**, not cyberfleet) + Pod-boundary settle
- merge backstop (speculative-CI/bisection) — lives in the lifecycle loop (dispatch consumer)
- blast-field auto-compute (the touch-set estimator sharpens SDD's hand-asserted `blast:`)
- **F1**: strengthen `spec-layout.md` S1 capability-first → strongly-recommended + Warden layout-quality signal
- **F2**: formation-loop intra-project cross-node scenario-overlap dedup (spec-level SSA)
- **F4**: codify the **transient CR-level planning artifacts** in SDD — `<cr-ref>.design.md` (overall
  design/model), `<cr-ref>.operations.md` (the hand-authored Operation/Mission graph = pre-store
  self-host seed), and `<cr-ref>.evidence.md` (the decision-evidence emit — see F5). All are created at
  planning when a CR fans into multiple Operations and parallel `.plan.md`. Extend `retire-plans` to
  sweep all of them gated on distilled/migrated → **deterministic cleanup**, no orphan. (`.operations.md`
  retires when its graph migrates into the store at self-host.)
- **F5**: the **decision-evidence emit** — the reasoning front-end's *proof of work*. Planning emits a
  structured record (sources pulled, Oracle/Architect judgments, decisions + alternatives weighed,
  adversarial verification) the way `research-workbench:deep-research` emits a cited report — the audit
  surface that validates the front-end (which can't be unit-tested). Mechanism: entry kinds on the
  provenance log (source of truth) + a rendered report. v1 = conductor emits by hand; automate later.
- naming finalization (units + store noun "mission graph" settled; engine/capability name = placeholder)

## Open questions

- Exact SDD node + engine surface names; whether Operation-capstone needs a new frontmatter field.
- Store schema exact fields (keep general, not overfit to this project; tombstone/retract kind settled).
- Finer semantic rung for non-behavioral prose (governance/reference) — likely "don't descend".
- F3 store mechanics: the `sdd/mission-graph` orphan-ref read/query/write **SDD engine** (git plumbing
  vs dedicated worktree for the ref) + ledger-shard keying on the mission-ref. (Owner settled = SDD.)

## Provenance

- Design brief: `.agents/plans/cyberfleet-batch.design.md`.
- Research: `.research/work-decomposition-cr-parallelism/` (conclusion.md — landscape + beads/wayfinder/build-graph/merge-queue prior art).
- Settled forks: estimator SDD-native; v1 declared-edges-only; Operation (not Campaign) for the release unit; store SDD-native (no DB); dispatch loop = cyberfleet Operator (not Legate).
- Run-start leash shard was removed (was misplaced under cyberfleet ledger); re-emit under the SDD node at spec time.

## Resolved decisions

- **Node placement** — a **new top-level SDD capability** `.agents/specs/sdd/mission-graph/`, a
  **single-node behavioral capability** (README + `mission-graph.feature`, mirroring `formation/`);
  registered as a Capability-map row + regenerated concept-index (`concept: orchestration`). One node ⇒
  the whole M1 mission owns it (SSA: one owning mission per spec-node). NOT the cyberfleet package.
- **Name** — node + store noun = **`mission-graph`** (store noun "mission graph" was already settled);
  engine verbs = **`ready`** / **`cycles`** (settled) + a separate write path. The delivery skill shares
  the `mission-graph` name (`plugins/sdd/skills/mission-graph/`, decided at deliver). The broader
  **compiler/scheduler capability concept name** stays parked → an **Op1.M2** / project-spec-distillation
  concern, NOT an M1 blocker.
- **Concept axis** — `orchestration` (joins `cr-concurrency`, `loops`, `conductor`); no new axis invented.
- **v1 scope tightened at spec time** — dropped critical-path **ranking** and **soft-overlap
  annotations** from the `ready` output (dispatcher/finer-ladder concerns, not in the design's §Criteria);
  frontier order is the pinned mission-ref tie-break. Everything in the Backlog stays a follow-up.
- **`discovered-from` edge — kept as provenance-only** (user call at the spec gate) — a v1 store
  edge-kind the fold **records but never acts on**; captured from day one because lineage can't be
  backfilled (same "cheap now, painful to retrofit" class as tombstone + schema-version). Consumers all
  deferred: decomposition-quality metric (spawn fan-out = under-lowered cut), growth/decision-evidence
  audit, stale-orphan detection, stacked-PR forwarding. `.feature` freezes "the fold ignores it"; README
  carries an edge-kinds table + a callout explaining the record-but-don't-fold decision.

## NEXT

**Op1.M1 spec is DRAFTED.** `.agents/specs/sdd/mission-graph/` now holds `README.md` (spec.md-equiv:
Use Cases + store/ready/cycles/Operations/status/validation sections) + `mission-graph.feature` (~35
boolean scenarios, engine-suite convention over constructed fixtures incl. the #135/#136/#137 fixture),
un-frozen. `sdd/spec.md` Capability-map row + concept-index regenerated. Committed as the spec-draft unit.

**Next = the spec gate (todo #4).** Run `pnpm verify` first (mechanical suite-format/spec-format
pre-filter must pass). Then spawn a **cold** `sdd:sdd-spec-judge` over the touched
`spec.md` + `.feature` for the {oracle, builder, architect} backward lens set → an ALIGNED rollup. On
ALIGNED: **re-emit the run-start leash shard** under the SDD node ledger (`.agents/specs/sdd/ledger/` —
was removed from the cyberfleet ledger), add the `@frozen` tag to `mission-graph.feature`, and record
the gate in the ledger. Then Op1.M1 deliver (todo #5): build the zero-dep `.mts` engine + colocated
`.test.mts` over the fixtures (delegate the build to Sonnet). **Op1.M2** (self-host) + Op2–5 are
follow-ups, out of scope for this mission.
