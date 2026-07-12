---
name: cyberfleet-batch
status: active
todos:
  - content: "design: full compiler/scheduler model captured in design.md (DONE)"
    status: completed
  - content: "spec: name + exact SDD node placement (finalize in-context during spec authoring)"
    status: pending
  - content: "spec: write the SDD node spec.md + .feature for the v1 KERNEL (store w/ touch-sets + ready w/ WAW-mutex + cycles + manual authoring); scenarios over authored fixture graphs incl. the #135/#136/#137 fixture"
    status: pending
  - content: "spec gate: cold spec-judge ALIGNED, freeze .feature"
    status: pending
  - content: "deliver: build the sharded append-only mission-graph log + ready/cycles .mts engine + tests"
    status: pending
  - content: "impl gate: cold impl-judge PASS; root pnpm verify"
    status: pending
  - content: "self-host: author the active Operation(s) into the store as its first Campaign; amend deferred Operations back into the CR source"
    status: pending
  - content: "handoff: PR; file the deferred backlog + F1/F2/F3 as follow-up CRs"
    status: pending
---

# cyberfleet-batch — CR→mission compiler/scheduler (working ref; concept rename pending)

> **Design is captured in `.agents/plans/cyberfleet-batch.design.md` — read it first.** This brief is
> the actionable handoff. Concept renamed a long way from "cyberfleet batch verb": it is now an
> **SDD-native system that compiles change-requests into a scheduled graph of executable missions.**

## The model (one paragraph)

**Not a new engine** — it *formalizes + enriches the existing intake→plan(s)→Explore→post-mission
loop* with a persisted DAG, criteria, and queries. A **CR lowers into one or more Operations, or a
standalone Mission** (side quest). **The project works one-or-few Operations at a time**: only the
active Operation(s) enter the local **mission graph** (store) + `.agents/plans/*.plan.md` mission
briefs; **deferred Operations are amended back into the CR + its source** (GitHub/Asana — the tracker
is the far-horizon store; opt-in: mark the active Operation there). Each lowered Mission is again
CR-shaped, preserving the gate/ledger/PR machinery. Hierarchy **Campaign > Operation > Mission > Task**
(Campaign = existing SDD product loop, untouched; Operation = releasable unit; Mission = executable
node w/ a `.plan.md`; Task = its todos). Relationships = the three CPU data hazards: **RAW** (dep →
serialize), **WAW** (hard, same spec-node → serialize at issue), **WAR** (soft → parallel + rebase).
Lowering aims for **SSA** (one owning Mission per spec-node — the stable, artifact-neutral atom,
contract = its frozen suite). The DAG is **monadic/dynamic** (discovered through Explore, not known up
front); execution is **barrier-free dataflow** (fire-when-ready, MIMD; "waves" are a view, not a
barrier); ordering only at **Operation-coherent retirement**.

## Placement & store

- **SDD owns it** (facts + schedule + blast); **cyberfleet Operator** consumes the `ready` frontier +
  runs the dispatch loop; **cyberlegion** = per-mission mechanism (`unit spawn`/Legate).
- **Store** = SDD-native **sharded, append-only, git-tracked mission-graph log** (the `ledger/`
  pattern). ~1k-entry ceiling → no DB; whole-graph analysis is cheap. beads/beads_rust = design
  reference only (they validated the model: dep-DAG, discovered-from, cycle-reject, `ready`).
- Target project spec: `packages/cyberfleet/.agents/spec`? — **REVISIT: placement moved to SDD**, so the
  node likely lives under `.agents/specs/sdd` (confirm exact node at spec time via discover-specs).

## v1 carve = the self-hosting kernel (dogfood)

Build only the minimum to plan its own remaining work, then self-host:
1. **Store** — sharded append-only mission-graph log (Operations/Missions, RAW+parent-child edges,
   status, **declared node-level touch-sets**).
2. **`ready` + `cycles`** — zero-dep `.mts`: fold shards → frontier incl. the **node-level WAW-mutex**
   (declared touch-set intersection with an in-flight mission ⇒ held back); reject cycles at write.
3. **Manual node authoring** — conductor writes nodes/edges/touch-sets by hand during intake/Explore.
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
- **F3**: cyberfleet **headless-operator** (unattended dispatch-loop driver; none exists today) + Pod-boundary settle
- merge backstop (speculative-CI/bisection) — lives in the dispatch consumer
- blast-field auto-compute (the touch-set estimator sharpens SDD's hand-asserted `blast:`)
- **F1**: strengthen `spec-layout.md` S1 capability-first → strongly-recommended + Warden layout-quality signal
- **F2**: formation-loop intra-project cross-node scenario-overlap dedup (spec-level SSA)
- naming finalization (units settled; store/capability = placeholders)

## Open questions

- Exact SDD node + engine surface names; whether Operation-capstone needs a new frontmatter field.
- Store schema exact fields (keep general, not overfit to this project).
- Finer semantic rung for non-behavioral prose (governance/reference) — likely "don't descend".

## Provenance

- Design brief: `.agents/plans/cyberfleet-batch.design.md`.
- Research: `.research/work-decomposition-cr-parallelism/` (conclusion.md — landscape + beads/wayfinder/build-graph/merge-queue prior art).
- Settled forks: estimator SDD-native; v1 declared-edges-only; Operation (not Campaign) for the release unit; store SDD-native (no DB); dispatch loop = cyberfleet Operator (not Legate).
- Run-start leash shard was removed (was misplaced under cyberfleet ledger); re-emit under the SDD node at spec time.

## NEXT

Move from design into spec: run the SDD spec phase for the **v1 kernel** — confirm the exact SDD node
(via discover-specs; placement is SDD, not the cyberfleet package), name it in-context, and draft
`spec.md` + `.feature` for {store w/ declared touch-sets, `ready` w/ node-level WAW-mutex, `cycles`,
manual authoring}. Scenarios follow the engine-suite convention: authored fixture graphs (incl. the
#135/#136/#137 fixture), never the live store; dogfood self-host is the acceptance bar at handoff.
Everything in the Backlog is a follow-up, not part of v1.
