---
name: "github-34: SDD project spec + behavior suite to the spec gate"
overview: "Carry CR #34 through the new SDD Mission Loop: the spec-tree cleanup (Phase 0) is done; the live work is the explore phase — build the missing behavior suite (e2e acceptance/ + colocated unit suites), add root spec.md lifecycle frontmatter, and bring the project spec to a spec-gate approve (Draft -> Approved). Deliver phase (the plugins/sdd impl sweep + in-place-vs-rebuild) follows the gate."
cr: github-34
cr-url: https://github.com/cyberuni/cyber-skills/issues/34
todos:
  - id: cleanup-phase
    content: "Phase 0 — spec-tree post-review cleanup (schema, acceptance seed, tracked plans, mechanical fixes). COMPLETE — see conclusion."
    status: completed
  - id: suite-e2e
    content: "Explore — author acceptance/acceptance.feature (e2e suite) from the A-F seed inventory; boolean/rubric Gherkin per design/suite-style.md"
    status: pending
  - id: suite-unit
    content: "Explore — author one colocated unit .feature per capability folder (intake, authoring, mission, mission/deliver, mission/handoff, campaign, formation, doctrine, forge, corpus, plugin, gateway)"
    status: pending
  - id: root-frontmatter
    content: "Explore — add project-spec lifecycle frontmatter to root spec.md (status: draft, artifact-types, etc.) per design/lifecycle-model.md; drop the ## TODO once filled"
    status: pending
  - id: prose-reconcile
    content: "Explore — grill phase 1: ensure each capability README has What/Why/decisions so every use case maps to a scenario; no dangling open: markers"
    status: pending
  - id: spec-gate
    content: "Spec gate (Draft -> Approved): run validate-spec / sdd-operator over the project spec; cold spec-judge judges the suite; on approve, freeze touched .feature files"
    status: pending
  - id: deliver-decision
    content: "Deliver (follow-up) — decide plugins/sdd in-place sweep vs archive + rebuild from the approved spec"
    status: pending
  - id: deliver-impl-sweep
    content: "Deliver — build against the frozen suite: delete render-spec-graph skill/agent + DAG kernel, build the plan-retirement .mts skill (W-1), align plugins/sdd to the new model"
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

**Issue scope (verbatim):** get the project spec + behavior suite *in and organized* so it can
be **approved at the spec gate** (Mission Loop step 2). Then, as follow-up, decide whether to
update `plugins/sdd/` in-place or archive + rebuild from the approved spec (step 3).

## Mission Loop position

- **Step 1 — intake.** Done: issue #34 is the CR.
- **Step 2 — explore (authoring).** **The live work.** The spec prose/rules are largely written
  and Phase 0 cleaned them up, but the **behavior suite does not exist yet** and the root spec
  has no lifecycle frontmatter. Build both, reconcile prose, end at the spec gate.
- **Step 3 — deliver.** The deferred `plugins/sdd/` impl sweep, built against the frozen suite,
  including the in-place-vs-rebuild call.
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

Order: prose first (grill phase 1), then the suite (grill phase 2), then frontmatter, then gate.

- **prose-reconcile.** Walk each capability README; confirm What / Why / design decisions are
  present and current so every use case has a scenario home. Resolve any `<!-- open: -->`
  markers the suite will touch. This is authoring's grill phase 1.
- **suite-e2e.** Author `acceptance/acceptance.feature` from the A–F seed inventory
  (CR lifecycle, escalation floor, resolve-a-squad, freeze, gate verdicts, handoff). Only
  cross-capability outcomes; boolean Gherkin by default, `@rubric` where a gradient rule needs
  it (autonomy bar, freeze condition). Conventions: `design/suite-style.md`. Exemplars already
  drafted in `acceptance/README.md`.
- **suite-unit.** Author one colocated unit `.feature` per capability folder for the
  single-capability behaviors (e.g. the mid-flight combat-log halt-write belongs under
  `mission/`, not acceptance). Folders to cover: `intake/`, `authoring/`, `mission/`,
  `mission/deliver/`, `mission/handoff/`, `campaign/`, `formation/`, `doctrine/`, `forge/`,
  `corpus/`, `plugin/`, `gateway/`. A folder with genuinely no unit behavior stays `.feature`-less
  (the digest reports zero scenarios, not an error).
- **root-frontmatter.** Add project-spec frontmatter to `spec.md` per
  `design/lifecycle-model.md`: `status: draft`, `artifact-types`, `aligned: false`, and the
  workflow fields as they apply. Drop the `## TODO` block once the suite is in.

## Spec gate (Draft → Approved)

Run the spec gate over the project spec (the issue's target milestone):

- Use the SDD machinery to dogfood it — `sdd:validate-spec` / `sdd:sdd-operator` running the
  authoring gate, with the cold `sdd:sdd-spec-judge` judging the suite (boolean + `@rubric`
  structure). See **open decision** below on hand-author vs full-machinery.
- Never advance with judge failures, open markers, or a misaligned suite (they fail the
  confidence dimension and forbid self-assertion).
- On **approve**: freeze each touched `.feature` via its `@frozen` tag; record the verdict as a
  durable per-CR `gate` ledger line; set `status: approved`. `spec.md` stays aligned, never
  frozen.

## Open decisions (need a ruling)

- **D-A. Hand-author the suite, or drive it through the SDD machinery?** Building the suite by
  hand is faster and we control it; driving it via `sdd:create-spec` → `sdd:sdd-operator`
  (explore) → `sdd:validate-spec` (spec gate) **dogfoods** the loop on its own spec — the
  point of CR #34. Lean: **hybrid** — author the suite by hand (the machinery is still being
  swept and may fabricate roles, per `project_sdd_operator_builder_fabrication`), then run the
  real gate via `validate-spec`. **DECIDE.**
- **D-B. `plugins/sdd/` in-place vs archive + rebuild** (the issue's follow-up). Defer until
  after the spec gate — the approved spec is the input either way. Tracked as
  `deliver-decision`. (`project_sdd_impl_sweep_pending`.)

## Step 3 — deliver (follow-up, after the gate)

Build the implementation against the **frozen** suite:

- Resolve **D-B** (in-place vs rebuild).
- Delete the `render-spec-graph` skill/agent + the DAG kernel (the spec-graph capability was
  removed in Phase 0; the impl still carries it).
- Build the **W-1 plan-retirement `.mts` skill** (doctrine-owned, glob `.agents/plans/*.plan.md`,
  delete only when source = done/merged AND distilled; idempotent). Pin the `../.agents/plans`
  init symlink gotcha.
- Align `plugins/sdd/` skills/agents to the new model (artifact-types resolution, no spec graph).

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
