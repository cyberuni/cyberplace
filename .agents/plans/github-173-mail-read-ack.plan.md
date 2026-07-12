---
cr: github-173
status: active
target: main
todos:
  - content: "explore + draft: mail/core additive read --ack scenarios (idempotent); pod re-open + brief-consume"
    status: in_progress
  - content: "spec gate: judge both nodes, freeze, ledger lines, report operator at spec gate"
    status: pending
  - content: "deliver: readAck in message.ts + `mail read --ack` in cli.ts, rebuild dist, update pod SKILL.md, tests, changeset"
    status: pending
  - content: "impl gate + handoff: pnpm verify, rebase main, commit units, PR closing #173, report operator done"
    status: pending
---

# CR github-173 — mail read+ack in one step; Pod consumes brief with it

Source: https://github.com/cyberuni/cyberplace/issues/173

Two touched project specs (one PR, coherent units):

1. **cyberlegion** `packages/cyberlegion/.agents/spec/mail/core` (behavioral, @frozen) —
   ADD `cyberlegion mail read <id> --ack`: prints body AND acks atomically. **Idempotent**:
   always prints body, acks only if unread, never errors on already-acked; unknown id still
   errors. Two-step `read` (peek) stays for non-consuming reads. Additive → self-clears, stays
   @frozen, no re-open. Impl: `readAck` in `message.ts`, wire `--ack` on `mail read` in `cli.ts`
   (also honors `--owner`), rebuild `dist/cli.mjs`, changeset.

2. **cyberfleet-plugin** `.agents/specs/cyberfleet-plugin/pod` (skill, @frozen) —
   - RE-OPEN (ratified by owner this mission): scenario "handled mail is acked immediately"
     names the mechanic as `cyberlegion mail read`, which today only peeks — stale/contradictory.
     Rewrite mechanic → `cyberlegion mail read --ack`.
   - ADD (additive → self-clears): Pod receives its mission brief with `read --ack` so the brief
     is consumed in the same step and no dangling unread mail is left.
   - Update `plugins/cyberfleet/skills/pod/SKILL.md` brief-receive + handled-mail lines to match.

## Decisions (owner-ratified)
- read --ack already-acked semantics: **idempotent** (print body, no error).
- pod frozen-scenario re-open: **ratified**.

## NEXT
Draft the additive mail/core scenarios and the pod edits; grill with a cold spec-judge; then spec gate.
