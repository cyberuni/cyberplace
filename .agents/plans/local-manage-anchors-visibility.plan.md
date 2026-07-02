---
name: manage-spec-anchors visibility — regroup + proactive surfacing
overview: >
  manage-spec-anchors is a prerequisite for a project being discoverable at all, but it's buried
  under the "Housekeeping" group (reads as routine cleanup, not setup). (1) Rename/regroup the
  manage skill's top-level "Bootstrap" group to something like "Setup & discovery" that includes
  manage-spec-anchors alongside backfill-project-spec. (2) Have the gateway/discover-specs path
  proactively offer manage-spec-anchors when discovery finds no spec for a project, instead of
  relying on the user to know it exists under a menu.
cr: local-manage-anchors-visibility
cr-url:
status: active
todos:
  - id: explore-regroup
    content: Revise manage node — regroup Bootstrap → Setup & discovery, move manage-spec-anchors there
    status: completed
  - id: explore-surfacing
    content: Add gateway scenario — offer manage-spec-anchors when discover-specs finds no spec
    status: completed
  - id: spec-gate
    content: Cold spec-judge run; reclassified as additive/self-clear (title/section-only, zero Given/When/Then delta) — no re-open needed, both nodes stay @frozen/approved
    status: completed
  - id: deliver
    content: Update manage/SKILL.md, manage/README.md, and gateway/sdd SKILL.md to match frozen suite
    status: completed
  - id: verify
    content: pnpm verify:specs (295/295 pass, spec/feature/governance/concept-index/structure checks all green)
    status: completed
  - id: handoff
    content: Commit
    status: in_progress
isProject: false
---

## NEXT

Commit the change: spec/suite edits (manage.feature + gateway.feature + their READMEs) and the impl
edits (manage/SKILL.md, manage/README.md, sdd/SKILL.md) — likely two commits (spec vs impl) or one,
per commit-work discipline. Mission complete after commit.
