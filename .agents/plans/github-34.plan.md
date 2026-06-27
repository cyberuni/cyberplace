---
name: "github-34: SDD project spec + behavior suite to the spec gate"
overview: "Carry CR #34 through the new SDD Mission Loop as a self-hosting bootstrap: the spec-tree cleanup (Phase 0) is done; the live work is the explore phase, hand-run in the main loop (no spec-producer/spec-judge to delegate to yet) — build the missing behavior suite (e2e acceptance/ + colocated unit suites), add root spec.md lifecycle frontmatter, and bring the project spec to a spec-gate approve (Draft -> Approved). Deliver phase builds a fresh plugins/sdd-new from the approved spec, keeping the existing plugins/sdd as a reference baseline."
cr: github-34
cr-url: https://github.com/cyberuni/cyber-skills/issues/34
todos:
  - id: cleanup-phase
    content: "Phase 0 — spec-tree post-review cleanup (schema, acceptance seed, tracked plans, mechanical fixes). COMPLETE — see conclusion."
    status: completed
  - id: design-grill
    content: "Explore (FIRST) — critical pass over design/ rules: coherence, internal consistency, no contradictions across rules or with the capabilities; tensions -> open: markers or a follow-up CR, NOT a redesign. The rules are upstream of every scenario."
    status: pending
  - id: prose-reconcile
    content: "Explore — lighter pass over each capability README: What/Why/decisions present and current so every use case maps to a scenario; no dangling open: markers"
    status: pending
  - id: suite-e2e
    content: "Explore — author the e2e suite split by the A-F seed theme (one Feature per file: cr-lifecycle, escalation-floor, resolve-squad, freeze, gate-verdicts, handoff); boolean/rubric Gherkin per design/suite-style.md"
    status: pending
  - id: suite-unit
    content: "Explore — author colocated unit .feature per capability folder, following the folder tree (mission -> mission/deliver/handoff = 3 files); single file per capability until a folder reason to split"
    status: pending
  - id: root-frontmatter
    content: "Explore — add project-spec lifecycle frontmatter to root spec.md (status: draft, artifact-types, etc.) per design/lifecycle-model.md; drop the ## TODO once filled"
    status: pending
  - id: cap-create-governance
    content: "Explore — spec a create-governance skill (author a governance: metadata{artifact-type,actor,face} + compose mode union|replace; place at <project>/.agents/governances/; validate schema). Sibling to create-spec/validate-spec; consumes the A model."
    status: pending
  - id: cap-publish-artifact-types
    content: "Explore — spec publishing artifact-types: a specialist plugin declares/exports the artifact-types it covers so they are discoverable/reusable. Home: plugin/ (manifest + registry)."
    status: pending
  - id: cap-forge-learn-artifact-types
    content: "Explore — spec the forge loop learning NEW artifact-types from opt-in field usage (discovered-from-usage growth, same as the cause enum). Home: forge/."
    status: pending
  - id: spec-gate
    content: "Spec gate (Draft -> Approved): run validate-spec / sdd-operator over the project spec; cold spec-judge judges the suite; on approve, freeze touched .feature files"
    status: pending
  - id: deliver-build-sdd-new
    content: "Deliver — build fresh plugins/sdd-new from the approved spec (operator, spec/plan/impl producers + judges, governances, plan-retirement .mts skill W-1; no spec-graph); keep plugins/sdd as reference baseline"
    status: pending
  - id: deliver-self-host
    content: "Deliver — once sdd-new's spec-producer + spec-judge exist, re-run the explore/spec gate through them to verify the bootstrap closes (self-hosting check)"
    status: pending
isProject: false
---

# Plan — github-34: SDD project spec + behavior suite to the spec gate

