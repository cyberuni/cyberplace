---
cr: backfill-plan-mode-preview
status: active
todos:
  - content: "intake: leash + plan brief scaffolded"
    status: completed
  - content: "explore: README explore section names plan-mode-preview drive mode"
    status: completed
  - content: "explore: add plan-mode-preview scenarios to conductor.feature (additive, @frozen)"
    status: completed
  - content: "spec gate: cold spec-judge ALIGNED true; additive self-clears (self-asserted)"
    status: completed
  - content: "deliver/impl gate: cold impl-judge PASS all 7 scenarios (self-asserted)"
    status: completed
  - content: "handoff: verify:specs green (344) + commit"
    status: completed
---

## NEXT

Backfill the **plan-mode preview** drive mode of the conductor's explore phase into the
`sdd` project spec + suite. Behavior already shipped in `plugins/sdd/skills/start-mission/`
(commit 977edf7): when Claude Code plan mode is active, explore runs its reasoning but writes
no repo files — it renders the drafted spec + scenario list into the plan file, keeps the cold
spec-judge, drops the impl-producer spikes, ends at ExitPlanMode; on approval the next
non-plan-mode explore adopts the preview as the settled draft.

Home = `.agents/specs/sdd/mission/conductor/` (explore concern — the drive-mode owner).
Additive scenarios self-clear into the frozen `conductor.feature` (no re-open).

CR: local backfill (no external source).
