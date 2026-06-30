---
name: "github-34: SDD project spec + behavior suite to the spec gate"
overview: "Carry CR #34 through the new SDD Mission Loop as a self-hosting bootstrap. The macro grill (holistic direction check over design/) is done. The live work is a series of per-capability VERTICAL SUB-MISSIONS: for each capability, tighten the prose, author per-unit .feature suites (one suite per skill/unit), and build the matching implementation fresh under plugins/sdd-new (build-to-learn, during explore). Then root frontmatter, the hand-run spec gate, the cross-cutting agents, plugin assembly, and the self-hosting check. plugins/sdd stays an untouched reference baseline."
todos:
  - id: cleanup-phase
    content: "Phase 0 — spec-tree cleanup (schema, acceptance seed, tracked plans). COMPLETE — see conclusion."
    status: completed
  - id: macro-grill
    content: "Explore L1 — MACRO grill over design/. DONE: 4 coherence fixes, surfaced 4 model refinements."
    status: completed
  - id: model-refinements
    content: "Explore L1 — land macro-grill model refinements in design/. ALL LANDED: intake-creates-plan, explore-builds-impl, per-unit suites, spec-types taxonomy."
    status: completed
  - id: sub-authoring
    content: "Sub-mission authoring/ — DONE. 5 units (spec-producer, validate-spec, spec-format, suite-format, create-spec, revise-spec) all have spec + impl."
    status: completed
  - id: sub-intake
    content: "DEFERRED (Tier 4, net-new). Sub-mission intake/ — no baseline skill. Carve to follow-up CR after migration."
    status: pending
  - id: intake-adapter-store
    content: "DEFERRED (Tier 4). Adapter directive + local CR store are net-new. Carved to follow-up CR."
    status: pending
  - id: sub-gateway
    content: "Sub-mission gateway/ — DONE. Single behavioral unit + gateway.feature (10). IMPL: plugins/sdd-new/skills/sdd/ (thin-relay, D-G model)."
    status: completed
  - id: arch-conductor-pivot
    content: "Architecture pivot (D-G) — DONE. Main session = conductor; spec/solution-producer inline; impl-producer + judges spawn depth 1."
    status: completed
  - id: sub-mission
    content: "Sub-mission mission/ — DONE. Conductor + solution-producer units specced + suited; solution-producer-governance impl built."
    status: completed
  - id: sub-deliver
    content: "Sub-mission deliver/ — DONE. impl-producer + impl-judge units specced + suited; impl-producer-governance impl built."
    status: completed
  - id: sub-handoff
    content: "Sub-mission handoff/ — DONE. Single behavioral unit + handoff.feature (13). Realized by operator agent in core-agents."
    status: completed
  - id: sub-corpus
    content: "Sub-mission corpus/ — SUITES DONE. 5 behavioral units (discovery, digest, dedupe, split, align). IMPLs pending deliver. Frozen (7ab8c98)."
    status: completed
  - id: sub-campaign
    content: "DEFERRED (Tier 4, net-new). Sub-mission campaign/ — the product outer loop."
    status: pending
  - id: sub-formation
    content: "Sub-mission formation/ — SUITE DONE. formation.feature with corpus-wide acts + Warden verdicts. Warden IMPL pending. Frozen (7ab8c98)."
    status: completed
  - id: sub-doctrine
    content: "Sub-mission doctrine/ — DONE. scanner + plan-retirement units; doctrine-loop skill + sdd-scanner agent + retire-plans.mts impl built."
    status: completed
  - id: sub-forge
    content: "DEFERRED (Tier 4, net-new). Sub-mission forge/ — the field outer loop."
    status: pending
  - id: sub-plugin
    content: "Sub-mission plugin/ — SUITE DONE. plugin.feature (manifest, workspace-init, registry init-WRITE). IMPL pending. Frozen (7ab8c98)."
    status: completed
  - id: sdd-init-skill
    content: "NEW — SDD `init` skill for workspace setup (.gitattributes merge=union, symlinks). Net-new, likely follow-up CR."
    status: pending
  - id: sub-create-governance
    content: "DEFERRED (Tier 4, net-new R1). Sub-mission create-governance — author a governance with metadata + compose mode."
    status: pending
  - id: sub-marketplace
    content: "DEFERRED (Tier 4, net-new R2+R3). Sub-mission marketplace — plugin artifact-type declaration + discovery."
    status: pending
  - id: sub-governances
    content: "Tier 1 — DONE. Built all 10 governance bars: 5 actor (oracle/builder/architect) + 4 fixed-universal + plugin-contract."
    status: completed
  - id: combat-log-location
    content: "DESIGN — SETTLED. Combat log stays <cr-ref>.log.jsonl sibling; ledger.jsonl for gate+strategy. Fixed gateway count bug."
    status: completed
  - id: combat-log-contract
    content: "DESIGN — DONE. Contract landed: safe-to-publish floor, per-entry handle/ts, halt kind, flush rule, efficiency split."
    status: completed
  - id: combat-log-timing-concurrency
    content: "DESIGN — DONE. Gate-line enforcement built (check-spec-state.mts). Recurrence=distinct-CRs in scanner. Seq collision doctrine-safe."
    status: completed
  - id: gateway-and-skill-surface-reshape
    content: "DESIGN/IMPL — DONE. Gateway loads route skill in-session; start-mission entry; operator->conductor/automaton rename."
    status: completed
  - id: core-agents
    content: "Deliver — cross-cutting agents. DONE: sdd-spec-judge, sdd-implementer, Scanner (doctrine-loop), Warden (formation-loop), governance-resolution.mts. PENDING: automaton, nested-project anchor union."
    status: in_progress
  - id: impl-judge-independence
    content: "ADR-0016 — DONE. Impl-judge layered verification: re-derive oracle, leash-scoped exercise, producer-green=pre-filter."
    status: completed
  - id: artifact-type-model
    content: "Sub-mission — DONE. Universal squad key, squads[] registry, convention-first resolution, artifact-types.toml tiebreaker."
    status: completed
  - id: dogfood-readiness
    content: "DONE. Full CR-wide explore ran through sdd-new skills. Spec gate passed (24 .feature frozen, ledger gate line)."
    status: completed
  - id: root-frontmatter
    content: "DONE. ADR-0017 frontmatter schema redesign: collapsed to status + project-path. 8 commits landed."
    status: completed
  - id: spec-gate
    content: "Spec gate Draft->Approved — DONE (7ab8c98, ratified by unional). All 24 .feature frozen, ledger gate line written."
    status: completed
  - id: assemble-plugin
    content: "Deliver — assemble plugins/sdd-new as real plugin: manifest, governances-as-skills, agents/, registry role-map."
    status: pending
  - id: self-host
    content: "Deliver — re-run explore + spec gate through sdd-new to confirm bootstrap closes."
    status: pending
  - id: handoff
    content: "Handoff — land as branch -> PR. Keep combat log. Do NOT delete plan until done/merged AND doctrine-distilled."
    status: pending
