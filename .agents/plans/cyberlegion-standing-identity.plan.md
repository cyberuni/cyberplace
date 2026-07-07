---
name: cyberlegion-standing-identity
status: done
todos:
  - content: "author additive standing-identity scenarios in identity.feature + README behavior rows"
    status: done
  - content: "spec gate: additive self-clears (stays @frozen); spec-judge ALIGNED; ledger gate line"
    status: done
  - content: "impl: AgentRecord.kind; standingId()+registerStanding(); prune exemption; resolve tie-break"
    status: done
  - content: "impl: identity owner CLI verb; who shows standing; unresolved-recipient hint"
    status: done
  - content: "impl: verification per frozen scenario; impl gate (cold impl-judge, 9/9 after fix)"
    status: done
  - content: "root pnpm verify (knip noise from untracked worktree only); commit; impl-gate ratify + handoff"
    status: done
---

# CR cyberlegion-standing-identity — a session-independent owner inbox

Target spec: `packages/cyberlegion/.agents/spec` (project `packages/cyberlegion`, node `identity/`).

## CR

Add a **standing identity**: a prune-exempt, session-independent durable inbox for a human/owner
principal, so a frameless (cron-started, no-parent-frame) agent can `mail send --to <owner>` and exit.
Purely additive to the frozen `identity` node. Full design: `cyberlegion-standing-identity.design.md`.

First of three CRs (A1 → A2 → B). A1 alone unblocks report-and-exit; A2 adds the human read path; B
adds the `relay-governance` contract.

## NEXT

Author the additive scenarios in `packages/cyberlegion/.agents/spec/identity/identity.feature` (8
scenarios, see design.md) + matching behavior rows in `identity/README.md`, then run the spec gate
(additive ⇒ self-clears, stays `@frozen`).
