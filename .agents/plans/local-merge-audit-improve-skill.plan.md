---
name: combine audit-skill and improve-skill, move under aces
overview: >
  .agents/skills/audit-skill (project-private, audit-only) and
  plugins/universal-plugin/skills/improve-skill (public, audit+write) overlap heavily:
  improve-skill is already the evolved superset (extracted references/check-definitions.md,
  added Q13-Q16 agentskills.io checks, has the "apply fixes" step audit-skill lacks). User
  decided (AskUserQuestion): full merge, keep the name "improve-skill", ship as a public ACES
  skill at plugins/aces/skills/improve-skill (aces already has an unrelated "improve" skill for
  eval-regression diagnosis, not a naming collision since names differ), drop the project-private
  audit-skill copy entirely. No new spec node needed under .agents/specs/aces — same class of
  change as the local-retire-create-skill precedent (chore-tracked relocate+reference-sweep, not
  new agent behavior; define-skill's own frozen .feature already covers audit/improve use cases
  and just references this skill by name for "a fuller pass").
cr: local-merge-audit-improve-skill
cr-url:
status: completed
todos:
  - id: move-improve-skill
    content: git mv plugins/universal-plugin/skills/improve-skill -> plugins/aces/skills/improve-skill
    status: completed
  - id: remove-audit-skill
    content: git rm -r .agents/skills/audit-skill (superseded by relocated improve-skill)
    status: completed
  - id: update-sibling-refs
    content: Fix define-skill, skillify, patch-skill (both project-private and public copies) references from audit-skill to improve-skill
    status: completed
  - id: update-cli-message
    content: packages/cyber-skills/src/audit/cli.ts stdout message "Run the audit-skill agent skill..." -> improve-skill
    status: completed
  - id: update-agents-md
    content: AGENTS.md two references to audit-skill -> improve-skill
    status: completed
  - id: drop-stale-registries
    content: Remove stale audit-skill entries from skills.sh.json, packages/cyber-skills/awesome-skills.json, skills-lock.json, .agents/cyber-skills-lock.json, plus two dangling .cursor-plugin/plugin.json ../skills/audit-skill entries found during the sweep (never resolved to a real path)
    status: completed
  - id: fix-broken-test
    content: cyber-skills.test.mts asserted against the real repo lock's audit-skill entry -- repointed at skillify (still cyberuni/cyber-skills, still foundIn repo)
    status: completed
  - id: changeset
    content: Add changeset for the packages/cyber-skills/src/audit/cli.ts published message + skill relocation
    status: completed
  - id: verify
    content: pnpm verify green
    status: completed
isProject: false
---

## NEXT — resume here

**Mission complete.** Working tree has the full diff staged for one commit (relocate +
reference sweep); `pnpm verify` is green. Nothing left to resume — retire this plan
(`sdd:plan-retirement`) once distilled, or commit now per commit discipline.

## Context

User invoked `sdd:start-mission "combine audit-skill and improve-skill and move under aces"`.
Grilled via AskUserQuestion: full merge (not audit-only, not keep-separate), name stays
`improve-skill`, ships as a public ACES skill (not kept project-private).

Investigated content: audit-skill (340 lines, inline check-definitions, audit-only, older
project-private original) vs. improve-skill (163 lines + references/check-definitions.md,
Q13-Q16 agentskills.io additions, "apply fixes" step, public/universal-plugin) — improve-skill
already IS the merged/evolved version. No content synthesis needed, just relocation.

Precedent: `.agents/plans/local-retire-create-skill.plan.md` (landed as 4 chore commits,
`f6a6a40` etc.) — same shape of change, same scoping decision (hand-authored website docs
pages deferred as a follow-up CR, not blocking this CR).

## Known follow-up, out of scope here

- `apps/website/src/content/docs/skills/audit-skill.md` and sibling pages (`overview.md`,
  `glossary.md`, `disciplines.md`, `governances.md`, `cli/audit.md`, `patch-skill.md`,
  `skillify.md`) still reference audit-skill / the old improve-skill path — hand-authored Astro
  docs, not covered by this plan's mechanical sweep, same deferral as the create-skill precedent.
- `docs/specs/aces/design.md` — a legacy pre-SDD draft design doc (dated 2026-06-13, still names
  `aces-spec-designer`/`aces-judge`, both already renamed elsewhere) that references `audit-skill`
  as ACES's structural-layer delegate 6 times. It predates and is superseded by the live spec at
  `.agents/specs/aces/design/`, so left untouched rather than patched — same class of drift as the
  website docs above.
- File a CR if either should be cleaned up.

## References

- `plugins/aces/skills/improve-skill/` — new home (moved from `plugins/universal-plugin/skills/improve-skill`)
- `.agents/skills/audit-skill/` — removed
- `plugins/aces/skills/define-skill/SKILL.md`, `.agents/skills/skillify/SKILL.md`,
  `plugins/skill-authoring/skills/skillify/SKILL.md`, `.agents/skills/patch-skill/SKILL.md`,
  `plugins/skill-authoring/skills/patch-skill/SKILL.md` — sibling-reference fixes
- `packages/cyber-skills/src/audit/cli.ts`, `AGENTS.md`, `packages/cyber-skills/governances/{skill-design,skill-repo-structure}.md`
- `skills.sh.json`, `packages/cyber-skills/awesome-skills.json`, `skills-lock.json`,
  `.agents/cyber-skills-lock.json`, `plugins/awesome-skills/.cursor-plugin/plugin.json`,
  `plugins/skill-authoring/.cursor-plugin/plugin.json`
- `packages/cyber-skills/src/bin/cyber-skills.test.mts` — repo-lock-dependent test fix
- `.changeset/merge-audit-skill-into-aces-improve-skill.md`
