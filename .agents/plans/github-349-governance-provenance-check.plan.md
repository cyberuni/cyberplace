---
cr: github-349-governance-provenance-check
source: https://github.com/cyberuni/cyberplace/issues/349
target-spec: .agents/specs/sdd
node: authoring/spec-producer, authoring/spec-gate, mission/conductor
change-class: revise
status: active
ledger-shard: ledger/github-349-governance-provenance-check.8f5f10.jsonl
todos:
  - content: Intake — locate spec, scaffold plan, resolve governances (SDD default chain)
    status: completed
  - content: Explore — grill CR into spec + suite diffs across spec-producer, conductor, spec-gate
    status: completed
  - content: Spec gate — cold spec-judge over the three-node diff, freeze touched .feature files
    status: completed
  - content: Deliver — implement governances_loaded declaration + relay + judge check
    status: pending
  - content: Impl gate — rebase onto main, cold impl-judge per frozen scenario
    status: pending
  - content: Handoff — PR (Closes #349), mail owner, clear warm units
    status: pending
---

# CR: spec-judge governance provenance check via dispatch channel (#349)

## Problem

The spec-judge cannot tell whether the spec-producer ran its pre-flight (loaded required
governances before writing). A producer that skips pre-flight and one that ran it incorrectly
look identical to the judge today — both just show up as an output gap. Surfaced during a
multi-round backfill where round 1 was entirely structural because the producer started writing
without loading `sdd:spec-format-governance` and `sdd:suite-format-governance` first.

## Proposed mechanism (from the issue, refine during grill)

- **Producer** (`sdd:spec-producer-governance`) declares which governances it loaded as a
  required `governances_loaded` field in its structured output — not written into any spec
  artifact.
- **Conductor** (start-mission / `mission/conductor`) extracts `governances_loaded` from the
  producer's response and forwards it in the dispatch channel as `producer_governances_declared`
  (brief field for a cold subagent, mail envelope field for an agent pool). Conductor stays a
  pure relay — no opinion on what's required.
- **Judge** (`sdd:sdd-spec-judge`, behavior lives in `authoring/spec-gate`) derives its own
  expected governance set from what it itself loaded, then checks
  `expected ⊆ producer_governances_declared`. On failure: emit `change`, finding-kind
  `governance-preflight-missing`, list the absent entries, halt before any content analysis runs.

## Scope

- `.agents/specs/sdd/authoring/spec-producer/` — spec.md + spec-producer.feature: producer emits
  `governances_loaded` as part of its output contract.
- `.agents/specs/sdd/mission/conductor/` — spec.md + conductor.feature: relay
  `producer_governances_declared` through the dispatch intent (brief field / mail envelope),
  no opinion on required set.
- `.agents/specs/sdd/authoring/spec-gate/` — spec.md + spec-gate.feature: judge pre-flight check
  (expected ⊆ declared) as a new pre-cold-judge-spawn gate, `governance-preflight-missing`
  finding-kind, halts before content analysis.
- `plugins/sdd/agents/sdd-spec-judge.md`, `plugins/sdd/skills/spec-producer-governance/`,
  `plugins/sdd/skills/start-mission/` — implementation once spec is frozen.

## NEXT

Spec gate PASSED clean (cold `sdd:sdd-spec-judge`, ALIGNED: true, all 3 lenses pass, no open
markers, no findings). All 3 `.feature` edits classified ADDITIVE by the structural differ
(self-clear, stayed `@frozen`, no Clearance). Ledger shard written
(`ledger/github-349-governance-provenance-check.8f5f10.jsonl`): run-start `leash` block +
self-asserted `gate: spec, approve` line.

Next: **deliver** — implement the mechanism against the frozen suite:
- `plugins/sdd/skills/spec-producer-governance/` — emit `governances_loaded` in structured output.
- `plugins/sdd/skills/start-mission/` (the conductor procedure) — relay
  `producer_governances_declared` through the dispatch brief/mail envelope.
- `plugins/sdd/agents/sdd-spec-judge.md` — derive expected set, check `expected ⊆ declared`,
  emit `change` + finding-kind `governance-preflight-missing` before lens analysis.
- One verification per the 12 frozen scenarios added across the 3 `.feature` files.
- Then rebase onto main, cold impl-judge, handoff (PR `Closes #349`).
