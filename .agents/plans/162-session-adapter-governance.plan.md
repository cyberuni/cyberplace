---
status: active
todos:
  - content: "Intake: plan brief, leash line, statusline"
    status: pending
  - content: "Explore: session-adapter spec node + .feature draft; root spec.md maps"
    status: pending
  - content: "Spec gate: cold aced-spec-validator to ALIGNED; freeze .feature"
    status: pending
  - content: "Deliver: session-adapter-governance SKILL.md+README, ADR 0025, ratify doctrine entry 2"
    status: pending
  - content: "Impl gate: cold aced-impl-judge over frozen suite"
    status: pending
  - content: "Handoff: pnpm verify, commits, PR closing #162"
    status: pending
---

# CR 162 — session-adapter verify-effect-or-fail-loud governance

CR: https://github.com/cyberuni/cyberplace/issues/162
Project: `.agents/specs/cyberlegion-plugin` (plugins/cyberlegion)

Ratify doctrine entry 2 (`packages/cyberlegion/.agents/spec/ledger/strategy.a3da48.jsonl`, seq 2)
as a cyberlegion governance: a SessionAdapter MUTATING op verifies its observable effect landed or
fails loud — never false success on a fire-and-forget send. Central design point: the
**unconditional vs attach-relative** effect-class distinction (attach-relative no-op with no
attached client is legitimate, NOT a failure — a naive read-back false-fails headless spawns).

Decisions settled at intake:

- **New governance skill** `plugins/cyberlegion/skills/session-adapter-governance/` (not an
  extension of `subagent-backend-governance`, which is the cold-subagent dispatch procedure — a
  different concern). Partial skill, loaded by name by CRs/producers touching adapter ops.
- **New spec node** `.agents/specs/cyberlegion-plugin/session-adapter/` (behavioral, ACED chain —
  artifact-type `skill`).
- **ADR** `artifacts/adr/0025-session-adapter-verify-effect-or-fail-loud.md` records the
  ratification + attach-relative rationale.
- **Conformance enumeration** (from source read, this tree):
  - `nudge` (`src/console/nudge.ts`) — unconditional; CONFORMANT (submit-verify-retry, throws on
    cap; #150/PR #153). Reference pattern.
  - `focus` (`src/console/session.{tmux,herdr}.ts`) — attach-relative; PARTIAL: verify-before
    (resolve-or-throw, PR #160) present; land-verify + no-attached-client no-op = authorized
    follow-up.
  - `clear` (`src/session.ts` `clearUnit`) — unconditional; NON-CONFORMANT on verify-after: reset
    command validated before send, but injection is raw `adapter.send` fire-and-forget (same
    boot-race swallow class nudge fixed) = authorized follow-up.
  - mail-delivery doorbell (`src/console/doorbell.ts` `wakeRecipient`) — unconditional effect via
    nudge's verify path; best-effort by contract (durable delivery already happened) → failure
    surfaces as explicit `warning`, never silent false success. CONFORMANT (vocabulary aligned).
  - raw `send`/`submit` — primitives; the rule binds the composites that report success.
- **Follow-ups authorized, not done here**: focus land-verify/no-op, clear verify-after.
- Doctrine entry 2 `ratified: false → true` flip in the Scanner shard as the ratification record
  mechanic (Council decision = issue #162 itself), noted in the ADR.

## NEXT

Start intake: write leash line to
`.agents/specs/cyberlegion-plugin/ledger/162-session-adapter-governance.fcdfa8.jsonl`, set
statusline `explore`, then draft the spec node.
