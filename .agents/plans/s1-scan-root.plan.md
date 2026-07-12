---
name: s1-scan-root
status: active
todos:
  - content: "explore: additive scenario — S1 keys on recognized scan root, not literal 'skills' dirname"
    status: completed
  - content: "deliver: thread resolved scan roots into runChecks; S1 fires on non-root container only"
    status: completed
  - content: "impl gate: cold judge + no-regression + pnpm verify"
    status: completed
  - content: "handoff: commit + PR"
    status: in_progress
---

# CR s1-scan-root — harden S1 to key on the scan root, not a literal 'skills' dirname

Follow-up from CR #149 (PR #151, impl-judge note). No GH issue — local CR.

Target: `aced` spec, node `config-authoring/improve-skill` (mechanical validate engine, SDD-default chain).

## Problem

S1 ("SKILL.md in own directory") fires CRITICAL when the skill dir's container basename `!== 'skills'`
(validate.mts ~L479). Now that #149 made scan locations configurable, a skill discovered under a
configured scan location whose final segment isn't literally `skills` false-positives S1. Never fires
with the real anchors (`plugins/*/skills`, `packages/*/skills` both end in `skills`), but latent.

By construction, `findSkillFiles` only returns `<scanRoot>/<name>/SKILL.md`, so a scan-discovered
skill is ALWAYS correctly nested — S1 re-deriving nesting from the container NAME is the brittleness.

## Fix

Thread the resolved scan roots (absolute realpaths) into `runChecks`. S1's real invariant: the skill
sits in its own named subdir directly under a recognized scan root. Fire S1 only when the skill's
container dir is NOT a recognized scan root. Fallback (no scanRoots passed — direct callers/tests):
keep the legacy `parent === 'skills'` check so behavior is unchanged for existing callers. Scope: S1
only; leave `isPublicShippedSkill` (public-vs-private distinction) untouched.

## NEXT — explore
Additive scenarios on the frozen improve-skill.feature (self-clears, no re-open):
1. S1 does not flag a skill nested in its own subdir under a configured non-'skills' scan location.
2. S1 still flags a SKILL.md that sits directly at a scan root (not in its own subdir) — true positive preserved.
Then implement + tests, cold impl-judge, gate (re-open implemented→approved→implemented), commit, PR.
