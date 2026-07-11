---
name: cyberlegion-unit-reset
status: active
todos:
  - content: "Intake: locate cyberlegion CLI spec, unit/lifecycle node; open revise CR"
    status: completed
  - content: "Explore grill: harness naming checked (clear vs new-chat vs gemini false-friend); shape unit clear <ref>; per-harness map + fail-loud"
    status: completed
  - content: "Draft unit/lifecycle spec.md + lifecycle.feature additive clear scenarios; cold spec-judge ALIGNED (after malformed-Outline fix)"
    status: completed
  - content: "Spec gate ratified (by:unional): additive self-clear, stays @frozen; ledger seq2"
    status: completed
  - content: "Deliver: unit clear + RESET_MAP/resetCommandFor + clearUnit + 6 verifications; verify 19/19"
    status: completed
  - content: "Impl gate ratified (by:unional): cold impl-judge PASS, risk guarantees backstopped; ledger seq3"
    status: completed
  - content: "Handoff: commit spec+impl, push branch, open PR; SDD follow-up CR to swap /new (deferred to SDD project)"
    status: in_progress
---

# CR: cyberlegion `unit clear` — warm-unit context reset through the mux

GitHub issue: https://github.com/cyberuni/cyberplace/issues/122

## What

Add an agent-invocable primitive that resets a **warm** peer unit's agent session to a **fresh cold
context** while keeping its pane/process **warm** (no cold-start cost). Realizes the missing half of
the warm/cold decoupling (warmth = unit, coldness = context). Revise CR against the cyberlegion CLI
`unit/lifecycle` node — a new sibling lifecycle verb next to spawn/close/focus/nudge/read.

## Scope

- **Home:** `packages/cyberlegion/.agents/spec/unit/lifecycle/` (the CLI spec, `status: implemented`).
- **Mechanism (design lean):** harness-mapped in-session clear injected via the `SessionAdapter.send`
  seam (claude `/clear`, per-harness map like the launch map) — keeps the process warm. Teardown+respawn
  loses warmth; rejected unless grill overturns.
- **Additive** to the frozen `lifecycle.feature` → self-clears, stays `@frozen`, no re-open.
- **Fail loud** on a harness with no injectable clear (mirror unmapped-harness-on-spawn), never a silent
  teardown+respawn.
- **No registry reap** — same id/pane/worktree survive; unlike `close`.

## Not this CR

- The SDD-side swap (`/new` → this primitive) in `plugins/sdd` — filed as a follow-up CR at handoff.
- Routing-brain changes in `cyberlegion-plugin` (the brain doesn't invoke reset; the caller does).

## NEXT

Run the explore grill on the open design questions (mechanism realization, harness coverage + fail-loud
shape, whether reset verifies fresh-context or is best-effort like focus, CLI shape `unit clear <ref>`
vs `--reset`). Then draft the spec.md + additive `.feature` scenarios and spawn the cold spec-judge.

## Ledger

Shard: `packages/cyberlegion/.agents/spec/ledger/cyberlegion-unit-reset.2897b3.jsonl` (leash: auto-none, user ratifies gates).
