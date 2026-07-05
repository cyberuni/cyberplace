---
spec-type: behavioral
concept: [fleet]
---

# decommission — tear a ship down and reap its state

The `cyberfleet` CLI's teardown layer: the deterministic inverse of `spawn`. `cyberfleet
decommission <id>` removes a finished ship's git worktree, tears down its session pane, and reaps
its `.cyberfleet/` record — so no stale worktree, pane, or state file is left behind. This realizes
the teardown that `spawn` named and deferred (its Non-goals: "tearing down a finished peer, its
worktree, and reaping its state"). Per ADR-0022 (decisions 8–9): a ship is a git worktree and its
pane is one of two swappable backend adapters (tmux or herdr), so decommission undoes exactly what
spawn created.

Decommission is a **cold verb** — it tears down a ship it is told to, and decides nothing about
*when* a ship is safe to decommission. That judgment (the PR has merged, the work is landed) belongs
to the persona layer (the Tender / Operator in the `cyberfleet-plugin` project), which calls
`decommission` once it has decided.

**Not the liveness sweep.** The sibling `prune` verb (in `identity/`) is a no-argument, *soft*
liveness sweep — it marks dead or stale agents `status: exited` and deletes nothing. `decommission`
is the opposite: a single, id-required, *hard* teardown that removes the worktree, the pane, and the
record. Two distinct verbs, two distinct contracts; `decommission` never touches another ship.

## Use Cases

**Subject** — tearing down a ship by id and reaping its state:

- **decommission removes the ship's worktree and tears down its session** — `cyberfleet decommission
  <id>` reads the ship's `agents/<id>.json`, removes its recorded git worktree through the worktree
  adapter, and tears down its pane through the session backend adapter selected by the pruner's
  environment (`$TMUX` / `$HERDR_ENV`, the same split spawn uses — a fleet runs one multiplexer,
  never mixed).
- **decommission resolves the ship's pane from its record or the reverse index** — a tmux ship
  carries its pane on `agents/<id>.json` (`tmux.pane`), but a herdr ship does not (spawn stores a
  herdr pane only inverse-indexed under `panes/<pane>.id`). Decommission resolves the pane from the
  record when present and otherwise from the `panes/<pane>.id → id` reverse index, so it tears down
  the right pane for either backend.
- **decommission reaps the ship's `.cyberfleet/` record** — after teardown it deletes the id-keyed
  state: `agents/<id>.json`, the ship's `panes/<pane>.id`, and `data/<id>/` (its brief and scratch),
  so a later `who` never lists a ship that no longer exists.
- **the flagship rule — decommission refuses the primary checkout, always** — if the ship's resolved
  worktree root equals the primary checkout (the flagship), decommission refuses with a clear error
  and reaps nothing, rather than removing the checkout everyone is working in (the same guard spawn
  applies on creation). This guard is absolute: `--force` does **not** override it.
- **decommission refuses a dirty worktree unless `--force`** — if the ship's worktree has
  uncommitted changes, decommission refuses with a clear error rather than discarding unlanded work;
  `--force` proceeds anyway (and forces the worktree removal). `--force` relaxes only the dirty
  check, never the flagship rule.
- **decommission on an unknown id errors and reaps nothing** — if no `agents/<id>.json` exists for
  the id, decommission errors clearly and leaves the tree untouched, rather than partially reaping
  unrelated state.
- **teardown precedes reap — an already-gone step is tolerated, a real failure is not** —
  decommission reaps the record only after teardown has succeeded or was already done. If the
  worktree or pane is already gone (removed by hand or a prior partial run) decommission does not
  hard-fail; it completes the reap so the record never outlives the ship (idempotent). But if a
  teardown step fails for a *real* reason (permissions, a repo error) decommission errors and leaves
  the record intact, so the operation is retryable and never half-reaped.

**Non-goals** — the soft liveness sweep (`prune`, in `identity/` — marking dead agents `exited`);
deciding *when* a ship is safe to decommission (persona judgment, `cyberfleet-plugin`); watching a
PR, waiting for merge, or rebasing a ship onto its base (generic `git`/`gh` the persona drives, not
a CLI mechanic); deleting the ship's git branch (left to GitHub's merge auto-delete or generic git);
reaping shared or peer state not keyed by the decommissioned id (a ship reaps only its own).

Every scenario in [`decommission.feature`](./decommission.feature) maps to one of these behaviors:

| Behavior | What it covers |
|---|---|
| **teardown worktree + session** | reads agents/<id>.json; worktree adapter remove; session adapter teardown; backend by $TMUX/$HERDR_ENV |
| **pane resolution** | pane taken from the record's tmux.pane, else the panes/<pane>.id reverse index (herdr ships) |
| **reap the record** | deletes agents/<id>.json, panes/<pane>.id, data/<id>/ after teardown; reaps only the decommissioned id |
| **flagship rule** | refuses (and reaps nothing) when the worktree root equals the primary checkout; --force never overrides |
| **dirty refusal** | refuses when the worktree has uncommitted changes; --force relaxes only this check |
| **unknown id** | errors and reaps nothing when no agents/<id>.json exists |
| **teardown precedes reap** | already-gone worktree/pane tolerated → reap completes; a genuine teardown failure aborts, record left intact |
