---
name: "sdd-self-contained-sweep: remove .agents/specs/sdd/* dead links from plugin skill prose"
overview: "Plugin-wide self-containment sweep of plugins/sdd-new/skills/. SDD plugin skills ship to consumer projects where the spec corpus .agents/specs/sdd/ does NOT exist, so prose references to corpus design docs are dead links (f9560c3 fallout). Redirect dead design-doc pointers to their shipped-governance equivalent (preferred, no rule duplication), bake inline only where nothing shipped carries the rule (spec-layout/spec-structure), and rewrite sibling-spec paths to shipped skill names. Impl-only, no spec/suite/gate. backfill-project-spec already done (commit 0f0c020). Local-tracked (GH issue write denied)."
todos:
  - id: brief
    content: "Create this tracking brief with the full inventory + fix rules. DONE."
    status: completed
  - id: dead-doc-redirect
    content: "Commit 1 — redirect DEAD-DOC refs to shipped governances (+ fix malformed sdd:autonomy-rubric / sdd:provenance-model) across validate-spec, resolve-governances, gate-validation-governance, lifecycle-governance, plugin-contract-governance, ownership-governance, combat-log-governance, formation-loop, plan-retirement, resume-mission."
    status: pending
  - id: bake-inline
    content: "Commit 2 — bake spec-layout/spec-structure rules inline (no shipped equivalent): place-node, concept-index, doctrine-loop (design/), resume-mission (design/)."
    status: pending
  - id: sibling-rewrite
    content: "Commit 3 — rewrite SIBLING-PATH refs to shipped skill names / drop dead Spec: lines: discover-specs, discover-plans, place-node, concept-index, doctrine-loop, plan-retirement, formation-loop, start-mission."
    status: pending
  - id: verify
    content: "grep zero (.agents/specs/sdd/ + dead bare doc names + sdd:autonomy-rubric/provenance-model) in SKILL.md/README.md; audit validate all skills; pnpm verify."
    status: pending
isProject: false
---

# Plan — sdd-self-contained-sweep

> Tracked, per-worktree. Runs on branch `next`. Replaces a denied GitHub issue.
> Continuation of the backfill-project-spec self-containment fix (commit `0f0c020`).

## Fix rules

A shipped skill may reference other **shipped** things by name (skills/governances, loadable via the
`Skill` tool / `governance show`) — sanctioned "optional depth." It may NOT point at corpus files that
don't ship. So **redirect** dead design-doc pointers to the shipped governance that carries the rule;
**bake inline / drop** only when nothing shipped carries it.

DEAD-DOC → shipped equivalent (verify the target actually carries the rule before redirecting):
- `lifecycle-model.md` → `sdd:lifecycle-governance`
- `provenance-model.md` → `sdd:combat-log-governance`
- `autonomy-rubric.md` → `sdd:gate-validation-governance`
- `governance-resolution.md` → `sdd:resolve-governances` / `sdd:plugin-contract-governance`
- `specialists-and-squads.md` → `sdd:plugin-contract-governance` (verify)
- `spec-layout.md`, `spec-structure.md` → NO shipped equivalent → bake inline / drop

Malformed namespaced refs: `sdd:autonomy-rubric` → `sdd:gate-validation-governance`;
`sdd:provenance-model` → `sdd:combat-log-governance`.

SIBLING-PATH: cross-skill ref → shipped skill name; a README `Spec:`/engine `(<corpus path>)` line
pointing at the skill's own corpus spec → drop the dead path, keep the prose.

## Inventory (16 skills, 54 refs = 36 DEAD-DOC + 18 SIBLING-PATH)

