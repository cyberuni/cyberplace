---
name: "github-34: SDD project spec + behavior suite to the spec gate"
overview: "Carry CR #34 through the new SDD Mission Loop as a self-hosting bootstrap. The macro grill (holistic direction check over design/) is done. The live work is a series of per-capability VERTICAL SUB-MISSIONS: for each capability, tighten the prose, author per-unit .feature suites (one suite per skill/unit), and build the matching implementation fresh under plugins/sdd-new (build-to-learn, during explore). Then root frontmatter, the hand-run spec gate, the cross-cutting agents, plugin assembly, and the self-hosting check. plugins/sdd stays an untouched reference baseline."
cr: github-34
cr-url: https://github.com/cyberuni/cyber-skills/issues/34
todos:
  - id: cleanup-phase
    content: "Phase 0 — spec-tree post-review cleanup (schema, acceptance seed, tracked plans, mechanical fixes). COMPLETE — see conclusion."
    status: completed
  - id: macro-grill
    content: "Explore, level 1 — MACRO grill: holistic pass over design/ for correct direction + nothing big missing. DONE (64b8c01, 745ae42): 4 coherence fixes (Compatibility floor in spec.md; judge lens split; type->artifact-type; gateway loads NO governance — corrected after a wrong-direction first pass). Surfaced 4 model refinements now pending in model-refinements. Reconcile rule learned: reason to the CORRECT answer from design intent, not a reference count."
    status: completed
  - id: model-refinements
    content: "Explore, level 1 — land the macro-grill's model refinements in design/: (a) Mission Loop step 1 (intake) CREATES the plan from a basic template; (b) step 2 (explore) grills the PLAN + spec + suite (when it exists) and builds impl (build-to-learn) — implementation is not deferred to deliver; (c) per-UNIT suites — one .feature per skill/unit, producer!=gate (generalize from authoring into unit-and-organization.md + suite-style.md, replacing 'one .feature per capability folder'); (d) unit-of-work = co-committable unit (commit-discipline), CR = unit of change-intent (intake done; sweep loops.md/mission for 'unit of work' misuse); (e) USE CASES are PER-TYPE — LANDED via the spec-types taxonomy (commit 369318c): every spec node is descriptive (no subject/suite; no marker), reference artifact (spec-type: reference; ## Subject, no .feature), or behavioral artifact (spec-type: behavioral; ## Use Cases + .feature). Only behavioral nodes carry ## Use Cases; descriptive indexes and reference artifacts carry none. spec-type declared not inferred; classification not lifecycle (lifecycle stays root-spec.md-only). Landed in unit-and-organization.md (## Spec types), spec.md, suite-style.md, lifecycle-model.md, abstraction-stack.md, authoring/README.md. STILL PENDING from (a)-(d): intake-creates-plan, explore-builds-impl, unit-of-work-vocabulary sweep across loops.md/intake/mission/. Touch loops.md, intake/, mission/."
    status: in_progress
  - id: sub-authoring
    content: "Sub-mission authoring/ — prose (reconcile rule + per-unit split note), per-unit suites (spec-producer.feature 10 + validate-spec.feature 19), impl spec-producer-governance in sdd-new. RESTRUCTURED to overview + per-unit specs: authoring/README.md is now a no-.feature OVERVIEW/index; each unit lives in its own folder with its own README (## Use Cases mapping to its suite) + .feature — authoring/spec-producer/ and authoring/validate-spec/. This CLOSES the Use Cases gap (F3) for authoring: use cases are per-UNIT, the overview carries none (a no-.feature node is an index). Gate-digest behavior folded into validate-spec/README. ALSO built this session: the two fixed-universal governances as reference-artifact nodes under authoring/ — spec-format (78d9d8c) + suite-format (4f68659), each a spec-type:reference node + a self-contained impl in plugins/sdd-new/skills/ (spec-governance renamed -> spec-format); see D-F. NOT DONE: suites+impls for create-spec, revise-spec (the two user-facing entry skills — overview lists them as pending units); validate-spec SKILL.md impl in sdd-new (only its check-spec-state.mts helper exists)."
    status: in_progress
  - id: sub-intake
    content: "Sub-mission intake/ — extract the inline README scenarios into per-unit .feature suites (channels/sources, escape hatch, inject channel); build impls in sdd-new. Carries the intake-adapter-store decision."
    status: pending
  - id: intake-adapter-store
    content: "DECISION + scope — the intake open marker (intake/README.md): the thin adapter directive (source selection + per-source convention + multi-source orchestration) and the local CR store (on-disk CR body + open->accepted->done; candidate beads) are flagged NEW WORK needing their own spec+suite. Decide: author their intake scenarios now (grows #34) OR carve to a follow-up CR and drop the marker. BLOCKS the spec gate until resolved (open markers block the gate)."
    status: pending
  - id: sub-gateway
    content: "Sub-mission gateway/ — extract the inline README scenarios to gateway.feature; build the thin-relay sdd gateway skill in sdd-new (NO governance load — the macro-grill ruling)."
    status: pending
  - id: sub-mission
    content: "Sub-mission mission/ — the operator (sdd-operator): resolution (registry READ), production chain, impl gate, in-flight service, stop-provenance. Prose -> per-unit suites -> operator agent in sdd-new."
    status: pending
  - id: sub-deliver
    content: "Sub-mission mission/deliver/ — build-to-keep behaviors + impl-producer-governance; per-unit suites -> impl in sdd-new."
    status: pending
  - id: sub-handoff
    content: "Sub-mission mission/handoff/ — delivery-shape contract, unit-of-delivery, conclusion write-back; per-unit suites -> impl."
    status: pending
  - id: sub-corpus
    content: "Sub-mission corpus/ — discovery, digest, dedupe, split, align-specs tools; per-unit suites -> impls in sdd-new (NO spec-graph/DAG)."
    status: pending
  - id: sub-campaign
    content: "Sub-mission campaign/ — the product outer loop; per-unit suites -> impl."
    status: pending
  - id: sub-formation
    content: "Sub-mission formation/ — the structure outer loop + the Warden delegate; per-unit suites -> impl."
    status: pending
  - id: sub-doctrine
    content: "Sub-mission doctrine/ — the process outer loop + the Scanner delegate + plan retirement (W-1 .mts skill); per-unit suites -> impl."
    status: pending
  - id: sub-forge
    content: "Sub-mission forge/ — the field outer loop (Consent floor, cross-installation corrections); per-unit suites -> impl."
    status: pending
  - id: sub-plugin
    content: "Sub-mission plugin/ — SDD's plugin nature: ships-as-plugin, extended-by-plugins, registry init-WRITE, workspace init (the ../.agents/plans symlink gotcha); per-unit suites -> impl."
    status: pending
  - id: sub-create-governance
    content: "Sub-mission create-governance (NEW cap, R1) — author a governance: metadata{artifact-type,actor,face} + compose mode union|replace; place at <project>/.agents/governances/; validate schema. Sibling to create-spec/validate-spec; consumes the A model. Prose -> suite -> impl."
    status: pending
  - id: sub-marketplace
    content: "Sub-mission marketplace (NEW cap, R2+R3, SDD-owned NOT forge) — a plugin declares the artifact-types it serves (R2); a register-plugin-to-marketplace skill + website shows plugins per artifact-type (R3). Two layers: marketplace=global catalog (website), registry=per-project resolution. Home: plugin/ + apps/website. Prose -> suite -> impl."
    status: pending
  - id: core-agents
    content: "Deliver — the cross-cutting agents in sdd-new (not owned by one capability): sdd-operator, cold sdd-spec-judge + sdd-implementer (impl-judge), doctrine Scanner, formation Warden; plus the deterministic .mts helpers (check-spec-state, governance-resolution). Built to the CORRECTED lens sets (spec gate {director,builder,architect}; impl gate {builder,architect}) — the baseline 2-lens skills are reference only. PROGRESS: check-spec-state.mts (new-model) DONE in plugins/sdd-new/skills/validate-spec/scripts/ (48a0c1e, 24 node:tests, typed under tsconfig.specs.json) — root tuple + per-node spec-type reconcile, validates the live tree via `pnpm verify:specs-new`. STILL PENDING: governance-resolution.mts + all the cross-cutting agents."
    status: pending
  - id: root-frontmatter
    content: "Explore — add project-spec lifecycle frontmatter to root spec.md (status: draft, artifact-types, aligned: false, strategy) per design/lifecycle-model.md; drop the ## TODO once the suites are in."
    status: pending
  - id: spec-gate
    content: "Spec gate (Draft -> Approved) — HAND-RUN in the main loop: judge the suite against suite-style.md + authoring criteria; never advance with judge failures/open markers/misaligned suite; on approve freeze touched .feature files, record per-CR gate ledger line, set status: approved."
    status: pending
  - id: assemble-plugin
    content: "Deliver — assemble plugins/sdd-new as a real plugin: .plugin/plugin.json manifest, governances-as-skills layout, agents/, registry role-map; diff against plugins/sdd to confirm intended deltas. Old-plugin retirement is a LATER CR."
    status: pending
  - id: self-host
    content: "Deliver — once sdd-new's spec-producer + spec-judge + operator exist, re-run explore + the spec gate THROUGH them over the same spec to confirm the hand-run result reproduces (the bootstrap closes)."
    status: pending
  - id: handoff
    content: "Handoff (step 4) — land as a branch -> PR (repo is PR-flow); keep the combat log in the PR. Do NOT delete this plan until github-34 is done/merged AND doctrine-distilled."
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

