---
name: name-spec-levels
cr: Terminology revision — name the three spec levels (corpus ⊃ project-spec ⊃ node)
project: sdd
todos:
  - content: "Anchor corpus/project-spec/node model in TERMINOLOGY.md, spec.md, spec-structure.md, corpus/README, ADR-0017"
    status: pending
  - content: "git mv 5 intra-spec engines corpus/ → project-spec/; discovery stays corpus/"
    status: pending
  - content: "Re-level prose in moved nodes' READMEs (a corpus dir → the project-spec directory)"
    status: pending
  - content: "Re-open + revise frozen .feature language (corpus → project-spec) + re-approve/re-freeze"
    status: pending
  - content: "Mirror rename in impl skills: labels, SKILL.md, .mts (scanCorpus→scanProjectSpec), READMEs"
    status: pending
  - content: "Update cross-refs in start-mission/manage/formation-loop"
    status: pending
  - content: "Concept-tag sweep (corpus-structure → project-spec-structure) + final verify"
    status: pending
---

# name-spec-levels

Formalize a three-level spec vocabulary and name every op by the level it acts upon.

**Model:** `corpus` (.agents/specs/ — collection, NOUN only) ⊃ `project-spec` (.agents/specs/sdd/) ⊃ `node` (spec.md + .feature). Ops named by what they touch: one project-spec = project-spec-level; across projects = corpus-level.

**Split:** corpus/{align-spec, check-spec-structure, concept-index, digest, place-node} → project-spec/…; corpus/discovery stays (genuinely corpus-level).

**Freeze:** git mv is pure (freeze survives). Frozen .feature *content* edits need ratified re-open → spec gate re-approve → re-freeze. Conductor ratifies in-session.

## NEXT

Start unit 1 — anchor the model in the definition docs. Full design in the approved plan: /home/unional/.claude/plans/frolicking-twirling-firefly.md
