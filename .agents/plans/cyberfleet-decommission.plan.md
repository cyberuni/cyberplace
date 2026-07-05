---
cr-ref: cyberfleet-decommission
project: cyberfleet
project-path: packages/cyberfleet
status: active
todos:
  - content: "Author decommission/ spec node (README + decommission.feature) via spec-producer grill"
    status: completed
  - content: "Spec gate: cold spec-judge ALIGNED; freeze decommission.feature + ledger gate line + status"
    status: completed
  - content: "Deliver: spawn impl-producer to build cyberfleet decommission + one verification per frozen scenario"
    status: completed
  - content: "Impl gate: cold impl-judge; on pass advance status to implemented"
    status: completed
  - content: "Handoff: pnpm verify, commit by unit of work, open PR; fold sdd cr-concurrency.md note reconcile"
    status: in_progress
  - content: "Post: spawn sdd-warden (detached, background) for corpus formation pass"
    status: pending
---

# CR: cyberfleet-decommission — the cold teardown primitive (inverse of spawn)

Add one new behavioral node `decommission/` to the `cyberfleet` CLI project. `cyberfleet
decommission <id>` tears a ship down: remove its git worktree, teardown its session, and reap its
`.cyberfleet/` record (`agents/<id>.json`, `panes/<pane>.id`, `data/<id>/`). This realizes the
teardown that `spawn`'s spec already named and deferred.

Safety: honors the flagship rule (never decommission the primary checkout, `--force` cannot
override); refuses a ship whose worktree has uncommitted changes unless `--force`; reaps only after
teardown succeeds-or-was-already-done (a genuine failure aborts, record left intact, retryable).

**Verb collision resolved** — `prune` was already a shipped no-arg *soft* liveness sweep (mark dead
agents `exited`) in `identity`; the hard per-ship teardown is the new verb `decommission`. Sibling
`identity/README.md` Non-goals updated to point hard teardown at `decommission`.

**Scope boundary** — CLI-only deterministic verb. Watch-PR / rebase / wait-for-merge and parallel
dispatch are persona + generic git/gh, delivered in the follow-up `cyberfleet-plugin` CR (Tender
persona + Operator flow), blocked-by this one.

Primitives already present: `console/worktree.ts` `remove()`, `console/session.ts` `teardown()`,
`identity.ts` list/save + reverse pane index. `decommission` wires them; no new mechanics.

## NEXT

Spec gate is next: the 3rd spec-judge round confirms Architect passes now the `prune` verb collision
is resolved. On ALIGNED true, freeze `decommission.feature` (`@frozen`), append the `gate` line to
this CR's ledger shard, and set the root spec `status`. Then deliver: spawn the impl-producer to
build `cyberfleet decommission` + one verification per frozen scenario.
