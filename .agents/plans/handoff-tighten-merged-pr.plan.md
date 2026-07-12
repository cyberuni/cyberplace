---
name: handoff-tighten-merged-pr
status: active
todos:
  - content: "intake: new CR (re-open/narrowing follow-up to #130), leash shard af5742, branch stacked on sdd-handoff-pr-closes-ref"
    status: completed
  - content: "explore: re-opened (user-cleared) + tightened Given -> '...whose source supports closing by reference'; gherkin-cli diff modified:1 addOnly:false"
    status: completed
  - content: "spec gate: sdd-spec-judge ALIGNED; cause:clearance; re-frozen; ledger seq2; terminology aligned to #130 siblings"
    status: completed
  - content: "impl gate: sdd-impl-judge IMPLEMENTATION_PASS (no code change; Step 4 already satisfies); ledger seq3"
    status: completed
  - content: "handoff: pnpm verify 19/19; #130 merged mid-flight -> rebased onto main, PR #134 (base main); residual coverage-gap surfaced as follow-up"
    status: completed
---

# CR handoff-tighten-merged-pr — tighten the frozen merged-PR scenario's Given

Target spec: `.agents/specs/sdd` (node `mission/handoff/`). **Revise**, re-open (narrowing).
Follow-up to PR #130 (`handoff-pr-closes-ref`), addressing its spec-judge architect observation.

## The gap

The frozen scenario "a merged PR closes the source without a separate close" has an unscoped
`Given` ("handoff delivered the work as a pull request") while its `Then` ("the source is closed
by the merge") only holds when the source **closes by reference**. #130's two new scenarios made
the distinction explicit (non-close-capable source → no reference written → merge can't auto-close
it), exposing the latent over-broad reading.

## Scope

- **Re-open (narrowing)** of `.agents/specs/sdd/mission/handoff/handoff.feature`: tighten the
  `Given` to "…whose source closes by reference". Edit-class = modified (not additive), so it is a
  **re-open** requiring **Clearance** — pre-authorized by the user directing this follow-up, served
  in-session.
- **No impl change**: `start-mission` Step 4 already writes the reference only for close-by-reference
  sources; the impl gate re-verifies the tightened scenario against the existing realization.

## NEXT

Tighten the Given; confirm `modified` via `npx gherkin-cli@0.0.1 diff --base sdd-handoff-pr-closes-ref
<feature> --format json`; spawn cold `sdd:sdd-spec-judge`; run spec gate with cause:clearance.