> Mission plan (portable handoff brief). Tracked (NOT gitignored), per-worktree.
> CR: [github-34](https://github.com/cyberuni/cyber-skills/issues/34) — redo the SDD spec +
> behavior suite as **one durable project spec** under `artifacts/specs/sdd`, organized into
> files and folders, ready to approve at the spec gate.

## What we are doing

The CR was refreshed to the **new SDD model**: one durable per-project spec + behavior suite is
the source of truth; the **CR is the unit of work**; the **Mission Loop** carries it
(intake → explore → deliver → handoff). This plan runs CR #34 through that loop against its own
spec tree (`artifacts/specs/sdd/`) — dogfooding the model on itself.

**This is a self-hosting bootstrap** (building a compiler with itself). The explore phase
*should* delegate grilling to a spec-producer and a spec-judge — but the new ones don't exist
yet, so we **hand-run explore in the main loop** to kickstart: grill the CR by hand into the
spec + suite diff, run the spec gate by hand. We *build* the new delegates as deliver-phase
output, then re-run the loop through them to prove the bootstrap closes.

We keep the existing `plugins/sdd/` as a **reference baseline** and build the new
implementation fresh under `plugins/sdd-new/`, so the two can be compared rather than the old
one mutated in place.

**Issue scope (verbatim):** get the project spec + behavior suite *in and organized* so it can
be **approved at the spec gate** (Mission Loop step 2). Then build the implementation (step 3).

## Mission Loop position

- **Step 1 — intake.** Done: issue #34 is the CR.
- **Step 2 — explore (authoring).** **The live work.** The spec prose/rules are largely written
  and Phase 0 cleaned them up, but the **behavior suite does not exist yet** and the root spec
  has no lifecycle frontmatter. Build both, reconcile prose, end at the spec gate.
- **Step 3 — deliver.** Build `plugins/sdd-new/` fresh from the frozen suite (operator,
  producers + judges, governances, W-1 skill); keep `plugins/sdd/` as a reference baseline.
- **Step 4 — handoff.** Land as a branch → PR (this repo is PR-flow). Plan retirement waits for
  merge + doctrine distill.

## Current state (gap analysis, verified this session)

- `artifacts/specs/sdd/` is organized into capability folders + `design/` + `acceptance/`, and
  `spec.md` carries the project-index narrative (abstraction stack, Mission Loop, 4 outer loops,
  capability map, invariants). Good.
- **No `.feature` files exist anywhere** — `find . -name '*.feature'` is empty. The behavior
  suite (the issue's core deliverable) is entirely unbuilt. `acceptance/README.md` holds an
  organized **seed inventory** (themes A–F with named scenario rows) but no `.feature`.
- **Root `spec.md` has no frontmatter** — no `status`, no lifecycle. Under the one-spec model
  the project needs a single lifecycle baseline to be gate-eligible. (The `status:` lines in
  `design/lifecycle-model.md` and `design/provenance-model.md` are schema/example snippets, not
  real frontmatter.)
- Capability folders are `README.md` (prose) only — they still need their colocated unit
  `.feature` (root `spec.md` `## TODO`: "fill each capability folder" + "build the behavior
  suite (acceptance/ + colocated unit)").

## Step 2 — explore: build to the spec gate

Order: **rules first** (`design/`), then capability prose, then the suite, then frontmatter,
then gate. Rules are upstream of every scenario — authoring scenarios against unsettled rules
makes them chase a moving target.

- **design-grill (FIRST).** A critical-thinking pass over `design/` — the rules the whole suite
  encodes: `abstraction-stack`, `actors-and-governance`, `autonomy-rubric`, `lifecycle-model`,
  `loops`, `provenance-model`, `specialists-and-squads`, `suite-style`, `unit-and-organization`.
  Check each rule for internal coherence, consistency with the others, and contradiction with the
  capability folders. Phase 0 only did the *mechanical* schema sweep here; this is the real grill.
  **Scope guardrail:** this is grilling, not redesign — a tension becomes an `<!-- open: -->`
  marker or a **follow-up CR**, never an in-place model rewrite that balloons #34. The model's own
  rule holds: nothing changes except through a CR.
- **prose-reconcile.** Lighter pass over each capability README; confirm What / Why / design
  decisions are present and current so every use case has a scenario home. Resolve any
  `<!-- open: -->` markers the suite will touch. Authoring's grill phase 1 at the capability level.
- **suite-e2e.** Author the e2e suite from the A–F seed inventory, **split by theme** (see Suite
  file organization). Only cross-capability outcomes; boolean Gherkin by default, `@rubric` where
  a gradient rule needs it (autonomy bar, freeze condition). Conventions: `design/suite-style.md`.
  Exemplars drafted in `acceptance/README.md`.
- **suite-unit.** Author colocated unit `.feature` per capability folder for the
  single-capability behaviors (e.g. the mid-flight combat-log halt-write belongs under
  `mission/`, not acceptance). Folders to cover: `intake/`, `authoring/`, `mission/`,
  `mission/deliver/`, `mission/handoff/`, `campaign/`, `formation/`, `doctrine/`, `forge/`,
  `corpus/`, `plugin/`, `gateway/`. A folder with genuinely no unit behavior stays `.feature`-less
  (the digest reports zero scenarios, not an error).
- **root-frontmatter.** Add project-spec frontmatter to `spec.md` per
  `design/lifecycle-model.md`: `status: draft`, `artifact-types`, `aligned: false`, and the
  workflow fields as they apply. Drop the `## TODO` block once the suite is in.

### Suite file organization

The split criterion is **freeze blast-radius**: `@frozen` lives per `.feature` file, so
scenarios a single CR tends to freeze/unfreeze together share a file; scenarios re-opened
independently get their own. One `Feature:` per file.

- **Unit suites — partitioned by the folder tree (free).** "Folders are views" → the capability
  folder *is* the split. One `.feature` per capability folder, named for the capability; a
  capability's file splits only when its folder splits. The only day-one multi-file case is
  `mission/`, which already has subfolders → `mission/mission.feature` +
  `mission/deliver/deliver.feature` + `mission/handoff/handoff.feature`.
- **e2e suite — split by theme now, not later.** The seed already decomposed the outcomes into
  six cohesive themes, and theme-level freeze is the right grain (a handoff CR must not freeze
  CR-lifecycle scenarios). Start as six files, one `Feature:` each:
  `acceptance/cr-lifecycle.feature` (A), `escalation-floor.feature` (B), `resolve-squad.feature`
  (C), `freeze.feature` (D), `gate-verdicts.feature` (E), `handoff.feature` (F). Bonus: the gate
  digest's "scenarios this CR touched" then maps cleanly to a theme.
- **The split seam, along the way.** Split a `.feature` when a CR keeps re-opening *part* of it
  while the rest stays frozen — for units that shows up as a folder split, for e2e as a new theme
  file. Same principle; the formation loop polices it after the bootstrap. Do **not** pre-split a
  single capability's units before there is a folder reason to.

### New capabilities — artifact-type & governance lifecycle (added 2026-06-26)

A clean arc around the actor-governance model (A): **create → publish → learn**.

- **create-governance skill (R1).** User-facing aid to author a governance: choose artifact-type
  + actor + face, scaffold `metadata:{artifact-type,actor,face}` + compose mode (union default,
  opt-in replace), place at `<project>/.agents/governances/`, validate the schema. A new SDD skill
  (sibling to `create-spec`/`validate-spec`); consumes the A model.
- **publish artifact-types (R2).** A specialist plugin **declares and exports** the artifact-types
  it covers so they are discoverable/reusable beyond one project's registry. Home: `plugin/`
  (manifest + registry).
- **forge learns new artifact-types (R3).** The forge loop (opt-in field corrections, Consent
  floor) **discovers artifact-types not yet modeled** and proposes them back — the same
  discovered-from-usage growth as the `cause` enum, applied to artifact-types. Home: `forge/`.

## Spec gate (Draft → Approved) — hand-run

Run the spec gate over the project spec **by hand in the main loop** (the issue's target
milestone). We cannot delegate to `sdd:sdd-spec-judge`/`sdd:validate-spec` yet — those belong to
the old `plugins/sdd/` and the new judge is not built. So we apply the gate criteria directly:

- Judge the suite against `design/suite-style.md` (every untagged scenario boolean; `@rubric`
  scenarios structurally well-formed) and the authoring criteria in `authoring/README.md`.
- Never advance with judge failures, open markers, or a misaligned suite (they fail the
  confidence dimension and forbid self-assertion).
- On **approve**: freeze each touched `.feature` via its `@frozen` tag; record the verdict as a
  durable per-CR `gate` ledger line; set `status: approved`. `spec.md` stays aligned, never
  frozen.

## Resolved decisions

- **D-A — hand-author to bootstrap.** Step 2 *is* the explore phase; we hand-run grill → diff in
  the main loop because there is no spec-producer/spec-judge to delegate to until we build them
  (deliver). Step 2 and D-A are the same act. (`project_sdd_operator_builder_fabrication` is moot
  while hand-running.)
- **D-B — build fresh under `plugins/sdd-new/`, keep `plugins/sdd/` as reference.** Not an
  in-place sweep: the old impl stays untouched as a baseline to compare against; the new impl is
  authored from the approved spec. (`project_sdd_impl_sweep_pending`.)

## Step 3 — deliver: build `plugins/sdd-new/` from the approved spec

Build the new implementation against the **frozen** suite, fresh (not by mutating `plugins/sdd/`):

- Author the operator, the spec/plan/impl **producers + judges**, and the governances the new
  spec defines (artifact-types resolution, **no** spec-graph / render-spec-graph / DAG kernel).
- Build the **W-1 plan-retirement `.mts` skill** (doctrine-owned, glob `.agents/plans/*.plan.md`,
  delete only when source = done/merged AND distilled; idempotent). Pin the `../.agents/plans`
  init symlink gotcha.
- **Self-hosting check:** once `sdd-new`'s spec-producer + spec-judge exist, re-run explore + the
  spec gate *through them* over the same spec to confirm the hand-run result reproduces — the
  bootstrap closes.
- Diff `plugins/sdd-new/` against the reference `plugins/sdd/` to confirm the deltas are
  intended; decide retirement of the old plugin as a later CR, not here.

## Step 4 — handoff & plan retirement

- Land on a branch → PR (repo is PR-flow). Keep the combat log in the PR (decision/failure
  trail reviewers want).
- **Do NOT delete this plan yet** — github-34 is not `done`/merged and not distilled. It stays
  tracked until doctrine distills + deletes post-merge.

## Phase 0 conclusion (cleanup — COMPLETE, applied 2026-06-26 on `next`)

The post-holistic-review cleanup of `artifacts/specs/sdd/` is done. **Rulings:** removed
`blocked-by` + the spec-graph apparatus (Q-1); kept `spec|impl` gate naming (Q-2); kept
`produced-by` (Q-3). Schema edits: removed `subtasks`/`priority`, `type` → `artifact-types`
(per-file resolution). Acceptance D1 rewritten to per-file `@frozen`; B7 halt-log relocated to
the mission unit. Plans are **tracked, not gitignored**; ephemeral/discarded wording reframed;
distill decoupled from delete. Mechanical fixes T-1..T-5 applied; root `spec.md` narrative
written; `DESIGN-NOTES.md` flagged superseded. Full-tree grep clean. Commits `b519821`,
`ab3e9c0`, `1e2ccac`, `65dd3d7`, `b8c916a`, `bf7443f`, `d42b7f4`, `b2a0721`, `ca51c30` + the
DESIGN-NOTES banner. Memory `project_combat_log_sibling_file` updated.

> Phase 0 closed the cleanup; this plan's live frontier is the **behavior suite + spec gate**
> (Step 2 above) — the actual deliverable named in the refreshed issue.
