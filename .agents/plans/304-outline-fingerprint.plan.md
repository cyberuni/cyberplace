---
status: draft
todos:
  - content: Fold Scenario Outline Examples table (header+rows, normalized) into the fingerprint
    status: completed
  - content: Add exact-duplicate + control scenarios (real dup, plain-Scenario dup) to scenario-overlap.feature
    status: completed
  - content: Wire check-scenario-overlap into the per-project check-project-specs ENGINES set
    status: completed
  - content: Drop the now-redundant root check:specs hardcoded --spec-dir .agents/specs/sdd call
    status: completed
  - content: Verify 10 -> 0 across all project specs; ablate (revert fix, confirm 10 findings return)
    status: completed
  - content: pnpm verify green at repo root; open PR closing #304 step 1 only
    status: pending
---

# CR: fix Scenario Outline fingerprint in check-scenario-overlap, wire per-project

Source: https://github.com/cyberuni/cyberplace/issues/304 (step 1 of the latest comment's Plan only).

## What

`check-scenario-overlap` fingerprinted a `Scenario Outline` from its steps only — a template, byte-
identical across every canonical `@trigger` outline — so distinct outlines (different Examples,
different subjects) were reported as exact-duplicates. Folded the outline's `Examples` table
(header + rows, normalized cell-by-cell) into the fingerprint. Title/tags stay excluded (deliberate).

Then added `check-scenario-overlap` to the per-project `check-project-specs` ENGINES set that #314
held it out of pending this fix — its deferral premise (10 engine-artifact findings) dissolved.

## Result

- Live corpus: 10 -> 0 findings across all 10 project specs (aced 3->0, cyberfleet-plugin 6->0,
  cyberspace 1->0), all others already 0.
- Controls verified live: a real cross-node duplicate (identical steps + identical Examples) still
  caught; a plain-`Scenario` duplicate still caught.
- Ablation: reverted the fingerprint fix, re-ran against aced/cyberfleet-plugin/cyberspace ->
  reproduced exactly 3/6/1 (=10), confirming the fix (not corpus changes) is what binds.
- Two new frozen scenarios added to `scenario-overlap.feature` (additive — self-clears, no re-open).
- Dropped the root `check:specs`'s hardcoded `--spec-dir .agents/specs/sdd` check-scenario-overlap
  call (now redundant — the sdd project's own `check:spec` covers it via the per-project ENGINES set).

## NEXT

Open PR against `main`, `Closes #304` is wrong (issue stays open for M1/M3) — reference without
closing; state scope as step 1 only.