isProject: false
---

# Plan — github-34: SDD project spec + behavior suite to the spec gate

> Mission plan (portable handoff brief). Tracked (NOT gitignored), per-worktree.
> CR: [github-34](https://github.com/cyberuni/cyber-skills/issues/34) — redo the SDD spec +
> behavior suite as **one durable project spec** under `.agents/specs/sdd`, organized into
> files and folders, ready to approve at the spec gate, then build the implementation.

## What we are doing

CR #34 carried through the **new SDD Mission Loop** as a **self-hosting bootstrap**
(dogfooding the model on its own spec tree, `.agents/specs/sdd/`). Because the new
spec-producer/spec-judge don't exist yet, we **hand-run explore in the main loop**, building
the new delegates as we go.

The work is organized in **two levels of grill**:

1. **Macro grill (level 1) — DONE.** A holistic pass over `design/` checking the direction is
  correct and nothing big is missing. It produced 4 coherence fixes and surfaced 4 model
   refinements (now the `model-refinements` todo).
2. **Vertical sub-missions (level 2) — the live work.** Go through the capabilities **one at a
  time, vertically**, each as an individual sub-mission with the rhythm below.

## NEXT — resume here (read this first)

> **Session update (2026-06-29, later) — `core-agents` advanced: Scanner + Warden LANDED.** The
> doctrine Scanner shipped earlier (`4cabdfd` doctrine-loop skill + `sdd-scanner` agent;
> `sdd-implementer` impl-judge `39c4e64`). This session built the **formation Warden** —
> `formation-loop` skill + `sdd-warden` agent in `plugins/sdd-new`, to the frozen
> `formation.feature` (`40f7818`). Also **completed the Director→Oracle rename** that `ef0b7fa`
> left half-done in `governance-resolution.mts` + its test (`director-spec` → `oracle-spec`,
> legacy migrate-on-read field), which had reds `pnpm verify:specs-new` on the `oracle-spec`
> registry key (`6b5dc0e`). `verify:specs-new` green; full turbo test green via pre-commit.
> **STILL PENDING in `core-agents`:** the headless **`automaton`** fallback agent + the
> **nested-project anchor union** in `governance-resolution.mts` (MVP did single project + plugin
> + sdd; `resolveBar` already orders project candidates inner-first).

> **Session update (2026-06-29) — combat-log focus CLOSED; reconciled-forward.** The
> `combat-log-contract` and `combat-log-timing-concurrency` todos both LANDED in git (contract:
> `8df3353` `1669e7d` `1724ba1` `f48f0f5` `bf4e7d0` `9c34399`; write-timing enforcement: `bc28563`)
> but their statuses still read `pending` — flipped both to `completed`. The contract's
> safe-to-publish floor + per-entry `handle`/`ts` + `halt` kind + flush rule + efficiency split are
> all in `combat-log-governance`; the gate-line floor is enforced in `check-spec-state.mts`;
> recurrence-by-distinct-CR is in `doctrine/scanner`. STILL OWED (separate CRs, not this focus): the
> repo-level process spec `<repo-root>/.agents/spec` (artifact does not exist yet), CR↔plan
> cardinality (open design), reader-side suite coverage (waits on doctrine/forge sub-mission suites),
> the shared-live-file edge guard (low priority). Process-vs-workflow positioning landed earlier
> (`b88b1f3`, `1cd301b`); memory `project_sdd_combat_log_contract` + `project_sdd_process_vs_workflow`.

**▶ MIGRATION CRITICAL PATH (the live build) — resumes below.**

> **Session update (2026-06-28, late).** The **Explore-phase subset of `core-agents` LANDED** plus
> an **impl-judge independence refinement (ADR-0016)**. Two plans drove it:
> `~/.claude/plans/focus-on-the-pieces-crispy-kettle.md`. Commits on `next`: `4a86e4e` `7398ede`
> `bf51266` `0eb3a0c` `dcb72a7` `83243ee` `fd7c51b` (Explore subset); `b4eadb7` `d0e4f81` `ad8b90b`
> `e5344f2` (ADR-0016). `pnpm verify` green (13/13). Earlier reshape (`5af5be7` `13bbe4a` `1bdf8bb`
> `fa8a00d` `bf7d536` `7fd8b40`) + `combat-log-location` are settled below.

> **Session update (2026-06-28, late evening) — the artifact-type model sub-mission LANDED.**
> Universal squad key + **squads[] registry (shape D)** + convention-first per-file resolution +
> optional **`.agents/sdd/artifact-types.toml`** tiebreaker + **dropped** the root `artifact-types`
> frontmatter field + the **`domain*→artifact-type` naming sweep**. Commits on `next`: `ea20694`
> `9f5d1a9` `0c77bb4` `f3a724c` `3837f9b` `debc7f8` `91fae26` `77a8f8f` `f1fa716` `6022837`.
> `pnpm verify` green (13/13). Plan `~/.claude/plans/a-file-s-artifact-type-is-floofy-quilt.md`;
> memory `project_sdd_artifact_type_model`. The cold `sdd:sdd-spec-judge` is **registered and
> spawnable — the prior restart blocker is CLEARED**; a scoped dogfood over `mission/conductor`
> ran end-to-end (`6022837` fixed its one finding).

> **Session update (2026-06-28) — `root-frontmatter` DONE, and it became a FRONTMATTER SCHEMA
> REDESIGN.** ADR-0017: frontmatter is the router's upfront index → the schema collapses to
> **`status` + `project-path`**. Dropped `aligned` (derive-don't-store: contract-sync judged, impl-sync
> = the impl gate's suite run, per-node = `@frozen` scan, in-flux = `.plan.md` todos),
> `spec-layout.location` (derivable from `project-path`), `placement-map` (useless to a frontmatter
> scan), the run-level leash block (session-local → ledger/plan). The organization strategy now lives in
> the **body placement map**. 8 commits; `pnpm verify` green. Root sdd spec.md + aces are now legal
> `draft`s on the new schema. Memory: `project_sdd_frontmatter_router_index`.

**▶ NEXT ACTION — the migration critical path resumes at `core-agents` remainder** (Deliver / outer
loops): the `sdd-implementer` (impl-judge) agent built to the ADR-0016 layered model, the doctrine
Scanner, the formation Warden, the headless `automaton`, and the nested-project anchor union in
`governance-resolution.mts`. OR run a **scoped dogfood** now: the cold `sdd:sdd-spec-judge` is
registered + spawnable and the root is a legal draft, so a single capability (e.g. `gateway/` or
`authoring/spec-producer`) can run `start-mission` (inline producer) → cold judge → the three `.mts`
gates from Bash. A FULL CR-wide explore still waits on `acceptance/` + sub-corpus/formation/doctrine/
plugin specs.

**THEN — widen the dogfood / fill gaps:**

0. **Pre-existing conductor coverage gap** (surfaced by the dogfood, OUT of the artifact-type CR's
   scope): `mission/conductor`'s in-flight hard-floor behaviors (Clearance / Compatibility /
   Conflict + detail-adjustment) are in prose but have **no scenarios** → the cold judge fails
   Oracle+Builder. Fill them in `conductor.feature` if that unit must pass its gate.
2. **Then a SCOPED dogfood is viable now** without the rest of the tree: pick one already-specced
   capability (e.g. `authoring/spec-producer` or `gateway/`), load `sdd:start-mission`, author the
   inline producer, and run the cold `sdd:sdd-spec-judge` over its `spec.md` + `.feature`. Drive the
   deterministic gates from Bash: `node plugins/sdd-new/skills/validate-spec/scripts/
   governance-resolution.mts --root . --artifact-type <type>`, `check-spec-state.mts --root
   .agents/specs`, `check-feature.mts --root .agents/specs`. A FULL CR-wide explore-to-spec-gate is
   NOT ready — `acceptance/` e2e suite unbuilt and `sub-corpus`/`formation`/`doctrine`/`plugin`
   capability specs still pending.

**What's already usable (no restart needed):** the `sdd:start-mission` / `sdd:validate-spec` skills,
all producer + `(actor,gate)` bar governances, and the three `.mts` helpers all load/run today; the
inline producers and the generic build-to-learn builder (`general-purpose` + `impl-producer-
governance`) need no registration. **Only the cold judge needs the reload.**

**Resume the migration build (Tier-1 order) — `core-agents` REMAINDER (Deliver / outer loops):**

1. **`core-agents` remainder.** The Explore subset is DONE (see the `core-agents` todo). **Still
   pending:** the `sdd-implementer` (impl-judge) agent — now build it to the **ADR-0016 layered
   model** (re-derive the oracle from the frozen `.feature`; producer green = pre-filter; leash-
   scoped behavioral-exercise backstop; judge ≠ producer model) per `mission/deliver/impl-judge/`;
   the doctrine Scanner; the formation Warden; the headless `automaton` fallback. Plus
   **nested-project anchor union** in `governance-resolution.mts` (MVP did single project + plugin +
   sdd; `resolveBar` already orders project candidates inner-first). The baseline agents in
   `plugins/sdd/` are reference only.
   - **Registry:** already migrated to Model-B this session (`7398ede`) — `.agents/universal-plugin.json`
     now uses `solution-producer` + the `(actor,gate)` governances map; `governance-resolution.mts`
     keeps migrate-on-read for any legacy registry.
   - **Squad shape — DONE (`9f5d1a9`).** `governance-resolution.mts` carried from the flat
     `domains/roles/governances` entry to the `squads[]` shape (specialists-and-squads.md "Registry
     SHAPE", landed in `ea20694`): an entry holds `squads[]`, each serving a SET of artifact-types
     with one chain. `matchPlugin` → `matchSquad` (returns a `SquadMatch` = plugin + squad);
     `resolveBar`/`resolveAgent`/`resolveRole`/`buildLoadPlan` thread the match; `validateRegistry`
     flags a type in two squads of one plugin and across two plugins; migrate-on-read folds a legacy
     flat entry into one squad. Live registry already on squads. `pnpm verify` green.
   - **Validate:** `pnpm verify:specs-new` + `audit validate` per skill; `pnpm verify` before push.

2. **Migration-first order (authoritative): see `## Migration ordering`.** Existing-baseline
   capabilities first (`sub-mission` → `sub-deliver` → `sub-handoff` → `sub-gateway` →
   `sub-governances` → `core-agents` → `sub-corpus` → `sub-formation` → `sub-doctrine` →
   `sub-plugin`), then assembly/bootstrap (`root-frontmatter` → `spec-gate` → `assemble-plugin` →
   `self-host`), then handoff. **DEFERRED** (net-new, carve to follow-up CRs, NOT on the migration
   path): `sub-intake` (+ `intake-adapter-store`), `sub-campaign`, `sub-forge`,
   `sub-create-governance`, `sub-marketplace`.

3. **`intake-adapter-store` decision — RESOLVED: deferred.** Carve the adapter directive + local
   CR store to a follow-up CR; intake itself is net-new (no baseline skill) and its real behaviors
   (escape hatch, inject channel) are enacted by the conductor/gateway, so the whole `sub-intake`
   moves behind the migration set. The `<!-- open: -->` marker in `intake/README.md` stays until
   that follow-up CR — it only blocks the **intake** node's gate, not the migration of the
   existing capabilities.

4. **Findings the commits don't show** (full record in `## D-F`):
   - The model now has a **spec-types taxonomy** (descriptive / reference / behavioral); only
     **behavioral** nodes carry `## Use Cases`. This **resolved** the F3 Use Cases gap and is the
     pattern every remaining sub-mission applies.
   - `spec-governance` renamed → **`spec-format`**; `suite-style.md` moved →
     `authoring/suite-format/`; both are now reference-artifact governances (a `spec-type:
     reference` node + an sdd-new impl).
   - Minor opens from the spec-producer-governance grill: a shared grilling rule across producers
     (impl-producer also reconciles); the 3 self-align lenses aren't yet explicit
     scope/coverage/structure checks.

5. **The "plan" terminology collision — DESIGNED & LANDED (2026-06-27).** The old
   `plan.md`+`tasks.md` split two ways by scope+lifetime: the **functional spec** (`plan.md` —
   approach, structures, chosen design + rejected alternatives) is now the per-unit **solution**
   `<unit>.solution.md` (durable, beside the unit's spec + suite); the **task DAG** (`tasks.md`)
   is the execution `.plan.md` `todos`, **operator**-filled (per-CR, transient). The `plan-producer`
   role → **`solution-producer`** (ungated, no judge; impl gate validates transitively). The
   solution is OPTIONAL (only when a unit has a real design fork — never restates code or suite),
   boundary-aligned not coverage-aligned, not frozen. Landed in `design/` (provenance-model,
   specialists-and-squads, spec-structure §"third facet", loops, mission/README,
   mission/deliver, plugin, intake), `TERMINOLOGY.md`, and the fold-marker removed. REMAINING =
   **impl only** (in `sub-mission` / `sub-deliver`): build `solution-producer-governance` in
   `plugins/sdd-new` + the per-unit spec/suite for the role. (Memory:
   `project_sdd_plan_terminology_collision`.)

6. **Do not relearn** — the working method and settled calls live in `## Resolved decisions`:
   vertical sub-missions; **prose → per-unit suites (one `.feature` per skill) → impl in
   `plugins/sdd-new`** (build-to-learn during explore); `plugins/sdd` is an **untouched baseline**;
   reconcile to the **correct answer, not a vote**; spec the behavior, never hand-edit the impl;
   commit per unit; CR = unit of change-intent.

## Migration ordering (reprioritized 2026-06-27)

The goal driving the remaining sub-missions is the **`sdd` → `sdd-new` migration**: get
`plugins/sdd-new` to a real, shippable plugin that supersedes `plugins/sdd`. So the sub-missions
are ordered by **does this capability have a baseline `sdd` impl to port?** — existing first,
net-new deferred. Same per-capability spec-first rhythm throughout (prose → per-unit suites →
impl); only the **order** changed.

**Tier 1 — migration core (existing baseline, on the critical path):**

1. `sub-authoring` — ✅ DONE.
2. `sub-mission` — ✅ DONE (operator + solution-producer units specced + suited;
   `solution-producer-governance` built; spawned agents deferred to `core-agents`).
3. `sub-deliver` — ✅ DONE (impl-producer + impl-judge units specced + suited;
   `impl-producer-governance` built, corrected to the spawned-builder model).
4. `sub-handoff` — ✅ DONE (single behavioral unit + handoff.feature; no separate impl —
   conductor-enacted, realized by the operator agent in core-agents).
5. `sub-gateway` — ✅ DONE (single behavioral unit + gateway.feature; thin-relay `sdd` skill built,
   corrected to spawn-nothing-by-default).
6. `sub-governances` — ✅ DONE. Built all 10 governance bars in `sdd-new` as reference nodes +
   skills: 5 Model-B actor bars (oracle-spec, builder-spec, builder-impl, architect-spec,
   architect-impl), 4 fixed-universal (lifecycle, ownership, combat-log, gate-validation — no
   leash), and single-owner plugin-contract. autonomy stays descriptive + baked-in (no node/skill).
7. `core-agents` — **← next.** The spawned workers (cold `sdd-spec-judge` + `sdd-implementer`,
   impl-producer builder, doctrine Scanner, formation Warden; `sdd-operator` as headless fallback) +
   the `.mts` helpers (`check-spec-state` done; `governance-resolution` pending).

**Tier 2 — existing supporting capabilities:**

8. `sub-corpus` — dedupe-specs, split-spec (baseline exists; NO spec-graph/DAG).
9. `sub-formation` — formation-loop + the Warden delegate.
10. `sub-doctrine` — doctrine-loop + the Scanner delegate + plan-retirement `.mts`.
11. `sub-plugin` — SDD's plugin nature, registry, workspace init.

**Tier 3 — assembly & bootstrap close (existing):**

12. `root-frontmatter` → 13. `spec-gate` (hand-run) → 14. `assemble-plugin` (diff vs `plugins/sdd`)
→ 15. `self-host` → 16. `handoff` (branch → PR).

**Tier 4 — DEFERRED (net-new, carve to follow-up CRs; NOT on the migration path):**

- `sub-intake` (+ `intake-adapter-store`) — no baseline skill; escape hatch + inject are enacted
  by the conductor/gateway. The `intake/README.md` `<!-- open: -->` marker stays for the follow-up
  CR; it blocks only the intake node's gate, not the migration.
- `sub-campaign`, `sub-forge` — net-new outer loops (no baseline).
- `sub-create-governance` (R1), `sub-marketplace` (R2+R3) — net-new capabilities.

## The Mission Loop — refined this session

- **Step 1 — intake.** Get the CR into the system **and create the plan from a basic
template** (this `.plan.md`). The plan is a step-1 artifact, not something authoring invents
later.
- **Step 2 — explore.** Grill the **plan + spec + suite** (the suite when it exists) into a
concrete diff, **and build the implementation** (build-to-learn, fresh in `plugins/sdd-new`)
— implementation is **not** deferred to deliver; `loops.md` already says impl happens in
both phases, the freeze is the boundary. Ends at the spec gate.
- **Step 3 — deliver.** Build-to-keep against the frozen suite; here it mostly means the
cross-cutting agents, plugin assembly, and the self-hosting check (most per-capability impl
was already built in explore).
- **Step 4 — handoff.** Branch → PR.

## The per-capability sub-mission rhythm

Each capability is its own sub-mission, run **vertically**:

1. **Prose** — tighten the capability `README.md`: What / Why / decisions current, every use
  case has a scenario home, resolve the `<!-- open: -->` markers it touches.
2. **Per-unit suites** — author one `.feature` **per unit of code (skill)**, not one per
  folder. A producer suite never tests a gate; a gate suite never tests grilling. Cross-
   capability outcomes go to `acceptance/`, never the capability folder.
3. **Impl** — build the matching skills/governances/agents fresh in `plugins/sdd-new`
  (build-to-learn; implementing surfaces suite gaps and stale-baseline bugs). Pre-gate it is
   provisional; the freeze hardens it to build-to-keep.

`authoring/` is the worked example: prose (reconcile rule + the per-unit split note),
`spec-producer.feature` (10) + `validate-spec.feature` (19), and
`plugins/sdd-new/skills/spec-producer-governance/`. Building the impl already caught a
baseline bug (the old spec-producer self-aligns to 2 lenses, not 3).

## Per-unit suite organization (the split rule)

The unit of test is the **unit of code (a skill)**, and `@frozen` is per `.feature` file:

- **One `.feature` per skill/unit**, named for the unit; a capability hosting several skills
holds several suites. (Replaces the older "one `.feature` per capability folder" — see
`model-refinements`, which lands this in `spec-structure.md` + `authoring/suite-format/`.)
- **No mixing units in one file** — a producer suite testing gates is a category error.
- **Split further** only when there is a unit reason to; the freeze grain is per file, so two
units in two files freeze independently.
- **e2e (cross-capability)** scenarios live in `acceptance/`, split by theme (the A–F seed):
`cr-lifecycle` (A), `escalation-floor` (B), `resolve-squad` (C), `freeze` (D),
`gate-verdicts` (E), `handoff` (F).

## Model refinements pending (`model-refinements` todo)

The macro grill surfaced four model points to land in `design/` before/with the sub-missions:

- **Step 1 creates the plan.** `loops.md` / `intake/` / `mission/` must say intake scaffolds
the `.plan.md` from a basic template; the plan-producer then fills it during explore.
- **Step 2 grills plan + spec + suite, and builds impl.** Make explicit that explore builds
implementation (build-to-learn), not only spec + suite.
- **Per-unit suites.** Generalize the authoring decision into `spec-structure.md` +
`authoring/suite-format/`: the unit of test is the skill, one `.feature` per unit.
- **aUnit-of-work vocabulary.** `unit of work` = the **co-committable** unit (commit-
discipline); the **CR** is the **unit of change-intent** (intake fixed; sweep `loops.md` /
`mission/` for misuse). SDD requires no TDD ordering inside a commit.

## New capabilities — governance authoring + marketplace (added 2026-06-26)

- **create-governance skill (R1).** User-facing aid to author a governance: choose artifact-type
  - actor + face, scaffold `metadata:{artifact-type,actor,face}` + compose mode (union default,
  opt-in replace), place at `<project>/.agents/governances/`, validate the schema. A new SDD skill
  (sibling to `create-spec`/`validate-spec`); consumes the A model.
- **Marketplace registration & artifact-type discovery (R2+R3), SDD-owned, NOT forge.**
  - **R2 — declare.** On publish, a plugin **declares the artifact-types it serves**.
  - **R3 — discover + install.** A skill **registers a plugin to the marketplace**; the
  **website shows which plugins are available per artifact-type**. Builds on the universal-
  plugin marketplace + `publish-universal-plugin` + the awesome-list website.
  - **Two layers:** marketplace = global catalog (website); registry
  (`.agents/universal-plugin.json`) = per-project resolution. Flow: marketplace → install →
  registry. Home: `plugin/` + `apps/website/`.

## A — locked: actor-governance resolution (from the macro grill)

- **Bars:** oracle / builder / architect, each with **two faces** (forward=producer self-align,
backward=judge), split so a role loads only its face. Strategist via the doctrine loop, no
per-spec governance.
- **Match key:** frontmatter `metadata:{artifact-type, actor, face}`; SDD matches on these (names
need not be unique).
- **Two tiers:** fixed-universal (ownership, lifecycle, spec-format, gate-validation — ship with
sdd) vs resolved-actor (per artifact-type/face).
- **Discovery is SDD-owned** — not harness precedence, not `${CLAUDE_PLUGIN_ROOT}`. The deciding
factor is *can SDD address the file?* Plugin governances are version-routed `user-invocable:false`
skills listed in `.agents/universal-plugin.json`; project/user governances are addressable files
the operator reads directly; the mechanical resolution + composition is a deterministic `.mts`
helper. sdd defaults are the sdd plugin's own governances, lowest precedence.
- **Composition:** **union** default; **most-specific wins on conflict** (project > plugin >
default); **opt-in `replace`**; driven by the `governance-composition` governance.
- **Lens sets** (sdd-default squad, overridable): spec gate `{oracle,builder,architect}`;
impl gate `{builder,architect}`; plan `{architect}` (ungated). Producer self-aligns to exactly the
bars its judge grades.
- **Packaging:** the spec is **never inside a distributable plugin dir**. Spec →
`<repo>/.agents/specs/<project>/`. Plugins ship `skills/` (governances-as-skills) + `agents/`.
Registry + plans are consumer/runtime-side at `<repo>/.agents/`.

## Spec gate (Draft → Approved) — hand-run

Run the spec gate over the project spec **by hand in the main loop** (we cannot delegate to
the new judge until it is built):

- Judge each unit suite against `authoring/suite-format/README.md` (untagged scenarios boolean; `@rubric`
structurally well-formed) and the authoring criteria in `authoring/README.md`.
- Never advance with judge failures, open markers, or a misaligned suite.
- On **approve**: freeze each touched `.feature` via its `@frozen` tag; record the verdict as a
durable per-CR `gate` ledger line; set `status: approved`. `spec.md` stays aligned, never frozen.

## Resolved decisions

- **D-A — hand-author to bootstrap.** Hand-run grill → diff in the main loop because there is no
spec-producer/spec-judge to delegate to until we build them.
- **D-B — build fresh under `plugins/sdd-new/`, keep `plugins/sdd/` as reference.** The old impl
stays untouched as a baseline; the new impl is authored from the spec.
- **D-C — build impl during explore (build-to-learn).** Per the Mission Loop refinement,
implementation interleaves with suite-building per capability; it is not deferred wholesale to
deliver. Pre-gate impl is provisional; the freeze hardens it.
- **D-D — per-unit suites.** One `.feature` per unit of code (skill); a producer suite never tests
gates. Generalized into the design via `model-refinements`.
- **D-E — unit-of-work vocabulary.** `unit of work` = co-committable unit; CR = unit of
change-intent. No TDD ordering required inside a commit.
- **D-F — spec-types taxonomy + spec-format (this session).** Every spec node is **descriptive**
(no subject/suite; no marker), **reference artifact** (`spec-type: reference`; `## Subject`, no
`.feature` — verified through a consumer's suite), or **behavioral artifact**
(`spec-type: behavioral`; `## Use Cases` + `.feature`; everyday word "unit spec"). Declared not
inferred; classification not lifecycle. `spec-governance` renamed → `**spec-format**` (the odd
alias; `governance-resolution.md` already called the concept spec-format). spec-format is the
worked **reference artifact**: node `authoring/spec-format/`, impl
`plugins/sdd-new/skills/spec-format-governance/`. Concern split: spec-format owns the required
`## Use Cases` section + `spec.md` enrichment; the `.feature` form + scenario ordering → `suite-style`;
granularity → `spec-structure`. FOLLOW-UPS: (1) DONE — built the `suite-format` governance
(renamed from `suite-style`; pairs with `spec-format`): moved `design/suite-style.md` →
`authoring/suite-format/` reference node + impl `plugins/sdd-new/skills/suite-format-governance/`;
owns Gherkin form + `@rubric` + scenario ordering + the `@frozen` marker. RESOLVED (keep-as-is):
the freeze/unfreeze *model* (triggers, gate, iteration economy) stays in `lifecycle-model.md`;
suite-format owns only the `@frozen` marker convention + the suite-edit rule. Clean concern
split — freeze-as-state-transition is a lifecycle concern.
(2) DONE — `plugins/sdd-new/skills/validate-spec/scripts/check-spec-state.mts` (+ `.test.mts`, 24
tests) carries the per-node `spec-type` reconcile (reference ⇒ `## Subject` + no `.feature`;
behavioral ⇒ `## Use Cases`; descriptive no-op) plus the root lifecycle tuple (status/aligned/
markers/approval — dropped the old type/subtasks/composition + the descriptive-root `.feature`
requirement). Runs via `pnpm verify:specs-new` (manual, like the baseline `verify:specs`; not in
CI). Validates the live `.agents/specs` tree green. OPEN: the full `validate-spec` skill (SKILL.md)
  - the project-spec gate-legality (what "approved" requires of the distributed suite) is the larger
  remaining piece; `check-feature.mts` not yet ported either.

- **D-G — main session is the conductor (operator folded in-session).** The operator is **not** a
spawned subagent by default — the **main (user) session runs the operator role** (the
**conductor**). The grill is heavy human interaction, so spec-producing belongs where the user
channel lives: **spec-producer + solution-producer run inline in the main session**;
**impl-producer + both judges spawn at depth 1 from the main session** (impl-producer is
mechanical, spawned in BOTH phases — build-to-learn vs non-frozen, build-to-keep vs frozen; judges
cold for grader independence). This preserves grader independence on **every** harness and
collapses the spawn tree `caller→operator→judge` (depth 2) → `main→judge` (depth 1) — it promotes
the old `harness-spawning.md` "flat-harness fallback" to the default and drops its
"forfeits-independence" caveat. **Spec gate** = the main session writes spec + solution + feature,
spawns a **cold spec-judge that reads spec.md + .feature ONLY** (solution out of view, ungated,
never frozen). **Positional authority** is trivial — the conductor *is* the in-session ratifier.
**Plugin surfaces are role-dependent**: spec/solution-producer **persona-loaded in-session**,
impl-producer + judges **spawnable subagents**. The **spawnable `sdd-operator` is kept as the
headless / fan-out fallback** (unattended scheduler, multi-CR fan-out on a depth-2 harness), not
the single-mission default. SWEPT this session across `design/` (8 files), capability specs
(mission/gateway/intake/deliver/acceptance), and the entry skills + spec-producer-governance
(specs + sdd-new impls); `verify:specs-new` green. Approved plan:
`~/.claude/plans/write-it-up-as-federated-wreath.md`. OPEN (deferred, independent of this pivot):
the "model-tuned producer" vs "specialist/tuned producer" terminology; the exact provenance marker
for a spawned SDD-default impl-producer builder (finalize in `sub-mission`/`sub-deliver`).
(Memory: `project_sdd_conductor_in_session`.)

## Step 3/4 — deliver & handoff

- **core-agents:** the cross-cutting agents (operator, cold spec-judge + impl-judge, Scanner,
Warden) + the `.mts` helpers, built to the corrected lens sets.
- **assemble-plugin:** `.plugin/plugin.json`, governances-as-skills, `agents/`, registry; diff vs
`plugins/sdd/`. **W-1 plan-retirement `.mts` skill** (doctrine-owned, glob
`.agents/plans/*.plan.md`, delete only when source = done/merged AND distilled; idempotent).
  - **Lesson (github-35 close-out):** Hand-run bootstrap missions emit no combat log, so the Scanner has nothing to distill — the doctrine loop / retirement-sweep (W-1) must define a **manual distill+retire fallback** for combat-log-less plans (github-35 was retired this way: lesson captured in-thread, plan deleted directly, no Scanner pass).
- **self-host:** re-run explore + the spec gate through sdd-new's producer + judge to confirm the
bootstrap closes.
- **handoff:** branch → PR; keep the combat log in the PR. **Do NOT delete this plan** until
github-34 is done/merged and doctrine-distilled.

## Phase 0 conclusion (cleanup — COMPLETE, applied 2026-06-26 on `next`)

The post-holistic-review cleanup of `artifacts/specs/sdd/` is done. **Rulings:** removed
`blocked-by` + the spec-graph apparatus (Q-1); kept `spec|impl` gate naming (Q-2); kept
`produced-by` (Q-3). Schema edits: removed `subtasks`/`priority`, `type` → `artifact-types`
(per-file resolution). Acceptance D1 rewritten to per-file `@frozen`; B7 halt-log relocated to
the mission unit. Plans are **tracked, not gitignored**; distill decoupled from delete.
Mechanical fixes T-1..T-5 applied; root `spec.md` narrative written; `DESIGN-NOTES.md` flagged
superseded. Commits `b519821`, `ab3e9c0`, `1e2ccac`, `65dd3d7`, `b8c916a`, `bf7443f`,
`d42b7f4`, `b2a0721`, `ca51c30`.