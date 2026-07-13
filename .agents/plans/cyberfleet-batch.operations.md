# cyberfleet-batch — the mission graph (hand-authored self-host seed)

> **This is the dogfood.** v1 = manual authoring, so this file *is* the mission graph for building
> the mission-graph system — authored by hand exactly as the conductor would before the engine exists.
> The moment **Op1.M1** ships (`ready`/`cycles` work), this graph **migrates into the store** and the
> rest is driven by `ready` (self-host bootstrap, design §"v1 carve").
>
> Model applied: Operation = **declared set of missions + a designated capstone ★**, release floor =
> the capstone's dependency closure. Edges: `A → B` = RAW (A finishes before B). WAW = same-node hard
> collision (serialize). **Commit near, speculate far** — Op1 is fully lowered; Op2–5 are left coarse
> until they approach. Design brief: `cyberfleet-batch.design.md`.

## Operations overview

| Op | Capstone (deployable value) | Status | Floor |
| --- | --- | --- | --- |
| **Op1 — Self-hosting kernel** | ★ `ready`/`cycles` proven on this project's own authored graph | **ACTIVE** | {M1, M2} |
| Op2 — Touch-set automation | ★ touch-sets computed + hazards classified without hand-authoring | far horizon | coarse |
| Op3 — Autonomous dispatch (F3) | ★ a mission dispatched + Operation-order-retired autonomously | far horizon | coarse |
| Op4 — Corpus prerequisites (F1+F2) | ★ capability-first + one-behavior-one-scenario enforced/measured | far horizon (parallel-safe) | coarse |
| Op5 — Risk & barriers | ★ barrier fences modeled + blast auto-computed | far horizon | coarse |

Side-quests (standalone single-mission Operations): **SQ-F4** codify `.design.md` + retire-plans sweep ·
**SQ-name** finalize engine/capability name · **SQ-intake** automate the Oracle/Architect intake vet.

**Active-Operation call (ingress):** only **Op1** is lowered into local missions now. Op2–5 stay parked
as coarse Operations on the CR source (far-horizon store); each is lowered when it approaches the
frontier. Priority = Op1's missions; progress = completed/total (currently **0/2**).

## The DAG

```
ACTIVE ───────────────────────────────────────────────────────────────────
  Op1  Self-hosting kernel
        M1  build the kernel ──────RAW─────► M2 ★  self-host proof
        (store + ready/cycles)               (author own graph, prove ready,
                                              amend deferred Ops onto the CR)

FAR HORIZON (coarse; lowered on approach) ─────────────────────────────────
        Op1.M1 (the store node) ──RAW──►┬─► Op2  Touch-set automation
                                        │
                                        ├─► Op3  Autonomous dispatch (F3)
                                        │        └ WAW on the store node → serialized after M1
                                        │
                                        └─► Op5  Risk & barriers ◄──RAW── Op2 (touch-set tool)

  Op4  Corpus prerequisites (F1+F2) ── independent of the engine → parallel-safe with Op1
```

**Critical path to full autonomy:** `Op1.M1 → Op3` (F3 is the deepest chain: store → operator →
lifecycle loop → live dispatch). **Critical path to self-hosting:** `Op1.M1 → Op1.M2` (the bootstrap).

**No barrier missions in this graph** — the F3 store move (in-tree → orphan ref) rides the git-access
seam, so it is *not* a fence. (The combat-log→mission-log rename *would* be a fence, but it is a
separate project concern — see "Out of graph.")

---

## Op1 — Self-hosting kernel  (ACTIVE, fully lowered)

Capstone ★ = **M2**. Release floor = {M1, M2}. This is the irreducible manual seed: it can't plan
itself into existence, so it's built via the current flat SDD mission, then it eats its own dogfood.

