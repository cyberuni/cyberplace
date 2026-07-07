# CR-A1 — standing identity (design)

Design brought into the repo from the approved multi-CR plan (relay-governance for headless agents).
CR-A1 is the first of three (A1 → A2 → B); A1 alone unblocks the driving problem.

## Why

A headless agent started by a cron job is a **top-level session with no parent frame**. It cannot
"return `needsInput` up" to a spawner because there is none. Its only way to report a result or a
question is to **push mail to a durable inbox and exit**, to be resumed by a later tick or the human's
reply. But that recipient must be **the human/owner**, and there is no durable owner identity today:
every `AgentRecord` is pane/session-keyed (`packages/cyberlegion/src/identity.ts`) and `prune` sweeps
any identity whose pane is gone or whose `lastSeen` is stale (>15min). So `mail send --to <owner>`
has no target.

Key reframe: a durable inbox is just `inbox/<id>/` — an id-keyed directory needing no live pane
(`packages/cyberlegion/src/paths.ts`). The only missing piece for "report and exit" is a record that
mints a **stable id** and **survives prune**. Purely additive.

## What

Scope is the `identity` node only; all changes additive.

- **`src/store/store.ts`** — `AgentRecord`: add `kind?: 'session' | 'standing'` (absent ⇒ `session`;
  every existing record valid untouched, no migration).
- **`src/identity.ts`**
  - `standingId(handle) = 'standing-' + slug(handle)` (filesystem-safe slug, no `:`; the `standing-`
    prefix avoids collision with 16-hex session ids and pane pointers).
  - `registerStanding(ctx, { handle })` as a **sibling** to `register()` — no harness detection, no
    pane machinery, `tmux: null`, no pane index, `kind: 'standing'`; idempotent upsert (same handle ⇒
    same id ⇒ refresh). Do NOT overload `register()`.
  - `prune()`: one line — skip `kind === 'standing'` (else the staleness branch sweeps it).
  - `resolveRecipient` (and `resolveAgent`): standing-precedence tie-break — a handle shared by a live
    session and a standing record resolves to the **standing** record (else an owner report lands in a
    dying session's inbox).
- **`src/cli.ts` `identity` group** — `identity owner --handle <name>` (create/refresh; bare
  `identity owner` shows current standing records); warn on stderr when a live session already claims
  that handle. `who` shows standing rows. Improve the unresolved-recipient error to hint
  `cyberlegion identity owner --handle <h>`.

Fail-loud on send to a missing recipient is already enforced by `resolveRecipient`'s throw — do NOT
auto-create an owner on send.

## Scenarios (additive to the frozen `identity.feature`)

1. `identity owner` mints a standing record with a handle-derived stable id.
2. re-registering the same owner handle keeps the id and refreshes (idempotent).
3. a standing record carries no tmux pane and is not pane-indexed.
4. `prune` never marks a standing record exited even when its `lastSeen` is stale.
5. `who` lists a standing record alongside session agents.
6. an owner handle colliding with a live session handle resolves to the standing record.
7. a record with no `kind` field is treated as a session (backward compat).

Spec-judge (CR-A1 spec gate) dropped a would-be 8th scenario — "`mail send --to <owner>` delivers
to the standing inbox" — as out of the identity node's scope (it exercises `mail`'s command surface,
which identity's Non-goals disown). That delivery coverage moves to the **`mail` node in CR-A2**
(which already touches `mail`): a "send resolves/delivers to a standing-kind recipient" scenario.

## Non-goals (later CRs)

- The human **read path** — surfacing owner mail into a root session, explicit ack, the manage-inbox
  skill (CR-A2, `surfacing/` + `mail/` nodes).
- The `relay-governance` contract that routes a frameless agent to this standing inbox (CR-B).
