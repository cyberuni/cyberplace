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

- **I. CR store + status.** Keep `sdd-change-request`'s separate pluggable store + its
  `open→accepted→done` status, or fold the CR record into the combat log / loop?

- **J. escape-hatch.** Does escaped work **bypass** the lifecycle entirely (source) or is it a
  **CR that self-clears outside** the gates (model)?

- **K. spec-digest re-home.** Its consumer (the spec-gate review station) dissolved into
  `authoring/`; and "digest one spec.md + one .feature" no longer maps to a multi-folder project
  spec + multi-suite. Re-home + redefine.
