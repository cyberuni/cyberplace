# cyberfleet-batch — planning evidence (decision · judgment · source trail)

> **Dogfood of the decision-evidence emit** (design §"Planning provenance"; capability = F5). This is
> the reasoning front-end's *proof of work* for the cyberfleet-batch planning: the judgments applied,
> the sources pulled, the alternatives rejected, and how claims were verified — the deep-research-style
> audit surface for the graph in `cyberfleet-batch.operations.md`. Emitted by hand (v1 = manual);
> transient, retires with the CR. It answers "*why* is the graph shaped this way, and was it done right?"

## Judgments (Oracle / Architect)

- **Oracle — legitimacy: SHIP.** The CR is legit — a CR→mission scheduler is load-bearing for the
  autonomy north-star (parallel, dependency-aware planning that keeps trunk deployable). Not stale,
  product-aligned. No better solution shipped; no scope drift.
- **Architect — structural: SDD-native, per-repo, single-writer, seam-isolated.** The store belongs
  under SDD (it reasons over specs / nodes / artifact-types), git-tracked and per-repo (intra-project
  locality), one write-decider (Operator), in-tree v1 → orphan-ref F3 behind a git-access seam. **No
  barrier missions** — clean capability boundaries, and the one cross-cutting move (F3 store) rides the
  seam so it isn't a fence.

## Sources pulled

| Source | How | What it settled |
| --- | --- | --- |
| GitHub issues #135/#136/#137 | `gh issue view` | the worked example (RAW #135→#136; #137 WAW-pairs #136) — replaced a non-existent one |
| `.research/work-decomposition-cr-parallelism/` | dossier read | prior art (beads, Wayfinder, build-graph, merge queues) → design reference, not a dep |
| GasTown README | WebFetch | global HQ + Beads + Dolt = the architecture we reject → validated per-repo choice |
| cyberlegion source (`paths.ts resolveRoot`, `FileStore`) | Explore (empirical) | mailbox = user-global hub, not git-tracked → killed the "store in cyberlegion" (D3) option |
| SDD engines (`discover-plans`, `spec-layout` S1, `retire-plans`, ledger, `gherkin-cli`) | Explore/grep | grounding: discover-plans is a flat list (graph is new); frozen-feature reconcile surface; ledger pattern; combat-log scope = 441 matches/95 files |
| SDD actor model (Oracle / Builder / Architect bars) | existing governance | intake judgment = spec-gate bars pulled forward to planning |

## Decisions + alternatives weighed

- **Store** — SDD-native, per-repo, git-tracked. *Rejected:* adopt-beads (Dolt/process, heaviest),
  beads_rust (Rust dep + 2nd provenance store), drop-to-Dolt (git already versions files),
  **cyberlegion-global-hub** (= GasTown's HQ+Beads+Dolt; wrong locality — mail is global by nature, the
  mission graph is per-repo).
- **F3 storage** — `sdd/mission-graph` orphan ref behind a git-access seam ("our Dolt, in-repo not
  global"). *Chose over* D1 (trunk files → branch-visibility gymnastics); D2 orphan-ref dissolves the
  cross-branch read problem outright. Management is **SDD**, not cyberfleet (corrected mid-design).
- **Sharding** — dropped; a single write-decider makes per-writer shards earn nothing (append-only kept for audit only).
- **Naming** — "DAG log" → **mission graph** (noun) + ledger (mechanism).
- **Machinery unit** — CR-shaped → **Mission-shaped** (PR = Mission); missions are local decomposition,
  generally without tracker refs (mission-ref = node id; CR kept as provenance).
- **Operation** — **declared set + capstone**; release floor = the capstone's closure (support members
  share priority + retire window, don't gate release). *Rejected:* membership = pure derived closure (starves support work).
- **"Active"** — ingress-decided / local-presence, **not** a runtime flag; progress = completed/total.
- **Cycle handling** — write-guard + fold-time quarantine + tombstone (all v1); a cycle = a bad cut to surface, not merely refuse.
- **Per-event originator** — **deferred (YAGNI)**; no telemetry consumer yet; additive schema-v2 later.
- **Validation** — authored fixture graphs (never the live store); dogfood self-host = acceptance bar, not a frozen scenario.
- **Transient artifacts** — `.design.md` + `.operations.md` + `.evidence.md` codified (F4); **combat-log→mission-log rename = out-of-graph** (separate CR, name-collision with "mission graph" to resolve first).

## Verification (adversarial checks that changed the answer)

- **Fact-checked the design's own claims** (Explore) → the #135/#136/#137 "worked example" did **not**
  exist in the dossier → pulled the real issues and rebuilt it. *(A claim that would have frozen into a ghost fixture.)*
- **Verified cyberlegion's store location empirically** (`resolveRoot` → `~/.agents/cyberlegion`,
  global, not git-tracked) **before** comparing → this killed D3 and surfaced the GasTown parallel.
- **Fetched GasTown** before rejecting → confirmed HQ + Beads + Dolt, so the rejection rests on facts, not assumption.
- **Sized the combat-log rename** (441 matches / 95 files / 6 frozen features) before advising → flipped
  the sequencing recommendation from "first" to "after / independent."
- **Caught + corrected two of my own errors** — edited ahead of user rulings (stopped, retracted twice);
  placed store ownership under cyberfleet (corrected to SDD).

## Provenance

- Commits: the review + design pass (~18 incremental commits from `aafe48c1`), each one finding/decision.
- Design/model: `cyberfleet-batch.design.md`. Graph: `cyberfleet-batch.operations.md`. Handoff: `cyberfleet-batch.plan.md`.
