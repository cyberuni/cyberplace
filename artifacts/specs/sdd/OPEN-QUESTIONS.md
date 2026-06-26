# Open questions — from the CR #34 authoring pass

Flags raised by the cluster-authoring agents, aggregated. Two buckets: **decided** (the new
spec already follows our ruling; the *source* specs are stale and need a sweep) and **open**
(needs a human ruling before the affected file is correct).

## Decided — sources are stale, sweep needed

1. **`domain-plugin` stays distinct from `produced-by`.** (Ruled earlier in CR #34.) Stale
   sources to sweep: `sdd-contract-registry` ("retired domain-plugin"), `sdd-operator-resolution`
   (writes choice to `produced-by`), `sdd-plugin` (internally inconsistent).
2. **4 co-equal outer loops including forge.** Sources say "three outer loops + forge as a
   separate meta loop" — stale.
3. **Outer loops emit new CRs; single intake.** Sources emit proposals/strategy-entries/
   submissions — reframed to CR-emission.
4. **`approval` (not `approved-by`), run-level `strategy.leash` (not per-gate).** `sdd-gate-autonomy`
   is stale on both.
5. **CR is the unit of work (primary loop).** `sdd-change-request` models it as a side flag.
6. **No generic Builder** — unfilled impl-producer = operator inline (`sdd:sdd-operator`) or null.
   `autonomy-governance` + `freeze-alignment` frontmatter carry the fabricated `impl-producer: sdd:builder`.
7. **Dead vocab** — `sdd-inject-channel` uses Battler/Warden/Executioner and depends on the dead
   `sdd-orchestrator`; reframed to neutral "inner-loop producers and judges".
8. **Three-tier provenance capability sweep (from M).** `design/provenance-model.md` is updated,
   but the capability files still carry the old single per-corpus combat-log model: `doctrine/`
   (reads "the spec's combat log" / "across N specs"; must read the concluded **plan** + distill
   + **discard** it), `campaign/` & `formation/` (read combat logs; must read the durable
   **public** trail via a **cursor**), `forge/` (confirm it reads the distilled correction, not
   `frozen[]`), `intake/` (add the public conclusion-summary write-back), `mission/handoff/`
   (write the public summary; note the plan as a handoff artifact). Doctrine/campaign also carry
   **fleet-era "N specs" framing** that predates the one-project-spec model (B). Plus the
   `plugins/sdd/` `combat-log-governance` + `ownership-governance` skills.

## Open — needs a ruling

- **A. Hard floor definition. RESOLVED.** No conflict — the implemented "data egress /
  irreversible external publication" floor is the **forge field loop's Consent**, a third
  floor in a different place. The hard floor is **three C's**: **Clearance** (contract
  narrowed — authoring/impl gate; pre-authorizable in the CR), **Conflict resolution** (suite
  self-contradiction — impl gate; discovered, not grantable), **Consent** (forge field loop
  opt-in to run/report — up front, default-off). Clearance + Consent are payable in advance;
  Conflict resolution is not. Local irreversible acts (force-push, data loss) stay off the
  floor (reversibility gradient). Written into `design/autonomy-rubric.md`; Consent behavior
  in `forge/`.

- **B. `type` ≡ artifact-type field collapse. RESOLVED — collapse.** One field `type` names
  the artifact-type / bundle key; `project|feature` is **derived from graph edges** (root =
  nothing parents it; composite = has `subtasks`), not declared. **Sweep applied** —
  `design/lifecycle-model.md` (schema + composition→derived-from-edges),
  `design/specialists-and-bundles.md` (registry matches `type`; `domain-plugin` distinct from
  `produced-by`), and `provenance-model.md` carry the collapsed schema. `domain-type` removed.

- **C. Freeze scope. RESOLVED — `.feature` only, and per file.** The behavior suite is the
  frozen contract; `spec.md` is the readable abstraction kept aligned, never frozen.
  **Refined:** freeze is **per suite file** via an `@frozen` feature-level tag, not one
  project-wide baseline. Vocabulary is **freeze/unfreeze** (not lock/unlock — "lock" is
  reserved for the concurrency layer). The unfreeze trigger is **risk, not phase**:
  narrowing/rewriting unfreezes a file (→ Clearance), additive folds in frozen (self-clears).
  Explore re-judges only unfrozen files; the impl gate runs the **full** suite regardless —
  impl-producer runs every file, impl-judge judges the result. Written into
  `design/lifecycle-model.md`, `design/provenance-model.md`, and `authoring/`.