| Skill | file:line | ref | class |
|---|---|---|---|
| validate-spec | README:19 | `.agents/specs/sdd/design/` | DEAD |
| validate-spec | SKILL:21 | provenance-model.md | DEAD |
| validate-spec | SKILL:22 | lifecycle-model.md | DEAD |
| validate-spec | SKILL:22 | autonomy-rubric.md | DEAD |
| validate-spec | SKILL:38 | provenance-model.md | DEAD |
| validate-spec | SKILL:63 | autonomy-rubric.md | DEAD |
| validate-spec | SKILL:82 | autonomy-rubric.md | DEAD |
| formation-loop | README:7 | autonomy-rubric.md | DEAD |
| formation-loop | README:17 | `.agents/specs/sdd/formation/` | SIBLING(formation-loop) |
| formation-loop | SKILL:17 | autonomy-rubric.md | DEAD |
| formation-loop | SKILL:67 | autonomy-rubric.md | DEAD |
| place-node | README:4 | `corpus/place-node/` | SIBLING(place-node) |
| place-node | SKILL:11 | `corpus/place-node/` | SIBLING(place-node) |
| place-node | SKILL:14 | spec-layout.md | DEAD(bake) |
| place-node | SKILL:35 | `mission/handoff/` | SIBLING(start-mission) |
| concept-index | README:4 | `corpus/concept-index/` | SIBLING(concept-index) |
| concept-index | SKILL:11 | `corpus/concept-index/` | SIBLING(concept-index) |
| concept-index | SKILL:14 | spec-structure.md | DEAD(bake) |
| concept-index | SKILL:30 | `.agents/specs/sdd/design/` | DEAD(bake) |
| resolve-governances | README:3,12 | governance-resolution.md | DEAD |
| resolve-governances | SKILL:11 | governance-resolution.md | DEAD |
| discover-specs | README:4,11 | `corpus/discovery/` | SIBLING(discover-specs) |
| discover-specs | SKILL:11 | `corpus/discovery/` | SIBLING(discover-specs) |
| discover-plans | README:4,12 | `intake/plan-discovery/` | SIBLING(discover-plans) |
| discover-plans | SKILL:11 | `intake/plan-discovery/` | SIBLING(discover-plans) |
| gate-validation-governance | README:10 | autonomy-rubric.md | DEAD |
| gate-validation-governance | README:11 | lifecycle-model.md | DEAD |
| gate-validation-governance | SKILL:12 | autonomy-rubric.md | DEAD |
| lifecycle-governance | README:11 | lifecycle-model.md | DEAD |
| lifecycle-governance | SKILL:49,134 | `sdd:autonomy-rubric` | DEAD(malformed) |
| plugin-contract-governance | README:11 | governance-resolution.md | DEAD |
| plugin-contract-governance | SKILL:37 | `sdd:provenance-model` | DEAD(malformed) |
| plugin-contract-governance | SKILL:43 | governance-resolution.md | DEAD |
| ownership-governance | README:11 | provenance-model.md | DEAD |
| ownership-governance | SKILL:19 | `sdd:autonomy-rubric` | DEAD(malformed) |
| combat-log-governance | SKILL:11 | `sdd:provenance-model` + provenance-model.md | DEAD |
| doctrine-loop | README:15 | `doctrine/scanner/` | SIBLING(doctrine-loop) |
| doctrine-loop | SKILL:16 | `.agents/specs/sdd/design/` | DEAD(bake) |
| plan-retirement | README:15 | `doctrine/plan-retirement/` | SIBLING(plan-retirement) |
| plan-retirement | SKILL:12 | provenance-model.md | DEAD |
| resume-mission | SKILL:32 | `.agents/specs/sdd/design/` | DEAD(bake) |
| start-mission | README:5 | `mission/conductor/` | SIBLING(start-mission) |

## NEXT

Start `dead-doc-redirect` (commit 1). Read each file's context first; confirm the redirect target
governance actually carries the rule (else bake the minimal rule inline there). Then bake-inline
(commit 2), then sibling-rewrite (commit 3). Verify + `pnpm verify` green before each commit.

## Notes

- Concurrent sessions share this tree + the union-merge ledger (seq already at 31 from another
  session). This sweep touches **no ledger** and stages files explicitly — never `git add -A`.
- Impl-only prose; governances are `reference` skills with no frozen `.feature` → grep + audit +
  verify suffice, no cold impl-judge.
