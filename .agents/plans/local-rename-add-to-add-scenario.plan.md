---
name: rename ACED add unit → add-scenario
overview: >
  Pure identifier rename (zero behavior delta) of the ACED `add` unit to `add-scenario`.
  Spec-first per SDD: git mv the frozen suite-authoring/add node + add.feature, rename the
  `add` token throughout (Feature line + scenario steps), then propagate to the impl skill
  and every prose reference. Same pattern as the prior rename-aced-case-judge /
  rename-aced-impl-judge CRs (leash auto-all, self-assert at gates, cause dimension).
cr: local-rename-add-to-add-scenario
cr-url:
status: done
todos:
  - id: spec-rename
    content: git mv suite-authoring/add -> add-scenario + add.feature -> add-scenario.feature; rename Feature line + every `add` token in scenario steps to add-scenario (keep improve/run/compare)
    status: completed
  - id: spec-refs
    content: update node README (title/Use Cases/self-refs) + parent index refs (aced spec.md capability map, suite-authoring README)
    status: completed
  - id: spec-gate
    content: spec gate — re-freeze add-scenario.feature, self-assert within leash, write gate line to ledger shard
    status: completed
  - id: impl-rename
    content: git mv plugins/aced/skills/add -> add-scenario; frontmatter name, heading, description, README install line
    status: completed
  - id: propagate-refs
    content: sweep all prose refs — sibling skills/READMEs, plugins/aced/readme.md, website docs (rename add.md, astro sidebar slug, [add](/aced/add/) links), design.md, aced-plugin spec.md, cross-spec README defer lines
    status: completed
  - id: impl-gate
    content: impl gate — pnpm verify + audit + website build + grep sweep green; self-assert; write gate line
    status: completed
  - id: handoff
    content: changeset (breaking install-path/doc-route change) + commit(s) per commit-discipline
    status: completed
isProject: false
---

## NEXT

DONE — landed on main in two commits (spec gate + deliver). pnpm verify green 13/13,
audit 0 critical, website built /aced/add-scenario. Both gates self-asserted within the
auto-all leash (ledger shard `local-rename-add-to-add-scenario.cd2445.jsonl`).

Out-of-scope residuals (left deliberately, per approved plan): the already-merged
`.changeset/aced-add-define-skill-skill.md` prose `add` (historical); a golden case in
the pre-consolidation `artifacts/specs/define-skill/golden-set/017-*.md`; the `aced-add`
token in the legacy `docs/specs/aced/design.md` §7.x narrative. Sweep if that legacy
suite/doc is confirmed live.
