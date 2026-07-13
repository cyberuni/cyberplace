---
status: active
todos:
  - content: "Intake: plan brief, leash line, statusline explore"
    status: completed
  - content: "Explore: mux focus primitive + doorbell focus-gate spec nodes + .feature drafts; build-to-learn spike"
    status: completed
  - content: "Spec gate: cold sdd-spec-judge to ALIGNED; freeze both .feature"
    status: completed
  - content: "Deliver: mux isPaneFocused primitive (tmux real, fail-open else) + wakeRecipient gate + tests"
    status: completed
  - content: "Impl gate: cold sdd-impl-judge over frozen suite; pnpm verify"
    status: completed
  - content: "Handoff: changeset, commits, PR closing #172; report operator"
    status: in_progress
---

# CR github-172 — doorbell rings the owner's bound main pane only when focused

CR: https://github.com/cyberuni/cyberplace/issues/172
Project: `packages/cyberlegion/.agents/spec` (the `cyberlegion` package — deterministic engine)
Follow-up (blocked-by this): #179 — dynamic route owner mail to Council's currently-focused pane

## What

The owner-mail **doorbell** (`wakeRecipient`, `src/console/doorbell.ts`) rings the hub's **bound main
pane** unconditionally when a standing-owner message is delivered. When the Council has roamed off
that pane, the ring wakes a session nobody is watching and burns tokens. Gate the standing-owner ring
on that pane being **currently focused** (a mux client is actually viewing it).

Reconciled from the issue's original "Operator checks mail" framing: the Operator persona never
polls/pulls — the waste is the engine's **push** doorbell. Engine change only; no persona edit.

## Scope — two nodes, one project

- **`mux/`** (`packages/cyberlegion/.agents/spec/mux`) — new best-effort primitive: is a given pane
  currently on-screen for an attached client? tmux real (`pane_active` + `window_active` +
  `session_attached` via the SessionAdapter); backends that cannot report focus return **unknown**.
- **`mail/doorbell/`** — the standing-owner ring gates on the focus primitive: focused → ring as
  today; positively-not-focused → store-and-forward no-op (mail durable, surfaces later on
  SessionStart/pull); **unknown → fail-open** (ring, no regression). Peer-recipient rings unchanged.

## Decisions (settled at intake, confirm/refine in grill)

- **Fail-open on unknown focus** — only skip the ring when we can positively confirm the pane is NOT
  focused. Preserves today's behavior on herdr/non-mux; mail is durable either way so nothing is lost.
- **Doorbell only** — the passive `mail hook` surface path (`mail/surface`) only injects when the
  pane is already taking a turn, so it self-limits when the Council is away; leave it out of scope
  unless the grill surfaces a real gap.
- **Domain**: deterministic engine → SDD default producer/judge (TS + vitest), NOT ACED.
- **Published package** `cyberlegion` changes → changeset required.

Ledger shard: `packages/cyberlegion/.agents/spec/ledger/github-172-doorbell-focus-gate.ceffd0.jsonl`

## Build-to-learn findings (explore)

- **Both real backends can report focus.** This session runs under **herdr** (no live tmux socket
  here). `herdr pane get <id>` returns `.result.pane.focused` (a real boolean; this Pod pane reports
  `focused:false`), erroring `pane_not_found` on an unresolvable pane. So the herdr adapter implements
  `isPaneFocused` for real, not `unknown`. tmux (3.6b installed) uses `pane_active` + `window_active`
  + `session_attached`. `unknown` remains for screen/none or a query that errors/can't resolve. This
  matters: herdr is the primary env, so `unknown`-everywhere would mean the gate never fires.
- **Interface**: `isPaneFocused(exec, target): boolean | undefined` on `SessionAdapter` (sibling of
  `paneExists`); `undefined` = unknown → fail-open. Both `.feature` diffs `addOnly:true` (self-clear).

## NEXT

Both gates approved (spec ALIGNED; impl IMPLEMENTATION_PASS true), root pnpm verify exit 0, rebased
onto origin/main. Handoff: push branch, open PR closing #172 (nodes already in blessed homes — a
revise, no Warden relocation), report operator. Retire this plan via doctrine distill after merge.
Follow-up #179 (dynamic roam-routing) stays open, blocked by this.
