# Plan — github-34: SDD spec redesign, post-review cleanup

> Mission plan (portable handoff brief). Tracked (NOT gitignored — see D-6), per-worktree.
> CR: github-34 — SDD spec redesign (project-spec model).
> Phase: post-holistic-review cleanup of `artifacts/specs/sdd/`.

## What we are doing

Holistic review of the SDD spec tree found defects + drift after the big redesign +
naming sweep. This phase resolves the frontmatter schema, fixes stale acceptance seed,
and closes a few schema contradictions. Design is otherwise sound; this is cleanup +
two real open design calls.

## Decided (ready to apply)

- **D-1. Remove `subtasks` from the schema.** Composition was the fleet ghost. One spec
  per project, folders are views, no child statuses. Cross-project parent/child is project
  management (lives in the source tracker), not spec frontmatter. Also delete the
  composition-rollup legal-state rules in `design/lifecycle-model.md` and the
  "Composition role (derived from edges) and rollup" section.
- **D-2. Remove `priority` from the schema.** Ranking hint; nothing load-bearing reads it.
- **D-3. `type` → `artifact-types` (plural).** A project touches many artifact-types;
  squads already resolve **per file**. Singular `type` was the leftover tension.
  Consequence: resolution stops matching one spec-`type` against `domains[]` and goes
  per-file (each file's artifact-type → its squad) — already implied by
  `design/specialists-and-squads.md`. Sweep `mission/` resolution + registry-shape prose.
- **D-4. acceptance `D1` is stale — rewrite.** "co-freezes the chain at descending strength
  (spec.md+.feature firmest, plan.md lower, tasks.md live)" is dead. Model is now **per-file
  `@frozen`**, spec.md kept aligned (never frozen), plan/tasks never frozen.
- **D-6. `.agents/plans/` is TRACKED, not gitignored.** Reversal of the earlier spec line.
  Reasons: Cursor treats `.cursor/plans` as tracked (gitignoring its symlink target is
  self-contradictory); the no-collision property comes from per-`cr-ref` filenames + the
  source-claim lock, NOT from gitignore (the spec conflated these); "discarded at retro"
  becomes a **tracked deletion** (better provenance — git history shows when a plan was
  distilled and dropped). Lifecycle is a **soft direction** managed by the doctrine loop, not
  a hard gitignore wall: create → mission appends → doctrine distills into the ledger →
  doctrine deletes. Apply: remove `.agents/plans/` from `.gitignore`; sweep the
  "gitignored" + "never merges / no-collision-because-gitignored" wording in
  `design/provenance-model.md`, `mission/handoff/README.md`, `doctrine/README.md`,
  `plugin/README.md` (init "gitignored home"). Fix the collision justification to
  per-`cr-ref` + source-claim. Update memory `project_combat_log_sibling_file` (says
  gitignored).

- **D-5. acceptance `B7` is misplaced, not wrong.** Mid-flight halt IS written to the combat
  log (`.agents/plans/<cr-ref>.log.jsonl`) during the mission — that is a **mission unit
  scenario**, not an e2e/acceptance one (acceptance = cross-capability only). Move the
  log-write assertion under `mission/`. Keep in `acceptance/` only the cross-capability
  outcome (CR halts → human resolves → resumes). Three homes for "a halt": mid-flight →
  combat log (mission); durable "why I paused" → ledger `gate` line; recurrence distill →
  doctrine. Same for the exemplar "every step is recorded in the combat log" wording.

## Open questions (need a ruling before applying)

- **Q-1. `blocked-by` — keep or remove?** User proposed removing it with subtasks/priority.
  CHALLENGE: blocked-by is *dependency*, not composition (design says orthogonal). It is the
  only cross-project execution-order edge and feeds THREE subsystems:
  - `corpus/render-spec-graph` — the spec DAG renders *from* it;
  - `autonomy-rubric` blast radius — "blocked-by dependents" is a mechanical high-blast signal;
  - `formation` — "keep the spec graph sound" is one of its four acts.
  Removing it deletes the spec-graph capability, not just a field. Either (a) keep it
  (dependency = the real survivor of the fleet death — my lean), or (b) consciously move the
  cross-project graph to the tracker (PM) and strip the three consumers. **DECIDE.**

- **Q-2. Gate + role naming.** User proposed `spec|impl` gate → `explore|deliver` gate, and
  `spec|impl-producer|judge` → `explore|deliver-producer|judge`. CHALLENGE:
  - Gates are named by *what they judge* (contract vs implementation), not the preceding
    phase — more legible.
  - Roles don't map: 3 producers (spec/plan/impl) vs 2 phases. plan-producer + impl-producer
    both land in "deliver" → collision; plan has no gate at all. Roles align to **artifacts**.
  - Real itch is likely "spec" is overloaded (project spec corpus vs spec gate's object).
  Options: (a) keep `spec|impl`; (b) `contract|impl` gate + keep artifact-aligned role names
  (de-overloads "spec", no phase collision, plan not orphaned) — my offer; (c) full
  `explore|deliver` rename (accept the orphaned-plan + object-legibility cost). **DECIDE.**

- **Q-3. `produced-by` → `updated-by`?** PUSH BACK: produced-by is framed as *immutable
  historical provenance* (trace a bad artifact to its maker; ACES needs this) + resume cache.
  `updated-by` connotes mutable last-writer-wins and fights that framing. It already overwrites
  to the latest producer on resume, so it already means "who last made this." Recommend **keep
  produced-by**; the word "updated" is the regression. **DECIDE / confirm.**

- **Q-4. Who deletes the plan, and when — RESOLVED: (a), doctrine owns, deferred to
  post-merge via a sweep skill.** The combat log is intentionally kept **in the PR** — the
  `report`/`correction` trail is the decision + failure history reviewers want (what broke,
  what the agent decided, did it do something bad), which the polished handoff conclusion
  hides. Conditions that make this work:
  - **Decouple distill from delete.** Doctrine's distill fires at `→ implemented` (step 3,
    before the PR exists); the **delete** is a separate, later act. Distill early, delete late.
  - **Delete is gated on TWO conditions: source = `done`/merged AND distilled.** Never delete
    an un-distilled plan (the retro never ran). Ordering: delete runs as doctrine's **last
    retro step**, after the distill writes strategy/recurrence to the ledger.
  - **Free-text hygiene (the only residual leak).** The committed combat log is structured
    decision metadata (role/agent/outcome/correction-kind/cause enums + terse `summary` /
    `detail`) — NOT code, prompts, or transcripts (those stay in the uncommitted raw `.jsonl`,
    read only for token-waste). So no redaction pipeline; just one **`combat-log-governance`
    rule**: `summary`/`detail` describe the decision/class, never embed code, secrets, or
    values.
  - **Reframe "ephemeral".** Committed → permanent in git history (commit-message-grade).
    Reword "ephemeral / discarded at retro" → "transient in the working tree, durable in
    history; removed from the tree at retro." Sweep `design/provenance-model.md`,
    `doctrine/README.md`, `mission/handoff/README.md`.

## New work from D-6 / Q-4 (specs + impl, beyond the cleanup)

- **W-1. Plan-retirement sweep skill.** New `plugins/sdd/` skill carrying a `.mts` script
  (per the repo's node-≥23.6 / no-deps convention, agent fallback when node absent):
  - glob `.agents/plans/*.plan.md`;
  - for each `<cr-ref>`, query its **source** status natively (`cr-ref` is source-qualified —
    `github-34` → GH issue #34, `asana-<gid>` → Asana, `local-<slug>` → local store);
  - delete `<cr-ref>.plan.md` + `<cr-ref>.log.jsonl` **only when source = `done`/merged AND
    distilled**; idempotent (missing plan or open CR = no-op, safe to re-run).
  - **Owner: doctrine** (runs as its last retro step). CI post-merge invocation optional.
  - Spec home: `doctrine/` behavior + a `provenance-model.md` note on retirement.
- **W-2. `combat-log-governance` free-text hygiene rule** (one line; see Q-4).
- **W-1b. init symlink gotcha (pin in `plugin/` init spec).** The Cursor symlink target must be
  **`../.agents/plans`** (relative to `.cursor/`), NOT `.agents/plans`. A verbatim
  `ln -s .agents/plans .cursor/plans` resolves relative to `.cursor/` → broken
  `.cursor/.agents/plans`. Use `../.agents/plans` (or an absolute path) + `ln -sfn` to replace
  an existing link. Verified by hand this session (the naive form created a dangling link).
- **W-3. Remove `.agents/plans/` from `.gitignore`** + the "gitignored / no-collision-because-
  gitignored / ephemeral" wording sweep (D-6 + Q-4 reframe) across `provenance-model.md`,
  `doctrine/README.md`, `mission/handoff/README.md`, `plugin/README.md`, and memory
  `project_combat_log_sibling_file`.

## TODO — mechanical fixes already confirmed by review (independent of Q-1..3)

- **T-1. `approval.cause` schema disagreement.** `mission/README.md` stop-provenance requires
  `cause: dimension | ceiling` on each `approval` entry, but the canonical schema in
  `design/lifecycle-model.md` and the `gate` ledger line in `design/provenance-model.md` omit
  it. Pick one: add `cause` to the schema + ledger line, OR drop it from mission.
- **T-2. Root `spec.md` is a STUB.** Under the project-spec model the root IS the whole-project
  index. Write the narrative (abstraction stack + Mission Loop 1–4 + 4 outer loops, in brief);
  stop pointing at DESIGN-NOTES.md as "the working model."
- **T-3. `design/provenance-model.md` `gate` example uses `design/lifecycle.feature`** — but
  `design/` holds rules, no `.feature` (rule-in-design / behavior-in-capability). Fix the
  example path to a capability-folder `.feature`.
- **T-4. `forge/README.md` states `priority: 3`** — a spec-frontmatter field on a folder-view,
  which "folders get no status/priority" forbids (and `priority` is being removed, D-2). Drop it.
- **T-5. `gateway/` routing table routes directly to `mission/handoff`** — handoff is step 4,
  mission-owned, not independently invoked. Drop or reword that row.

## Notes

- Q-1 and Q-2 are real design forks; Q-3 is a confirm. T-1..T-5 are mechanical.
- D-1..D-3 are schema edits — touch `design/lifecycle-model.md` (schema + legal-state +
  composition section), `design/specialists-and-squads.md` (resolution by per-file type),
  `mission/README.md` (resolution). Grep the whole tree for `subtasks`, `priority`,
  `blocked-by`, `\btype:`, `produced-by` before editing.
- D-4/D-5 touch `acceptance/README.md` + `mission/README.md`.
- Apply T-1..T-5 + D-1..D-5 first (safe), resolve Q-1..Q-3, then sweep `plugins/sdd/` impl
  (separate pending work — see memory `project_sdd_impl_sweep_pending`).

## Conclusion (applied 2026-06-26, spec-tree cleanup, on `next`)

**Rulings.** Q-1 = **remove `blocked-by`** + strip its 3 consumers (the spec graph is an
nx-style project-dependency graph; out of SDD scope, belongs in the source tracker). Q-2 =
**keep `spec|impl`** (rename dropped). Q-3 = **keep `produced-by`** (rename dropped).

**Commits** (spec tree only; `plugins/sdd/` impl sweep deferred):

1. `b519821` D-1 + Q-1 — remove the spec-graph apparatus (subtasks + blocked-by + composition
   section; strip render-spec-graph/DAG kernel in corpus, blast-radius blocked-by signal in
   autonomy-rubric, formation graph-soundness act 4→3, project|feature axis).
2. `ab3e9c0` D-2 + T-4 — remove `priority` (schema + forge folder-view line).
3. `1e2ccac` D-3 — `type` → `artifact-types` (plural), resolution per file.
4. `65dd3d7` D-4 + D-5 — rewrite acceptance D1 to per-file `@frozen`; relocate B7 (halt-log)
   to mission unit; drop the two combat-log-mechanics exemplar lines.
5. `b8c916a` D-6 + Q-4 + W-2 + W-3 — plans are tracked, not gitignored; reframe
   ephemeral/discarded wording; fix collision justification; decouple distill/delete; add
   the Plan-retirement section + the combat-log free-text hygiene rule.
6. `bf7443f` T-2 — root spec narrative.
7. `d42b7f4` T-1 + T-3 — `cause: dimension|ceiling` across schema + gate ledger line; fix the
   gate example path (`design/lifecycle.feature` → capability folder).
8. `b2a0721` T-5 — drop the gateway row routing directly to `mission/handoff`.
9. `ca51c30` W-1 + W-1b — spec the doctrine-owned plan-retirement sweep; pin the
   `../.agents/plans` init symlink gotcha.
10. (plan write-back) — record this conclusion in the tracked mission plan.
11. `DESIGN-NOTES.md` superseded — banner + divergence list; historical body preserved.

Memory `project_combat_log_sibling_file` updated (plans tracked, not gitignored).

**Spec-tree cleanup: COMPLETE.** Full-tree grep clean (no stale
`subtasks`/`blocked-by`/`priority`/spec-graph/`ephemeral`/`gitignored` outside intentional
"not gitignored" phrasing); `DESIGN-NOTES.md` flagged superseded.

**Still pending (separate work, NOT this cleanup phase):** `plugins/sdd/` impl sweep — incl.
deleting the render-spec-graph skill/agent + DAG kernel, building the W-1 retirement `.mts`
skill, and the in-place-vs-rebuild decision (memory `project_sdd_impl_sweep_pending`).

**This plan's own retirement:** do NOT delete yet — github-34 (CR #34) is not `done`/merged
(work sits on `next`, impl sweep outstanding) and has not been distilled. Per the retirement
model it stays tracked until doctrine distills + deletes post-merge.
