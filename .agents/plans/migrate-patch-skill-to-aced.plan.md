---
name: migrate patch-skill into aced
overview: >
  patch-skill (contribute a locally-improved installed skill back to its source repo via PR) lives in
  the skill-authoring plugin, which is NOT an SDD project — so it has no spec node and no ACED eval
  suite, unlike the aced siblings. It followed skillify out of skill-authoring (PR #49); only `init`
  and `patch-skill` now remain there. Unlike skillify, patch-skill is NOT config-authoring (it does not
  create an agent-config artifact — it propagates an already-authored one upstream) and the aced spec
  has no existing routing to it. This CR adopts patch-skill into aced with a PARTIAL fit declaration:
  (1) author a backfilled behavioral spec node from the existing impl, its gradeable behaviors being the
  trigger (when-to / repo-native carve-out), the path-mapping rule (always skills/<name>/, never
  .agents/skills/), and the must-nots (no SKILL.local.md, single commit via Git Data API, no PR when
  identical, show-diffs-first); the Git Data API plumbing is NOT an eval target; (2) relocate the impl
  into plugins/aced as aced:patch-skill + packaging; (3) remove it from skill-authoring. ADD CR against
  the aced project (status stays implemented).
cr: migrate-patch-skill-to-aced
cr-url:
status: active
todos:
  - id: intake
    content: Open CR, scaffold plan, run-start leash (auto-spec) to ledger shard
    status: completed
  - id: explore
    content: DONE — backfilled contribute/patch-skill node via aced-scenario-writer; fit classified STRONG (not partial — confusable trigger vs skill-authoring family + repo-native carve-out); 17 scenarios; cold aced-spec-validator ALIGNED PASS 3-lens, no blocking findings
    status: completed
  - id: spec-gate
    content: DONE — froze patch-skill.feature, gate ledger line, approval.spec -> this CR, concept-index refreshed (contribution concept). Self-asserted within auto-spec leash
    status: completed
  - id: deliver
    content: HELD (auto-spec) — git mv skill into plugins/aced (aced:patch-skill), packaging (plugin.json + 2 marketplaces), .agents/skills surfacing, website doc under aced/, eval suite (partial-fit — no goldens for git-plumbing steps)
    status: pending
  - id: impl-gate
    content: HELD — cold aced-impl-judge over frozen scenarios + eval suite; approval.impl -> this CR, impl ledger line, status stays implemented
    status: pending
  - id: handoff
    content: HELD — Warden placement pass finalizes group, commit in units, PR (base main), spawn post-mission sdd-warden detached
    status: pending
isProject: false
---

## Resolved decisions

- **Full aced adoption** over relocation-only (SDD-consistent — every aced skill has a spec node; the
  skillify precedent). User away at the depth/placement/scope questions; proceeded on the recommended
  path (matches how the skillify CR proceeded).
- **STRONG fit** (reclassified from the initial partial read; the aced-fit governance's strong
  discriminator is a genuine confusable activation decision, which patch-skill has — vs the
  skill-authoring family plus the repo-native carve-out). Trigger + behavior layers both carry signal;
  near-misses authored. The Git Data API plumbing (blob→tree→commit sequence) is deterministic
  mechanics — NOT an eval target; asserted only as its observable outcome (one commit, not per-file).
- **Placement — PROVISIONAL, OPEN for user.** patch-skill is not config-authoring. No existing aced
  group fits (it propagates an authored config upstream). Scaffolded under a new `contribute/` group;
  finalized at handoff (Warden pass) — a pure git mv preserves freeze. The spec-judge architect lens
  will advise; if it blocks the new group, fold per its finding. Deliver is HELD so the user sees
  placement before anything outward lands.
- **Scope**: patch-skill only. `init` stays in skill-authoring for a later CR (different artifact-type
  — it authors AGENTS.md — and a distinct concern).
- **Squad** (resolve-governances, artifact-type=skill, project=plugins/aced): spec-producer
  `aced-scenario-writer`, spec-judge `aced-spec-validator`, impl-judge `aced-impl-judge`; builder bars
  `aced:aced-builder-spec` / `aced:aced-builder-impl`.
- **Leash auto-spec** — self-assert the internal spec gate; HOLD deliver (outward-facing cross-plugin
  move + marketplace edits + PR) for user confirmation.

## NEXT — spec gate DONE + committed; HELD at deliver for the user (outward-facing)

Explore + spec gate complete and self-asserted (auto-spec leash). Spec-gate unit committed on branch
`migrate-patch-skill-to-aced`. DELIVER IS HELD because it is outward-facing. When the user confirms,
run deliver:
1. `git mv plugins/skill-authoring/skills/patch-skill plugins/aced/skills/patch-skill`; invoked as
   `aced:patch-skill` (SKILL.md name stays `patch-skill`). Update `.agents/skills/patch-skill` surfacing
   (keep `metadata: internal: true`; re-run `pnpm --filter=cyberplace repair:private-skills` if it
   manages it). Remove from `plugins/skill-authoring` (only `init` remains there after).
2. Packaging: `plugins/aced/.plugin/plugin.json` (add patch-skill), `.claude-plugin/marketplace.json` +
   `.cursor-plugin/marketplace.json`, `apps/website/src/content/docs/skills/patch-skill.md` → move under
   the aced section + sidebar. Mirror how skillify was repackaged in PR #49.
3. Author the ACED eval suite (impl-producer builds one eval per frozen scenario; `artifacts/specs/patch-skill/`
   mirroring `artifacts/specs/skillify/`). STRONG fit → include the @trigger layer + behavior goldens;
   NO goldens for the Git Data API plumbing (out of the graded suite).
4. `pnpm verify` green.
Then impl gate: spawn cold `aced:aced-impl-judge` over the frozen scenarios + eval suite → approval.impl
-> this CR (status stays implemented), impl ledger line.
Then handoff: Warden placement pass FINALIZES the `contribute/` group (new top-level group — confirm the
architect blesses it or fold per its finding; git mv preserves freeze); update the root spec.md Capability
map + Placement map to add `contribute/`; commit in units; PR (base main); spawn post-mission sdd-warden
detached.

OPEN DECISIONS for the user (surfaced at this hold):
- Confirm deliver may proceed (outward-facing: cross-plugin move + 2 marketplaces + PR).
- **Placement**: bless the new top-level `contribute/` group vs fold patch-skill under `config-authoring/`
  (broadened charter). My lean: new `contribute/` group — it propagates an authored config, it does not
  author one; config-authoring's charter is explicitly "creating the artifacts ACED evaluates".
- Scope confirm: patch-skill only (leave `init` for a later CR).

Follow-up CR (from spec-judge, non-blocking): skillify's frozen Non-goals do not name patch-skill
(one-directional mirror); add a patch-skill deferral when skillify next unfreezes (needs its own re-open).
