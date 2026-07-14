---
cr-ref: github-190
node: sdd/mission-graph
status: active
todos:
  - content: "Explore: revise mission-graph node — additive orphan-ref store scenarios; build-to-learn the git-plumbing seam swap"
    status: completed
  - content: "Spec gate: freeze the additive scenarios (self-clearing), cold spec-judge, self-assert within leash"
    status: completed
  - content: "Deliver: implement orphan-ref backend behind the readEvents/appendEvent seam (git plumbing), migrate verb, tests"
    status: completed
  - content: "Impl gate: cold impl-judge PASS (11/11 mutation-verified); rebase no-op (0 behind); pnpm verify 20/20 — HELD for HITL ratification (auto-spec leash)"
    status: completed
  - content: "Handoff: PR #204 opened (Part of #190 — F3 store only, NOT Closes); verdict packet mailed to legate; impl gate ratified by human merge of #204 into main (52e14110); impl gate line recorded (seq 3, by:unional)"
    status: completed
  - content: "headless-operator agent (cyberfleet agents/): the unattended fleet-level dispatch-loop driver — Pod-boundary settled, ready-surface confirmed present"
    status: in_progress
  - content: "PAUSED — lifecycle loop: merge in Operation-order -> tear down pod -> write graph -> dispatch next"
    status: pending
  - content: "PAUSED — merge backstop (speculative-CI / bisection)"
    status: pending
  - content: "PAUSED — Pod-boundary settle + end-to-end live dispatch (the capstone star)"
    status: pending
---

# Op3 (#190) — Autonomous dispatch (F3)

CR: https://github.com/cyberuni/cyberplace/issues/190
Design of record: `.agents/plans/cyberfleet-batch.design.md` (§Store F3, §Ready-set→dispatcher) ·
`artifacts/adr/0026-mission-graph-store.md` (§Decision F3 orphan ref) · node
`.agents/specs/sdd/mission-graph/README.md` · engine `plugins/sdd/skills/mission-graph/`.

## Carve — F3 store first (dependency root); rest paused

This mission is HIGH blast and spans three deliverables. Per the mission brief, the **F3 store node**
ships first — it is the dependency root (headless-operator + lifecycle loop both consume the
branch-independent store). The rest is **paused** into the PAUSED todos above.

**Active carve = the F3 orphan-ref store.** Move the mission-graph store off the branch-coupled in-tree
file (`.agents/mission-graph/events.jsonl`) onto a true **orphan ref** `refs/sdd/mission-graph`,
read/written via **git plumbing** behind the existing `readEvents`/`appendEvent`/`appendEdgeChecked`
seam. The pure functions (`fold`/`ready`/`cycles`/`checkOperation`) never change — the v1→F3 swap is
seam-only (ADR-0026 §Physical home; README §Delivery "a later move … never disturbs the two views").

### Design decisions settled for the store (were ADR-0026 §Open "F3 store mechanics")

- **Git plumbing, not a dedicated worktree.** Append = read current blob -> append line ->
  `hash-object -w` -> `mktree` -> `commit-tree -p <old>` -> `update-ref` (compare-and-swap on the old
  value). Read = `cat-file -p refs/sdd/mission-graph:events.jsonl`. Working tree stays clean; no second
  checkout to materialize or clean up.
- **True orphan ref** `refs/sdd/mission-graph` (outside `refs/heads/`): branch-independent (worktrees
  share `.git`), not a normal branch, not swept by default push. (The existing full-repo branch
  `sdd-mission-graph` is NOT this — it is the branch-coupled duplicate F3 retires.)
- **Backend selection behind the seam:** env `MISSION_GRAPH_STORE=in-tree|orphan-ref` override wins;
  else orphan-ref when the ref exists OR (git work-tree AND no in-tree file); else in-tree. Keeps
  existing plain-temp-dir seam tests on in-tree; a `migrate` verb seeds the ref from an existing
  in-tree store (idempotent) so v1 adopters are never silently orphaned.
- **Ledger-shard keying** (the other §Open item): stays **per cr-ref** — single write-decider, no
  multi-writer contention (ADR-0026 §no-sharding). Revisit only if a real second decider appears.

### Scenarios (additive to the frozen mission-graph.feature — self-clearing, no re-open)

New stage `# ── The store home — the orphan ref (F3) ──`, boolean, over **constructed temp git repos**
(not the live store, consistent with the suite's fixture convention):
- append persists to the orphan ref, working tree stays clean
- an event appended on one branch is visible when read from another (branch-independence)
- an absent orphan ref reads as the empty log
- a stale compare-and-swap write is rejected (racing-writer guard)
- `migrate` seeds the orphan ref from an existing in-tree store

## NEXT

**F3 store SHIPPED AND RATIFIED** (PR #204 merged `52e14110`; ledger seq 3 `by:unional`). Now UN-PAUSED
(human said continue 2026-07-14) — building the **headless-operator** (todo 1, in_progress; todo 2
"lifecycle loop" is its core behavior, not a separate deliverable).

### Decisions settled this resume (were the design's "Gap → F3" open item)

- **Pod-boundary — SETTLED.** `Pod.spawn` = *intra*-mission fan-out (a ship parallelizes ITS OWN mission
  with helper worktree-ships, from inside a ship). `headless-operator.spawn` = *inter*-mission dispatch
  (the fleet loop reads `ready`, picks the next WHOLE mission off the frontier, spawns a ship for it,
  on completion merges + retires + re-derives — from OUTSIDE any ship, single graph writer). No collide.
  headless-operator = the **Operator persona realized headless** (Operator already owns spawn-from-
  outside / list-fleet / route); remit widens from spawn/list/route to the full lifecycle loop driven by
  `ready` instead of a live Council request. **No rule in Pod or Operator changes.**
- **Dependencies confirmed PRESENT (not blocked):** `mission-graph.mts ready --format json` emits the
  ranked frontier (id, node, operation, blast, hitlOrAfk, modelTier, briefPointer, rank); `append`
  node/edge/tombstone is the single-writer path; `migrate` + orphan store shipped (F3); `cyberlegion
  unit spawn` delivers the first turn (#188). The loop wires over these — no new engine.
- **v1 shape = lean agent def, loop inline (mirrors [[headless-legate]]).** headless-operator carries the
  lifecycle-loop pseudocode inline and defers MECHANISMS to the mission-graph engine (ready/append) +
  cyberlegion CLI (unit spawn) + the Operator persona's existing spawn seat. NO new governance for v1
  (headless-legate keeps its muster loop inline too). Needs manifest wiring: add `"agents": "./agents"`
  to `plugins/cyberfleet/.plugin/plugin.json` (no agents key today).

### Remaining after headless-operator
3. **merge backstop** — speculative-CI / bisection (dispatch-consumer concern, not the store engine).
4. **★ capstone** — end-to-end live dispatch (a mission dispatched + Operation-order-retired with no
   human in the issue loop).

## Out of scope (paused — file as continuation of this mission or follow-up CRs)

headless-operator agent · lifecycle loop · merge backstop · live end-to-end dispatch (the capstone).
These consume the F3 store; none blocks shipping it. Ledger shard: `ledger/github-190.ffd3cc.jsonl`.
