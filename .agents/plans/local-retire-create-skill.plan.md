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
    status: pending
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

**First action:** open `plugins/aces/skills/define-skill/SKILL.md` and decide the
`check-define-skill-escaped-path` todo — this is the actual blocker, not a formality:

Durability escape now happens **upstream** of `define-skill` (wired into
`plugins/sdd-new/skills/sdd/SKILL.md` and `start-mission/SKILL.md`'s Step 1, `cb62994`). A
request for a private/non-durable skill now **escapes the SDD lifecycle before any CR opens**
— which means `define-skill` (dispatched as the ACES spec-producer *inside* a CR) is **never
reached** for that request at all. So "define-skill now handles the fast case via the escape
hatch" — the framing this whole line of work assumed — is not quite right: something still has
to actually scaffold the skill file for escaped work, and right now nothing does. Two options:

1. Give `define-skill` a second entry point / early branch for **already-escaped** requests
   (no CR context) that does scaffold + audit + report, skipping the "hand off to the ACES eval
   loop" ending entirely (there's no mission to hand off within). `define-skill` would then be
   invoked directly by the conductor at the point of escape, not just as an ACES-role producer.
2. Keep `create-skill` (or a trimmed version of it) as the literal "escaped path" handler —
   i.e. don't retire it, repurpose it as what the escape hatch invokes for "ordinary means."

Option 1 is likely right (one skill, no duplicate scaffold logic to keep in sync) but needs a
decision, then a small `define-skill` edit, before `create-skill` can actually be deleted.

**Once that's resolved**, the remaining todos are mechanical (same shape as the
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
