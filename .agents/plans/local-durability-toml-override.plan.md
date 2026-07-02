---
name: durability.toml as a universal override valve
overview: >
  Close an asymmetry in the durability escape-hatch (local-fast-track-durability-tier,
  commit 4183717): code artifact-types got a project-declared override
  (.agents/sdd/durability.toml), agent-config artifact-types only got an unconditional
  fixed location convention. Promote durability.toml to a universal override valve
  (resolution step 2, ahead of any kind-specific default) usable for any artifact-type.
cr: local-durability-toml-override
cr-url:
status: active
todos:
  - id: reorder-resolution
    content: Reorder durability resolution list in intake/README.md (durability.toml -> step 2, universal)
    status: completed
  - id: add-scenarios
    content: Add colocated + frozen e2e scenarios for the override case
    status: completed
  - id: spec-gate
    content: Spawn cold spec-judge, fix flagged stale cross-reference, gate
    status: completed
  - id: handoff
    content: Commit
    status: in_progress
isProject: false
---

## NEXT

Commit as one unit of work. No further follow-ups from this CR — durability.toml itself
still has no reader/writer implementation (tracked as a follow-up on the prior CR's plan).

## Gate record

Spec gate: approve (self-asserted, `auto-all` leash, `ledger/local-durability-toml-override.ea8afc.jsonl` seq 2).
Impl gate: approve (same shard, seq 3) — no code artifact; the spec delta is the deliverable.

sdd:sdd-spec-judge caught a real defect on first pass: a stale "step 3 below" cross-reference
left over from the reorder (README.md:140, fail-closed moved from step 3 to step 4). Fixed
inline, re-graded clean (oracle/builder/architect all pass).

## Context

Follow-up to `local-fast-track-durability-tier` (commit 4183717). User flagged the asymmetry
in plan mode; direction (keep fixed agent-config default, add override valve) chosen via
AskUserQuestion, plan approved via ExitPlanMode
(`/home/unional/.claude/plans/would-embadding-that-in-greedy-garden.md`).
