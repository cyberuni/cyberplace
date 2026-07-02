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
status: completed
todos:
  - id: check-define-skill-escaped-path
    content: Decide whether define-skill needs a lightweight scaffold-audit-done ending for already-escaped (non-durable) requests
    status: completed
  - id: reconcile-lock-files
    content: Fix skills-lock.json / .agents/cyber-skills-lock.json (both point at nonexistent skills/create-skill/SKILL.md — bundled skills/ dir was already removed)
    status: completed
  - id: update-refs
    content: Update plugin.json, skills.sh.json, packages/cyber-skills/awesome-skills.json self-reference
    status: completed
  - id: remove-skill
    content: Delete plugins/skill-authoring/skills/create-skill/
    status: completed
  - id: changeset
    content: Add changeset if this touches published package surface (skills-lock.json/cyber-skills-lock.json might)
    status: completed
isProject: false
---

## NEXT — resume here

**Mission complete.** All todos done across 4 commits: `01c3217` (define-skill escaped entry
point + gateway wiring), `8251594` (stale lock-file entries dropped), `af5c67c` (plugin.json /
skills.sh.json / awesome-skills.json refs + changeset), `f6a6a40` (both create-skill copies
deleted — public plus the project-private `.agents/skills/create-skill` mirror the plan didn't
originally list, confirmed with the user — plus skillify/patch-skill sibling-reference fixes).
`pnpm verify`'s pre-existing `resolve-durability.mts` lint failures are unrelated to this CR
(confirmed against a clean stash); every touched file audits and lints clean individually.

**Known follow-up, out of scope here:** `apps/website/src/content/docs/skills/create-skill.md`
and `overview.md` still reference the retired skill — hand-authored docs pages, not covered by
this plan's References and not regenerable (the `render:awesome-list` marker file is separately,
pre-existingly broken). File a CR if this should be cleaned up.

This plan can be retired (`sdd:plan-retirement`) once distilled.

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
