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
- **persistence** — the mission graph, so the plan(s) are a queryable graph Explore + post-mission update.

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

## CR ↔ Operation ↔ mission plan (the tracker is the far-horizon store)

How lowering output lands — decided:
- A CR lowers into **one or more Operations, or a standalone Mission** (a side quest).
- **The project works one (or very few) Operations at a time.** The local mission graph and the
  `.agents/plans/*.plan.md` briefs (which are *mission* plans) cover only the active Operation(s).
- **Deferred Operations are written back to the CR**: amend the CR and its source (GitHub issue /
  Asana task) to capture the Operations *not* being worked. The tracker is the **far-horizon store**;
  the local graph is the near horizon. This gives commit-near/speculate-far a concrete home: far work
  is parked as coarse Operation entries on the CR source, not as local nodes.
- **Opt-in:** mark the active Operation on the CR source.
- After lowering, the machinery unit **shifts from CR-shaped to Mission-shaped**: **PR = Mission**
  (branch, spec-gate diff scope, plan brief — all per-Mission). The CR remains the intake artifact —
  it carries the **stakeholder's intent**; missions are the *local decomposition* of that intent into
  manageable, deliverable, ideally parallel-executable pieces. **Missions generally do NOT get their
  own tracker refs** (a common case, not an edge case) — reconciling every mission back to the CR
  source is possible but generally undesirable: the tracker speaks intent, not decomposition. So the
  **mission-ref is minted locally** (the mission-graph node id), with the originating CR(s) kept as
  provenance on the node. The tracker is amended at the **Operation** grain only (deferred Operations
  onto the CR). **Open: ledger-shard keying** (stay per cr-ref, or move to the local mission-ref) —
  settle at spec time.
- Cross-CR regrouping is likewise **local**: a mission drawing on two CRs lists both as provenance;
  branches are never blended (one branch per Mission).
- A cross-Operation RAW edge into deferred work is recorded as a ref on the CR source (the
  "Depends on CR-1" pattern); it enters the local graph when that Operation activates.

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
   not by originating CR (so N CRs → M missions, not 1:1). Regrouping is *local* — a mission lists
   its originating CR(s) as provenance (see "CR ↔ Operation ↔ mission plan"); the machinery follows
   the Mission (PR = Mission).
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

## Finer-than-node granularity (collision disambiguation)

Finer-than-node is **disambiguation at a collision, not a primary signal.** Default: two missions
collide at node level → **serialize (conservative)**. Descend to a finer grain **only** to justify
downgrading a *suspected false hard* to soft/parallel. The machinery runs rarely, on the colliding
pair — never as the baseline touch-set.

The ladder (descend only until classifiable, then stop):
```
project / spec        ← barrier scope
  spec-node           ← PRIMARY atom (stable, cheap, artifact-neutral); collision ⇒ serialize by default
    file              ← a node has many files; different files ⇒ usually not a real collision (cheap, ~stable)
      file-region     ← same file, disjoint line-hunks ⇒ textually soft (predicted, artifact-neutral)
        semantic unit ← last rung, ARTIFACT-TYPE-SPECIFIC (richest, least stable)
```
Most same-node collisions resolve at the **file** rung (a node holds several files; missions usually
touch different ones). `cli.ts` prune-vs-gc needs only **file-region**. The semantic rung is the rare
bottom for genuinely entangled same-file work.

**File-sets are *sourced*, never *derived*.** SDD does not map suite→impl files today, and a global
suite→impl analysis would be expensive — so it is off the table. The file-set comes from: (1) the
mission's **declared** touch-set (plan-brief floor — already there); (2) the **capability-first folder
convention** (node ↔ folder glob — cheap, requires screaming architecture); (3) **post-hoc git diff**
(corrects the prediction, monadic). The file rung applies only when both colliding missions have
declared file-sets; else stay node-serial. Cost is bounded to the colliding pair, never project-wide.

