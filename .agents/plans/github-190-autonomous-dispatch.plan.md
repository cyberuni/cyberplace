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
  - content: "Handoff: PR opened (Part of #190 — F3 store only, NOT Closes); mail legate the verdict packet; await impl-gate ratification"
    status: in_progress
  - content: "PAUSED — headless-operator agent (cyberfleet agents/): the unattended fleet-level dispatch-loop driver"
    status: pending
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

**F3 store SHIPPED to PR — awaiting human impl-gate ratification.** Spec gate self-asserted (auto-spec
leash, `by:agent`); impl gate cold-judged PASS (11/11 mutation-verified) but HELD for human ratification
(HITL, HIGH blast) — verdict packet mailed to the legate. On ratification: record the impl `gate` line
(`by:<human>`, advance to implemented) and merge the PR.

Then **resume the PAUSED todos** (the rest of Op3) — each consumes the now-branch-independent F3 store:
1. **headless-operator** — cyberfleet has no `agents/` dir today; build the unattended fleet-level
   dispatch-loop driver as a cyberfleet agent. Settle its relationship to Pod-style spawns (design
   §"Gap → F3": spawning parallel worktree-ships from inside a ship is Pod's job today).
2. **lifecycle loop** — merge in Operation-order → tear down pod → write graph (single writer, via the
   F3 store) → re-derive `ready` → dispatch next.
3. **merge backstop** — speculative-CI / bisection (dispatch-consumer concern, not the store engine).
4. **★ capstone** — Pod-boundary settle + end-to-end live dispatch (a mission dispatched +
   Operation-order-retired with no human in the issue loop).

## Out of scope (paused — file as continuation of this mission or follow-up CRs)

headless-operator agent · lifecycle loop · merge backstop · live end-to-end dispatch (the capstone).
These consume the F3 store; none blocks shipping it. Ledger shard: `ledger/github-190.ffd3cc.jsonl`.
