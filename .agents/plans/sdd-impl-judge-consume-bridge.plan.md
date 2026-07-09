---
name: sdd-impl-judge-consume-bridge
status: done
blocked-by: sdd-verify-scenarios-spec
todos:
  - content: "impl-judge contract wired via Option 2 (run-level leash): judge runs verify-scenarios; UNBOUND+FAIL+high-BR-bound judged, low-BR-bound accepted on report — grew Map-and-run step 0 in sdd-impl-judge.md"
    status: completed
  - content: "impl-producer-governance: deterministic verification bound via spec:<node> describe + verbatim scenario-name title (additive impl-producer.feature scenario, self-clears)"
    status: completed
  - content: "spec gate re-open (user-ratified): narrowed the impl-judge independence scenarios to the by-hand set + added the bridge stage; both features re-frozen; cold spec-judge ALIGNED (2 iters, caught intra-suite Conflict)"
    status: completed
  - content: "guard: no-bridge domain falls back to full by-hand judging (frozen scenario); agent-behavior types unaffected (bridge is the default judge's deterministic path only)"
    status: completed
  - content: "root pnpm verify green; cold impl-judge PASS (static inspection); committed d1e6dfac"
    status: completed
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

DONE — committed `d1e6dfac` on branch `sdd-scenario-test-bridge` (not pushed). Completes the bridge
arc (CR #1 `sdd-verify-scenarios-spec` = `d0a86616`). The default `sdd-impl-judge` now consumes the
`verify-scenarios` bridge for deterministic types under the run-level leash (Option 2). Plan retires
once the branch merges and is doctrine-distilled.