- **L. Drift detection & `align-specs`. RESOLVED.** Prose↔suite drift is caught **inline** at
  every CR's spec gate by the spec-judge applying the Builder (coverage) lens (semantic) + a mechanical scenario-diff
  (narrowing → Clearance); **no scenario IDs in the prose** (impractical for NL/diagrams) so
  prose alignment is judge-only. No outer loop hunts drift (Campaign confirmed product-only).
  Added a **user-invocable, CI-usable `align-specs`** tool in `corpus/` for full/batch
  detection (`--check`) + interactive reconciliation (a Director-lens call sets direction, the Builder lens fixes
  coverage; frozen-scenario narrowing → Clearance CR).

- **D. `forge` subject. RESOLVED.** Two different harnesses were conflated. **forge** = the
  **external field loop**: improve **SDD itself** from opt-in, cross-installation end-user
  field corrections (Consent-gated); it does NOT evolve a folder. The old `harness/` folder
  (a project's toolchain/CI/distribution) is **dropped** — outside SDD, no dedicated loop.
  SDD's plugin nature moved to the new **`plugin/`** capability (ships-as-plugin +
  extended-by-plugins + registry init-WRITE). The three internal loops
  (campaign/formation/doctrine) read the project's own combat logs; forge is the one external
  loop. Written into `forge/`, `plugin/`, `loops.md`, the capability maps.

- **E. Corpus tooling tier. RESOLVED — two-tier confirmed.** Cross-project (the project-spec
  DAG): split/dedupe/deprecate/`blocked-by` are real gated lifecycle acts. Intra-project: a
  "split" is folder reorg — a view change with no new gate. Corpus tools operate at the
  cross-project tier; intra-project reorg is plain editing.

- **F. Multi-artifact CR / per-file bundle scoping. RESOLVED — per-file producer, git-native
  concurrency.** A project-spec CR touches many artifact-types → summons multiple specialists
  at once; the exclusion is **per file**: one artifact-type → one bundle → one producer per
  file, "no two producers on the same **file**." **CR concurrency** is solved by git, not an
  SDD lock: one mission = one working tree = one CR at a time, serial inside the tree;
  parallelism is separate trees (worktrees). SDD stays **tree-agnostic** (worktree lifecycle
  is a later `universal-plugin` feature), branch-aware only at handoff. Cross-CR file
  collisions are git merge conflicts; overlapping-frozen-scenario conflicts at merge → the
  hard floor (Conflict resolution / Clearance). Written into
  `design/specialists-and-bundles.md` and `design/unit-and-organization.md`.

