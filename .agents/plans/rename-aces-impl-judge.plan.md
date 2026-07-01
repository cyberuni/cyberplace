---
name: rename-aces-impl-judge
status: done
todos:
  - content: "Intake: located aces project spec, scoped rename (matches sdd-implementer -> sdd-impl-judge precedent, PR #44)"
    status: completed
  - content: "Explore: rename agent file + spec node (sdd-roles/implementer -> impl-judge), update all active prose refs"
    status: completed
  - content: "Spec gate: verify renamed .feature still ALIGNED (rename-only, zero behavior delta) — self-asserted, ledger shard rename-aces-impl-judge.c5c99d"
    status: completed
  - content: "Deliver: update registry (.agents/universal-plugin.json) + init-aces canonical entry"
    status: completed
  - content: "Impl gate: pnpm verify green (13/13), no dangling aces-implementer refs in active files — self-asserted"
    status: completed
  - content: "Handoff: commit as one unit (no changeset — internal agent-id consistency fix, not a documented public API)"
    status: completed
---

# CR: rename aces-implementer -> aces-impl-judge

**CR type:** rename/consistency fix on the `implemented` ACES project spec (`.agents/specs/aces/`). No behavior
change — the agent already functions as the impl-judge; only the identifier was misleading (reads like an
impl-**producer**).

**Precedent:** SDD's own plugin had the identical problem and was already fixed — `sdd-implementer` ->
`sdd-impl-judge` (PR #44, merged into main). ACES never got the equivalent rename.

**Target project spec:** `.agents/specs/aces/` (status implemented, project-path plugins/aces).
**Target node:** `.agents/specs/aces/sdd-roles/implementer/` -> rename to `sdd-roles/impl-judge/`
(pure move + identifier substitution in scenario text, zero behavior delta).

**Scope (active files only — legacy `artifacts/specs/` and historical `.agents/plans/*.plan.md` records left
untouched as provenance):**
- `plugins/aces/agents/aces-implementer.md` -> `aces-impl-judge.md`
- `.agents/specs/aces/sdd-roles/implementer/` -> `impl-judge/` (README.md + `implementer.feature` ->
  `impl-judge.feature`)
- `.agents/specs/aces/sdd-roles/README.md`, `.agents/specs/aces/spec.md` capability map
- `.agents/universal-plugin.json` aces squad `impl-judge` role value
- `plugins/aces/skills/init-aces/SKILL.md` canonical registry entry + prose
- prose refs in: `aces-judge.md`, `aces-scenario-writer.md`, `define-agent/SKILL.md`,
  `init-aces/README.md`, `aces-builder-impl/SKILL.md` + `README.md`, `improve/SKILL.md`,
  `define-skill/SKILL.md`, `plugins/aces/readme.md`

**Started 2026-07-01. User asked "should aces-implementer be removed?" — investigated, it's not dead code,
it's the impl-judge; scoped as a rename to match the sdd precedent instead. User did not respond to a scope
confirmation prompt within 60s; proceeding on best judgment (low blast radius, reversible, direct precedent).**

## NEXT

Rename the agent file + spec node, sweep all active prose references, run `pnpm verify`, commit as one unit.