Invoke the `resume-mission` skill, or follow it by hand.

1. **What landed this session (the model deepened — not a new sub-mission).** See `## D-F` for
   the full decision record. In brief:
   - **`model-refinements` (e) LANDED** — the **spec-types taxonomy** (descriptive / reference /
     behavioral) is now the model (369318c). `spec-type` is declared-not-inferred, classification-
     not-lifecycle. Remaining (a)-(d) still pending: intake-creates-plan, explore-builds-impl,
     unit-of-work-vocabulary sweep across `loops.md`/`intake/`/`mission/`.
   - **Two fixed-universal governances built as reference artifacts** — `spec-format` (78d9d8c) +
     `suite-format` (4f68659): each a `spec-type: reference` node under `authoring/` plus a
     self-contained impl in `plugins/sdd-new/skills/`. `spec-governance` renamed → `spec-format`;
     `suite-style.md` moved → `authoring/suite-format/`. Freeze split: marker in suite-format,
     model stays in `lifecycle-model.md` (kept-as-is, be0b5a4).
   - **`check-spec-state.mts` (new-model)** in `plugins/sdd-new` (48a0c1e) — root tuple + per-node
     spec-type reconcile, 24 tests, validates the live tree via `pnpm verify:specs-new`.
   - **Repo hygiene** (not CR-scoped): `user-invocable` hoisted to top-level repo-wide (6dfa3f7,
     c15c134 — it was inert under `metadata:`); `typecheck:specs` (root `tsconfig.specs.json`) now
     types **all** plugin `.mts` and fixed the latent `Dirent` errors (6a2c1fa, 0b04898);
     `.agents/skills` ↔ `.claude/skills` synced, 9 empty dirs removed (c41956f).

