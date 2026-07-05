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
    status: completed
  - content: "Post: spawn sdd-warden (detached, background) for corpus formation pass"
    status: completed
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

**This CR is done and landed — PR #77 (branch `cyberfleet-decommission`), root spec `implemented`,
both gate ledger lines durable.** Keep this plan until the PR merges and the doctrine loop distills
it (then retire).

**Sitting 2 (separate CR, blocked-by this one):** `cyberfleet-plugin` — the warm layer that consumes
`decommission`. Add the **Tender** persona (station-side, one per open PR: watch → rebase → wait for
GitHub merge → `cyberfleet decommission`) and the **Operator** parallel-commission flow (one ship per
approved brief, concurrent). Merge authority stays on GitHub; the Tender only watches/rebases/reaps.
Start with `sdd:start-mission` against `.agents/specs/cyberfleet-plugin/` once #77 is merged.

**Known follow-up (surfaced by the impl-judge, routed to the Warden):** `identity/README.md`'s
`prune` Non-goals wording is awkward and `identity.feature` has no scenario exercising the `prune`
soft-sweep — candidate identity-node CR.
