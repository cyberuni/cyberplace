---
name: sdd-impl-judge-consume-bridge
status: active
blocked-by: sdd-verify-scenarios-spec
todos:
  - content: "revise the impl-judge contract: for a DETERMINISTIC artifact-type, the judge runs verify-scenarios and reasons by hand over ONLY the UNBOUND set (not every scenario) — grows the default path in plugins/sdd/agents/sdd-impl-judge.md 'Map and run' step 2"
    status: pending
  - content: "revise impl-producer-governance so a deterministic verification is authored as a bound test (spec: describe namespace + verbatim scenario-name title) whose report maps back to the scenario"
    status: pending
  - content: "spec gate (re-open): both changes narrow/rewrite frozen scenarios in .agents/specs/sdd/mission/impl-judge/impl-judge.feature (and impl-producer/) — confirm ratified re-open before touching, re-freeze after"
    status: pending
  - content: "guard: agent-behavior types stay ACED-judged (unchanged); an artifact-type with no scenario-bridge config falls back to full by-hand judging (no regression)"
    status: pending
  - content: "root pnpm verify; commit; handoff"
    status: pending
---

# CR sdd-impl-judge-consume-bridge — wire the default impl-judge to the scenario→test bridge

Target spec: `.agents/specs/sdd/mission/impl-judge/` (frozen — re-open) + `mission/impl-producer/`.

## Origin

Second half of the bridge arc. `verify-scenarios` (branch `sdd-scenario-test-bridge`) proves the
mechanism but nothing consumes it live — the default `sdd-impl-judge` still reasons per scenario by
hand. This CR teaches the **default** impl-gate path to run the bridge for deterministic
artifact-types and judge only the UNBOUND remainder, killing the by-hand token burn structurally.

## Why the default path, not a plugin squad

Deterministic test-running is the **default** verification path — an unmatched artifact-type already
degenerates to SDD defaults, and ACED is the *specialized* agent-behavior plugin. So this grows the
SDD-core default judge, not a new `cli`/`script` squad. (The squad route was considered and rejected.)

## Freeze note

This narrows/rewrites frozen scenarios in `impl-judge.feature` and `impl-producer-governance` — a
**re-open** (freeze transition + status write). Confirm the ratified re-open before editing those
scenarios; additive scenarios self-clear, narrowing does not.

## NEXT

Blocked by `sdd-verify-scenarios-spec` (the bridge must be spec'd/frozen before the gate depends on
it). Then run `start-mission` against `.agents/specs/sdd/`.
