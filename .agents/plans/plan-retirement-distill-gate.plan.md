---
name: plan-retirement-distill-gate
status: active
todos:
  - content: "Settle scope fork (A structural distills-field) + frozen-feature re-open ratification"
    status: completed
  - content: "Explore/grill spec + suite; cold spec-judge ALIGNED after one Builder gap-close"
    status: completed
  - content: "Spec gate — approve; re-froze plan-retirement.feature + scanner.feature; combat-log shape"
    status: completed
  - content: "Deliver — realize the distilled gate in retire-plans.mts + tests; Scanner distills write-side"
    status: in_progress
  - content: "Impl gate — cold impl-judge over frozen scenarios; verify fail-closed on missing distillation"
    status: pending
  - content: "Handoff — land, distill note, follow-ups as new CRs"
    status: pending
---

# plan-retirement-distill-gate

**CR:** Harden `sdd:plan-retirement` so the **distilled** precondition is mechanically
enforced, not caller-asserted.

**Root cause (diagnosed):** `plugins/sdd/skills/plan-retirement/scripts/retire-plans.mts`
deletes whatever `--retire` names, fail-closing only on *cleared AND present on disk*.
Both clearance signals (source=done/merged AND distilled) are caller judgment by design
(README "The clearance boundary"). A caller who *believed* a mission was distilled deleted
`referenced-artifact-escalation`'s `plan.md` + `.log.jsonl` (commit `0f69e42f`) before any
strategy distillation existed — destroying the combat-log evidence the distill was meant to
preserve. Only the durable ledger shard survived.

**Insight:** unlike source-status (needs network/gh/Asana), **distilled is locally
verifiable** — a `strategy` ledger entry drafted FROM this cr-ref either exists or it does not.

**Structural blocker (explore):** strategy entries have **no structured subject field**; they
name the distilled mission only in prose and cite *other* cr-refs in `evidence[]` as
cross-refs. "Distilled(cr-ref)" is not mechanically checkable until a strategy entry records
what it distills. → scope fork:
- **A (systematic):** add `distills: <cr-ref>` to the strategy shape (combat-log-governance),
  Scanner writes it (doctrine-loop), engine gates on `distills == cr-ref`. Reverses the
  README design decision; re-opens the frozen `.feature`; touches combat-log-governance +
  doctrine-loop. Medium blast, additive field.
- **B (narrow):** engine scans for any strategy mentioning the cr-ref. Cross-ref
  false-positives leave the hole partly open. Not systematic.

**Grandfathering:** already-retired missions have no plan on disk — the gate is prospective;
no backfill of old strategy entries needed for correctness.

## NEXT

Spec frozen. **Deliver** against the frozen suites:
1. `retire-plans.mts` — read the project ledger dir (new `--ledger <dir>`), and for each cleared
   cr-ref require a `strategy` entry with `distills == cr-ref` before deleting; fail-closed on
   absence or missing `--ledger`. `distills` keys the gate, never a substring `evidence` mention;
   an unratified distilling entry still clears. + tests per frozen scenario.
2. Scanner write-side (`doctrine-loop` skill / `sdd-scanner` + `combat-log-governance` SKILL.md):
   record `distills: <cr-ref>` on a Ship/Kill distillation; omit for milestone/drift/token-waste.
3. Impl gate: cold `sdd:sdd-impl-judge` over the frozen scenarios (fail-closed-on-absence,
   cross-ref-not-distills, unratified-still-clears, happy path, partial pair).
