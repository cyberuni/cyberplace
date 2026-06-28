---
name: "github-35: backfill-project-spec — organization strategies for an existing project's spec"
overview: "Build the backfill-project-spec authoring unit: when an existing project has no consolidated spec, choose an organization strategy (capability-first default + mirror-source; bounded-context/layered/doc-envelope recorded as alternatives), scaffold the skeleton + the declared spec-layout, and lower the placement burden for non-owner builders (#35). The skill is an internal step the conductor loads during start-mission explore — NOT a new user entry. ACES is the worked example (spec the TARGET agent-config plugin, not the current impl). Full approved plan: ~/.claude/plans/create-a-new-spec-composed-puddle.md."
todos:
  - id: design
    content: "Design — design/spec-layout.md (strategy menu, shared envelope, nesting rule, compass, #35 mechanisms, per-strategy SDD-fit, spec-org-vs-source-org divergence, declared spec-layout field). Repoint spec-structure.md. Add spec-layout to lifecycle-model.md. Enforce in check-spec-state.mts (validate-if-present) + tests. DONE: commits a3878dc (docs) + ffdeec0 (feat). verify:specs-new green."
    status: completed
  - id: unit-spec
    content: "Spec the backfill-project-spec authoring unit — authoring/backfill-project-spec/{README.md behavioral + ## Use Cases, backfill-project-spec.feature}. Cover detect -> choose location -> recommend (S1/S2) -> scaffold envelope+skeleton -> write spec-layout + placement map -> hand back to start-mission explore; Warden-confirms. Update authoring/README.md Units list."
    status: in_progress
  - id: testcases
    content: "Build testcases/spec-layout/<strategy>/<case>/ fixtures: input project + expected backfilled spec tree. >=1 per strategy (incl. alternatives), 2+ where variation matters, plus hoist + monorepo location cases. check-spec-state --root green on each expected tree."
    status: pending
  - id: impl
    content: "Implement plugins/sdd-new/skills/backfill-project-spec/{SKILL.md,README.md} as internal (user-invocable: false) conductor-loaded step during start-mission explore. Leaves tree at status: draft; reuses corpus discovery+digest for belongs-near-X."
    status: pending
  - id: aces
    content: "ACES proof — scaffold .agents/specs/aces/ for the TARGET ACES (agent-config plugin of SDD) at status: draft. S1 capability-first; location: hoisted; S2-mirror recorded as counter-fixture. Spec the target, NOT the current 8-skill/4-agent impl (which needs overhaul — follow-up)."
    status: pending
  - id: land
    content: "Validate (run skill vs each testcase; pnpm verify:specs-new; audit validate on the skill; pnpm verify), commit per unit, land CR #35 as branch -> PR. Branch: github-35-backfill-project-spec."
    status: pending
isProject: false
---

# Plan — github-35: backfill-project-spec

> Mission plan (portable handoff brief). Tracked, per-worktree.
> CR: [#35](https://github.com/cyberuni/cyber-skills/issues/35) — pre-determine spec organization to
> lower the placement burden for non-owner builders. Full approved design:
> `~/.claude/plans/create-a-new-spec-composed-puddle.md`.

## NEXT — resume here

`design` is DONE (commits `a3878dc` + `ffdeec0`; `verify:specs-new` green). The design doc
`.agents/specs/sdd/design/spec-layout.md` is the authority for everything below.

**Next action — `unit-spec`.** Author the `authoring/backfill-project-spec/` behavioral unit (README with
`## Use Cases` + `backfill-project-spec.feature`). The behavior, in order: **detect** project shape →
**choose spec location** (colocate default / agentic-plugin hoist / monorepo-wide) → **recommend +
choose** strategy (S1 default vs S2) → **scaffold** the shared envelope + the strategy skeleton + stub
READMEs (declared `spec-type`) + root `spec.md` with `spec-layout` frontmatter + the placement map →
**hand back** to `start-mission`'s per-unit explore. Update `authoring/README.md`'s Units list. Then
`testcases` → `impl` → `aces` → `land`.

## Working method (do not relitigate)

- **Model realignment (2026-06-28):** `create-spec`/`revise-spec` retired → folded into **`start-mission`**
  (single CR entry); `operator` → `conductor` (role) / `automaton` (agent). `backfill-project-spec` is an
  **internal authoring unit reached through `start-mission` explore** (`user-invocable: false`,
  conductor-loaded), NOT a new user entry.
- **The unit contract is invariant.** A behavioral leaf = README (`spec-type: behavioral`, `## Use Cases`)
  + colocated `.feature` + optional `.solution.md`; `spec-type` is the only per-node frontmatter; lifecycle
  is root-only; freeze is per-`.feature`. Strategies are grouping only.
- **Strategy menu:** ship **S1 (capability-first, default) + S2 (mirror-source)**; **S3 DDD / S4 layered /
  S5 doc-envelope** recorded as alternatives. ADR is a **facet, off the menu** (per-unit solution +
  `design/decisions/` log). Layering/arc42 structure **nests inside** capabilities, never top-level.
- **spec-org vs source-org divergence** is the maintenance tradeoff the skill surfaces. Fixed-layout
  plugins (ACES) force the hoist + accept S1 divergence (the divergence test). S2 mirroring is
  **boundary-aligned** (depth capped at the unit boundary; nested `src/` below a leaf is impl detail).
- **Declared, not inferred:** the chosen layout lives in the root `spec.md` `spec-layout` frontmatter +
  a body placement map; written once by this skill at scaffold, read (never re-derived) thereafter; the
  Warden rewrites it only on a deliberate reorganization.
- **ACES = spec the TARGET** (agent-config plugin of SDD), not the current impl. Impl overhaul is a
  follow-up, out of scope.
- **Commit per unit** (Conventional Commits, tests green). A pre-commit hook runs the full `turbo test`.
- **Validate:** `pnpm verify:specs-new` (typecheck + check-spec-state tests + live tree); `audit validate`
  per skill; `pnpm verify` before push.

## Resolved decisions

Captured in full in the approved plan (`~/.claude/plans/create-a-new-spec-composed-puddle.md`, "Decisions"
section). Key: full vertical scope; S1+S2 shipped; name `backfill-project-spec`; spec-location detect+choose;
declared `spec-layout`; per-strategy testcases; ADR off-menu; mirror boundary-aligned; ACES = divergence
test on the target; CR #35 own plan/branch.
