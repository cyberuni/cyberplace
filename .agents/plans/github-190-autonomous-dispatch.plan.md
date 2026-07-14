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
  - content: "headless-operator agent (cyberfleet agents/): built (03a50cb5); spec gate self-asserted (by:agent seq 4); impl gate cold-judged PASS 8/8, RATIFIED by human merge of PR #205 into main (848dfc3a), impl gate line seq 5 by:unional"
    status: completed
  - content: "PAUSED — lifecycle loop: merge in Operation-order -> tear down pod -> write graph -> dispatch next"
    status: pending
  - content: "merge backstop — BUILT as cyberfleet merge-backstop-governance (19c92652); spec gate self-asserted (by:agent seq 6); impl gate cold-judged PASS 7/7, RATIFIED by human merge of PR #207 into main (ba0280d7), impl gate line seq 7 by:unional"
    status: completed
  - content: "★ capstone — end-to-end live dispatch: exercise F3 store + headless-operator + merge-backstop together; a mission dispatched + Operation-order-retired with no human in the issue loop"
    status: in_progress
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

**merge-backstop SHIPPED AND RATIFIED** (PR #207 merged `ba0280d7`; ledger seq 7 `by:unional`). Three
of four Op3 carves DONE: F3 store (#204), headless-operator (#205), merge-backstop (#207). Now building
**todo 4 — the ★ capstone** (human said start capstone, 2026-07-14).

**Todo 4 — ★ end-to-end live-dispatch capstone.** The integration proof that the three shipped pieces
compose: a real mission **dispatched** off the `ready` frontier by the headless-operator, run in its own
ship, and **Operation-order-retired** through merge-backstop-governance — with **no human in the issue
loop**. This is a DEMONSTRATION/acceptance mission (design §v1-carve "dogfood — plan its own build"),
not a new artifact: decide whether it is (a) a live dogfood run against this repo's own mission graph, or
(b) a recorded acceptance fixture/scenario proving the compose. Scope it in explore first; it likely
touches no production code (or only glue) — the pieces already exist. Watch the always-green invariant
end-to-end. NOTE: shared worktree still carries a concurrent session's `mission-graph.mts` +
`github-189-symbol-rung.plan.md` WIP — do NOT stage or disturb.

### (history below) merge-backstop resume

**Todo 3 — merge backstop. EXPLORED (2026-07-14).** Design intent (design §Architecture-lessons ROB +
§Ready-set→dispatcher): missions run OoO in parallel worktrees but **merge to trunk in Operation order**
(in-order retirement) to keep trunk always-green; the **backstop = flush-on-misprediction** — before an
Operation-order merge lands, **speculative CI** tests the merged result; on red, **bisection** finds the
culprit, which is held/re-queued, never landed on trunk. It is a **dispatch-layer** concern (design:
"the merge + backstop is the dispatcher's"; "keep a speculative/bisection merge backstop in the dispatch
layer"), Operator-owned, listed as a "dispatch-consumer" deferral (NOT the store engine).

**HOME FORK — SETTLED (A) by human choice 2026-07-14:** a cyberfleet **governance** (cyberfleet's
first), `plugins/cyberfleet/skills/merge-backstop-governance/`, loaded by name by the headless-operator
at its merge step — mechanics deferred to `gh`/git/CI, no new engine. (Rejected: (B) a cyberlegion verb
— merge+CI+bisect is VCS/CI orchestration outside cyberlegion's inter-agent-comms remit; (C) a `.mts`
engine — the design frames the backstop as a dispatch-layer protocol, not a store-grade engine.)

**BUILT (commit 19c92652):** the governance SKILL+README (§Order Operation-order / §Gate green-only
speculative CI on merged result / §Bisect hold-culprit-land-innocent / §Depth confidence-bounded /
§The invariant always-green) + headless-operator wired to load it by name + 7 additive `@behavior`
scenarios on the operator node (+50/-0, self-clearing) + README. Both cold judges PASS:
- **Spec gate** — cold `aced-spec-validator` **ALIGNED true**. Self-asserted `by:agent`, ledger seq 6.
- **Impl gate** — cold `aced-impl-judge` **IMPLEMENTATION_PASS 7/7**, no hollow passes, faithful to the
  dispatch-governance partial-skill pattern. **HELD for HITL ratification** — human ratifies by merging.

VERIFY CAVEAT: `pnpm verify` is red in the shared worktree ONLY from a concurrent session's unformatted
`mission-graph.mts` WIP (+ its downstream knip), NOT this change. My files pass biome (markdown, not
linted) and `verify:specs` in isolation; PR CI runs on a clean checkout so it will gate honestly.

NOTE: `mission-graph.mts` + `github-189-symbol-rung.plan.md` carry ANOTHER concurrent session's
uncommitted work in this shared worktree — do NOT stage or disturb them.

### (history below) headless-operator resume

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

### headless-operator — BUILT, gates run (this resume)

Delivered commit `03a50cb5`: agent def `plugins/cyberfleet/agents/headless-operator.md` + manifest
`"agents": "./agents"` + operator persona headless pointer + 8 additive `@behavior` scenarios
(+59/-0, self-clearing) + README. `pnpm verify` green (20/20). Both cold judges PASS:
- **Spec gate** — cold `aced-spec-validator` **ALIGNED true** (oracle/builder/architect). Self-asserted
  `by:agent` (auto-spec leash), ledger seq 4.
- **Impl gate** — cold `aced-impl-judge` **IMPLEMENTATION_PASS 8/8**, no hollow passes, lean + faithful
  to the headless-legate pattern. **HELD for HITL ratification** (HIGH blast) — the human ratifies by
  merging the PR; impl `gate` line (`by:<human>`) written at ratification, as the F3 store did (seq 3).
- **Seam both judges flagged (feeds todo 3):** where the merge-backstop MECHANISM lives (this agent vs a
  cyberlegion verb) is left implicit; S6 satisfied as written ("merge behind the backstop"), but the
  backstop's own contract is unbuilt — exactly todo 3.

### Remaining after headless-operator
3. **merge backstop** — speculative-CI / bisection. The headless-operator merges "behind the merge
   backstop" (specced as a collaborator); this todo builds the backstop's own mechanism/contract.
   A dispatch-consumer concern, not the store engine.
4. **★ capstone** — end-to-end live dispatch (a mission dispatched + Operation-order-retired with no
   human in the issue loop).

## Out of scope (paused — file as continuation of this mission or follow-up CRs)

headless-operator agent · lifecycle loop · merge backstop · live end-to-end dispatch (the capstone).
These consume the F3 store; none blocks shipping it. Ledger shard: `ledger/github-190.ffd3cc.jsonl`.
