---
name: name-spec-levels
cr: Terminology revision — name the three spec levels (corpus ⊃ project-spec ⊃ node)
project: sdd
todos:
  - content: "Anchor corpus/project-spec/node model in TERMINOLOGY.md, spec.md, spec-structure.md, corpus/README, ADR-0019"
    status: completed
  - content: "git mv 5 intra-spec engines corpus/ → project-spec/; discovery stays corpus/"
    status: completed
  - content: "Re-level prose in moved nodes' READMEs (a corpus dir → the project-spec directory)"
    status: completed
  - content: "Re-open + revise frozen .feature language (corpus → project-spec) + re-freeze (ledger 32-33)"
    status: completed
  - content: "Mirror rename in impl skills: labels, SKILL.md, .mts (scanCorpus→scanProjectSpec), READMEs"
    status: completed
  - content: "Update cross-refs in start-mission/manage/formation-loop + design docs"
    status: completed
  - content: "Concept corpus-structure → spec-structure + final verify (impl gate ledger 34)"
    status: completed
---

# name-spec-levels

Formalize a three-level spec vocabulary and name every op by the level it acts upon.

**Model:** `corpus` (.agents/specs/ — collection, NOUN only) ⊃ `project-spec` (.agents/specs/sdd/) ⊃ `node`. Ops named by what they touch. Split: corpus/{5 intra-spec engines} → project-spec/…; corpus/discovery stays. Concept `corpus-structure` → `spec-structure` (bi-level).

**Gates:** spec re-freeze ledger seq 33, impl ledger seq 34. Full `pnpm verify` green (13/13). No changeset (plugins/sdd-new not a published package).

## NEXT

Mission complete on branch `next` — 8 commits (plan + 7 units). Awaiting the user's push/PR decision. On merge + doctrine-distill, this plan is retirable (doctrine loop).
