---
cr: github-128-unit-error-scenarios
target-spec: packages/cyberlegion/.agents/spec
target-suite: packages/cyberlegion/.agents/spec/unit/lifecycle/lifecycle.feature
source: https://github.com/cyberuni/cyberplace/issues/128
status: active
todos:
  - content: "intake + locate spec (cyberlegion unit/lifecycle); confirm additive edit-class"
    status: completed
  - content: "explore: draft 6 error-case scenarios (focus/nudge/read × unresolvable-ref + no-live-pane)"
    status: completed
  - content: "spec gate: cold spec-judge, freeze self-clears (additive), record gate line"
    status: completed
  - content: "deliver: impl-producer adds one verification per new scenario (no production code change)"
    status: completed
  - content: "impl gate: cold impl-judge; advance to implemented"
    status: completed
  - content: "handoff: PR with Closes #128, mail operator"
    status: pending
---

# github-128 — error-case scenarios for unit nudge/focus/read

## CR

Issue: https://github.com/cyberuni/cyberplace/issues/128

The `unit/lifecycle` focus/nudge/read cluster carries only happy-path scenarios.
`builder-spec-governance` requires every operation to cover its error cases. Add
error-case scenarios for `unit nudge`, `unit focus`, `unit read` covering (a) an
unresolvable/unregistered ref and (b) a registered unit with no live/known pane.

Additive to the frozen `lifecycle.feature` — mirrors the two existing `clear`
error scenarios exactly. The guard already exists in code (`resolveTarget` in
`packages/cyberlegion/src/cli.ts` throws `no agent addressable` / `no known
session pane`); no production code change — impl gate adds test coverage only.

## NEXT

Author the 6 new scenarios into `lifecycle.feature` (adjacent to the happy-path
focus/nudge/read block), extend `spec.md` prose + README behavior table, then run
the spec gate (cold spec-judge; additive freeze self-clears).
