---
name: retire skill-authoring/create-skill in favor of aces:define-skill
overview: >
  plugins/skill-authoring/skills/create-skill duplicates aces:define-skill's scope (near-
  identical trigger phrasing: "create a skill", "write a skill for X") and is stale (its own
  placement table lists "Persona" as a pattern, retired when create-persona-skill was removed
  in favor of define-agent). Blocked on define-skill's ACES eval-loop default being too heavy
  for quick/private scaffolds — the durability line of work (4183717, 7a5b826, 9e6d07f,
  cb62994) built the fix, but define-skill itself was never touched to use it.
cr: local-retire-create-skill
cr-url:
status: active
todos:
  - id: check-define-skill-escaped-path
    content: Decide whether define-skill needs a lightweight scaffold-audit-done ending for already-escaped (non-durable) requests
    status: completed
  - id: reconcile-lock-files
    content: Fix skills-lock.json / .agents/cyber-skills-lock.json (both point at nonexistent skills/create-skill/SKILL.md — bundled skills/ dir was already removed)
    status: pending
  - id: update-refs
    content: Update plugin.json, skills.sh.json, packages/cyber-skills/awesome-skills.json self-reference
    status: pending
  - id: remove-skill
    content: Delete plugins/skill-authoring/skills/create-skill/
    status: pending
  - id: changeset
    content: Add changeset if this touches published package surface (skills-lock.json/cyber-skills-lock.json might)
    status: pending
isProject: false
---

## NEXT — resume here

**Resolved:** Option 1 (user confirmed). `define-skill` (`plugins/aces/skills/define-skill/SKILL.md`)
now documents three entry points — impl-producer (in-CR), standalone (user-invoked, offers the
ACES loop), escaped (gateway/start-mission invoke it directly after a `non-durable` resolution,
scaffold+audit+report and **stop**, no ACES hand-off). `plugins/sdd-new/skills/sdd/SKILL.md` and
`start-mission/SKILL.md`'s escape bullets now say escaping doesn't mean stopping — invoke the
matching producer (`define-skill` for `skill`) directly when one exists. `audit validate` passes
on `define-skill`.

**First action:** the remaining todos are mechanical (same shape as the
`create-persona-skill` retirement earlier this session, commit `5fd3840`): reconcile the two
lock files (both already point at a nonexistent path — `skills/create-skill/SKILL.md` — from
before the bundled-`skills/` removal, a pre-existing break, not something this CR causes),
update `plugin.json` / `skills.sh.json` / the `awesome-skills.json` self-reference, delete the
directory, changeset if needed.

## Context

Raised by the user mid-session, three turns before this pause: "should
`plugins/skill-authoring/skills/create-skill` be removed and replaced with `define-skill`?" —
by direct analogy to the already-completed `create-persona-skill` → `define-agent` retirement
(`5fd3840`, same session). Blocked immediately on define-skill's ACES-eval-loop default being
too heavy for quick scaffolds, which spun out the whole durability escape-hatch line of work
(4 commits: `4183717`, `7a5b826`, `9e6d07f`, `cb62994`) before circling back here.

## References

- `plugins/skill-authoring/skills/create-skill/SKILL.md` — to remove
- `plugins/aces/skills/define-skill/SKILL.md` — needs the escaped-path decision above
- `plugins/skill-authoring/.cursor-plugin/plugin.json`, `skills.sh.json`,
  `packages/cyber-skills/awesome-skills.json` — reference sites (same pattern as `5fd3840`)
- `skills-lock.json`, `.agents/cyber-skills-lock.json` — both already stale (point at
  `skills/create-skill/SKILL.md`, removed by an earlier, unrelated changeset)
