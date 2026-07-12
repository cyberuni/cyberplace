---
cr: 150-nudge-boot-race
source: https://github.com/cyberuni/cyberplace/issues/150
target-spec: packages/cyberlegion/.agents/spec
node: unit/lifecycle
change-class: revise
status: active
ledger-shard: ledger/150-nudge-boot-race.e7b9ea.jsonl
todos:
  - content: Intake — locate spec, scaffold plan, resolve governances (SDD default chain)
    status: completed
  - content: Explore — add additive boot-race scenarios to unit/lifecycle.feature; cold spec-judge
    status: pending
  - content: Spec gate — freeze .feature, ledger gate line, status stays implemented
    status: pending
  - content: Deliver — implement submit-verify-retry nudge across adapters + bind scenarios with tests
    status: pending
  - content: Impl gate — rebase onto main, cold impl-judge per frozen scenario
    status: pending
  - content: Handoff — PR (Closes #150), mail operator, clear warm units
    status: pending
---

# CR: nudge boot-race robustness (#150)

## Problem

`cyberlegion unit nudge <ref>` is fire-and-forget: `SessionAdapter.send` runs one atomic
text+Enter submit (`herdr pane run` / tmux `send-keys ... Enter`). Fired while the harness TUI is
still booting (splash/init), the Enter is swallowed — text stages in the input box, never submits;
the ship sits idle at $0.00 while `unit nudge` reports success. Adapter-general (same shape on tmux).

## Contract to pin (additive to frozen unit/lifecycle.feature)

After a successful `unit nudge`, the peer has actually taken the turn (input submitted), not merely
received staged text. On a boot-race swallow, nudge re-submits a bounded number of times; if the turn
is still not taken after the cap, nudge fails loud rather than reporting a false success.

## Design decision

Chose **(b) submit-then-verify-then-retry** over (a) verify-readiness-before-submit. See
[150-nudge-boot-race.design.md](./150-nudge-boot-race.design.md).

## Scope

- `packages/cyberlegion/.agents/spec/unit/lifecycle/lifecycle.feature` — additive scenarios only
  (existing nudge scenarios unchanged → self-clears, stays @frozen, no re-open).
- `packages/cyberlegion/.agents/spec/unit/lifecycle/README.md` — sync the nudge bullet + table.
- `packages/cyberlegion/src/console/session.ts` + `session.herdr.ts` + `session.tmux.ts` — adapter
  primitive to verify/resubmit.
- `packages/cyberlegion/src/cli.ts` (or a session-layer helper) — the verify+retry loop.
- Tests binding the new scenarios (prior nudge scenarios were UNBOUND; close that gap here).

## Coordination

Sibling ship cr128 is adding error-case scenarios for nudge/focus/read to the SAME
`lifecycle.feature`. Both additive. Rebase-before-impl-gate handles landing order; mail `operator` on
a hard overlap.

## NEXT

Run explore: draft the additive boot-race scenarios + README sync, dispatch the cold sdd-spec-judge,
converge, then spec gate (freeze).