2. **Live frontier = the per-capability vertical sub-missions.** `model-refinements` (a)-(d) is
   **upstream** and should land first. `sub-authoring` is **in progress** — its remainder is
   `create-spec`/`revise-spec` suites+impls + the `validate-spec` **SKILL.md** impl (only its
   check-spec-state helper exists). Then `sub-intake` / `sub-gateway` / `sub-mission` / … per the
   todo order, each applying the **overview + per-unit-spec** split (the worked `authoring/`
   pattern). Use Cases gap (F3) is **RESOLVED** by the taxonomy — only behavioral nodes carry
   `## Use Cases`; descriptive indexes + reference artifacts carry none.

3. **Open decision still blocking the spec gate:** `intake-adapter-store` — author the
   adapter-directive + local-CR-store scenarios now (grows #34), or carve to a follow-up CR and
   drop the `<!-- open: -->` marker. Unresolved → the open marker blocks the gate. (The F3 Use
   Cases call is now settled.)

4. **Working method (do not relearn or relitigate — see `## Resolved decisions`):** vertical
   sub-missions; rhythm **prose → per-unit suites (one `.feature` per skill) → impl in
   `plugins/sdd-new` (build-to-learn, during explore)**; `plugins/sdd` is an **untouched
   baseline**; reconcile to the **correct answer, not a vote**; spec the behavior, never
   hand-edit the impl as a shortcut; commit per unit; CR = unit of change-intent.

5. **`spec-producer-governance` grill (done this session):** deferred section structure to
   `spec-governance`, dropped the ungrounded `## Artifacts` table, baked in the grilling
   discipline + the use-case→scenario coverage rule. Minor opens: a shared grilling rule across
   producers (impl-producer also reconciles); the 3 self-align lenses aren't yet used as
   explicit scope/coverage/structure checks.

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
  `model-refinements`, which lands this in `unit-and-organization.md` + `suite-style.md`.)
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
- **Per-unit suites.** Generalize the authoring decision into `unit-and-organization.md` +
  `suite-style.md`: the unit of test is the skill, one `.feature` per unit.
