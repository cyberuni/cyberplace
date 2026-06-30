---
name: "formation-intra-spec-structure: the formation loop detects structural issues WITHIN a spec"
overview: "CR against the sdd project spec. The corpus maintenance tools dedupe-specs / split-spec / align-specs are the FLEET-era station — they policed overlap, oversize, and contradiction ACROSS many specs. Under the new model one project = one spec, so cross-spec dedupe/split/align are obsolete: their @frozen but unimplemented .feature nodes (corpus/dedupe-specs, corpus/split-spec, corpus/align-specs) and the formation-loop station rows that point at them should be retired. Their SPATIAL SUCCESSOR is a formation-loop capability that detects structural issues WITHIN a single spec as a regular maintenance check — node-placement drift, capability-folder concept-scatter (the concern concept-index re-unifies), an oversized node that should split into sub-nodes, and contradictions between nodes inside the SAME spec. The Warden runs it post-mission and continuous, emitting findings each carrying a self-clear-or-escalate verdict. Net: replace the cross-spec corpus station with an intra-spec structural-maintenance station."
todos:
  - id: intake
    content: "Step 1 — open local CR `formation-intra-spec-structure`, scaffold this brief, run discover-specs to locate the sdd project spec (.agents/specs/sdd) and confirm the corpus/* + formation/* current shape. Source: user request (this session)."
    status: pending
  - id: explore-retire
    content: "Explore: confirm and pre-authorize retirement of the obsolete cross-spec tools — corpus/dedupe-specs, corpus/split-spec, corpus/align-specs (all @frozen, none implemented). Deleting frozen scenarios is a NARROWING → Clearance hard floor; pre-authorize it in the CR. Decide remove-vs-repurpose for each node + its .feature; note that spec-digest (inlined into validate-spec) and discovery/concept-index/place-node STAY."
    status: pending
  - id: explore-define
    content: "Explore (build-to-learn): author the intra-spec structural-maintenance capability under formation/ — ## Use Cases + boolean .feature. Cases: node-placement drift (a node home that no longer matches its concept), capability-folder concept-scatter (lean on concept-index), oversized-node split heuristic (a node that should become a parent + sub-nodes), intra-spec contradiction (two nodes in one spec that conflict). If a deterministic scan helps, prototype an engine sibling to concept-index/place-node; green node:test = the oracle."
    status: pending
  - id: wire-warden
    content: "Explore/deliver: update the formation-loop station table — replace the dedupe/split/align rows with the intra-spec structural-maintenance checks; update sdd-warden.md and formation-loop README/SKILL so the Warden runs the new station with self-clear-or-escalate verdicts."
    status: pending
  - id: spec-gate
    content: "Spec gate: spawn cold sdd:sdd-spec-judge over the new + retired nodes; on ALIGNED freeze the new .feature (@frozen) and record a gate line in .agents/specs/sdd/ledger.jsonl. The retirements ride the Clearance pre-authorization."
    status: pending
  - id: deliver
    content: "Deliver: build the skill/engine (and remove the retired corpus skills/specs) against the frozen suite; spawn cold impl-judge; impl gate → status advance + impl ledger line."
    status: pending
  - id: handoff
    content: "Handoff: pnpm verify green; commit per concern (retire corpus tools / add intra-spec station / wire warden); update this ## NEXT; update memory (project_sdd_concept_axis_and_placement, project_sdd_fleet_vocab_locked)."
    status: pending
isProject: false
---

# Plan — formation-intra-spec-structure

> Mission plan (portable handoff brief). Tracked, per-worktree.
> Local CR `formation-intra-spec-structure`. Source: user request (this session).
> Runs on branch `next` (the sdd-new line).

## What we are doing

Retire the fleet-era cross-spec corpus tooling (dedupe / split / align-specs — all `@frozen` but
never implemented, and obsolete now that **one project = one spec**) and replace it with its
**spatial successor**: a formation-loop station that checks the structure **inside a single spec**
as regular maintenance. The Warden gains intra-spec checks — placement drift, concept-scatter,
oversized-node split, intra-spec contradiction — each emitting a self-clear-or-escalate verdict.

## NEXT — resume here

▶ NOT STARTED. Begin at `intake`: open the local CR, run `discover-specs --root .agents/specs` to
confirm the current `corpus/` and `formation/` node shape, then in `explore-retire` pre-authorize
the Clearance narrowing for the three obsolete corpus nodes before touching any frozen `.feature`.

## CR

Local CR `formation-intra-spec-structure`. Source: user request (this session). Touches the sdd
project spec at `.agents/specs/sdd`: retires `corpus/dedupe-specs`, `corpus/split-spec`,
`corpus/align-specs`; adds an intra-spec structural-maintenance node under `formation/`. The
retirement deletes frozen scenarios → **Clearance** hard floor, pre-authorized in this CR.
