---
name: migrate skillify into aced
overview: >
  skillify (generalize the current session's work into a reusable SKILL.md) lives in the
  skill-authoring plugin, which is NOT an SDD project — so it has no spec node and no ACED eval
  suite, unlike its aced config-authoring siblings (define-skill/agent/governance). The aced spec
  already treats skillify as a sibling (define-skill.feature has a frozen "defers to skillify"
  scenario; define-skill Non-goals carve it out). This CR adopts skillify into aced fully:
  (1) author a backfilled behavioral spec node under config-authoring/skillify from the existing
  impl; (2) relocate the impl into plugins/aced as aced:skillify and update packaging; (3) remove
  it from skill-authoring. ADD CR against the aced project (status: implemented).
cr: migrate-skillify-to-aced
cr-url:
status: active
todos:
  - id: intake
    content: Open CR, scaffold plan, run-start leash (auto-spec) to ledger shard
    status: completed
  - id: explore
    content: Backfill config-authoring/skillify node (README + skillify.feature) via aced-scenario-writer inline + cold aced-spec-validator; boundary vs define-skill already ratified
    status: completed
  - id: spec-gate
    content: Judge suite (aced bars), freeze skillify.feature, self-assert spec gate within auto-spec leash
    status: completed
  - id: deliver
    content: DONE — git mv skill into plugins/aced (aced:skillify), removed .agents/skills+.claude/skills surfacing + skill-authoring cursor ref, moved website doc to aced/ + sidebar, authored eval suite (eval.md + 17 goldens, audit PASS)
    status: completed
  - id: impl-gate
    content: DONE — cold aced-impl-judge; first pass caught 003/004 gap, fixed SKILL.md (Defer-when table), re-grade 18/18 PASS; approval.impl -> this CR, impl ledger line, status implemented
    status: completed
  - id: handoff
    content: Placement already blessed (sibling of define-skill); committed 3 units (c1d6ad7 relocate / 3f2ac8d spec+eval / cb134e5 docs); pnpm verify + verify:specs green; post-mission Warden spawned. REMAINING = git push + PR (held for user)
    status: in_progress
isProject: false
---

## Resolved decisions

- **Full aced adoption** over relocation-only (user away at the scope question; SDD-consistent —
  every sibling in config-authoring/ has a spec node; aced spec already routes to skillify).
- **Backfill explore** — skillify's behavior fully exists in the current impl, so the producer reads
  the existing SKILL.md; no live seed-intent grill needed.
- **Placement**: `config-authoring/skillify` (sibling to define-skill). Boundary vs define-skill is
  already ratified in define-skill.feature (frozen "defers to skillify").
- **Squad** (resolve-governances, artifact-type=skill, project=plugins/aced): spec-producer
  `aced-scenario-writer`, spec-judge `aced-spec-validator`, impl-judge `aced-impl-judge`; builder
  bars `aced:aced-builder-spec` / `aced:aced-builder-impl`.
- **Leash auto-spec** — self-assert the internal spec gate; HOLD deliver (the outward-facing
  cross-plugin move + marketplace edit) for user confirmation.

## NEXT — mission complete locally; only outward push/PR remains (user-gated)

All gates passed, committed in 3 units on branch `migrate-skillify-to-aced`, `pnpm verify` +
`verify:specs` green, post-mission Warden spawned detached. REMAINING: `git push -u origin
migrate-skillify-to-aced` + open a PR (base main) — held for the user (outward-facing). Once merged,
this plan is retirement-eligible (doctrine loop). Advisory follow-ups (file as new CRs if desired):
skillify Step 6 `improve-skill` ambiguous vs `aced:improve`; Step 1 `npx cyberplace` dependency baked
into an aced plugin skill. Note: `.agents/plans/acceptance-pipeline-skill-suite.md` shows an
unrelated unstaged deletion (not this CR) — left untouched.

## ARCHIVE — earlier pause note (deliver boundary)

Spec gate DONE and self-asserted (auto-spec leash). Working tree (UNCOMMITTED — todos incomplete):
- NEW node `.agents/specs/aced/config-authoring/skillify/` (README.md + skillify.feature @frozen, 18 scenarios)
- root `spec.md` approval.spec → this CR (status stays `implemented`; approval.impl still manage-model-runners, updates at this CR's impl gate)
- ledger shard `ledger/migrate-skillify-to-aced.861a7c.jsonl` (leash + spec gate line)
- `## Why` section removed from README per spec-judge blocking finding
Branch: `migrate-skillify-to-aced`. Spec-judge verdict: oracle+builder PASS, architect PASS after fix → ALIGNED.

DELIVER is HELD (leash auto-spec) because it is outward-facing. When the user confirms, run deliver:
1. `git mv plugins/skill-authoring/skills/skillify plugins/aced/skills/skillify`; rename skill id → `aced:skillify` (SKILL.md name stays `skillify`, invoked as aced:skillify). Update the intra-doc reference "Different from aced:define-skill" as needed.
2. Author the ACED eval suite for skillify (impl-producer builds one eval per frozen scenario; artifacts/specs/skillify or the repo's eval location — mirror manage-model-runners' eval layout).
3. Update packaging: `plugins/aced/.plugin/plugin.json` (add skillify), remove skillify from `plugins/skill-authoring`; `.claude-plugin/marketplace.json` + `.cursor-plugin/marketplace.json`; the `.agents/skills/skillify` + `.claude/skills/skillify` surfacing (re-run `pnpm --filter=cyberplace repair:private-skills` if it manages them); `apps/website/src/content/docs/skills/skillify.md` (move under aced section).
4. `pnpm verify` green.
Then impl gate: spawn cold `aced:aced-impl-judge` over the frozen scenarios + eval suite → status implemented, approval.impl → this CR, impl gate ledger line.
Then handoff: Warden placement pass (scoped), commit in units (spec node / move+packaging / eval suite), PR-flow, spawn post-mission sdd-warden detached.

ADVISORY follow-ups (non-blocking, from spec-judge): normalize `concept:` onto sibling define-skill (do as a pair); optionally trim `## Scenarios (colocated)` to a one-line pointer.

OPEN DECISION for user: confirm Full aced adoption (assumed) vs relocation-only; confirm deliver may proceed.
