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

- **C. Freeze scope. RESOLVED — `.feature` only.** The behavior suite is the frozen contract;
  `spec.md` is the readable abstraction kept aligned, never frozen. Written into
  `design/lifecycle-model.md` and `authoring/`.

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

- **F. Multi-artifact CR / per-file bundle scoping.** A project-spec CR touches many
  artifact-types → summons multiple specialists. Make explicit: one bundle **per artifact-type**,
  "no two producers on the same **file**" (per-file, not per-spec).

- **G. Durable approval/freeze record.** With no per-folder `status`/`approval`, where does
  "this CR's diff was approved + which scenarios are now frozen" live — the combat log, a per-CR
  record, or a single growing freeze baseline? Undefined.

- **H. 5th risk dimension.** Keep the 4-dim `why` (reversibility, blast-radius, novelty,
  confidence) or the 5-dim gradient (+ contract-impact)? Sources disagree with themselves.

- **I. CR store + status.** Keep `sdd-change-request`'s separate pluggable store + its
  `open→accepted→done` status, or fold the CR record into the combat log / loop?

- **J. escape-hatch.** Does escaped work **bypass** the lifecycle entirely (source) or is it a
  **CR that self-clears outside** the gates (model)?

- **K. spec-digest re-home.** Its consumer (the spec-gate review station) dissolved into
  `authoring/`; and "digest one spec.md + one .feature" no longer maps to a multi-folder project
  spec + multi-suite. Re-home + redefine.
