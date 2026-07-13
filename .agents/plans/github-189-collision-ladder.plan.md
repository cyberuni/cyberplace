---
cr: github-189
status: active
target: main
todos:
  - content: "explore + draft: README(spec) + collision-ladder.feature for the finer-than-node ladder classifier (node sdd/collision-ladder)"
    status: completed
  - content: "spec gate: cold sdd-spec-judge ALIGNED, freeze .feature, ledger gate line, status approved; mail legate"
    status: completed
  - content: "deliver: build collision-ladder.mts engine + tests + SKILL/README; per-scenario verification; pnpm verify green"
    status: completed
  - content: "impl gate: rebase onto origin/main, cold sdd-impl-judge PASS, status implemented; mail legate"
    status: completed
  - content: "handoff: finalize placement, PR referencing (not closing) #189, mail legate with outcomes"
    status: in_progress
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
Both gates self-asserted (spec ALIGNED, impl PASS on cold judges). Node `sdd/collision-ladder` frozen
(18 scenarios); engine + 18 node:tests wired into `verify:specs`; root `pnpm verify` green (20/20).
Spec gate: cold sdd-spec-judge ALIGNED round 1, two non-blocking wording gaps fixed pre-freeze. Impl
gate: cold sdd-impl-judge round 1 rejected (CLI `--format` flag path unbound — mutation-caught), fixed
test-only + judge-iteration correction logged, round 2 PASS. Placement finalized (sibling of
touch-set-correction; placement map + concept-index registered). Ledger shard hash `1cf516`.
Remaining: push branch, open PR **referencing** (not closing) #189, mail legate done.
Deferred on #189: the ★ SSA-lowering / symbol-level capstone (third bullet) — an overlapping-region
code file stays hard, flagged `symbol-rung-deferred`.
