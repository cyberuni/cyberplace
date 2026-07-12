---
cr: github-159-doorbell-bunker
source: https://github.com/cyberuni/cyberplace/issues/159
target-spec: packages/cyberlegion/.agents/spec
node: mail/doorbell (new) + mail/core (additive)
change-class: add
status: active
ledger-shard: ledger/github-159-doorbell-bunker.3c90b8.jsonl
todos:
  - content: Intake — locate spec, scaffold plan, resolve governances (SDD default chain)
    status: completed
  - content: Explore — author mail/doorbell.feature + additive mail/core Bunker scenarios; cold spec-judge
    status: completed
  - content: Spec gate — freeze new/touched .feature, ledger gate line, status stays implemented
    status: completed
  - content: Deliver — implement nudge-on-send + Bunker notify + mail bunker path; verification per scenario
    status: completed
  - content: Impl gate — rebase onto main, cold impl-judge per frozen scenario, root pnpm verify
    status: completed
  - content: Handoff — Warden placement pass, PR (Closes #159), mail Bunker, clear warm units
    status: in_progress
---

# CR: register + nudge on mail delivery + rename owner inbox to Bunker (#159)

## Problem

`cyberlegion mail send` durably delivers but never wakes the recipient — no doorbell, no nudge. Two
observed gaps, the SAME missing primitive differing only by recipient:
1. A peer agent recipient is never woken — the sender must separately `unit nudge` it.
2. The human owner is never notified on live arrival — owner mail only surfaces via hook-fire context
   an agent chooses to relay (mail/surface), never proactively on send.

Plus a rename: the standing owner inbox ("`--owner legate`" / "standing owner's mailbox") becomes the
**Bunker** — the human's durable report-up inbox, named for the Operator/dispatcher persona, with a
memorable CLI path (`mail bunker`).

## Contract to pin

On `mail send`, after the durable write:
- **Peer agent recipient with a live pane:** ring its pane (reuse the #150 nudge submit-verify-retry
  path — no boot-race false-success) so it checks its inbox with no separate manual nudge. Opt-out
  flag for a heads-down ship. Never nudge the sender's own pane.
- **Human owner (Bunker) recipient:** notify the human on live arrival by ringing the bound main pane
  (attach), not only at the next hook-fire.
- **No live pane / headless / no main pane bound:** legitimate no-op — the durable message still
  lands, send succeeds, surfaces on the recipient's next SessionStart (existing mail/surface path).
  Never fail the send because no one was awake.

Bunker addressing (additive to frozen mail/core):
- `mail bunker` (and `mail bunker read/ack`) is a memorable path to the Bunker standing owner inbox.
- `--owner <handle>` mechanism preserved; `legate` still resolves (back-compat, nothing hardcodes it).

## Design decisions

- `legate` is a **convention**, not hardcoded — `--owner <handle>` is generic; the Bunker rename
  disentangles the owner-inbox handle from the `legion-gateway-legate` routing brain. Back-compat is
  free; migrate the *suggested* handle (`cli.ts` init nextStep, docs) `legate` → `bunker`.
- New **behavioral** node `mail/doorbell` owns the push-nudge-on-delivery primitive (peer + Bunker +
  no-op). Distinct from mail/surface (pull, hook-fire injection) and mail/core (plain send).
- Nudge-on-send is best-effort and default-ON; a swallowed/absent pane is a no-op, never a send
  failure (mail stays store-and-forward; the nudge is the wake on top).
- Aligns with the #158 verify-observable-effect-or-fail-loud rule: the nudge itself already verifies
  the turn was taken (submit-verify-retry); a no-live-pane recipient is a legitimate no-op, not a
  failed effect.

## Scope

- `packages/cyberlegion/.agents/spec/mail/doorbell/{doorbell.feature,README.md}` — NEW node.
- `packages/cyberlegion/.agents/spec/mail/core/core.feature` — additive Bunker-addressing scenarios.
- `packages/cyberlegion/.agents/spec/mail/{README.md,core/README.md}` — sync tables/bullets.
- `packages/cyberlegion/src/message.ts` + `cli.ts` — send triggers best-effort recipient/Bunker
  nudge; `mail bunker` command path.
- `packages/cyberlegion/src/console/nudge.ts` — reuse submit-verify-retry (no new copy).
- Tests binding each new frozen scenario.
- Plugin/docs `legate` → `bunker` suggested-handle migration (coherence; back-compat preserved).

## Coordination

Sibling ship `beam` (#158, unit focus beaming) establishes SessionAdapter
verify-observable-effect-or-fail-loud. Do NOT block. Align vocabulary if #158 lands first; else note
the seam. Rebase-before-impl-gate handles landing order.

## Follow-up (new CR, not this PR)

Migrate the `cyberlegion-plugin` (draft) docs `legate` → `bunker` owner-inbox handle for coherence
with this rename — `plugins/cyberlegion/skills/init-cyberlegion/{SKILL.md,README.md}` suggest
`unit register --standing --handle legate`. Safe to defer: back-compat is preserved (`mail bunker`
and `--owner legate` both resolve), and those skills belong to a separate SDD project.

## NEXT

DONE through impl gate (both gates self-asserted by:agent, auto-all leash). Handoff: push + PR
(Closes #159), mail status to the Bunker, clear this ship's context. Impl sketch (reference):
- `message.ts` (or a new `console/doorbell.ts`): `wakeRecipient(ctx, adapter, exec, {toId, senderId, noNudge})`
  — best-effort. Resolve recipient record; if `kind:standing` → target = `getMainPane()`, else target =
  `pane?.id ?? findPaneByAgentId(toId)`. No target, or target == sender's own pane → no-op. Else
  `await nudge(adapter, exec, {id: target}, DOORBELL_MSG)` in try/catch → best-effort warning, never
  throw. `--no-nudge` skips entirely.
- `cli.ts` `mail send` action: after `send(...)`, call `wakeRecipient` (make action async); add
  `--no-nudge` flag; surface a `nudge` field / warning in output.
- `cli.ts`: new `mail bunker [read|ack]` command → resolveBunker(store) = standing `bunker` else
  `legate`, errors naming how to mint; routes to the same inbox/peek/ack paths as `--owner`.
- Tests: one verification per frozen doorbell scenario + the 6 Bunker mail/core scenarios.
Then rebase onto origin/main, cold impl-judge, root `pnpm verify`.
Delegate the mechanical build to a sonnet subagent (feedback: delegate implementation).
