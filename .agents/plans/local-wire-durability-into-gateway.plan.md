---
name: wire resolve-durability into the gateway and mission loop
overview: >
  resolve-durability (built in the prior CR) existed as a tested, standalone engine with
  nothing calling it. Wire it into the actual gateway/mission-loop executable skills so
  durability escape becomes real runtime behavior, fulfilling the already-frozen
  acceptance/cr-lifecycle.feature scenario.
cr: local-wire-durability-into-gateway
cr-url:
status: active
todos:
  - id: wire-gateway-skill
    content: Edit plugins/sdd-new/skills/sdd/SKILL.md's escape recognition + routing table
    status: completed
  - id: wire-start-mission
    content: Edit plugins/sdd-new/skills/start-mission/SKILL.md Step 1's escape-a-non-CR bullet
    status: completed
  - id: sync-spec-docs
    content: Update gateway/README.md prose + gateway.feature (additive scenario)
    status: completed
  - id: judge
    content: Spawn cold spec-judge over the executable edits + spec docs together
    status: completed
  - id: handoff
    content: Commit
    status: in_progress
isProject: false
---

## NEXT

Commit as one unit of work. Remaining open items from the durability line of work:

1. **Retire `plugins/skill-authoring/skills/create-skill`** in favor of `aces:define-skill` —
   the durability escape path is now real end-to-end, so this can finally happen.
2. **Promotion-path detector** (private→public) — still an open marker.
3. **Mixed-request carve-and-escape is untested** (spec-judge content gap): the "carve durable
   artifacts into the CR, escape the non-durable ones" behavior described in both edited
   SKILL.md files and gateway/README.md has no backing scenario in gateway.feature,
   cr-lifecycle.feature, or resolve-durability.feature — a reasonable inference from the
   per-artifact resolution model, but currently prose-only.

## Gate record

Spec gate: approve (self-asserted, `auto-all` leash, `ledger/local-wire-durability-into-gateway.02e1b5.jsonl` seq 2).
Impl gate: approve (same shard, seq 3).

sdd:sdd-spec-judge: oracle/builder/architect all pass, ALIGNED true, no blocker. One content
gap noted (item 3 above, not blocking). Also corrected my own framing: I'd told the judge
gateway/README.md was a "descriptive node, no frontmatter" — it's actually `spec-type:
behavioral` / `concept: routing`. The judge's correct reasoning: no re-open ceremony applies
because `spec.md`/`README.md` prose is *never* frozen regardless of spec-type (only `.feature`
freezes) — not because it's descriptive. No file fix needed, just a note for future framing.

## Context

Follow-up to `local-resolve-durability` (9e6d07f), which built the engine but wired it into
nothing.
