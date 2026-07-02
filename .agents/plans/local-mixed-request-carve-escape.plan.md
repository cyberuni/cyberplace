---
name: back mixed-request carve-and-escape with frozen scenarios
overview: >
  Close the test-coverage gap the local-wire-durability-into-gateway spec-judge flagged: the
  per-artifact durability model lets one request carve its durable artifacts into a CR while
  escaping the non-durable ones, but that carve-and-escape outcome is prose-only (gateway/README.md
  L188-192, start-mission/SKILL.md L23, sdd/SKILL.md L91) with no backing frozen scenario. Add two
  additive @frozen scenarios (acceptance + gateway suites). Suite-coverage only — no engine/prose change.
cr: local-mixed-request-carve-escape
cr-url:
status: active
todos:
  - id: add-acceptance-scenario
    content: Add mixed carve-and-escape scenario to acceptance/cr-lifecycle.feature "Escape hatch — durability" block
    status: completed
  - id: add-gateway-scenario
    content: Add mixed-durability carve scenario to gateway/gateway.feature "Classification edges" block
    status: completed
  - id: judge
    content: Run check-suite + spawn cold spec-judge over the two-file diff; fix findings inline
    status: completed
  - id: handoff
    content: Self-assert spec gate (auto-all), append ledger/log, commit
    status: in_progress
isProject: false
---

## NEXT

Mission complete pending commit. Both additive @frozen scenarios landed; cold spec-judge
(`sdd:sdd-spec-judge`) graded oracle/builder/architect all-pass, ALIGNED true, no blocker.
Additive-only diff → self-cleared, files stay @frozen, no re-open. Retirement-ready once
doctrine distills.

## Gate record

Spec gate: approve (self-asserted, `auto-all` leash, `ledger/local-mixed-request-carve-escape.c01827.jsonl` seq 2).
Impl gate: approve (same shard, seq 3) — no code artifact; the behavior was already implemented
by the durability line, this CR only backs it with frozen scenarios.

## Context

Follow-up thread from the durability line (4183717, 7a5b826, 9e6d07f, cb62994). The mixed
carve-and-escape path is asserted in prose in three live places but has no frozen scenario. Design
is settled — this CR is pure suite coverage.

## Out of scope

- Stale `plugins/sdd-new/skills/` path refs in intake/README.md + intake/resolve-durability/README.md
  (live code is `plugins/sdd/skills/`) — distinct docs concern, leave unstaged.
- Promotion-path detector (intake/README.md:212) — needs a design grill, separate mission.
