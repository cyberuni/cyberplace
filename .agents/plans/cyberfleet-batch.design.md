# Mission compiler/scheduler — planning brief

> **NAME + PLACEMENT PENDING.** Working concept: an SDD engine that compiles change-requests into
> a scheduled set of individually-executable **missions**. File will be renamed once the concept
> name lands. Placement leaning: **SDD** owns this (it reasons over CRs, spec-nodes, artifact-types,
> blast); cyberfleet/cyberlegion consume + dispatch the schedule.
> Design seed: operator brief + `.research/work-decomposition-cr-parallelism/conclusion.md`.

## What it does

Take one or more **change-requests** and *compile* them into a set of individually-executable
**missions** (matching the mission-loop unit) plus a **schedule** for running them in parallel and
knowing when the project is shippable.

It is **not** "analyze the structure of a CR." The dependency/overlap structure is the internal
*hazard analysis* the scheduler needs — a means, not the product.

Mental model: an **optimizing compiler back-end + CPU instruction scheduler**, not the Agile
"epics → stories → tasks" static taxonomy. The organizing principle is **hazards and parallelism**,
not topic.

## Hierarchy / vocabulary (military doctrine: Campaign > Operation > Mission > Task)

```
Campaign   = existing SDD product outer loop (grow/prune capabilities) — UNTOUCHED
  └─ Operation  = a releasable/deployable sub-graph of missions       ← the "Release" unit
       └─ Mission = the executable DAG node; runs the mission loop; builds+tests-green
            └─ Task = a step inside a mission (its plan-brief todos)
```

