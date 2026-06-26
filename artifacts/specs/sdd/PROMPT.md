# PROMPT — pick up SDD redesign (next session)

This is the handoff for the **SDD spec redesign** under `artifacts/specs/sdd/`. Read this,
then `OPEN-QUESTIONS.md` (the live ruling tracker) and `DESIGN-NOTES.md` (the full model).

## What we're doing

Redesigning the SDD spec tree from the old **spec-fleet** model (many frozen sibling specs)
to the **project-spec model**: ONE durable spec per project, organized into files/folders
(folders are *views*, never lifecycle units). This whole effort is **CR #34** — the first
change-request dogfooding the new SDD model on SDD itself.

Core model (see `DESIGN-NOTES.md` for the long form):

- **Abstraction stack:** outcome ← code ← spec+suite ← change-request (CR).
- **One spec, one behavior suite, one gate/freeze baseline** per project. Folders organize
  it; none gets its own `status`/`approval`.
- **Mission Loop (steps 1–4):** intake → explore → deliver → handoff. One cycle = one CR to
  completion. *cycle* = one full Mission-Loop pass; *iteration* = internal repeats inside
  explore/deliver.
- **Post-mission (step 5):** four outer loops emit new CRs — three **internal** (campaign /
  formation / doctrine, fed by the project's own combat logs) + one **external** (forge,
  opt-in cross-installation end-user corrections that improve SDD itself).
- **Hard floor = three C's** (mandatory human escalation, above the autonomy gradient):
  **Clearance** (contract narrowed; pre-authorizable in the CR), **Conflict resolution**
  (suite self-contradiction; discovered), **Consent** (forge opt-in; default-off).
- **Autonomy bar** (self-clear-vs-escalate rubric) replaces fixed approval stations.
- **Specialists = producer+judge squads** keyed by **artifact-type** (= the `type` field),
  one squad per artifact-type; the operator orchestrates them. Producers run inline (warm),
  judges spawn cold.
- **Freeze scope = the `.feature` only.** `spec.md` is the readable abstraction, kept
  aligned, never frozen.

## Current folder tree (`artifacts/specs/sdd/`)

```
design/ gateway/ intake/ authoring/ mission/{deliver,handoff}
campaign/ formation/ doctrine/ forge/ corpus/ plugin/ acceptance/
spec.md  DESIGN-NOTES.md  OPEN-QUESTIONS.md  PROMPT.md
```

`design/` = the rules (no behavior suites). `plugin/` = SDD's plugin nature (ships-as-plugin
+ extended-by-plugins + registry init-WRITE). `corpus/`/`plugin/`/`acceptance/` are
cross-cutting, not loop steps. `harness/` was **dropped** (a project's toolchain/CI is
outside SDD, no loop).

## Where we are

**Resolved (A–M) — all rulings closed.** See `OPEN-QUESTIONS.md`. Commit `e60e69d` landed the harness→plugin
+ external-forge restructure and the B-sweep (`type` = artifact-type, composition role derived
from edges, `domain-type` removed, `domain-plugin` distinct from `produced-by`). Commits
`022b93d` (G + per-file freeze) and `dde86a4` (F + CR concurrency) landed the latest two.

- **G — RESOLVED.** Approval splits two faces (standing `approval` in `spec.md` vs durable
  per-CR `gate` ledger line carrying `frozen[]`); freeze is a per-suite-file `@frozen` tag;
  every ledger line gains optional `cr`. Refined **C** to per-file freeze, freeze/unfreeze
  vocab, risk-not-phase unfreeze trigger, full impl-gate run by the impl-producer.
- **F — RESOLVED.** Producer exclusion is per-file (one artifact-type → one squad → one
  producer per file); CR concurrency is git (one mission = one tree = one CR; parallelism is
  separate trees; SDD tree-agnostic, worktree lifecycle deferred to `universal-plugin`).
- **H — RESOLVED.** 4-dim gradient (reversibility, blast-radius, novelty, confidence).
  Contract-impact is not a row: un-authorized breaking → Clearance floor; cleared breaking →
  rides blast radius. Swept `autonomy-rubric.md`, `provenance-model.md`, `formation/README.md`.
- **I — RESOLVED.** Pluggable store survives but the adapter is **thin** (a directive: which
  source(s) + convention + orchestration), not a CRUD layer — agents use GitHub/Jira/Asana/
  beads natively. Status `open→accepted→done` is the source's own, not duplicated; `cr` id is
  the join. **Claiming a CR is the CR-level coordination lock** (completes F: git locks files,
  source-claim locks CRs). Write-back conditional (PR `Closes #N` / direct-to-main → `done`);
  follow-ups re-enter as new CRs. Swept `intake/README.md`, `design/unit-and-organization.md`.

- **J — RESOLVED.** Escape = the **task-vs-CR boundary**. Not every task is a CR; "is this a
  CR?" ≡ "should SDD engage?" Recognition is grill + impact analysis (may carve a CR out and
  escape the rest), not a gateway classifier. Escaped work **bypasses and leaves no record**
  (non-CR isn't SDD's to track; spec-prose-only is in git). Escape ≠ trivial-CR self-clear
  (folder move breaks imports → impl retest → it's a CR). Swept `intake/`, `gateway/`.
- **K — RESOLVED.** `spec-digest` re-homes into `authoring/` (owns the spec gate), **CR-scoped**
  (the files this CR touched, not one folder, not the whole tree) and **folded in-session**
  (no spawned skill). The fixed-section read-only contract survives, generalized to multi-file.
  Standalone `sdd-spec-digest` spec + `plugins/sdd/skills/spec-digest` superseded (sweep).
- **M — RESOLVED.** Three-tier provenance: ephemeral per-worktree **plan**
  (`.agents/plans/<cr-ref>.plan.md`, gitignored, portable handoff artifact) holds mid-flight
  `report`/`correction`/CR-scoped-`seq`; slim durable **ledger** (root `combat-log.jsonl`,
  `merge=union`) keeps `gate`+`strategy`+distilled recurrence; durable **public** trail
  (CR source + changesets + git) feeds campaign/formation via a cursor. Doctrine reads the plan,
  distills, discards. Forge reads distilled corrections, not `frozen[]`. Dissolves M's
  concurrency. Rationale: **ADR-0015** + survey. `design/provenance-model.md` swept; **capability
  sweep pending** (stale-sweep #8).

**All open rulings (A–M) are now resolved.** What remains is implementation, not design:

## Decided-but-stale sweeps still pending

The 7 items under **"Decided — sources are stale, sweep needed"** in `OPEN-QUESTIONS.md`
describe *source specs* (the old `plugins/sdd/` skills/governances and old sibling specs) that
still contradict the rulings. The new spec tree is correct; the sweep into the actual
`plugins/sdd/` implementation has **not** been done.

## Open follow-up after the spec gate

Decide whether to update `plugins/sdd/` **in place** in one go, or **archive it and create a
fresh plugin** from the new spec.

## How to resume

All design rulings (A–L) are resolved. The remaining work is **implementation**, in two
phases:

1. **The decided-but-stale sweep** (7 items in `OPEN-QUESTIONS.md`): the new spec tree is
   correct, but the old `plugins/sdd/` skills/governances and old sibling specs still
   contradict the rulings. Sweep them.
2. **The plugin decision** (above): update `plugins/sdd/` in place vs archive-and-rebuild
   from the new spec tree. Decide, then execute.

Commit per the repo's commit discipline (one concern per commit; `pnpm verify` runs on the
pre-commit path).