- **Unit-of-work vocabulary.** `unit of work` = the **co-committable** unit (commit-
  discipline); the **CR** is the **unit of change-intent** (intake fixed; sweep `loops.md` /
  `mission/` for misuse). SDD requires no TDD ordering inside a commit.

## New capabilities — governance authoring + marketplace (added 2026-06-26)

- **create-governance skill (R1).** User-facing aid to author a governance: choose artifact-type
  + actor + face, scaffold `metadata:{artifact-type,actor,face}` + compose mode (union default,
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

- **Bars:** director / builder / architect, each with **two faces** (forward=producer self-align,
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
- **Lens sets** (sdd-default squad, overridable): spec gate `{director,builder,architect}`;
  impl gate `{builder,architect}`; plan `{architect}` (ungated). Producer self-aligns to exactly the
  bars its judge grades.
- **Packaging:** the spec is **never inside a distributable plugin dir**. Spec →
  `<repo>/.agents/specs/<project>/`. Plugins ship `skills/` (governances-as-skills) + `agents/`.
  Registry + plans are consumer/runtime-side at `<repo>/.agents/`.

## Spec gate (Draft → Approved) — hand-run

Run the spec gate over the project spec **by hand in the main loop** (we cannot delegate to
the new judge until it is built):

- Judge each unit suite against `design/suite-style.md` (untagged scenarios boolean; `@rubric`
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
  inferred; classification not lifecycle. `spec-governance` renamed → **`spec-format`** (the odd
  alias; `governance-resolution.md` already called the concept spec-format). spec-format is the
  worked **reference artifact**: node `authoring/spec-format/`, impl
  `plugins/sdd-new/skills/spec-format-governance/`. Concern split: spec-format owns the required
  `## Use Cases` section + `spec.md` enrichment; the `.feature` form + scenario ordering → `suite-style`;
  granularity → `unit-and-organization`. FOLLOW-UPS: (1) DONE — built the `suite-format` governance
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
  + the project-spec gate-legality (what "approved" requires of the distributed suite) is the larger
  remaining piece; `check-feature.mts` not yet ported either.

## Step 3/4 — deliver & handoff

- **core-agents:** the cross-cutting agents (operator, cold spec-judge + impl-judge, Scanner,
  Warden) + the `.mts` helpers, built to the corrected lens sets.
- **assemble-plugin:** `.plugin/plugin.json`, governances-as-skills, `agents/`, registry; diff vs
  `plugins/sdd/`. **W-1 plan-retirement `.mts` skill** (doctrine-owned, glob
  `.agents/plans/*.plan.md`, delete only when source = done/merged AND distilled; idempotent).
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