Semantic rung — **freeze-anchored, not section-anchored** (answers the "too dynamic" worry):
- **code impl** → symbol/export via diff hunks.
- **behavioral prose** (skill/subagent/doc with a `.feature`) → the **scenario** (the frozen contract:
  stable by construction; additive scenarios self-clear). Already mechanized via `gherkin-cli diff` —
  same scenario ⇒ hard, different scenarios ⇒ soft. Reuses existing SDD tooling.
- **non-behavioral prose** (governance/reference) → no suite to anchor → sections too dynamic → **do
  not descend; stay node-serial** (rarer, often shared-thin indexes).

Two safety/monadic properties:
- **Confidence decays down the ladder** (node stable → symbol/scenario predicted/churny); a low-rung
  "soft" is lower-confidence → treat conservatively; cap the descent by parallelism payoff.
- **Finer info arrives later** (monadic): early = node-only; Explore reveals scenarios, the diff
  reveals hunks. So the schedule **starts node-conservative and *relaxes* to parallel as finer info
  arrives** — conservative-first, relax-on-evidence; never optimistically parallelize a hard case.

**File is a *default* second signal** (decided — cost is low): node primary + file always known (from
declared touch-sets + folder convention). Region + semantic rungs stay **collision-only** (descend to
downgrade a suspected false-hard). Defer general semantic-rung symbol analysis to v2.

**Touch-set tool placement**: the post-hoc/correction touch-set computer is an **SDD engine** (part of
the SDD-native estimator) — a self-contained `.mts` composing `git diff <base>..<head>` (files+hunks)
+ `gherkin-cli diff` (changed scenarios) + `resolve-governances` (node + artifact-type). **Not**
universal-plugin (that is plugin packaging). Extract to a shared CLI only if a non-SDD consumer appears.

## Partitioning prerequisites (the scheduler depends on + elevates + measures)

The scheduler's precision rests on **clean partitioning at two levels**. Both are existing SDD concerns
this capability makes load-bearing — it *depends on* them, *strengthens* their recommendation, and
*measures* their quality (its false-conflict signal = a partition-quality metric surfaced to the Warden).

| Level | Partition rule | SDD surface | Action this capability drives |
| --- | --- | --- | --- |
| **Code** | capability-first (screaming architecture) → node ↔ folder | `spec-layout.md` S1 (default) | strengthen S1 from "default" to **strongly recommended; layered/framework-first discouraged** (it scatters capabilities → node↔folder breaks → collisions explode → scheduling degrades). False-conflict rate measures it. |
| **Spec** | one behavior = one scenario in one owning node (no cross-node suite overlap) | formation loop / **gap** | new **intra-project cross-node scenario dedup** (spec-level SSA). Uncovered today: cross-*project* `dedupe-specs`/`split-spec` retired; `check-spec-structure` is intra-*node* node-shape only. Suite overlap poisons the scenario rung (same behavior in two files looks file-disjoint but is a hard collision). |

Follow-up CRs (separate from the scheduler engine):
- **F1**: strengthen `spec-layout.md` / `start-mission` / `place-node` capability-first recommendation +
  optional layout-quality signal from the Warden.
- **F2**: formation-loop intra-project cross-node scenario-overlap detection + dedup (spec-level SSA).

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

## Store: the mission graph (persistence + naming)

The monadic graph must persist and grow across sessions. **Decision: an SDD-native, git-tracked,
per-repo store; beads is the design *reference*, not a runtime dependency.**

**Naming.** "DAG log" is retired — it mixed layers. The **mission graph** is the *noun* (nodes +
edges + status you query); a git-backed **ledger/store** is the *storage mechanism*. It is a log at
the persistence layer, a graph at the query layer.

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
- **Put it in the cyberlegion hub (mailbox substrate)** — rejected: cyberlegion's store resolves to
  `~/.agents/cyberlegion` — **user-global, not git-tracked, shared across every repo** by default
  (`paths.ts` `resolveRoot`). Reusing it = **rebuilding GasTown** (its global HQ + Beads work-state
  records + the files→SQLite/Dolt slide the `Store` interface already sanctions) — the architecture
  we reject. **Locality principle**: shared storage infra must not dictate locality. **Mail is global
  by nature** (owner inboxes receive from headless/cron agents anywhere) → the hub is right for it;
  the **mission graph is per-repo by nature** (one spec corpus, one trunk, one touch-set space) → it
  belongs in the repo's git. `--space`-scoping a global store only *fakes* per-repo locality against
  the grain.
