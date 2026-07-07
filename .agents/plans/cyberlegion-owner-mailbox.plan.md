---
name: cyberlegion-owner-mailbox
status: done
todos:
  - content: "author additive scenarios: surfacing (+4 owner-mail) and mail (+6 --owner) nodes + READMEs"
    status: done
  - content: "spec gate: both additive (addOnly); spec-judge ALIGNED; ledger gate line"
    status: done
  - content: "impl: inject-inbox owner-mail surfacing gated on spawnedBy; mail --owner selector on inbox/read/ack"
    status: done
  - content: "impl: verification per frozen scenario; impl gate (cold impl-judge)"
    status: done
  - content: "root pnpm verify; commit; handoff"
    status: done
---

# CR cyberlegion-owner-mailbox — the human read path

Target spec: `packages/cyberlegion/.agents/spec` (nodes `surfacing/` + `mail/`). Design:
`cyberlegion-owner-mailbox.design.md`.

## CR

Second of three (A1 → A2 → B). Give the human the owner-mailbox read path: root sessions surface
standing-owner unread mail inline (gated on `spawnedBy`, never acks); `mail inbox/read/ack --owner
<handle>` manage the hub-level owner mailbox from any session. Additive to two frozen nodes.

## NEXT

Spec gate over the additive surfacing + mail scenarios (spec-judge), then build inject-inbox owner
surfacing + the `mail --owner` selector against the frozen suite.
