---
name: rename ACES add unit → add-scenario
overview: >
  Pure identifier rename (zero behavior delta) of the ACES `add` unit to `add-scenario`.
  Spec-first per SDD: git mv the frozen suite-authoring/add node + add.feature, rename the
  `add` token throughout (Feature line + scenario steps), then propagate to the impl skill
  and every prose reference. Same pattern as the prior rename-aces-case-judge /
  rename-aces-impl-judge CRs (leash auto-all, self-assert at gates, cause dimension).
cr: local-rename-add-to-add-scenario
cr-url:
status: active
todos:
  - id: spec-rename
    content: git mv suite-authoring/add -> add-scenario + add.feature -> add-scenario.feature; rename Feature line + every `add` token in scenario steps to add-scenario (keep improve/run/compare)
    status: completed
  - id: spec-refs
    content: update node README (title/Use Cases/self-refs) + parent index refs (aces spec.md capability map, suite-authoring README)
    status: completed
  - id: spec-gate
    content: spec gate — re-freeze add-scenario.feature, self-assert within leash, write gate line to ledger shard
    status: completed
  - id: impl-rename
    content: git mv plugins/aces/skills/add -> add-scenario; frontmatter name, heading, description, README install line
    status: pending
  - id: propagate-refs
    content: sweep all prose refs — sibling skills/READMEs, plugins/aces/readme.md, website docs (rename add.md, astro sidebar slug, [add](/aces/add/) links), design.md, aces-plugin spec.md, cross-spec README defer lines
    status: pending
  - id: impl-gate
    content: impl gate — pnpm verify + audit + website build + grep sweep green; self-assert; write gate line
    status: pending
  - id: handoff
    content: changeset (breaking install-path/doc-route change) + commit(s) per commit-discipline
    status: pending
isProject: false
---

## NEXT

Spec gate passed (freeze preserved, self-asserted). Next: `impl-rename` — git mv
plugins/aces/skills/add -> add-scenario, then `propagate-refs` sweep (sibling skills/READMEs,
plugins/aces/readme.md, website docs + astro sidebar, docs/specs/aces/design.md,
artifacts/specs/aces-plugin/spec.md). Then impl gate (pnpm verify + audit + website build +
grep sweep) and handoff (changeset + commit). Session ledger shard:
`local-rename-add-to-add-scenario.cd2445.jsonl`.