### M1 — Build the kernel  *(= the current cyberfleet-batch mission)*
- **Does:** the git-tracked mission-graph store (in-tree files, single-writer, no sharding, schema
  `v:1`, tombstone/retract kind; nodes/edges/status/declared node-level touch-set) **+** the
  `ready`/`cycles` engine (fold → frontier with node-level WAW-mutex; best-effort write-guard +
  fold-time cycle quarantine) **+** unit tests over authored fixture graphs (incl. #135/#136/#137).
- **Owns (touch-set):** the new SDD node `sdd/mission-graph` (spec.md + `.feature` + the zero-dep
  `.mts` engine). New node ⇒ single-writer by construction, no contention.
- **Deps:** — (head of the graph; gated only by its own frozen spec).
- **blast:** low (new node, no existing consumers) · **HITL** at spec + impl gates, else **AFK** ·
  **tier:** Sonnet build / Fable review.
- **Sub-flow:** spec the kernel → freeze `.feature` → deliver store + engine → impl gate → `pnpm verify`.

### M2 ★ — Self-host proof  *(capstone)*
- **Does:** author *this graph* into the store; run `ready` and prove it returns the correct frontier
  (with M1 done, `ready` = {Op2, Op3, Op4, Op5 heads} minus WAW-holds); author the worked-example
  fixture (#135→#136 RAW, #137 WAW-pairs #136); **amend the deferred Operations (Op2–5) onto the CR
  source**; then handoff — distill the design into the project spec + 2 ADRs + research survey, delete
  `cyberfleet-batch.design.md`, PR.
- **Owns (touch-set):** the store *data* (graph authoring) + the project spec DESIGN-NOTES + the 2 ADRs
  + `docs/research/2026-07-work-decomposition.md`. Reads M1's engine; owns no engine code.
- **Deps:** **M1 → M2** (RAW — needs `ready` working to self-host).
- **blast:** low · **HITL** (human confirms the dogfood actually planned the remaining work) ·
  **tier:** Fable (judgment).
- **Acceptance bar:** if the kernel can't usefully plan Op2–5 from this seed, it isn't ready.

---

## Op2 — Touch-set automation  (far horizon — coarse)

Capstone ★ = SSA-lowering + symbol-level dep inference. Sharpens the graph so hazards are *computed*,
not hand-declared. **Deps:** Op1.M1 (the store) → Op2.

- git-diff **touch-set correction tool** (SDD engine = `git diff` + `gherkin-cli diff` +
  `resolve-governances`) — post-hoc corrects the declared prediction (monadic).
- finer-than-node **ladder** (file default signal → region → semantic) + shared-thin-file hard→soft downgrade.
- ★ **SSA-lowering** criteria/automation + symbol-level produce/consume dep inference (the richer front-end).
- blast: medium (reuses `resolve-governances`, the estimator) · mostly AFK · tier: Sonnet/Opus.

## Op3 — Autonomous dispatch (F3)  (far horizon — coarse)

Capstone ★ = a real mission dispatched and Operation-order-retired with no human in the issue loop.
**Deps:** Op1.M1 → Op3 (the F3 store **WAW-collides** with the v1 store node → serialized *after* M1).

- **F3 store**: the `sdd/mission-graph` orphan-ref read/query/write **SDD engine** (behind the git-access seam).
- **cyberfleet headless-operator** agent (cyberfleet has no `agents/` dir today).
- **lifecycle loop**: merge (Operation-order ROB) → tear down the pod → write the graph → dispatch next.
- **merge backstop** (speculative-CI / bisection) — the dispatch consumer.
- ★ **Pod-boundary settle** + end-to-end live dispatch.
- blast: **HIGH** (new fleet driver, spans cyberfleet + cyberlegion) · **HITL** (high-blast, gated) · tier: Opus/Fable.

## Op4 — Corpus prerequisites (F1 + F2)  (far horizon — parallel-safe)

Capstone ★ = the two partition prerequisites enforced + measured. **Independent of the engine** (a
different node-space), so it can run in parallel with Op1.

- **F1**: strengthen `spec-layout.md` S1 capability-first (default → strongly-recommended) + Warden layout-quality signal.
- ★ **F2**: formation-loop intra-project cross-node scenario-overlap dedup (spec-level SSA).
- blast: medium (touches `spec-layout`, formation/Warden) · **HITL** (doctrine change) · tier: Fable.

## Op5 — Risk & barriers  (far horizon — coarse)

Capstone ★ = blast auto-computed. **Deps:** Op1 → M5.1; Op2 (touch-set tool) → M5.2.

- **barrier-mission handling** (fences from the formation loop; called out explicitly, hoisted early).
- ★ **blast-field auto-compute** (the touch-set estimator sharpens SDD's hand-asserted `blast:`).
- blast: medium · HITL for barriers · tier: Opus/Fable.

## Side-quests (standalone single-mission Operations)

- **SQ-F4** — codify `<cr-ref>.design.md` as a recognized transient artifact + extend `retire-plans`
  to sweep it (deterministic cleanup). Independent.
- **SQ-name** — finalize the engine/capability name (store noun "mission graph" settled; avoid the
  `plan` token). Independent, small.
- **SQ-intake** — automate the **Oracle legitimacy + Architect** intake vet (manual/by-hand in v1).
  Depends on Op2's front-end.

---

## Out of graph (adjacent, not part of this build)

- **combat-log → mission-log rename** — a corpus-wide reference rename (~441 matches / ~95 files, 6
  frozen `.feature`, code + on-disk data + ADRs). Its own SDD mission with its own gate; sequence it
  *after* this design settles, and decide the "mission log" vs "mission graph" name-collision first.
  Tracked separately, **not** a cyberfleet-batch follow-up.

## Notes on model fidelity (why the graph looks like this)

- **Lazy lowering:** Op1 is decomposed to the mission (PR) grain; Op2–5 are left as coarse Operations
  with mission *sketches* — we don't schedule far work in detail (avoids thrown planning).
- **SSA:** every mission owns a distinct node (single-writer). The only same-node collision is the
  store node (Op1.M1 vs Op3 F3-store) → resolved by the RAW edge (versioned: v1-store → F3-store).
- **Operation floors:** Op1 releases at {M1, M2}; validation is folded into M1's definition-of-done
  (tests ride the build PR), so it's not a separate floor member.
- **Progress readout:** Op1 0/2. When M1 lands, `ready` will surface {Op2, Op3, Op4, Op5} heads —
  and Op4 can start immediately (parallel-safe), the rest serialize behind the store.
