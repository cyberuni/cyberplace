---
cr: github-189
status: active
target: main
todos:
  - content: "explore + draft: README(spec) + collision-ladder.feature for the finer-than-node ladder classifier (node sdd/collision-ladder)"
    status: in_progress
  - content: "spec gate: cold sdd-spec-judge ALIGNED, freeze .feature, ledger gate line, status approved; mail legate"
    status: pending
  - content: "deliver: build collision-ladder.mts engine + tests + SKILL/README; per-scenario verification; pnpm verify green"
    status: pending
  - content: "impl gate: rebase onto origin/main, cold sdd-impl-judge PASS, status implemented; mail legate"
    status: pending
  - content: "handoff: finalize placement, PR referencing (not closing) #189, mail legate with outcomes"
    status: pending
---

# CR github-189 (Op2) — finer-than-node ladder (collision-ladder)

Source: https://github.com/cyberuni/cyberplace/issues/189 (Op2 of cyberfleet-batch self-hosting-kernel)

**Scope (this mission only):** the **second bullet** of #189 — the finer-than-node **ladder**:
`file (default) → region → semantic (scenarios)`, plus the **shared-thin-file hard→soft downgrade**.
A read-only classifier that, at a node-level collision between two missions, descends the ladder to
justify downgrading a suspected false-hard to **soft** (co-wave/parallel), rather than over-serializing.

Builds on the merged `sdd/touch-set-correction` node (PR #199) — reuses its store /
`resolve-governances` / `gherkin-cli diff` composition; extends the same granularity model, not a new one.

## What it does (settled during explore)
- **Input:** two missions' per-node touched detail for a **shared (colliding) node** — each file with
  its artifact-type, touched line-hunks (region), and (for `.feature`) changed scenarios.
- **Ladder (descend only until classifiable, then stop):**
  - **file** — different files under the node ⇒ **soft** (artifact-neutral, high confidence).
  - **region** — same file, disjoint line-hunks ⇒ **soft** (textual); overlap ⇒ descend.
  - **semantic (scenario)** — same `.feature`, different scenarios ⇒ **soft**; same scenario ⇒ **hard**.
    Non-behavioral prose (no `.feature`) ⇒ do not descend, stay **hard** (conservative).
- **Node verdict:** **hard if any shared file is hard**, else soft; records the decisive rung +
  confidence (decays down the ladder).
- **Shared-thin-file downgrade:** a file touched by many missions (router/barrel/registry) is flagged
  `sharedThin` + surfaced as an architectural smell; the region/semantic descent is exactly what
  downgrades its hard→soft instead of serializing everything on it.
- **Read-only w.r.t. the mission graph:** it *returns* a verdict; the scheduler consumes it. Never mutates.

## Out of scope (later ★ capstone of #189 — flag if the spec pulls at it)
- ★ **SSA-lowering** criteria/automation + **symbol-level** produce/consume dep inference. The
  code-impl **symbol** semantic rung is deferred: an overlapping-region **code** file stays **hard**,
  flagged `symbol-rung-deferred`. PR **references** #189, does not close it.
- Writing the verdict into the mission graph / running the scheduler (the graph consumes; ladder produces).

## NEXT
Author node `sdd/collision-ladder` (sibling of `touch-set-correction`, concept `orchestration`):
README(spec) + boolean `.feature` over CONSTRUCTED pairwise touched-detail (never a live diff/store).
Pure classifier is the tested heart; thin IO seam (hunks via `git diff -U0`, scenarios/artifact-type
reused from the correction composition) is not unit-tested. Then spec gate (freeze + cold judge),
deliver engine + node:tests wired into `verify:specs`, impl gate (cold judge), handoff PR referencing #189.
Ledger shard hash: `1cf516`.
