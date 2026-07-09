---
name: sdd-conductor-node-split
status: active
todos:
  - content: "confirm the finding: check-spec-structure --spec-dir .agents/specs/sdd flags mission/conductor/ oversized (67 scenarios > 40); cluster the scenarios by theme (done below) and verify no cluster is a duplicate of the sibling mission/resolution/resolution.feature node (checked: resolution.feature covers the matcher's own mechanics — bucketing, tier precedence, registry parsing; conductor.feature's resolution-themed scenarios cover the conductor's outcome-level use of it — classify/resolve/fail-closed/recuse — distinct subject, no reconcile finding)"
    status: completed
  - content: "decide the split boundary and new node name(s) — candidate: extract the autonomy-bar cluster (detail-adjustment / Clearance / Compatibility / Conflict / ceiling / consent-not-a-floor, ~8 scenarios) + the leash cluster (leash block / re-check / self-assert / pause / overwrite, ~7) + the provenance cluster (halt entry / timestamp / handle / no-email floor / telemetry flush, ~7) into one new node (proposed mission/autonomy/ or mission/leash/), leaving mission/conductor/ with resolution-integration + delivery + explore/plan-mode + impl-gate (~41, still borderline — may need a second look)"
    status: pending
  - content: "author the new node's README.md (spec-type: behavioral, concept tag) with the moved Use Cases; trim mission/conductor/README.md accordingly"
    status: pending
  - content: "update cross-references: anything citing 'the conductor's autonomy bar' / leash / combat-log-timestamp behavior by pointing at mission/conductor/ should retarget the new node (grep the corpus for mission/conductor references before finalizing)"
    status: pending
  - content: "spec gate: freeze-preserving split — every moved scenario is verbatim, narrows nothing, self-clears the frozen-contract guard once the Council ratifies the shape; still run the gate to re-freeze both .feature files under their new paths"
    status: pending
  - content: "root pnpm verify; commit by unit of work; handoff"
    status: pending
---

# CR sdd-conductor-node-split — split the oversized mission/conductor/ node

Target spec: `.agents/specs/sdd` (node `mission/conductor/` NARROWED, new node — name TBD, candidate
`mission/autonomy/`).

## Origin

Filed by the sdd-warden formation pass following `cyberlegion-plugin-init-skill` (post-mission,
corpus-wide structure audit — this finding is unrelated to that CR's content, surfaced by the
routine corpus-wide sweep). `check-spec-structure --spec-dir .agents/specs/sdd` flags
`mission/conductor/` **oversized: 67 scenarios > 40** — the single largest node in the corpus.

Reading the scenario titles, `conductor.feature` carries at least four distinguishable concerns
bolted onto "running one mission segment":

1. **resolution/producer integration** (~14 scenarios) — classify, resolve, fail-closed, recuse,
   ambiguity — the conductor's *use* of the matcher, not the matcher's own mechanics (those already
   live in the sibling `mission/resolution/` node; verified distinct, no overlap/duplication).
2. **delivery + explore/plan-mode mechanics** (~21) — producer/judge separation, spike-and-discard,
   plan-mode preview, checkpoint batching, open-marker recording, iteration cap.
3. **impl gate** (~8) — approve/change/revert, status advance, frozen-scenario / open-marker
   blocking.
4. **autonomy bar + leash + provenance** (~22) — the floor/gradient verdict (Clearance/Compatibility/
   Conflict/ceiling/consent), the run-level leash block and its re-check/self-assert/pause
   lifecycle, and the combat-log write contract (timestamp, handle, no-email floor, flush timing).

Cluster 4 reads as the most coherent, most independently-referenced-elsewhere candidate for
extraction: it is "the conductor's authority over itself" rather than "the conductor's mechanics of
running a segment," and several other specs/governances already cite the autonomy bar and leash as
a discrete concept (`sdd:combat-log-governance`, `sdd:gate-validation-governance`) separate from the
segment-running mechanics.

## Why this escalates rather than self-clears

Same reasoning as the prior `cyberlegion-identity-presence-split` CR (also Warden-filed): this is
the **first split** of this specific node — `mission/conductor/` is the most heavily cross-referenced
node in the entire corpus (nearly every plugin/governance that mentions "the conductor" cites it),
so the blast radius of getting the boundary or the new node's name wrong is high, and naming a new
concept node is a real design decision the Warden should not make unilaterally. Every candidate
scenario move is verbatim (coverage-preserving), so once the Council ratifies a shape the split
itself clears the frozen-contract guard with no re-open needed.

## NEXT

Not yet started. Run `start-mission` against `.agents/specs/sdd` for this CR. First settle the new
node's name and whether cluster 4 splits further (leash/provenance arguably differ enough from the
floor+gradient verdict to become two nodes instead of one) — that boundary call determines whether
`mission/conductor/` lands comfortably under 40 or needs a second pass.
