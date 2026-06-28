---
name: "github-34: SDD project spec + behavior suite to the spec gate"
overview: "Carry CR #34 through the new SDD Mission Loop as a self-hosting bootstrap. The macro grill (holistic direction check over design/) is done. The live work is a series of per-capability VERTICAL SUB-MISSIONS: for each capability, tighten the prose, author per-unit .feature suites (one suite per skill/unit), and build the matching implementation fresh under plugins/sdd-new (build-to-learn, during explore). Then root frontmatter, the hand-run spec gate, the cross-cutting agents, plugin assembly, and the self-hosting check. plugins/sdd stays an untouched reference baseline."
todos:
  - id: cleanup-phase
    content: Phase 0 — spec-tree post-review cleanup (schema, acceptance seed, tracked plans, mechanical fixes). COMPLETE — see conclusion.
    status: completed
  - id: macro-grill
    content: "Explore, level 1 — MACRO grill: holistic pass over design/ for correct direction + nothing big missing. DONE (64b8c01, 745ae42): 4 coherence fixes (Compatibility floor in spec.md; judge lens split; type->artifact-type; gateway loads NO governance — corrected after a wrong-direction first pass). Surfaced 4 model refinements now pending in model-refinements. Reconcile rule learned: reason to the CORRECT answer from design intent, not a reference count."
    status: completed
  - id: model-refinements
    content: "Explore, level 1 — land the macro-grill's model refinements in design/: (a) Mission Loop step 1 (intake) CREATES the plan from a basic template; (b) step 2 (explore) grills the PLAN + spec + suite (when it exists) and builds impl (build-to-learn) — implementation is not deferred to deliver; (c) per-UNIT suites — one .feature per skill/unit, producer!=gate (generalize from authoring into spec-structure.md + authoring/suite-format/, replacing 'one .feature per capability folder'); (d) unit-of-work = co-committable unit (commit-discipline), CR = unit of change-intent (intake done; sweep loops.md/mission for 'unit of work' misuse); (e) USE CASES are PER-TYPE — LANDED via the spec-types taxonomy (commit 369318c): every spec node is descriptive (no subject/suite; no marker), reference artifact (spec-type: reference; ## Subject, no .feature), or behavioral artifact (spec-type: behavioral; ## Use Cases + .feature). Only behavioral nodes carry ## Use Cases; descriptive indexes and reference artifacts carry none. spec-type declared not inferred; classification not lifecycle (lifecycle stays root-spec.md-only). Landed in spec-structure.md (## Spec types), spec.md, authoring/suite-format/, lifecycle-model.md, sdd-stack.md, authoring/README.md. ALL LANDED: (a) intake-creates-plan swept across loops.md/intake/mission/+provenance (intake scaffolds the .plan.md from a basic template, plan-producer fills it during explore); (b) explore-builds-impl in loops.md step 2 (grill plan+spec+suite, build impl to learn); (c) per-unit suites already in spec-structure.md+suite-format; (d) unit-of-work-vocabulary verified clean (every usage commit-level, intake contrasts CR=unit-of-change-intent); (e) spec-types taxonomy landed earlier."
    status: completed
  - id: sub-authoring
    content: "Sub-mission authoring/ — prose (reconcile rule + per-unit split note), per-unit suites (spec-producer.feature 10 + validate-spec.feature 19), impl spec-producer-governance in sdd-new. RESTRUCTURED to overview + per-unit specs: authoring/README.md is now a no-.feature OVERVIEW/index; each unit lives in its own folder with its own README (## Use Cases mapping to its suite) + .feature — authoring/spec-producer/ and authoring/validate-spec/. This CLOSES the Use Cases gap (F3) for authoring: use cases are per-UNIT, the overview carries none (a no-.feature node is an index). Gate-digest behavior folded into validate-spec/README. ALSO built this session: the two fixed-universal governances as reference-artifact nodes under authoring/ — spec-format (78d9d8c) + suite-format (4f68659), each a spec-type:reference node + a self-contained impl in plugins/sdd-new/skills/ (spec-governance renamed -> spec-format); see D-F. COMPLETE: create-spec unit (README ## Use Cases + create-spec.feature 12 + impl plugins/sdd-new/skills/create-spec/) and revise-spec unit (README + revise-spec.feature 9 + impl, carries the frozen-feature re-open guard), both marked done in the authoring overview; validate-spec SKILL.md spec-gate impl built in plugins/sdd-new/skills/validate-spec/ (spec-gate ONLY — impl gate is the mission's; folds digest in-session, freezes per .feature, writes gate line to ledger.jsonl). All 5 authoring units (spec-producer, validate-spec, spec-format, suite-format, create-spec, revise-spec) now have spec + impl. verify:specs-new green."
    status: completed
  - id: sub-intake
    content: "DEFERRED (Tier 4, net-new — not on the sdd->sdd-new migration path; ## Migration ordering). Sub-mission intake/ — extract the inline README scenarios into per-unit .feature suites (channels/sources, escape hatch, inject channel); build impls in sdd-new. Intake has NO baseline skill; escape hatch + inject are enacted by the conductor/gateway. Carve to a follow-up CR after the migration."
    status: pending
  - id: intake-adapter-store
    content: "DEFERRED (resolved 2026-06-27 — carve to follow-up CR). The intake open marker (intake/README.md): the thin adapter directive (source selection + per-source convention + multi-source orchestration) and the local CR store (on-disk CR body + open->accepted->done; candidate beads) are NEW WORK with no baseline. Carved to a follow-up CR; the <!-- open: --> marker stays and blocks only the intake node's gate, not the migration of the existing capabilities."
    status: pending
  - id: sub-gateway
    content: "Sub-mission gateway/ — DONE. gateway/ made a single behavioral unit (spec-type: behavioral + ## Use Cases); extracted the inline scenarios to gateway.feature (10) atomically (README points to it). IMPL DONE: plugins/sdd-new/skills/sdd/ (SKILL.md + README.md) — the thin-relay front door, CORRECTED to the D-G model (spawns NOTHING by default, runs the conductor in-session; spawns sdd-operator + relays ONLY in the headless fallback), loads NO governance (macro-grill ruling). verify:specs-new green."
    status: completed
  - id: arch-conductor-pivot
    content: "Architecture pivot (D-G) — fold the operator into the MAIN-SESSION CONDUCTOR. The conductor is the main session running the operator role (not a spawned subagent); spec-producer + solution-producer run inline (the live grill); impl-producer + both judges spawn at depth 1 from the main session. Preserves grader independence on every harness; collapses the spawn tree caller->operator->judge (depth 2) to main->judge (depth 1). Spec gate = cold spec-judge over spec.md + .feature ONLY (solution out of view). Spawnable sdd-operator demoted to the headless/fan-out fallback (kept). Plugin surfaces are role-dependent: spec/solution-producer persona-loaded in-session, impl-producer + judges spawnable. DONE: swept design/ (specialists-and-squads, harness-spawning [inverted], lifecycle positional-auth, loops, provenance, governance-resolution, autonomy-rubric, spec-structure), capability specs (mission, gateway, intake, deliver, acceptance), and the entry skills + spec-producer-governance (specs + sdd-new impls). verify:specs-new green. Approved plan: ~/.claude/plans/write-it-up-as-federated-wreath.md."
    status: completed
  - id: sub-mission
    content: "Sub-mission mission/ — the CONDUCTOR (operator role). SPEC+SUITE DONE: mission/README.md restructured to a descriptive overview (Units table); operator/ unit spec (resolution, five-role chain, explore orchestration, segment, impl gate, stop-provenance) + operator.feature (38); solution-producer/ unit spec + solution-producer.feature (10). IMPL DONE: plugins/sdd-new/skills/solution-producer-governance/ (the plan-terminology-collision remaining impl — writes <unit>.solution.md only; produced-by.solution-producer: sdd:sdd-operator). IMPL DEFERRED to core-agents (dependency-correct — they reference governances not yet in sdd-new): the sdd-operator AGENT (headless/fan-out fallback), the cold judges, the impl-producer builder all wait until sub-deliver (impl-producer-governance) + sub-governances (actor/fixed bars) populate the skills they load. Decision: ONE operator unit (one agent: sdd-operator), suite grouped by 6 concerns, split later only if freeze grain demands. produced-by for spawned-default impl-producer = sdd:sdd-operator (recorded in operator/README). verify:specs-new green."
    status: completed
  - id: sub-deliver
    content: "Sub-mission mission/deliver/ — DONE. deliver/README restructured to a descriptive phase overview (Units table); split on producer!=judge into impl-producer/ unit (README + impl-producer.feature 11) and impl-judge/ unit (README + impl-judge.feature 10). IMPL DONE: plugins/sdd-new/skills/impl-producer-governance/ — CORRECTED to the D-G model (impl-producer is mechanical + SPAWNED via a generic builder, not inline; produced-by sdd:sdd-operator). The impl-judge AGENT (sdd-implementer) deferred to core-agents. verify:specs-new green."
    status: completed
  - id: sub-handoff
    content: "Sub-mission mission/handoff/ — DONE. handoff/ made a single behavioral unit (spec-type: behavioral + ## Use Cases; no sub-skills — conductor-enacted) + handoff.feature (13): land in the declared shape (PR-flow/commit-to-main), decompose by unit of work, conditional status write-back, distilled public summary + follow-ups as new CRs, no new floor, plan kept-but-not-landed/not-retired-early. NO separate sdd-new impl — handoff is realized by the operator agent (built in core-agents). verify:specs-new green."
    status: completed
  - id: sub-corpus
    content: Sub-mission corpus/ — discovery, digest, dedupe, split, align-specs tools; per-unit suites -> impls in sdd-new (NO spec-graph/DAG).
    status: pending
  - id: sub-campaign
    content: "DEFERRED (Tier 4, net-new — no baseline; ## Migration ordering). Sub-mission campaign/ — the product outer loop; per-unit suites -> impl."
    status: pending
  - id: sub-formation
    content: Sub-mission formation/ — the structure outer loop + the Warden delegate; per-unit suites -> impl.
    status: pending
  - id: sub-doctrine
    content: Sub-mission doctrine/ — the process outer loop + the Scanner delegate + plan retirement (W-1 .mts skill); per-unit suites -> impl.
    status: pending
  - id: sub-forge
    content: "DEFERRED (Tier 4, net-new — no baseline; ## Migration ordering). Sub-mission forge/ — the field outer loop (Consent floor, cross-installation corrections); per-unit suites -> impl."
    status: pending
  - id: sub-plugin
    content: "Sub-mission plugin/ — SDD's plugin nature: ships-as-plugin, extended-by-plugins, registry init-WRITE, workspace init (the ../.agents/plans symlink gotcha); per-unit suites -> impl."
    status: pending
  - id: sub-create-governance
    content: "DEFERRED (Tier 4, net-new — no baseline; ## Migration ordering). Sub-mission create-governance (NEW cap, R1) — author a governance: metadata{artifact-type,actor,face} + compose mode union|replace; place at <project>/.agents/governances/; validate schema. Sibling to create-spec/validate-spec; consumes the A model. Prose -> suite -> impl."
    status: pending
  - id: sub-marketplace
    content: "DEFERRED (Tier 4, net-new — no baseline; ## Migration ordering). Sub-mission marketplace (NEW cap, R2+R3, SDD-owned NOT forge) — a plugin declares the artifact-types it serves (R2); a register-plugin-to-marketplace skill + website shows plugins per artifact-type (R3). Two layers: marketplace=global catalog (website), registry=per-project resolution. Home: plugin/ + apps/website. Prose -> suite -> impl."
    status: pending
  - id: sub-governances
    content: "Tier 1 (migration) — carry the cross-cutting governances to sdd-new. IN PROGRESS; the session REWORKED the governance model, so the old 'reference-artifact nodes' framing in the body/## Migration ordering is PARTLY SUPERSEDED — trust ## NEXT + common-governances.solution.md. DECIDED + COMMITTED (d439420, d186622): (1) granularity = Model B — one bar per (actor,gate), discipline SECTIONS, faces MERGED (producer+judge load the shared bar; producer!=judge holds at the AGENT level); spec|impl KEPT (coverage vs conformance); subjective slices split to judge-only @rubric. Model A (per-role <actor>-<gate>-<face>, 10) kept as the FALLBACK for asymmetric-input/large-rubric bars. Recorded in .agents/specs/sdd/common-governances/common-governances.solution.md + examples/acme-ui (A) & examples/acme-ui-merged (B). (2) Placement: single-consumer governance -> its owning capability folder (spec-format/suite-format under authoring/, plugin-contract under plugin/); cross-cutting -> NEW common-governances/ folder; rules/models stay in design/. (3) Disciplines (engineer/designer/a11y/security/qa) compose onto the SDD generic core via compose:union, project/plugin-supplied per artifact-type at resolution — SDD ships only the GENERIC core bars; disciplines are OUT OF SCOPE here. (4) universal-plugin build is OUT OF SCOPE -> governances are harness-loaded skills authored in the mission loop. (5) Governances are GENERAL standing criteria, never per-CR. COVERED: the ACTOR bars (director/builder/architect) — decided + exemplified. DESIGN-PREP DONE this session: (a) ~/.claude/plans/swirling-foraging-moore.md fixed to Model B (5 bars, faces merged); (b) non-actor governances RECORDED in common-governances.solution.md (0317e8b) — fixed-universal = one invariant skill each (not face-split); plugin-contract single-owner under plugin/; autonomy descriptive+baked-in (no node/skill); reconciles RESOLVED: gate-validation model FOLDS into lifecycle-model.md (no new design doc), gate-validation carries NO leash (moved to autonomy-rubric, 3-dim gradient), architect-spec asymmetry absorbed by Model B per-face footer; (c) design/ aligned (82aade4): renamed actors-and-governance.md -> actors-governance.md, dropped universal-plugin-build embedding (one harness-loaded delivery model), adopted Model B match-key metadata{artifact-type,actor,gate} (was face), added combat-log to fixed-universal. DONE (commit plan #2-6, this session): BUILT all bars as sdd-new skills + reference nodes — 5 actor bars (director-spec, builder-spec, builder-impl, architect-spec[+per-face footer], architect-impl) under common-governances/{director,builder,architect}/ (962c02f); the 4 fixed-universal (lifecycle 422a0e7, ownership ae87283, combat-log 301749d, gate-validation 3f54d9b — gate-validation carries NO leash, model folds into lifecycle-model.md) under common-governances/; plugin-contract (1eacb3c) under plugin/plugin-contract/ (single-owner; plan-producer->solution-producer, operator->conductor, Model-B governances map, artifact-type resolution); spec.md capability-map row (c3ac0a1). autonomy CONFIRMED recorded as descriptive design/autonomy-rubric.md + baked-in + acceptance theme B (no node/skill). pnpm verify green (incl. test:audit over all 10 new governance skills). NOTE: live .agents/universal-plugin.json still uses plan-producer + flat governances{director,builder,architect} — migrated when governance-resolution.mts/plugins land (core-agents/sub-plugin)."
    status: completed
  - id: combat-log-location
    content: "DESIGN follow-up (raised 2026-06-28, surfaced by the gateway strategy-count bug). SETTLED: the durable `ledger.jsonl` (root spec sibling; holds `gate` + `strategy`) is distilled by the doctrine loop — keep it. OPEN: the chatty per-mission `report`/`correction` combat log currently lives BESIDE the plan at `.agents/plans/<cr-ref>.log.jsonl`. With one plan brief per CR under the CR->plan model, should those lines instead be logged INSIDE the plan brief (one CR artifact, retired together at retro) or stay a sibling `.log.jsonl` file? Decide, then reconcile combat-log-governance + design/provenance-model.md. SEPARATE bug — FIXED (5af5be7): the gateway now counts pending strategy from the one root `ledger.jsonl`, not `*.log.jsonl`. The DESIGN question (combat-log home: inside the plan brief vs sibling `.log.jsonl`) is still OPEN."
    status: pending
  - id: gateway-and-skill-surface-reshape
    content: "DESIGN/IMPL — reshape the gateway + the user-facing skill surface (raised 2026-06-28, multi-point). (A) GATEWAY DRIVE: the gateway must NOT 'hand work to' or 'spawn' a conductor. After classify it LOADS the matching skill IN-SESSION and works the task DIRECTLY (D-G: main session = conductor, nothing to hand to). Drop '## Hand the work to the conductor' from gateway/README.md + plugins/sdd-new/skills/sdd/SKILL.md; rewrite the gateway.feature handoff scenario -> 'loads the route skill in-session and works directly'. (B) sdd-operator -> RENAME `automaton`: a THIN HEADLESS WRAPPER of the gateway (same classify+load+work) that only adjusts behavior knowing NO HUMAN is in the loop (self-assert at gates, batch needs-input instead of asking). Not a separate orchestrator agent. Cold judges + impl-producer builder still spawn at depth 1 from whichever driver. Sweep sdd-operator -> automaton across design/ + specs + sdd-new. (C) MISSION IS NOT A ROUTE and the gateway does NOT live inside it — the gateway ASSUMES/ENTERS the mission loop once it identifies a CR. The MISSION LOOP IS THE CR WORKFLOW (intake/explore/deliver/handoff) over the ONE durable PROJECT spec. CRITICAL REFRAME (already decided in memory project_sdd_project_spec_and_change_request; skills never caught up): spec = the PROJECT, CR = the MISSION (unit of change-intent, git-PR-shaped). The entry skills create-spec / revise-spec / dedupe-spec are OUTDATED — they still assume SPEC = the mission (one spec per feature you create/revise). Under the new model, adding / revising / deduping part of the project spec is just what a CR's EXPLORE phase DOES, not a top-level mission. REWORK the skill surface to be CR-oriented: a request enters as a CR against the project spec; spec edits are operations INSIDE the loop. RESOLVED (i) — a SINGLE 'work a CR' entry skill, proposed name `start-mission` (pairs with pause-mission / resume-mission). It TRIGGERS ON A GENERAL CHANGE-INTENT PROMPT or a source URL ('add a start-mission skill to sdd', 'work on <github issue url>'), NOT on $sdd activation. It ingests the CR (prose or issue URL via intake sources), creates the .plan.md, and runs the mission loop (explore->deliver->handoff) over the durable project spec; add/revise/dedupe of the project spec are EXPLORE-phase operations inside it. The gateway, on a change-intent classification, loads start-mission; start-mission is also independently triggerable so the user need not say $sdd. RESOLVED: RETIRE create-spec / revise-spec / dedupe-spec as user-facing entries; before deleting, MIGRATE their load-bearing logic into start-mission's EXPLORE phase + the corpus/formation capability. MIGRATION INVENTORY (keep these): [from create-spec -> start-mission/explore] locate-or-propose the node (spec.md exists => revise path, not create); CLASSIFY spec-type (behavioral/reference/descriptive) + artifact-types (the squad key for plugin matching; set-once, confirm-not-guess); scaffold the README skeleton per spec-format (no control frontmatter); seed-intent Q&A for a NEW feature (3-5 targeted Qs: problem/who, observable behavior, public interface, edges/non-goals, reviewers) and SKIP for backfill (producer reads source/tests/history); the in-session grill loop (spec-producer inline + cold spec-judge each round + build-to-learn impl-producer builder; iteration cap 3; on cap/blocked DON'T auto-accept -> ask accept/loop/change); leaves status: draft; report (spec-type, artifact-types, ALIGNED, open markers, next=validate-spec). [from revise-spec] the FREEZE RE-OPEN GUARD (approved/implemented => frozen .feature; require the ratified re-open before editing; NEVER edit a frozen .feature without it) — load-bearing; revise-intent collection; OBSERVATION routing (typed architect|strategist; surface, never act silently; a split/granularity observation becomes a NEW node or a corpus op, never a marker grown into the node; decline=drop). [from dedupe-specs -> corpus (sub-corpus) / formation Warden, NOT a user entry] the named-artifacts PROPOSAL (by path; home / winning-claim + what moves; coverage check = each behavior exactly one home, none orphaned/duplicated; rationale); TWO human checkpoints (confirm plan BEFORE change, confirm result BEFORE commit); the actor split (Architect leads home/claim, Director scope/no-orphan, Builder coverage-survives); the freeze re-open guard; commit discipline (one coherent resolution, stage all touched specs). DROP on migration (stale): subtasks / blocked-by / render-spec-graph (removed in Phase 0), spec-governance -> spec-format. DECIDED 2026-06-28: (1) name `start-mission` CONFIRMED. (2) NO user-invocable `validate-spec` / `validate-impl` — the spec gate + impl gate become INTERNAL non-user-invocable sub-skills (like the governance skills), run by the conductor inside the loop; a skill may decompose into smaller non-invocable skills. Steps 3-4 (deliver / handoff) get NO entry skills — the conductor drives straight through; the human re-engages only at the impl gate + the git PR. land-mission DROPPED. (3) MOVE `pause-mission` + `resume-mission` from .claude/skills/ (repo-local project skills) INTO plugins/sdd-new/skills/ (the sdd plugin) — they are SDD lifecycle controls, not repo-local. (4) CONDUCTOR/OPERATOR — motive-model finding (artifacts/specs/motive-model/spec.md): the parent model SPLITS the driver into ACTOR vs DELEGATE and FORBIDS collapsing them; 'operator' as a single noun spanning user (case 1) + automaton (case 2) IS that forbidden collapse. Model words: **Conductor** = the Architect runtime variant, the HUMAN ACTOR who orchestrates (case 1 = the user); **orchestrator** = the delegate pattern it wields; SDD's headless instance = **automaton** (case 2). DECIDED (user confirmed 2026-06-28): keep `conductor` = the human/user in the driver seat (the seat is the conductor's — filled by the user when present, by the automaton when not); `automaton` = the orchestrator delegate; RETIRE `operator` (rename mission/operator/ -> the conductor role / orchestrated chain; finish sdd-operator -> automaton). Already the established word in specialists-and-squads.md ('the conductor is the main session'). (D) GATEWAY MODEL: DROP the pinned `model: haiku, effort: low` in sdd/SKILL.md — the needed model+effort is determined by the SKILL the gateway routes to (create-spec already carries an advisory message of expected level+effort, commit ef35182). Mechanism today: the routed skill ADVISES model+effort and the user switches MANUALLY. IDEAL but NOT POSSIBLE in the harness yet: the gateway pauses and asks the user to change model on route — record as a harness-limitation gap. Touch the baked 'conductor' term (~30 files) only as far as this reshape requires; reconcile, do not vote. PROGRESS (2026-06-28, branch next): LANDED — (A) gateway reshaped to load-route-skill-in-session + strategy/ledger fix + no haiku pin (5af5be7); (B) operator retired -> conductor (role) / automaton (agent) swept across 41 files incl. mission/operator/ -> mission/conductor/ (13bbe4a); start-mission skill built as the conductor's in-session realization, with the migrated create/revise explore logic baked in (1bdf8bb). DONE: retired create-spec/revise-spec (deleted units + impl skills; repointed authoring specs + governance refs at start-mission; dedupe-spec has no sdd-new impl — deferred to sub-corpus) (fa8a00d); spec gate validate-spec made user-invocable:false / internal (bf7d536); pause-mission + resume-mission moved from .agents/skills (symlinked into .claude/skills) into plugins/sdd-new/skills as sdd: plugin skills, de-staled + metadata.internal dropped (04588d7). (D) model-advisory landed in start-mission. pnpm verify green (13/13). COMPLETE."
    status: completed
  - id: core-agents
    content: "Deliver — the cross-cutting agents in sdd-new (not owned by one capability). PER arch-conductor-pivot (D-G): the DEFAULT conductor is the main session (no spawned operator) — so build the SPAWNED workers: cold sdd-spec-judge + sdd-implementer (impl-judge), the impl-producer builder, doctrine Scanner, formation Warden; sdd-operator is built ONLY as the headless/fan-out fallback. Plus the deterministic .mts helpers (check-spec-state, governance-resolution). Built to the CORRECTED lens sets (spec gate {director,builder,architect}; impl gate {builder,architect}) — the baseline 2-lens skills are reference only. PROGRESS: check-spec-state.mts (new-model) DONE in plugins/sdd-new/skills/validate-spec/scripts/ (48a0c1e, 24 node:tests, typed under tsconfig.specs.json) — root tuple + per-node spec-type reconcile, validates the live tree via `pnpm verify:specs-new`. STILL PENDING: governance-resolution.mts + all the cross-cutting agents."
    status: pending
  - id: root-frontmatter
    content: "Explore — add project-spec lifecycle frontmatter to root spec.md (status: draft, artifact-types, aligned: false, strategy) per design/lifecycle-model.md. The root ## TODO was REMOVED from spec.md (it belonged to the CR, not the durable spec) and rolled into this plan: item 1 'fill each capability folder' = the sub-* todos; item 2 'build the behavior suite' = colocated unit suites (per sub-mission) + the acceptance/ e2e suite (A–F seed themes, still unbuilt — see Per-unit suite organization)."
    status: pending
  - id: spec-gate
    content: "Spec gate (Draft -> Approved) — HAND-RUN in the main loop: judge the suite against authoring/suite-format/ + authoring criteria; never advance with judge failures/open markers/misaligned suite; on approve freeze touched .feature files, record per-CR gate ledger line, set status: approved."
    status: pending
  - id: assemble-plugin
    content: "Deliver — assemble plugins/sdd-new as a real plugin: .plugin/plugin.json manifest, governances-as-skills layout, agents/, registry role-map; diff against plugins/sdd to confirm intended deltas. Old-plugin retirement is a LATER CR."
    status: pending
  - id: self-host
    content: Deliver — once sdd-new's spec-producer + spec-judge + operator exist, re-run explore + the spec gate THROUGH them over the same spec to confirm the hand-run result reproduces (the bootstrap closes).
    status: pending
  - id: handoff
    content: Handoff (step 4) — land as a branch -> PR (repo is PR-flow); keep the combat log in the PR. Do NOT delete this plan until github-34 is done/merged AND doctrine-distilled.
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

