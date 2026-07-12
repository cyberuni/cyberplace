---
cr: github-128-followup-reconcile-unresolvable-ref
target-spec: packages/cyberlegion/.agents/spec
target-suite: packages/cyberlegion/.agents/spec/unit/lifecycle/lifecycle.feature
source: https://github.com/cyberuni/cyberplace/issues/128 (spec-judge follow-up observation on PR #152)
status: active
todos:
  - content: "reconcile close + clear unresolvable-ref scenarios to the accurate addressable/ref vocabulary"
    status: completed
  - content: "sync README prose + behavior table; align non-frozen test labels"
    status: completed
  - content: "spec gate: cold spec-judge confirms freeze-preserving reconcile (non-narrowing), self-assert"
    status: completed
  - content: "verify green; commit + PR"
    status: completed
---

# github-128 follow-up — reconcile "unregistered id" → "unresolvable ref"

## CR (Reconcile)

Spec-judge follow-up observation from PR #152: the frozen `close` and `clear`
unknown-ref scenarios in `lifecycle.feature` describe the same `resolveAgent`
failure as "no unit is registered under that id", while the shipped code throws
`no agent addressable as "<ref>" (tried id, handle, and worktree branch/CR)`
and the existing tests already assert `/no agent addressable/`. The 6 new
focus/nudge/read scenarios (PR #152) use the accurate "unresolvable ref" /
"addressable under that ref" vocabulary. Reconcile close + clear to match.

**Freeze-preserving reference-rename (ADR-0021):** the oracle is unchanged — the
command still throws on an unresolvable target and does nothing. The prose is
corrected to match the frozen contract's own tested behavior; nothing is
narrowed, no floor. Not a re-open.

Scope: 2 frozen scenarios (`close` unknown, `clear` unknown) + README prose/table
+ cosmetic non-frozen test-label alignment. No production code change. The other
"unregistered" hits (mail/surface, unit/registry) are a distinct, correct
concept (a session with no identity) — out of scope.

## NEXT

Edit the two scenarios + README, align test labels, structural-diff to confirm
modified-but-non-narrowing, spec-judge confirm, self-assert, verify, PR.