- **G. Durable approval/freeze record. RESOLVED — two faces + per-file freeze tag.**
  *Approval:* `spec.md` `approval` holds only the **standing** (latest CR's) gate verdict —
  "is the contract cleared now, who last ratified." The **durable per-CR** record lives in
  the combat log as a new **`gate`** ledger line (`cr`, `gate`, `verdict`, `by`, optional
  `why`, plus a `frozen[]` list), the immutable twin of the standing block. *Freeze:* a
  per-suite-file `@frozen` tag answers "which scenarios are frozen" — no growing baseline, no
  scenario-ID registry. Every ledger line gains an optional `cr` (one log now spans many CRs
  against the one durable spec). Human-ratified `gate` lines follow positional authority
  (in-session only). Written into `design/provenance-model.md`, `design/lifecycle-model.md`,
  `authoring/`. (Depends on the per-file freeze refinement under **C**.)

- **H. 5th risk dimension. RESOLVED — 4-dim.** The gradient is **reversibility, blast-radius,
  novelty, confidence**. Contract-impact is **not** a gradient row: breaking-ness splits
  between the **Clearance floor** (un-authorized narrowing escalates above the gradient) and
  **blast radius** (a cleared/pre-authorized breaking change's residual risk = how far it
  reaches); additive/non-breaking edits clear the floor and read low. The semver-class
  scenario-diff is still computed mechanically — it feeds the floor + the breaking weight on
  blast radius, not its own dimension. Swept `design/autonomy-rubric.md` (gradient table,
  load-bearing-nuance para, aggregate-verdict example, mechanical helper),
  `design/provenance-model.md` (`why` is four-dimension), and `formation/README.md` (Warden's
  per-act assessment). `lifecycle-model.md`'s 4-dim `why` block was already correct.

- **I. CR store + status. RESOLVED — thin adapter, source-native status, coordination
  write-back.** The pluggable store **survives but the adapter is thin**: agents operate
  GitHub/Jira/Asana/beads **natively** (pick up issue → branch → PR → close), so the adapter
  is a **directive** (which source(s), per-source convention, multi-source orchestration), not
  a CRUD/data-access layer — the old `create/read/list/transition` backend-contract framing is
  dropped. Status `open→accepted→done` is the **source's own**, read/moved natively, **not**
  duplicated in the combat log or frontmatter; the `cr` id is the only join. **Claiming a CR
  is the CR-level coordination lock** that completes F: git locks *files* within a tree, the
  source-claim locks *CRs* across trees. **Write-back is conditional, not bookkeeping** — PR
  handoff closes the source via `Closes #N` (SDD adds nothing); direct-to-main transitions to
  `done` on push; either way the mission reports back findings + follow-ups, which re-enter as
  **new CRs**. No CR block in frontmatter. Written into `intake/README.md` (sources prose +
  scenarios) and `design/unit-and-organization.md` (claim-lock bullet). Local store + thin
  adapter directive remain new work (own spec+suite).

- **J. escape-hatch. RESOLVED — escape = the task-vs-CR boundary; escaped work bypasses and
  leaves no record.** The real axis is **task vs CR**: an agent receives tasks, not all are
  CRs, and "is this a CR?" ≡ "should SDD engage?" — logically *prior* to SDD, but still
  handled *inside* a loaded SDD because tasks arrive mid-session. **Recognition = grill +
  impact analysis**, not an up-front gateway classifier (resolves old open #1); the grill may
  also **carve a CR out of a task** and escape the rest. **Escaped work leaves no SDD record**
  (resolves old open #2): a non-CR is not SDD's to track; a spec-prose-only change (typo) is
  already in git — no draft, no gate line, no combat-log entry. **Escape ≠ the trivial-CR
  self-clear**: a real-but-low-risk behavioral change is a CR that self-clears with full
  provenance (e.g. **moving a folder breaks imports → impl-gate retest → it is a CR**, not an
  escape). Most original "representation/meta-work" escapes dissolve into E (intra-project
  reorg = plain editing; cross-project = gated corpus acts). Ambiguity defaults to a CR.
  Written into `intake/README.md` (prose + scenarios) and `gateway/README.md` (intake note,
  routing row, escape bullet).

- **K. spec-digest re-home. RESOLVED — into `authoring/`, CR-scoped, folded in-session.**
  The digest re-homes into `authoring/` (which owns the spec gate; its old consumer
  `validate-spec`/the gate station folded there) — not `corpus/` (cross-project DAG tooling).
  Two shifts: **unit = the CR's delta footprint** (the files this CR touched, aggregated), not
  one fleet-era spec folder and not the whole multi-folder tree (the root `spec.md` capability
  map is the whole-project index); and it **folds into the in-session gate station** rather
  than a separately-spawned skill (the gateway never calls it; a read-only summary needs no
  isolated actor). What survives is the **fixed-section, read-only, decision-free contract**,
  generalized to multi-file (CR id + what/why, What, Status, Scenarios with added/modified/
  **narrowed** flagged, Key decisions, Open items; missing `.feature` = zero scenarios, not an
  error). The risk verdict + `frozen[]` are the gate/rubric outputs shown alongside, never
  produced by the digest. Written into `authoring/README.md` (`### The gate digest`). The
  standalone `sdd-spec-digest` spec + `plugins/sdd/skills/spec-digest` are **superseded** —
  removed in the pending plugin sweep.

- **M. Combat log is per-corpus under one-CR-per-tree (F)? RESOLVED — three-tier provenance.**
  The chatty mid-flight `report`/`correction`/`seq` lines move **out** of the shared
  per-corpus log into an **ephemeral per-worktree plan** (`.agents/plans/<cr-ref>.plan.md` +
  `.log.jsonl`, **gitignored**), which dissolves the concurrency conflict (one plan per tree —
  nothing shared to merge) *and* makes the plan a **portable handoff artifact** (Markdown,
  co-located with the work, `*.plan.md` for Cursor interop). The durable `combat-log.jsonl`
  (sibling to the **root** `spec.md`) keeps only **`gate` + `strategy`** (incl. the distilled
  recurrence count); it is sparse, so its rare cross-tree appends reconcile by **union merge**
  (`merge=union`), never the hard floor. `seq` is **CR-scoped** (collision-free, since one CR =
  one tree via the claim-lock). The append conflict is **mechanical, not the semantic
  frozen-scenario class**. **Doctrine** reads the concluded plan at retro, distills the
  `cause` recurrence into `strategy`, then **discards** the plan; **campaign/formation** read
  the durable **public** trail (CR-source conclusion + changesets + git) forward via a
  `.agents/sdd/loop-cursors.json` cursor, **not** the plan; **Forge** reads the distilled
  `correction`-with-`cause`, **not** `frozen[]` (a prior mis-attribution, now fixed). The
  mission writes a **public-worthy conclusion summary** back to the CR source at handoff.
  Rationale + cross-harness survey: **ADR-0015** + `docs/research/2026-06-agent-plan-persistence.md`.
  Written into `design/provenance-model.md`. **Capability sweep pending** (see stale-sweep #8).