- **SDD-native, per-repo (chosen)** — a new mission graph **beside** the plan briefs `discover-plans`
  already lists (honest scoping: `discover-plans` reads a *flat* brief list — name/status/todos — no
  graph; the graph is new, the briefs stay the detail layer); add a small zero-dep `ready`/`cycles`
  `.mts` engine. Fits scale (tens–low-hundreds of coarse missions, ~ms graph walk), unifies
  provenance, no new toolchain.

**Scale: ~1k entries top** (per-project CR/Mission planner, NOT a general issue tracker). This is
the design ceiling — it confirms no DB, and shapes the layout below.

Store shape (SDD-native, per-repo):
- **The mission graph = the source of truth for graph structure** — a **git-tracked, append-only
  store** holding nodes + edges (RAW, parent-child/Operation, discovered-from) + status changes +
  `touch-set` (**primary = spec-nodes touched**; optional finer file-region/symbol for shared-thin
  files; + tier/confidence), `blast`, `hitl|afk`, `artifact-type`. Append-only is kept for the
  **audit trail** (the monadic "how the graph grew" history), *not* for collision-avoidance — see
  single-writer.
- **Single write-decider ⇒ no sharding.** One actor decides every write (v1: the conductor, by hand;
  F3: the Operator's lifecycle loop) — invoking the SDD mission-graph engine to append. With writes
  serialized through one decider, per-writer sharding earns nothing, so **drop it**: a plain
  append-only file (or small current-state file-set) suffices. This is the payoff of "missions
  report, the decider writes" (finding 6). Sharding (the `ledger/` pattern) returns only if a real
  multi-decider case ever appears.
- **Status authority = the graph, not the brief.** The graph owns **scheduling state** (open /
  claimed / retired — what `ready` folds); the brief owns the **detail layer + the human dispatch
  clearance** (`status: approved` — a leash flag, human-attributed per the relayed-ratification seam).
  Different axes, no shared field. On conflict the graph wins; a brief outliving a graph-retirement is
  `plan-retirement` sweep debt, never a second truth. `discover-plans` answers "what briefs exist";
  `ready` answers "what can issue now."
- **Plan briefs (`.plan.md`) = the live detail layer** for *active* missions only (todos, NEXT,
  design), referencing their node id. Retired missions persist in the graph as history, no brief.
- **WAW/WAR NOT stored** — computed from touch-sets at ready-time (only ever over the small active
  frontier).
- **Engine** (`.mts`, zero-dep): fold the store → reject cycles at write; compute ready-set
  (transitive blocking + WAW-mutex from touch-sets); emit live frontier. beads' `ready`/`cycles`
  primitives reimplemented at our scale.
- **At 1k the back-end can be lavish** — whole-graph / naive O(n²) analysis is cheap; no incremental
  algorithms, caches, or indexes needed. Simple fold-and-walk.

**Physical home — behind a read/write seam** (cyberlegion's own `FileStore`→`SqliteStore` seam is
the proof this swaps cleanly; here the seam abstracts the *git access mechanism*, NOT file-vs-DB —
that swap is the Dolt slide, avoided at ~1k scale):
- **v1 = in-tree git-tracked files.** Single session, no fleet ⇒ **no cross-branch visibility problem
  exists**; the conductor writes graph files on its working branch like any tracked file, merged via
  the normal PR. Dead simple, zero new git machinery.
- **F3 = the orphan ref `sdd/mission-graph`.** When the fleet runs, missions execute on their own
  branches, so the graph moves off the code branches onto a **dedicated in-repo orphan ref** —
  git-tracked + per-repo (correct locality) yet **branch-independent** (every ship reads the same
  graph regardless of its checkout — this dissolves finding 6). Read/query/write is an **SDD engine**
  — mission-graph *management* is SDD work, the same layer that owns `ready`/`cycles`, NOT cyberfleet:
  **our Dolt — a git-backed queryable datastore — but *in-repo*, not global or a separate DB.** The
  reasoning stays behind the same git-access seam, so the v1→F3 swap never touches it. cyberfleet only
  *consumes* `ready` and *calls* the SDD write path from its lifecycle loop (orchestrator — the way it
  calls `cyberlegion unit spawn` — not the store's owner). So there is **no cross-package layer
  inversion**: SDD owns both the reasoning and the store.

## Ready-set → dispatcher surface (the output side)

Because the scheduler is a **pure derivation over the git-tracked mission graph**, the surface is a
**pull query, not a service** — no push/protocol/daemon; the mission graph is the coordination substrate.

**`ready`** — a stateless SDD CLI query (TOON / `--format json`, like `discover-plans`). Folds the
mission graph → the live frontier: missions with **no unsatisfied RAW predecessor and not WAW-blocked**
by an in-flight same-node mission. Ranked (active-Operation priority → critical-path length). Per-mission
schema: id, node, operation, blast, hitl|afk, model-tier, brief-pointer, why-ready, soft-overlap
annotations, rank.

Consumed at the existing three layers, keeping the `cyberfleet decides / cyberlegion dispatches` line
clean: **SDD `ready`** *computes* → **cyberfleet `missions`/Council** *displays* it (+ gate/leash) →
**cyberfleet Operator** *acts* — it owns the **dispatch loop** (fleet-level decision), realized
**headless-operator** when unattended. Per mission it calls **cyberlegion mechanism** (`unit spawn`,
or **Legate** for warm/cold strategy). **Legate/headless-legate is the per-unit mechanism executor,
NOT the scheduler** — the loop and the ready-set consumption are the Operator's.

> **Gap → F3**: there is **no headless-operator** today (cyberfleet has no `agents/` dir; only
> headless-legate exists at the mechanism layer). The unattended fleet-level dispatch-loop driver must
> be built as a cyberfleet agent. (Cyberfleet-internal detail for that CR: today the operator skill
> says spawning parallel worktree-ships from *inside* a ship is Pod's job — so the headless-operator's
> relationship to Pod-style spawns needs settling there, not here.)

**The lifecycle loop (above the mission loop).** The mission loop *ends at handoff = PR created +
reported*. A **lifecycle loop** picks up from there: merge the PR, terminate the pod (the ship that
ran it), update the mission graph, re-derive `ready`, dispatch next. **The Operator owns this loop**
near-term (remit widened from "dispatch" to full lifecycle); it is the **single graph writer** —
missions only *report*, the owner appends (resolving finding 6). Not a daemon: summoned by the
Council, runs a tick, exits. Splitting the lifecycle into a dedicated agent to keep the Operator
session lean is a **nice-to-have deferred** (a fresh Operator is one `/new` away). **v1 runs none of
this** (manual authoring, no fleet) — the whole loop is an F3 concern.

```
lifecycle loop (Operator-owned; cyberlegion spawn + the SDD mission-graph engine are the mechanisms it calls):
  ready = sdd ready                      # pull frontier (ranked) — SDD reasoning over the store
  while capacity K and ready:
    m = pick(ready)                      # dispatcher policy: rank + human-availability
    claim(m)                             # owner appends claim to the mission graph (status=in-progress)
    cyberlegion unit spawn <worktree>    # AFK -> autonomous; HITL -> human channel
  on mission-done(m):                    # rides the mission's existing HANDOFF phase — the mission REPORTS
    merge in Operation-order + speculative-CI backstop
    terminate the pod
    append: status=retired, corrected touch-set (git-diff tool), discovered edges/nodes
  # next `ready` reflects it -> re-derive
```

Decisions:
- **Two orderings split**: `ready` governs **issue**; **retirement is Operation-ordered merge** (dispatcher
  merges in Operation-coherent order + speculative-CI/bisection backstop). Scheduler emits Operation
  structure as retire *guidance*; the merge + backstop is the dispatcher's (scheduler stays read-only).
- **Capacity is the dispatcher's**: `ready` emits the full frontier + ranking; dispatcher applies K
  (issue width) + human-availability. Scheduler = what's *possible*; dispatcher = what to *run*.
- **Feedback rides existing phases** — intake, Explore, and handoff surface nodes / edges /
  retirement / corrected-touch-set / discovered-from. In v1 the in-session conductor writes them
  directly; in F3 the dispatched mission **reports** and the Operator writes (single-writer). No new
  reporting protocol — reuses the existing relay; the scheduler just re-derives.
- **Single writer.** The Operator is the sole graph writer, so claims/retirements never race and the
  graph is authoritative for scheduling state. (A rare second writer would resolve at fold-time by
  deterministic tie-break — but single-writer is the design norm, which is why sharding is dropped.)

## Worked example — GitHub issues #135/#136/#137 (fixture source)

The trio are **GitHub issues in this repo** (cyberlegion *reconcile-against-mux*): one design
conversation, lowered by hand into exactly the shapes this engine formalizes —
- **#135 (CR-1, cull)** — new `listPanes` adapter primitive + reconcile-cull on the registry node.
  **Retired** (closed).
- **#136 (CR-2, adopt)** — *consumes* CR-1's `listPanes` ⇒ a true **RAW edge #135 → #136**; touches
  the same registry/reconcile node.
- **#137 (retention/GC)** — deliberately split out ("retention is a distinct lifecycle concern") — a
  **standalone side-quest Mission**, no RAW edge; but its "fold into `prune`/`reconcile`?" scope
  overlaps #136's node ⇒ a node-level **WAW pair** with #136.

Expected engine reads: with #135 retired, `ready` = {#136, #137} minus the WAW-mutex ⇒ surface one
(pinned tie-break ⇒ #136), the other on its retirement. Operation view: #135+#136 = one Operation
(capstone #136 — registry truthfulness); #137 = its own Mission. The issues also show the amend-back
pattern (see "CR ↔ Operation ↔ mission plan") done by hand: split issues carrying "Depends on CR-1
(#PLACEHOLDER_CR1)" refs — with *unresolved placeholders*, exactly the bookkeeping the tracker
amendment should mechanize. (Here each piece happened to get its own issue; the general model does
NOT require missions to have tracker refs.) The example is **distilled into an authored test fixture
at spec time** (the issues are the source; the fixture is the durable form).

## v1 carve + self-host bootstrap

**Strategy: dogfood — the system's first job is planning its own build (a self-hosting compiler).**
Acceptance bar: if it can't usefully plan its own remaining work, it isn't ready. Our own project (a
handful of real Operations/Missions with genuine deps) is the primary acceptance case, alongside the
#135/#136/#137 worked example above.

Dogfooding *decides* the carve by asking: what is the minimal kernel that lets it eat its own dogfood?

**v1 = the self-hosting kernel:**
- **Store** — the git-tracked mission graph (**in-tree files**, single writer ⇒ no sharding):
  nodes = Operations/Missions, edges = RAW deps + parent-child, status, **declared node-level
  `touch-set`** (the spec-nodes a mission writes — hand-authored in v1). General schema (not overfit
  to our project). (F3 moves it to the `sdd/mission-graph` orphan ref behind the SDD engine's git-access seam.)
- **`ready` + `cycles`** — a zero-dep `.mts` engine: fold the store → the frontier (`ready`), including
  the **node-level WAW-mutex**: a candidate whose declared touch-set intersects an in-flight mission's
  is held back (serialize at issue; soft downgrades arrive with the finer ladder, deferred). Reject
  cycles at write (`cycles`).
- **Manual node authoring** — the conductor writes nodes/edges/touch-sets by hand (frontmatter/append)
  during intake/Explore. No automation.

**Deferred out of v1 (each becomes a Mission in the self-hosted graph):**
git-diff touch-set correction tool · SSA-lowering automation · finer-than-node file/region/semantic
rungs (incl. the shared-thin-file hard→soft downgrade) · barrier-mission handling · dispatcher
surface / headless-operator (F3) · symbol-level produce/consume dep inference · F1 (spec-layout
strengthening) · F2 (cross-node scenario dedup) · merge backstop (dispatch-consumer) · blast-field
auto-compute · naming finalization.

**Bootstrap sequence:**
1. Build the kernel via the current SDD flat plan (the one irreducible manual seed — it can't plan
   itself into existence).
2. The moment `ready` works, decompose *this project's* remaining work: author the **active
   Operation(s)** into the store, amend the **deferred Operations back into the CR + its source** —
   its own backlog becomes its first Campaign.
3. Drive the rest with `ready`; each deferred item above is a hand-classified Mission until the
   automation that would classify it is itself built (conservative-first, relax-as-capability-arrives).

**Validation:** the frozen `.feature` follows the engine-suite convention (plan-discovery /
discovery): abstract Given–When–Then over per-scenario **constructed** graphs, node:test-verified
against authored fixtures — **never bound to the live store** (it mutates on every retirement, so
exact-output-over-live-state is flaky by construction, and point-in-time snapshots churn too fast to
freeze). The #135/#136/#137 worked example is distilled into one such fixture. Dogfooding is the
**acceptance bar, not a frozen scenario**: at handoff the kernel must have planned this project's own
remaining work (a process check, recorded in the plan/ledger). Invariants that hold for *any* graph
state ("ready never surfaces a mission with an unsatisfied RAW predecessor") may additionally run
against the live graph as an on-demand audit.

## Criteria (what a correct output must satisfy)
- The **ready-set** never surfaces a mission with an unsatisfied RAW/WAW predecessor; no two
  concurrently-ready missions are a WAW pair.
- Deterministic **given a mission-graph snapshot**: same partial graph → same ready-set + same
  provisional forward view (pinned tie-break, e.g. by mission ref). The graph is dynamic between snapshots.
- **Scheduling state is read from the graph, not the brief** — the graph is authoritative; brief
  existence never implies "not retired."
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
- v1 dependency detection: **declared-only** (declared RAW edges + declared node-level touch-sets);
  symbol-level produce/consume inference = follow-up CR.
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
- **Finer-than-node = a collision-time ladder** (node→file→region→semantic), descend only to downgrade
  a suspected false-hard; file-sets sourced (declared + folder convention + git diff), never derived.
- **Two partitioning prerequisites** the scheduler depends on/elevates/measures: code = capability-first
  (strengthen spec-layout S1 → F1); spec = one-behavior-one-scenario (formation cross-node dedup → F2).
- **Output = a `ready` pull query** (pure derivation over the mission graph) consumed by the
  **cyberfleet Operator's lifecycle loop** (a new **headless-operator** when unattended — F3); cyberlegion is the
  per-mission mechanism (`unit spawn`/Legate), NOT the scheduler. Issue vs Operation-ordered-retire
  split; capacity is the Operator's; feedback rides existing intake/Explore/handoff phases (no
  reporting protocol); touch-set correction tool = SDD engine.
- **v1 = self-hosting kernel** (store w/ declared touch-sets + `ready` w/ node-level WAW-mutex +
  `cycles` + manual authoring); **dogfood** the rest — the system plans its own build. Everything
  else deferred to Missions in its own graph. (Touch-sets + WAW classification pulled INTO v1 so the
  Criteria hold from day one; only the finer-ladder downgrades are deferred.)
- **CR ↔ Operation ↔ mission plan**: a CR lowers to one-or-more Operations or a standalone Mission
  (side quest); the project works one-or-few Operations at a time; deferred Operations are **amended
  back into the CR + its source** (tracker = far-horizon store, local graph = near horizon; opt-in
  active-Operation marker); the machinery unit shifts CR→Mission (**PR = Mission**). CR = stakeholder
  intent; missions = local decomposition, generally WITHOUT tracker refs — mission-ref minted locally
  (node id), CR(s) kept as provenance, tracker amended at Operation grain only. Ledger-shard keying
  (cr-ref vs mission-ref) = open.
- **Validation = engine-suite convention**: frozen scenarios over per-scenario authored fixture
  graphs (never the live store); worked example = **GitHub issues #135/#136/#137** distilled into a
  fixture; dogfood self-host = the acceptance bar, not a frozen scenario; live-graph checks limited
  to state-independent invariants.
- **Naming:** store noun settled = **mission graph** ("DAG log" retired — it mixed the log/graph
  layers); ledger/store = the storage mechanism. Units settled (Campaign>Operation>Mission>Task).
  The engine/capability name is still parked (finalize during spec).
- **Graph is monadic/dynamic** (discovered through Explore + micro/macro iterations), never fully known.
  Engine re-derives a **live frontier/ready-set**; commit near, speculate far, lazily lower the frontier.
- **Execution is barrier-free dataflow** (Turborepo/OoO fire-when-ready, MIMD) — "waves" are a view,
  not a barrier. Ordering only at retire (Operation-coherent merge).
- **Store = SDD-native, per-repo, git-tracked** (a new mission graph beside the plan briefs + a
  zero-dep `ready`/`cycles` + read/query/write `.mts` engine behind a git-access seam). **Mission-graph
  management is SDD work** (same layer as the reasoning, NOT cyberfleet). **Single write-decider**
  (conductor v1 / Operator's lifecycle loop F3) ⇒ **no sharding**; append-only kept for audit only.
  **v1 = in-tree files**; **F3 = the `sdd/mission-graph` orphan ref** — an *in-repo* git-backed
  queryable datastore ("our Dolt, but in-repo not global"). cyberfleet only consumes `ready` + calls
  the SDD write path from its lifecycle loop. **Rejected: the cyberlegion global hub** (= GasTown's
  HQ+Beads+Dolt slide; wrong locality — mail is global by nature, the mission graph is per-repo).
  beads/beads_rust = design reference only. No external DB.
- **Status authority = the mission graph** (scheduling state: open/claimed/retired); the brief keeps
  the detail layer + the human dispatch clearance (`approved`) — different axes, graph wins on
  conflict, a stale brief = plan-retirement sweep debt.
- **Lifecycle loop above the mission loop** (Operator-owned near-term; dedicated-agent split
  deferred): the mission loop ends at handoff→PR; the lifecycle loop merges (Operation-order), tears
  down the pod, writes the graph, dispatches next. Single graph writer; missions **report**, the
  owner **writes** (in-flight discoveries ride the existing relay). v1 runs none of it (F3 concern).

## Open (next)
- **Finer-than-node granularity mechanism** — how the optional file-region/symbol check downgrades
  hard→soft for shared-thin files (CLI router/barrel/registry); whether prose artifact-types ever need
  scenario/section-level. Artifact-type-specific; likely deferred. (Node is the stable primary atom.)
- **Name** the engine/capability (compiler/scheduler vocabulary; avoid the `plan` token — collides
  with SDD `.plan.md` mission briefs). (Store noun settled = "mission graph".)
- Which axes are v1 vs deferred (concurrency + deliverability + granularity core; cost may be v2).
- Exact target SDD node + engine surface; whether Operation-capstone declaration needs a new
  frontmatter field on the plan brief. (Mission ↔ CR/`.plan.md` relation settled — see
  "CR ↔ Operation ↔ mission plan".)
- **F3 store mechanics** — the `sdd/mission-graph` orphan-ref read/query/write **SDD engine** (git
  plumbing vs a dedicated worktree for the ref), and ledger-shard keying under Mission-shaped
  machinery (per the locally-minted mission-ref). (Owner settled = SDD, not cyberfleet.)
