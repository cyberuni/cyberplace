---
name: sdd-remove-formation-autorun
status: done
todos:
  - content: "re-open handoff node: replaced the frozen spawn scenario with 'handoff nudges a formation pass after landing, without spawning' (reminder → sdd:manage; spawns no Warden)"
    status: completed
  - content: "handoff/README.md: table row + trigger section → nudge-not-spawn; formation on-demand via sdd:manage (row 44)"
    status: completed
  - content: "start-mission SKILL.md step 4: removed the auto-spawn, added the one-line nudge"
    status: completed
  - content: "folded in the spec-judge's catch: design/loops.md:65 also asserted the auto-spawn → reconciled to nudge (4th file). Both gates self-asserted (auto-all leash); root verify green"
    status: completed
---

# CR sdd-remove-formation-autorun — stop auto-spawning the formation Warden at handoff

Target spec: `.agents/specs/sdd/` (the `mission/handoff/` node) + the realizing skill
`plugins/sdd/skills/start-mission/` (step 4).

## Origin

Handoff currently **auto-spawns** the corpus-wide formation Warden, detached, on every mission
landing (`handoff.feature` "handoff spawns the formation loop after landing, detached";
`start-mission` SKILL.md step 4). User wants the autorun **removed** — a full corpus-wide scan +
subagent on every mission is costly/noisy and should be deliberate.

## Design (user-confirmed)

**Nudge, don't spawn.** Handoff stops spawning the Warden and instead surfaces a one-line reminder
that a corpus-wide formation pass is due, pointing to `sdd:manage` ("audit the corpus structure").
No orphaned capability: `manage` already routes corpus-wide audit → `formation-loop` (on-demand).
Not a Clearance floor — no acceptance scenario asserts the autorun; the removed scenario is a
handoff **unit** scenario (re-open, user-authorized).

## Scope

Contained to 3 files — independent of PR #96 (which edited the `formation/` node prose):
- `mission/handoff/handoff.feature` (frozen: swap the spawn scenario for the nudge scenario)
- `mission/handoff/README.md` (table row + trigger section)
- `plugins/sdd/skills/start-mission/SKILL.md` (step 4)

The `formation/` node's "fires post-mission" cadence prose is untouched — formation still runs
post-mission, only the trigger changes from auto-spawn to manual/nudge.

## NEXT

DONE — landed on branch `sdd-remove-formation-autorun`. Handoff no longer auto-spawns the formation
Warden; it nudges toward `sdd:manage` and formation runs on-demand. Both gates self-asserted
(`by: agent`, auto-all leash) — **flagged agent-asserted, awaits Council ratify-or-kick-back**.
Retire this plan once merged + doctrine-distilled.