- **Task** — atomic step (a mission's todo).
- **Mission** — the executable unit / DAG node; individually builds+tests-green. ≈ an Agile *Story*
  (one coherent, deliverable unit of intent, realized as Tasks).
- **Operation** — a sub-graph of missions that is **releasable/deployable**. ≈ an Agile *Epic/Release*.
  The unit of focus: missions in the active Operation get higher priority. (This is the unit earlier
  mis-called a "story".) Chosen over "Campaign" because Campaign is already SDD's product loop and
  sits a rung *above* Operation; the Operation rung was empty, so no rename.
- **Campaign** — SDD's existing product outer loop; left as-is.

## Not a new engine — formalizing the existing loop

This is **not** a new pre-mission compiler bolted on. It **formalizes + enriches the flow SDD already
runs**: intake already turns a CR (GitHub issue / Asana task / prompt) into a plan under
`.agents/plans`; Explore already reshapes mission scope, files follow-up CRs, and discovers blocks;
post-mission already feeds back. We add three things to decisions the conductor **already makes by hand**:
- **plan → plan*s*** — intake can split one CR into multiple Operations/missions (a DAG, not one flat brief);
- **criteria** — node-ownership/SSA, hazards (RAW/WAW/WAR), Operation-coherence, blast — to guide cuts
  that are currently intuition;
- **persistence** — the DAG log, so the plan(s) are a queryable graph Explore + post-mission update.

Touchpoints where the DAG is created/updated = the existing phases: **intake** (initial split),
**Explore** (scope change, discovered edges, follow-up CRs), **handoff/post-mission** (discovered-from,
retirement). Worked example: **#120 blocked on #122** — today ad-hoc (block + wait); formalized, it is
a **RAW edge discovered during Explore**, written to the DAG so the scheduler routes around it.

## The hazard mapping (why the compiler model is load-bearing)

Edge convention: `A → B` = "A must finish before B" (A produces, B consumes).

Our three CR relationships are exactly the three classic data hazards:

| Our term | Hazard | Resolution |
| --- | --- | --- |
| dep edge (B consumes a symbol A produces) | **RAW** true data dependency | serialize |
| **hard** overlap (both write the same symbol) | **WAW** output dependency | serialize (can't co-wave) |
| **soft** overlap (same file, different region) | **WAR** anti-dependency | co-wave OK, removable by rename = **rebase** |

Soft overlaps are WAR anti-dependencies: false dependencies a rebase dissolves. Hard overlaps are
WAW: genuine output collisions. This *explains* the soft/hard split instead of asserting it.

The pipeline (**hybrid** — reasoning front-end + deterministic back-end):
1. **Lower** — coarse CR → candidate missions (compiler front-end). **Core to v1**: a CR is a coarse
   program; the parallelism lives *inside* it, so without lowering there is nothing to interleave.
   This is a **reasoning** step (semantic cut), not a pure function — an agent/skill pass, scaffolded
   by deterministic seams (existing spec-nodes + artifact-type boundaries are candidate mission cuts).
   Overlaps with SDD `explore` (which already decomposes one CR into touched units) — should reuse it.
2. **Hazard analysis** — build the dependency + conflict graph (RAW/WAW/WAR). Deterministic `.mts`.
3. **Schedule / optimize** — extract max parallelism into ordered waves + Operations. Deterministic `.mts`.

Layering: this is a **pre-mission planner** that sits *above* the mission loop — it emits missions
for the existing mission loop to run, which cyberlegion then dispatches into worktrees.

## The axes (read the mission DAG on all of these at once)

Nodes = missions; edges = RAW deps; WAW/WAR = pairwise annotations.

**Axis 1 — Concurrency (hazards → waves).** A **wave** = an antichain that is pairwise non-WAW;
soft (WAR) pairs may share a wave carrying a rebase-cost annotation. ILP extraction with hazard
detection. The merge-time speculative/bisection backstop is the "flush on misprediction."

```
  wave 1          wave 2                 wave 3
 ┌──────┐        ┌───────────────────┐  ┌────────┐
 │  M1  │──RAW──►│  M3  (uses X)      │  │  M4    │
 │ (+X) │        │                ┆   │══│ (rew X)│
 └──────┘        │  M5  ┄┄soft┄┄┄┄┘   │  └────────┘
 ┌──────┐        │ (same file M3,     │      ▲ WAW: can't share a wave
 │  M2  │        │  different region) │
 └──────┘        └───────────────────┘
```

**Axis 2 — Deliverability (Operations).** Orthogonal to concurrency. An **Operation** = a
*capstone* mission ★ + its **dependency closure**; when the closure completes, the project is
**releasable/deployable**. The distinguishing property is *shippable product value* — NOT
"builds + tests green" (every Mission already has that). Not every sub-graph is an Operation. A
capstone is partly **declared** (the Operation's deployable objective — semantic value can't be
fully inferred, like a compiler can't infer transaction boundaries) and partly **checkable**: the
engine verifies the closure is *dependency-closed* (no missing prerequisite). Deliverability = the
legal **ship points**; concurrency = how fast we reach them; prefer wave boundaries that land on
Operation cuts. Priority is derived here: missions in the active Operation outrank the rest.

```
   ┌─ Operation O1 (capstone ★M3) ─┐
   │   M1 ──► M3★                   │  releasable when {M1,M3} done
   └───────────────────────────────┘
                    └──► M4★         Operation O2 (capstone ★M4) = {M1,M3,M4}
   M2★ = its own Operation {M2}      M5 = support inside O1, not a capstone
```

**Axis 3 — Granularity / lowering.** How a coarse CR splits into missions and how fine to stop
(compiler front-end). Rule of thumb: one mission = one coherent, independently-verifiable unit
(≈ one PR / one context window). Decides the *nodes*, not their order.

**Axis 4 — Risk / autonomy.** Each mission's **blast** (feeds the sharpened `blast:` field) and
**HITL vs AFK** (Wayfinder's axis) → which missions need a human gate vs self-assert on the leash.
The schedule must respect gates: a HITL capstone can't be auto-shipped. The SDD north-star axis.

**Axis 5 — Cost / optimization.** Per-mission effort + **critical path** (longest dep chain bounds
wall-clock) + **capacity** (fleet hosts K parallel worktrees = issue width) + the **rebase tax**
from soft overlaps. The objective + constraints the scheduler optimizes against.

*(Priority is not an independent axis — it is derived from Axis 2: missions in the active
Operation outrank the rest. MVP-first = choose which Operation is active.)*

**5 axes.** Axes 1–2 are the heart; 3 defines the nodes; 4–5 shape and constrain the schedule.

## The DAG is dynamic (monadic), not static

**Correction to any "we know the whole DAG ahead" premise — we do not.** Explore is the discovery
process: touch-sets, deps, and even which nodes exist aren't known until we spec + build. In
build-systems terms (*Build Systems à la Carte*) the graph is **monadic** (deps discovered while
building — Shake/Nix/Bazel-dynamic), not **applicative** (graph known ahead — Make/Turborepo/Nx).

Consequences:
- The engine maintains a **partial, growing DAG** and **re-derives continuously** — it never emits a
  rigid schedule. Primary output = a **live frontier / ready-set** (à la beads `bd ready` /
  Wayfinder frontier = open+unblocked+unclaimed), not a fixed wave-plan.
- **Confidence gradient over the horizon**: near-frontier is knowable (CR + existing specs are a real
  prior); far horizon is speculation. Commitment **decays with distance** — fully commit the
  ready-set, loosely speculate the next, don't schedule far (avoids thrown work).
- **Lazy (monadic) lowering**: decompose just the frontier to expose the next missions; defer deep
  decomposition of far work until it approaches. JIT the next block, not whole-program.
- **Multi-timescale updates**: DAG mutates within a mission (Explore refines local edges), at handoff
  (`discovered-from` spawns missions), and across campaign/formation loops (new CRs). Re-derive on all.
- AOT/NPU (static whole-graph reasoning) is **demoted to the known core** (settled specs/impl); the
  **frontier is CPU/monadic** (discover, speculate, re-derive).

## Execution model: barrier-free dataflow (Turborepo/OoO), not GPU warps

Missions are **independent agent sessions (MIMD)**, not SIMT lockstep — so there is **no wave
barrier**. A mission fires the moment *its own* deps retire (Turborepo runs tasks barrier-free at
max concurrency = OoO reservation stations firing when operands are ready). **"Waves" are a
topological-level *view*** (for humans / capacity planning), never an execution unit.

Turborepo caveat: it is *applicative* (static graph from `turbo.json`) — take its **execution**
semantics (barrier-free, fire-when-ready), not its graph model (which is our monadic problem above).

The one real ordering constraint is at **retire, not issue**: missions are worked out-of-order in
parallel worktrees, but **merge/retire in an Operation-coherent order** (the reorder-buffer / ROB) so
trunk stays deployable. Plus **latency hiding** (MIMD-friendly): a mission blocked on a gate/CI/human
lets its agent pick up another ready mission.

## SSA lowering procedure (the reasoning front-end)

Goal restated as SSA construction: a CR's total **write-set** is what it creates or modifies.
Lowering = **partition the write-set so each unit has exactly one owning mission** (SSA: one
assignment per variable; missions = versions).

**Granularity — the unit is the spec-node, NOT the export.** (Revised: per-export is unstable under
monadic uncertainty and not artifact-type-neutral — skills/subagents/governances/docs are prose, no
"export".) The stable, artifact-neutral atom is the **spec-node = `project + capability +
artifact-type`**, whose contract is its **frozen `.feature`** — exactly what the mission loop freezes.
So **SSA = one owning mission per spec-node**. It is stable (capability known early, symbols churn),
artifact-neutral, already SDD-native + cheap (`resolve-governances` / `project-path`), and matches
production practice (Uber/Aviator schedule at coarse build-target granularity; symbol-level is
research-only). **Screaming architecture is the precision lever**: clean capability boundaries make a
node-level collision a *real* collision (architecture quality = scheduler precision); where node-level
over-serializes (one thin file, two capabilities — e.g. `cli.ts` prune vs gc), that is usually an
architectural **smell** to split. Exception: legitimate shared-thin files (CLI router, barrel,
registry) get an **optional finer file-region/symbol check** to downgrade hard→soft. The exact finer
mechanism (and whether prose ever needs scenario-level) is **open — artifact-type-specific, deferred**.

Procedure:
1. **Recover the write-set (def set).** Primary unit = **spec-nodes** (project+capability+artifact-
   type) the CR touches — stable + cheap (`resolve-governances`/`project-path`). Optional finer
   (file-region/symbol) only for known shared-thin files. Partial/predicted at the frontier (monadic).
2. **Node-interference view (deterministic seams).** Compute **cohesion** (nodes that must co-change),
   **contention** (a node touched by >1 concern), **def-use** (RAW). Scaffolded by capability
   boundaries / artifact-types / new-vs-modified (a new node = single-writer by construction;
   contention only on existing shared nodes).
3. **Partition symbols → missions (SSA rename + register allocation).** Agent's cut, toward: single-
   writer-per-symbol, high cohesion within a mission (≈ operator fusion, don't over-split coupled
   symbols), Operation-coherence. **Crosses CR boundaries** — missions regroup work by *ownership*,
   not by originating CR (so N CRs → M missions, not 1:1).
4. **Resolve contention by versioning (key refinement).** Two concerns writing node X → version it
   `X_v1`(A) → `X_v2`(B) with a RAW edge. **A WAW is only irreducibly hard when the two writers are
   otherwise independent (no order to impose).** Versioning **is** the resolution (order them, do
   first, rebase/rework second → versioned-RAW). **Policy: serialize at ISSUE (strong default).**
   Mechanism note: worktrees mean git only surfaces the conflict at *retire* — but at **node**
   granularity a same-node collision is usually a *substantial semantic* merge (hard/impossible), so
   optimistic parallel-then-merge is the wrong default; don't start them concurrently. Contrast RAW
   (blocks *starting*, needs the output). **The coarser the atom, the more a collision biases to
   issue-serial** (coarse merges are expensive). Only known-cheap overlaps (shared-thin files) stay
   soft/parallel. **Irreducible-hard** = even serialized, the second needs real **rework** (not a
   clean replay) because the first moved the ground.
5. **Emit RAW edges from def-use** across the assignment = the dependency DAG.
6. **Lazy/monadic frontier expansion.** Deeply lower only the frontier; leave far work coarse until
   it approaches, then Explore refines it.

Maps to compiler **SSA construction + register allocation**: interference graph = symbol-contention;
coloring = assign symbols to missions (registers); **spilling = the irreducible serialize**; φ-nodes
= merge/rebase reconciliation. Division of labor: deterministic engine *proposes* (seams, interference,
contention, def-use); agent *decides the cut* (partition + versioning) toward SSA; back-end *verifies*
SSA-ness + flags residue.

Refines the hazard model: **WAW-hard collapses to versioned-RAW whenever an order can be imposed**;
irreducibly hard only for order-less concurrent co-writes of one symbol.

## Barrier missions (architecture / project-wide refactors)

A distinct mission **class** the node-ownership model doesn't capture: architecture / project-wide
refactoring **doesn't own one node — it cross-cuts many**, so its blast is (near) the whole graph
**of its project/spec** (monorepo projects are isolated — a refactor in one project does not fence
another's missions) and it WAW-conflicts with almost everything in that project. In CPU/compiler terms these are **barriers / fences**
(serializing instruction, stop-the-world, schema migration): missions can't reorder across them, and
everything after rebases onto the new world — a **global φ-node** partitioning the schedule into
epochs (before-refactor / after-refactor).

- **Must be called out explicitly** — cannot be scheduled as a normal node-owning mission; their real
  edge set is "conflicts with most of the fleet."
- **Do them first/early — once the need is known and the target shape is clear.** Doing a refactor
  *after* parallel fan-out forces a fleet-wide rebase/rework (moves the ground under everyone); cost
  only grows with delay. Caveats: refactors are often **discovered mid-flight** (monadic) → then it's
  a **drain-and-rebase** (pause in-flight, do the barrier, rebase the fleet), cheaper the sooner;
  a purely **speculative** refactor risks wasted or wrong-shape work → confirm the need first.
- Usually on the **critical path** (hoisting early is also cost-optimal) and **high-blast → HITL-gated**.
- **SDD home**: barrier missions are largely what the **formation loop** (Architect/Warden, corpus
  structure) produces — structural CRs = fences in the scheduler.

## Architecture lessons (CPU / GPU / NPU)

The hazard *dynamics* are CPU (renaming, OoO, speculation); the *graph* is monadic/dynamic (above);
NPU/XLA static reasoning applies only to the settled core.

**Load-bearing (change a design decision):**
- **SSA = the LOWER objective.** Decompose each CR so every symbol/artifact has exactly one owning
  mission (single static assignment). Then WAW/WAR (false deps) vanish by construction; only true
  RAW deps remain. Hard conflicts are *designed out*, not merely detected; the residue (two CRs that
  must both rewrite one symbol) is the irreducible hard conflict → serialize. Merge/rebase points = **φ-nodes**.
  → This defines what "a good mission cut" is, and links the reasoning front-end (aim for SSA) to the
  deterministic back-end (flag the residue).
- **Register renaming = worktrees.** A worktree gives each mission a fresh physical copy → dissolves
  file-level (WAR/WAW) false deps; the conflict only materializes at write-back (merge). Sharpens
  soft/hard: **soft** = collision on the *physical register* (same file, renamable → rebase);
  **hard** = collision on the *architectural register* (same symbol's semantics, not renamable).
- **Reorder buffer / in-order retirement = Operation-ordered merge.** Work missions OoO in parallel
  worktrees, but **merge to trunk in an order that keeps the project releasable**; the **Operation is
  the retirement boundary**. Keeps trunk always-green under parallelism.
- **Monadic/JIT scheduling (not AOT).** The graph grows at runtime; re-derive the ready-set
  continuously, commit near / speculate far. Branch prediction + squash = the merge-time
  speculative/bisection backstop; predictor confidence bounds speculation depth.
- **Latency hiding (GPU occupancy, MIMD-safe).** Oversubscribe the ready-pool so a mission blocked on
  a gate/CI/human lets its agent pick up another ready mission. *(Warp divergence / homogeneous-wave
  barriers do NOT apply — missions are independent MIMD sessions, no lockstep retire.)*

**Supporting:** operator fusion → fuse a producer + trivial consumer (anti-over-decomposition);
forwarding → start a dependent off the producer's unmerged branch (stacked-PR optimization);
mixed precision → assign model tier by blast (the existing delegation table).

## DAG persistence / state (store decision)

The monadic DAG must persist and grow across sessions. **Decision: SDD-native, git-tracked store;
beads is the design *reference*, not a runtime dependency.**

How far from beads: conceptually *very* close — beads independently converged on our primitives
(cycle-rejected dep-DAG, `discovered-from` dynamic growth, `ready` frontier). That's validation. The
gap is that beads is a **generic issue tracker**; our value (SSA lowering, WAW/WAR from touch-sets,
Operation retirement) lives *above* any store and is ours regardless. beads would store nodes + RAW
deps only — ~80% of the easy part, ~0% of the hard part.

Options weighed:
- **Adopt beads (Go/Dolt)** — rejected: Dolt DB/process, auto-git invasiveness, heaviest.
- **Adopt beads_rust (`br`)** — closer (embedded SQLite + JSONL, self-contained ~5–8 MB binary,
  non-invasive — never commits/hooks). Still rejected: schema impedance (touch-sets/overlap/Operation
  don't fit its issue schema), a **second provenance store** competing with SDD plan briefs, a Rust
  toolchain dep in a zero-dep TS/`.mts`/`npx` repo, and it earns little (we compute the interesting
  relations outside it anyway).
- **Drop to Dolt** — rejected: Dolt = version-controlled DB; **git already versions our files**.
  beads_rust abandoning Dolt for SQLite confirms it was overkill.
- **SDD-native (chosen)** — extend the plan-brief graph `discover-plans` already reads; add a small
  zero-dep `ready`/`cycles` `.mts` engine. Fits scale (tens–low-hundreds of coarse missions, ~ms
  graph walk), unifies provenance, no new toolchain.

**Scale: ~1k entries top** (per-project CR/Mission planner, NOT a general issue tracker). This is
the design ceiling — it confirms no DB, and shapes the layout below.

Store shape (SDD-native):
- **DAG log = the source of truth for graph structure** — a **sharded, append-only, git-tracked
  event log** (the SDD `ledger/` pattern) holding nodes + edges (RAW, parent-child/Operation,
  discovered-from) + status changes + `touch-set` (**primary = spec-nodes touched**; optional finer
  file-region/symbol for shared-thin files; + tier/confidence), `blast`, `hitl|afk`, `artifact-type`.
  Sharded per-writer so concurrent agents growing the
  graph (monadic) never collide; status history = the audit trail. Conceptually beads_rust's
  SQLite+JSONL split (structured graph + detail) done git-native.
- **Plan briefs (`.plan.md`) = the live detail layer** for *active* missions only (todos, NEXT,
  design), referencing their node id. Retired missions persist in the DAG log as history, no brief.
- **WAW/WAR NOT stored** — computed from touch-sets at ready-time (only ever over the small active
  frontier).
- **Engine** (`.mts`, zero-dep): fold the shards → reject cycles at write; compute ready-set
  (transitive blocking + WAW-mutex from touch-sets); emit live frontier. beads' `ready`/`cycles`
  primitives reimplemented at our scale.
- **At 1k the back-end can be lavish** — whole-graph / naive O(n²) analysis is cheap; no incremental
  algorithms, caches, or indexes needed. Simple fold-and-walk.

## Criteria (what a correct output must satisfy)
- The **ready-set** never surfaces a mission with an unsatisfied RAW/WAW predecessor; no two
  concurrently-ready missions are a WAW pair.
- Deterministic **given a DAG snapshot**: same partial DAG → same ready-set + same provisional
  forward view (pinned tie-break, e.g. by cr/mission ref). The DAG itself is dynamic between snapshots.
- Every declared Operation capstone's closure is **dependency-closed**; non-closed capstones flagged.
- **Retire order is Operation-coherent** (trunk stays deployable); issue order is barrier-free.
- Forward view is marked **provisional**, with commitment decaying over the horizon.
- Read-only, zero side effects, pure derivation (the deterministic back-end).
- Conservative on low-confidence touch-sets (file-only tier ⇒ treat same-file as hard/needs-review).

## Limitations / non-goals / feasibility caveats
- Touch-sets are **predictive** (before the work is done) — inherit false-negative risk no build
  tool faces; the DAG is probabilistic, re-checked at merge. **SOFT = rebase-cost hint, NOT a
  safety proof** (~33% of clean merges are semantically broken — Brun). Keep a speculative/bisection
  merge backstop **in the dispatch consumer** (non-goal of this engine).
- **Not any sub-graph is a story** — capstones are declared + checked, not freely enumerated.
- Decomposition (lowering) semantic quality is bounded by what a static estimator can see;
  the front-end may be v2.
- The engine **schedules and identifies**; it does **not** spawn worktrees or run missions
  (that's cyberlegion) and does not itself gate (that's the SDD gates).

## Settled so far
- Split: SDD owns this engine (facts + schedule + blast); cyberfleet/cyberlegion consume+dispatch.
- v1 dependency detection: **declared-edges-only**; symbol-level produce/consume inference = follow-up CR.
- Compiler/scheduler model with the RAW/WAW/WAR hazard mapping.
- Vocabulary: **Campaign > Operation > Mission > Task** (Operation = the releasable unit, confirmed;
  existing Campaign product loop untouched).
- 5 axes; priority folds into the Operation axis.
- **Decomposition (lowering) is core to v1** — without it the scheduler has nothing to interleave.
- Engine is **hybrid**: reasoning front-end (lower) + deterministic back-end (hazard + schedule).
  Sits above the mission loop as a pre-mission planner; reuses `explore` unit-identification.
- **LOWER objective = SSA** (single owning mission **per spec-node** — the stable, artifact-neutral
  atom, contract = its frozen suite; NOT per-export). Reasoning pass aims for it, back-end flags the
  residue. Screaming architecture = precision lever. Merge discipline = in-order (Operation-ordered)
  retirement. WAW-hard collapses to versioned-RAW when an order can be imposed (bites at retire, not issue).
- **Not a new engine** — formalizes + enriches the existing intake→plan(s)→Explore→post-mission loop
  with a DAG, criteria, and persistence. Lowering rides the existing phases.
- **Node-level hard collision → serialize at ISSUE (strong default)** (coarse merges are expensive);
  only known-cheap shared-thin-file overlaps stay soft/parallel. Coarser atom ⇒ bias to serial.
- **Barrier missions** (architecture/project-wide refactors) = fences: called out explicitly,
  done first/early once confirmed, high-blast/HITL, largely from the formation loop.
- **DAG is monadic/dynamic** (discovered through Explore + micro/macro iterations), never fully known.
  Engine re-derives a **live frontier/ready-set**; commit near, speculate far, lazily lower the frontier.
- **Execution is barrier-free dataflow** (Turborepo/OoO fire-when-ready, MIMD) — "waves" are a view,
  not a barrier. Ordering only at retire (Operation-coherent merge).
- **Store = SDD-native** (extend the plan-brief graph + a zero-dep `ready`/`cycles` `.mts` engine);
  beads/beads_rust are the design reference, not a runtime dep. No Dolt, no external DB.

## Open (next)
- **Finer-than-node granularity mechanism** — how the optional file-region/symbol check downgrades
  hard→soft for shared-thin files (CLI router/barrel/registry); whether prose artifact-types ever need
  scenario/section-level. Artifact-type-specific; likely deferred. (Node is the stable primary atom.)
- **Name** the engine (compiler/scheduler vocabulary; avoid the `plan` token — collides with SDD
  `.plan.md` mission briefs).
- Which axes are v1 vs deferred (concurrency + deliverability + granularity core; cost may be v2).
- Exact target SDD node + engine surface; whether Operation-capstone declaration needs a new
  frontmatter field on the plan brief; how a decomposed mission relates to a CR/`.plan.md`.
