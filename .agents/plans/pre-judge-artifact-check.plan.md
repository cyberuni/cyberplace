---
name: "pre-judge-artifact-check: extend the pre-judge mechanical self-check to referenced-artifact-exists"
overview: "Ratifies doctrine strategy ledger seq 1 (strategy.317dd8.jsonl) which reinforced the already-pending seq 42 (0000-legacy.jsonl): extend the pre-judge mechanical self-check beyond .feature-form to a semantic blocker — referenced engine/skill/artifact paths that do not exist on disk — as a spec-producer self-run plus a spec-gate fail-closed pre-filter, same shape as check-feature. Scoped narrower than seq 42's full ask: only the referenced-artifact-exists half is delivered; the use-case-row-has-scenario half is deferred (needs a real Use-Case-row-to-scenario link mechanism to check without fuzzy-matching false positives — a design decision, not a mechanical add)."
todos:
  - id: intake
    content: "Open the local CR, scaffold this brief. Source: doctrine strategy seq 1 (reinforcing seq 42), ratified."
    status: completed
  - id: explore
    content: "Implement extractPathRefs + checkReferencedArtifacts in check-spec-state.mts; --files mode only (never the --root tree sweep, which the existing corpus's legitimate example/convention prose would false-positive against). 50 tests green."
    status: completed
  - id: validate
    content: "Run --root and --files against the real corpus; found + fixed 2 genuine broken references (authoring/backfill-project-spec, authoring/suite-format)."
    status: completed
  - id: spec-gate
    content: "Additive scenarios in spec-gate.feature (stays @frozen); README use-case row + new section. verify:specs-new + verify green."
    status: completed
  - id: deliver
    content: "Wire into spec-gate/SKILL.md (gate pre-filter) and spec-producer-governance/SKILL.md (producer self-run)."
    status: completed
  - id: handoff
    content: "Commit, ledger gate line, update this plan's NEXT."
    status: completed
isProject: false
---

# Plan — pre-judge-artifact-check

> Mission plan (portable handoff brief). Tracked, per-worktree.
> CR: local CR, ratifying doctrine strategy ledger seq 1 (`strategy.317dd8.jsonl`), which
> reinforced already-pending seq 42 (`ledger/0000-legacy.jsonl`).
> Target: `.agents/specs/sdd/authoring/spec-gate/` (project-path `plugins/sdd-new`).

## What we are doing

seq 42 asked for two semantic pre-judge checks: (a) referenced artifact/engine/skill names that
don't exist on disk, (b) use-case rows with no mapped scenario. Delivered (a) only — a real,
tested, CR-scoped mechanical check (`--files` mode, mirroring `check-feature.mts`'s shape exactly)
that already found and fixed 2 genuine broken relative-path references in the existing corpus.
(b) is scoped OUT: without a formal Use-Case-row-to-scenario link (a table column or id), any
mechanical mapping check is fuzzy text-matching with real false-positive risk across ~20 existing
behavioral nodes — that's a design decision (does the Use Cases table need a new column?), not a
mechanical add, and belongs in its own CR if the user wants to pursue it.

## Resolved decisions

- **`--files` only, never `--root`.** The accumulated corpus's legitimate example/convention
  prose (opt-in configs not yet created, hypothetical nested-project paths) makes a blind
  tree-wide sweep unworkable without hand-curating years of prose. CR-scoped only, same as how
  `check-feature`'s fail-closed gate actually works (its `--root` sweep is a separate CI backstop
  this new check does not get).
- **(b) use-case-row-has-scenario deferred.** Flagged to the user as an open scoping call, not
  silently dropped.

## NEXT — resume here

▶ MISSION COMPLETE (2026-07-01). `check-spec-state.mts` carries `extractPathRefs` +
`checkReferencedArtifacts` + `checkReferencedArtifactsInFiles` (50 new/existing tests green,
275/275 `verify:specs-new`). Wired into `spec-gate/SKILL.md` (gate pre-filter) and
`spec-producer-governance/SKILL.md` (producer self-run). 4 additive scenarios in
`spec-gate.feature` (stays `@frozen`). Found + fixed 2 real broken references in the corpus
(`authoring/backfill-project-spec/README.md`, `authoring/suite-format/README.md`) — proof the
check works. **Open follow-up (not filed):** seq 42's (b) half (use-case-row-has-scenario) needs
a design decision on how to link a row to its scenario(s) before it can be a mechanical check.
