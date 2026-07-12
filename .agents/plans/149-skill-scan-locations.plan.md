---
name: 149-skill-scan-locations
status: active
todos:
  - content: "explore: grill customizable scan locations (config + --dir glob) + CI wiring on validate.mts"
    status: completed
  - content: "explore: grill new manage-skill-dirs curation skill (mirror manage-spec-anchors)"
    status: completed
  - content: "spec gate: freeze improve-skill.feature additive scenarios + manage-skill-dirs.feature"
    status: completed
  - content: "deliver: implement config union + glob findSkillFiles + --dir flag + verification"
    status: completed
  - content: "deliver: implement manage-skill-dirs engine + skill"
    status: completed
  - content: "deliver: wire mechanical scan into pnpm verify; clean first-run backlog"
    status: completed
  - content: "impl gate: cold SDD impl-judge per frozen scenario"
    status: completed
  - content: "handoff: branch + PR, closes #149"
    status: in_progress
---

# CR #149 — customizable skill-scan locations + wire the mechanical scan into CI

CR: https://github.com/cyberuni/cyberplace/issues/149 (follow-up from #133 / PR #144)

Target project spec: `aced` (`.agents/specs/aced/`, implemented). Nodes:
- `config-authoring/improve-skill` — the mechanical validate engine (new scan-scope behavior)
- NEW `manage/manage-skill-dirs` (or under `manage/`) — curation skill, mirrors SDD `manage-spec-anchors`

Touched files: `plugins/aced/skills/improve-skill/scripts/validate.mts` (deterministic engine,
SDD-default chain), new `plugins/aced/skills/manage-skill-dirs/`, `package.json` + `turbo.json`
(CI wiring). New config `.agents/aced/skill-dirs.toml` (opt-in, additive).

## The gap (#149)

`improve-skill`'s mechanical `validate.mts` never runs on this repo's plugin skills:
1. `SKILL_DIRS = ['skills','.agents/skills']` + one-level-deep `findSkillFiles` → 41+ partials under
   `plugins/*/skills/<name>/SKILL.md` are never discovered.
2. No `pnpm verify` step invokes `validate.mts` → the #133 partial-skill guards are inert in CI.

## The proposal (two coupled pieces, existing precedent)

1. **Extensible scan locations** — opt-in `.agents/aced/skill-dirs.toml` (`extra = ["plugins/*/skills",
   "packages/*/skills"]`), unioned onto `SKILL_DIRS`; a one-segment glob in `findSkillFiles`; a
   repeatable `--dir <glob>` CLI flag. Mirrors SDD `spec-anchors.toml` (ADR-0019). Absent config →
   unchanged behavior (no baked-in monorepo layout).
2. **Wire into CI** — a `pnpm verify` step runs the scan across configured dirs, non-zero on CRITICAL.
3. **manage-skill-dirs** skill — curate the config (list/add/remove/preview), mirror manage-spec-anchors.

## Caveat (known)

Flipping the CI scan over `plugins/*/skills` enforces ALL mechanical checks on 40+ never-scanned
skills → expect a first-run backlog cleanup before the gate goes green. Plan for a "fix backlog once"
step; do not silently ship a red gate.

## Decisions (grilled with user)

1. **Config** — opt-in `.agents/aced/skill-dirs.toml`, single `anchors` key, unioned onto 2 built-in
   defaults; absent → unchanged. Mirror SDD spec-anchors (ADR-0019); glob `*`/`**`; NO `<project>`
   capture (skill name comes from its own dir). Repeatable `--dir <glob>` flag.
2. **CI** — new dedicated `//#check:skills` turbo task; non-zero on CRITICAL.
3. **manage-skill-dirs** — full parity with SDD manage-spec-anchors (list/add/remove/edit/induce/preview
   + confirm-before-persist). New node `config-authoring/manage-skill-dirs/`.
4. **Backlog** — the CI flip surfaces exactly 1 CRITICAL (universal-plugin `rm -f <file>`). Fix at the
   source: **refine E1 by blast radius** — scoped `rm -f <named rel file>` → WARN; catastrophic forms
   (rm -rf/-r, sudo rm, curl|sh, dd, mkfs, fork bomb, rm -f glob/abs/home) stay CRITICAL. NO
   ratify/allowlist bypass (itself an attack surface). Auto-clears the 1 CRITICAL → green gate.

## Build-to-learn (spikes, thrown away)

- Backlog measured: 81 skills, **1 CRITICAL** (universal-plugin E1), 23 WARN (WARN doesn't gate).
- E1 discriminator prototype: 15/15 crisp, non-overlapping (recursion / glob / abs-home-var path).
- Glob matcher + CRUD/induce/preview fully reusable from `manage-spec-anchors.mts` (minus `<project>`).

## NEXT — handoff (PR open, awaiting merge)

**Both gates PASSED.** Spec gate: round-2 cold spec-judge ALIGNED. Impl gate: cold impl-judge APPROVE,
all frozen scenarios PASS, no regression, BLOCKER null. status: **implemented**. `pnpm verify` 20/20.
Two commits on `feat/aced-skill-scan-locations`: spec gate (73b83e6a) + deliver (ea96c44b). Impl-gate
status transition committed next; branch pushed; PR opened closing #149.

After merge:
- **Doctrine-distill + retire this plan** (`sdd:manage` → doctrine loop) once source merged AND distilled.
- **Formation nudge**: a corpus-wide formation pass is due (new node landed) — `sdd:manage` → formation-loop, on-demand.

### Follow-ups (file as new CRs, do not block #149)
- **S1 parent-dirname edge** (impl-judge note, pre-existing): S1 ("SKILL.md in own directory") checks
  literal parent dirname `=== 'skills'`; a future skill-dir pattern whose final segment isn't literally
  `skills` would false-positive S1. Never fires with the real anchors (both end in `skills`). Harden S1
  to derive the skill-root from the configured scan location, not a hardcoded `'skills'`.
- **Glob-logic duplication** (impl-judge note): `expandSkillDirPattern`/`collectDescendants` duplicated
  between validate.mts and manage-skill-dirs.mts — mirrors the manage-spec-anchors precedent (no-deps
  self-contained .mts). Optional: extract a shared glob util if a third consumer appears.
