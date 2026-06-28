---
name: "github-35: backfill-project-spec — organization strategies for an existing project's spec"
overview: "Build the backfill-project-spec authoring unit: when an existing project has no consolidated spec, choose an organization strategy (capability-first default + mirror-source; bounded-context/layered/doc-envelope recorded as alternatives), scaffold the skeleton + the declared spec-layout, and lower the placement burden for non-owner builders (#35). The skill is an internal step the conductor loads during start-mission explore — NOT a new user entry. ACES is the worked example (spec the TARGET agent-config plugin, not the current impl). Full approved plan: ~/.claude/plans/create-a-new-spec-composed-puddle.md."
todos:
  - id: design
    content: "Design — design/spec-layout.md (strategy menu, shared envelope, nesting rule, compass, #35 mechanisms, per-strategy SDD-fit, spec-org-vs-source-org divergence, declared spec-layout field). Repoint spec-structure.md. Add spec-layout to lifecycle-model.md. Enforce in check-spec-state.mts (validate-if-present) + tests. DONE: commits a3878dc (docs) + ffdeec0 (feat). verify:specs-new green."
    status: completed
  - id: unit-spec
    content: "Spec the backfill-project-spec authoring unit. DONE (ee2d0c8): authoring/backfill-project-spec/{README behavioral + ## Use Cases, .feature 23 scenarios}; authoring/README.md Units list updated."
    status: completed
  - id: impl
    content: "Implement the backfill-project-spec internal skill. DONE (11816f8): plugins/sdd-new/skills/backfill-project-spec/{SKILL.md,README.md}, user-invocable: false, six-step procedure. audit validate clean (only the standard internal-skill Q1 warning, same as siblings)."
    status: completed
  - id: aces
    content: "ACES proof. DONE (19aac5d): .agents/specs/aces/ scaffolded capability-first + hoisted; root spec.md with spec-layout frontmatter + placement map; envelope (design/ + decisions/, acceptance/, glossary) + capability skeleton (eval-run, config-authoring, suite-authoring, sdd-roles, registry) as declared-spec-type stubs. Target spec, not current impl. check-spec-state green."
    status: completed
  - id: testcases
    content: "Build testcases/spec-layout/<strategy>/<case>/ fixtures: input project + expected backfilled spec tree. >=1 per strategy (incl. alternatives), 2+ where variation matters, plus hoist + monorepo location cases. check-spec-state --root green on each expected tree. (ACES already serves as the S1-capability-first + hoist case.)"
    status: pending
  - id: land
    content: "Validate (pnpm verify:specs-new; audit validate on the skill; pnpm verify) — all green. Landed: PR #36 (base next) closing #35. DONE pending review/merge. Do NOT delete this plan until merged AND doctrine-distilled."
    status: completed
isProject: false
---

# Plan — github-35: backfill-project-spec

> Mission plan (portable handoff brief). Tracked, per-worktree.
> CR: [#35](https://github.com/cyberuni/cyber-skills/issues/35) — pre-determine spec organization to
> lower the placement burden for non-owner builders. Full approved design:
> `~/.claude/plans/create-a-new-spec-composed-puddle.md`.

## NEXT — resume here

**Done so far (branch `github-35-backfill-project-spec`):** `design` (`a3878dc`+`ffdeec0`), mission brief
(`08b0f70`), `unit-spec` (`ee2d0c8`), `impl` (`11816f8`), `aces` proof (`19aac5d`). `verify:specs-new` green.

**All steps DONE.** `testcases` (`c93927a`, 10 expected roots green) and `land` (PR #36, base `next`, closing
#35; `pnpm verify` + `verify:specs-new` green) complete. The mission has landed pending review/merge.

**Remaining (do not delete this plan until then):** address PR review; on merge, **doctrine-distill** any
reusable lesson; only then retire this brief. Follow-ups noted in the approved plan: the ACES **impl**
overhaul to the new target spec; promoting S3/S4/S5 to first-class compass routes; nearest-neighbor
"belongs near X" automation.

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
