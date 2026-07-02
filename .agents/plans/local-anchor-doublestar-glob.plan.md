---
name: anchor ** glob — any-depth wildcard for spec-anchors patterns
overview: >
  manage-spec-anchors patterns only globbed one segment at a time (`*`, `<project>`). Add a `**`
  segment (globs zero or more levels, any depth) so a custom anchor can name a root whose specs
  sit at varying depth beneath it — mirrors the fixed convention 3's any-depth nested-project scan.
cr: local-anchor-doublestar-glob
cr-url:
status: active
todos:
  - id: implement
    content: Add ** any-depth glob to expandAnchor (discover-specs.mts) + previewPattern (manage-spec-anchors.mts) + isValidPattern
    status: completed
  - id: tests
    content: Unit tests for ** in both scripts (expandAnchor, preview, isValidPattern)
    status: completed
  - id: docs
    content: Update spec.feature (additive scenario, self-clears), README, both SKILL.md grammar docs
    status: completed
  - id: verify
    content: pnpm verify:specs + typecheck:specs green
    status: completed
  - id: handoff
    content: Commit
    status: in_progress
isProject: false
---

## NEXT

Commit the change (feat: add ** any-depth glob to spec-anchors patterns), one unit of work covering
both .mts scripts + tests + docs. Mission complete after commit.
