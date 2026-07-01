---
name: aces-define-skill
todos:
  - content: "Intake: locate ACES spec, run resolution, scaffold this brief"
    status: completed
  - content: "Explore: classify fit (strong), author define-skill README + .feature; grill loop w/ cold aces-spec-validator"
    status: completed
  - content: "Spec gate: aces-spec-validator ALIGNED, froze define-skill.feature, ledger seq 6-7, node approved"
    status: completed
  - content: "Deliver: wrote plugins/aces/skills/define-skill SKILL.md + README; reconciled aces-define-skill eval suite"
    status: completed
  - content: "Impl gate: aces-implementer static-inspection PASS all 29, ledger seq 8, node implemented"
    status: completed
  - content: "Handoff: changeset + pnpm verify green; PR (removal of old create-skill deferred to follow-up CR per user)"
    status: in_progress
---

# CR: aces-define-skill — fold + enhance create-skill into ACES as `define-skill`

**CR type:** add a new behavioral node to the `implemented` ACES project spec (`.agents/specs/aces/`).
Root spec stays `implemented`; the new node runs its own draft→approved→implemented lifecycle. Additive.

**Target project spec:** `.agents/specs/aces/` (status implemented, project-path plugins/aces).
**Target node:** `.agents/specs/aces/config-authoring/define-skill/` — `README.md` + `define-skill.feature`
(sibling to `define-agent/`, `define-governance/`). Update `config-authoring/README.md` index + root
`spec.md` capability map / placement map to list define-skill.

**Fit:** strong — genuine trigger disambiguation ("create a skill" vs define-agent / define-governance /
skillify / improve-skill) + non-deterministic authoring judgment (placement, pattern, description). Full
bar: trigger-context + near-miss balance required.

**Resolution:** artifact-type `skill` → ACES squad. spec-producer aces-scenario-writer (inline),
spec-judge aces-spec-validator (cold), impl-producer null→SDD-default builder, impl-judge aces-implementer,
bars aces-builder-spec / aces-builder-impl / aces-fit.

**Synthesis (best of 3 copies):** universal-plugin 7-phase spine (Research→Design→Implement→Audit→
Test→Evidence→Ship) + 5 design questions; skill-authoring concrete placement/pattern tables + npx skills
init/add + fallback symlink + README requirement + skill-design/agent-tool-output governance loads.
**Enhance = "to aces":** replace legacy Test phase (test-skill + evals/trigger-queries.json) with ACES
eval-driven testing (aces:add scaffolds golden set, aces:run baselines, gate on score≥threshold); fit
classify up front; route persona→define-agent, governance/rubric→define-governance.

**Deliverables:** (1) node README + define-skill.feature; (2) plugins/aces/skills/define-skill/SKILL.md +
README.md; (3) ACES eval suite artifacts/specs/aces-define-skill/ (eval.md + golden-set + baseline run);
(4) delete plugins/skill-authoring/skills/create-skill, plugins/universal-plugin/skills/create-skill,
.agents/skills/create-skill; repoint every inbound ref (create-persona-skill, skillify, website doc,
awesome list, plugin manifests, AGENTS.md cross-links); (5) bump aces plugin version if convention needs.

**Gates:** spec gate → aces-spec-validator ALIGNED, freeze, ledger gate. impl gate → aces-implementer
per-frozen-scenario pass. **Verify:** pnpm verify green; audit validate no CRITICAL; aces:run baseline;
`grep -rn create-skill` no live dangling refs.

## NEXT

Handoff. Both gates passed (spec seq 7, impl seq 8); pnpm verify green; changeset added. Open PR from
`worktree-aces-define-skill`. **Removal of the 3 old create-skill copies + ref repointing is a
follow-up CR** (user chose "land aces addition only") — see the ref inventory below; file it as a
GitHub issue at handoff.

Link: no external source — local CR `aces-define-skill`.

## Handoff ref inventory (grep create-skill, to repoint/remove)

- **Remove:** plugins/skill-authoring/skills/create-skill/, plugins/universal-plugin/skills/create-skill/, .agents/skills/create-skill/
- **Registry/lock (regenerate or edit):** skills-lock.json, .agents/cyber-skills-lock.json, skills.sh.json, packages/cyber-skills/awesome-skills.json, plugins/skill-authoring/.cursor-plugin/plugin.json
- **Tests (may break — update fixtures):** packages/cyber-skills/src/skill/repair.test.ts (7), packages/cyber-skills/src/registry/find.test.ts (4)
- **Sibling skill cross-refs (repoint→aces:define-skill):** skillify SKILL+README (both plugins + .agents), patch-skill SKILL (both), plugins/aces/skills/report/SKILL.md
- **Website docs:** apps/website/src/content/docs/skills/create-skill.md (the page), overview.md, audit-skill.md, astro.config.mjs
- **Design/research docs:** docs/specs/aces/design.md, docs/research/2026-05-activation-frontmatter-proposal.md, artifacts/specs/define-governance/golden-set/014-out-of-scope-convert-to-skill.md
- **Leave (historical):** packages/cyber-skills/CHANGELOG.md
- NOTE: skill-authoring + universal-plugin are PUBLIC plugins that ship create-skill; removal means users get skill-authoring via the aces plugin. User-confirmed ("remove the old one").
