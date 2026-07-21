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
    status: completed
  - content: Impl gate — rebase onto main, cold impl-judge per frozen scenario
    status: completed
  - content: Handoff — PR (Closes #349), mail owner, clear warm units
    status: completed
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

Both gates PASS. Spec gate: cold `sdd:sdd-spec-judge`, ALIGNED true, all 3 lenses pass, 12
scenarios frozen (ADDITIVE, self-cleared). Deliver: implemented in `plugins/sdd/skills/
spec-producer-governance/SKILL.md`, `plugins/sdd/skills/start-mission/SKILL.md`,
`plugins/sdd/agents/sdd-spec-judge.md` — no changeset needed (`@cyberplace/sdd-plugin` is in the
changeset `ignore` glob). `pnpm verify`: 34/34. Rebased clean onto main (no conflicts). Impl gate:
cold `sdd:sdd-impl-judge` re-derived all 12 scenarios by hand (no runtime code — pure
agent-instruction prose), 12/12 pass, no blockers. One non-blocking wording observation recorded as
a `backlog` followup ledger line (seq 4).

Handoff done: no node relocation needed (nodes already at their established homes). Branch pushed,
PR opened: https://github.com/cyberuni/cyberplace/pull/351 (`Closes #349`). No warm units to clear
(only cold judge dispatches this mission).

Post-ship design review (Council/user): added a spec-honesty pass — `spec-gate/README.md` now states
the check is a self-reported declaration not an attestation (catches honest omission, not skip-and-
claim; expected set is guessable), and that no portable cross-harness load-telemetry exists (4-harness
survey). Softened the "close that" overclaim in `sdd-spec-judge.md`. Recorded 2 backlog followups
(ledger seq 5-6): portable provenance via a repo-owned loader seam; tighten the judge's expected-set
oracle to the producer's required set. `pnpm verify` 34/34.

Keep this plan until the PR merges and is doctrine-distilled. Open question for the owner: file the
two backlog followups as GitHub issues, or leave them ledger-only until a later mission picks them up.
