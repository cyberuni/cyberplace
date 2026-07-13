---
cr: github-188-spawn-delivers-turn
status: active
project: cyberlegion (packages/cyberlegion)
spec: packages/cyberlegion/.agents/spec/unit/lifecycle
source: https://github.com/cyberuni/cyberplace/issues/188
todos:
  - content: "explore: author additive turn-delivery scenarios on lifecycle.feature + README sync"
    status: pending
  - content: "spec gate: cold sdd-spec-judge; freeze self-clears (additive); self-assert"
    status: pending
  - content: "deliver: SPAWN_DOORBELL + wakeSpawn best-effort in doorbell.ts; --no-wake on unit spawn; rebuild dist"
    status: pending
  - content: "impl gate: cold sdd-impl-judge over frozen scenarios"
    status: pending
  - content: "handoff: ADR-0026 (spawn delivers first turn), changeset, pnpm verify green, PR closing #188"
    status: pending
---

# CR github-188 — unit spawn delivers the first turn

## What

A bare `cyberlegion unit spawn` opens a paned session whose brief is injected by the SessionStart
hook but **no turn is taken** — the pod boots idle until a human nudges. Fix: `unit spawn` delivers
the peer's first turn on a fresh paned spawn — best-effort, boot-race-aware (reuse `nudge`), with a
`--no-wake` opt-out. Mirrors `mail send`'s auto-ring (`wakeRecipient`). Fixes Operator, Pod, and the
`channel` dispatch strategy (incl. its mode-A idle-boot case) at once — no persona change.

## Approach (B)

Turn-delivery is **mechanism** (completes the spawn), not routing — stays within the CLI dumb-hands
charter (`packages/cyberlegion/.agents/spec/spec.md`). Payload-delivery (brief file) and turn-delivery
(a taken turn) are two acts; spawn only did the first. Do NOT revive the `dispatch` CLI verb
(dissolved CR-4/ADR-0024, #185/#186).

## Scope

- `packages/cyberlegion/.agents/spec/unit/lifecycle/lifecycle.feature` — additive scenarios (freeze
  self-clears): spawn delivers a first turn; boot-race re-submit; best-effort no-fail; `--no-wake`.
- `packages/cyberlegion/.agents/spec/unit/lifecycle/README.md` — Use-Case bullet + scenario-map rows.
- `packages/cyberlegion/src/console/doorbell.ts` — `SPAWN_DOORBELL` + `wakeSpawn` best-effort helper.
- `packages/cyberlegion/src/cli.ts` — `--no-wake` on `unit spawn`; async action calls `wakeSpawn`.
- tests + rebuilt `dist/cli.mjs` + changeset + ADR-0026.

## Out of scope (record, don't build)

- Warm agent pool (mail+doorbell an existing idle unit instead of spawning).
- `--visible` axis (force a paned session for a cold one-shot a human wants to watch).
- dispatch-governance wake-matrix reconcile (mode-B `unit nudge` now double-rings a fresh channel
  spawn — a minor inefficiency, frozen `dispatch.feature` scenarios stay true; file as a follow-up CR).

## NEXT

Author the additive scenarios on `lifecycle.feature`, sync the README, run the spec gate.