> **Model shift this session.** The governance design was substantially reworked. The old
> "reference-artifact nodes" framing in the body below and in `## Migration ordering` is **partly
> superseded** — trust this anchor and
> `.agents/specs/sdd/common-governances/common-governances.solution.md` over the old body.

1. **Next action — `core-agents` (Tier-1 #7).** `sub-governances` is **DONE** (all 10 bars built +
   audited; see its todo). Now build the **spawned workers** that load those bars
   (`arch-conductor-pivot` D-G): the cold `sdd-spec-judge` + `sdd-implementer` (impl-judge), the
   generic impl-producer builder, the doctrine Scanner, the formation Warden; `sdd-operator` only as
   the headless/fan-out fallback. Plus the deterministic `.mts` helpers — `check-spec-state.mts`
   DONE (48a0c1e); **`governance-resolution.mts` PENDING** (resolves `(artifact-type, actor, gate)`
   → bar per `plugin-contract-governance`, composes union/replace per precedence). Build to the
   CORRECTED lens sets (spec gate `{director,builder,architect}`; impl gate `{builder,architect}`)
   and the Model-B `(actor, gate)` bar names now in `common-governances/`. The baseline 2-lens
   agents in `plugins/sdd/` are reference only.
   - **Registry migration (do here or note):** the live `.agents/universal-plugin.json` still uses
     `plan-producer` + flat `governances{director,builder,architect}`; the resolution helper +
     aces/quill entries move to `solution-producer` + the Model-B `(actor,gate)` governances map
     when `governance-resolution.mts` lands.
   - **Validate:** `pnpm verify:specs-new` + `audit validate` per skill; `pnpm verify` before push.
   - **Findings (the model shift):** governances are **general** standing criteria, never per-CR; a
     bar (esp. builder) **composes disciplines** via `compose: union` — SDD ships only the generic
     core (disciplines out of scope here); `universal-plugin build` is out of scope → governances are
     **harness-loaded** skills.

   **Dependency note (still holds):** the spawned **agents** (`sdd-operator` headless fallback, cold
   `sdd-spec-judge` + `sdd-implementer`, the impl-producer builder) are built in `core-agents`,
   AFTER `sub-deliver` + `sub-governances` exist in sdd-new. Each per-capability sub-mission builds
   its **governances/skills**; `core-agents` batches the **agents** last.

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
   skills: 5 Model-B actor bars (director-spec, builder-spec, builder-impl, architect-spec,
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