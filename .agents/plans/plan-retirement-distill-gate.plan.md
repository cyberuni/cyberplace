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
  - content: "Deliver — distilled gate in retire-plans.mts + 25 tests; Scanner distills write-side (3 sites)"
    status: completed
  - content: "Impl gate — cold impl-judge IMPLEMENTATION_PASS (mutation-backstopped); one doc-blocker fixed"
    status: completed
  - content: "Handoff — landed; both gates Council-ratified (by:unional); follow-ups noted"
    status: completed
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

Both gates passed (spec + impl), root `pnpm verify` green. **Handoff**: land the deliver commit,
then file follow-ups as new CRs:
1. **Grandfather-backfill** (optional): existing strategy entries (incl. this session's `364c83`,
   `9bb674`) carry no `distills` field — harmless (their missions are already retired / plans gone),
   but a backfill would let any future re-derivation match them. Low priority.
2. **Cause-enum precision**: the impl-gate correction (`spec-feature-contradiction`) was a
   nearest-bucket fit — the real class is *operating-doc/sibling-prose contradicts the shipped impl*
   (also seen in `acaa41`). A Council-ratified enum value would sharpen matchability. File as a
   doctrine strategy or a small governance CR.
3. Corpus **formation pass** is due (on-demand, `sdd:manage`) — this CR touched 3 nodes.
