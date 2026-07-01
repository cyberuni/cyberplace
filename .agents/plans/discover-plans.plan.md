---
name: "discover-plans: intake's resumable-mission engine + gateway surface"
overview: "CR against the sdd project spec. Implement a new behavioral unit intake/plan-discovery and its concrete engine discover-plans — a non-user-invocable skill carrying a self-contained .mts script that scans .agents/plans/ for *.plan.md mission briefs, parses each plan's frontmatter (name, todos tally by status) plus its ## NEXT lead line, and emits a TOON list of unretired/resumable missions. Exact parallel to corpus/discovery's discover-specs engine. Re-opens the frozen gateway.feature (user-ratified in-session) to add a 'surface in-progress plans on re-entry' scenario ALONGSIDE the existing 'surface pending strategy' behavior — the two are distinct concerns (pending strategy = unratified doctrine ledger lines for the Council; in-progress plans = resumable missions). The gateway runs discover-plans on entry to offer resume."
todos:
  - id: script
    content: "Explore (build-to-learn): write plugins/sdd-new/skills/discover-plans/scripts/discover-plans.mts (scan .agents/plans/*.plan.md, frontmatter name+todos status tally, ## NEXT lead, TOON output) + discover-plans.test.mts (node:test). Green = the behavior oracle."
    status: completed
  - id: plan-discovery-spec
    content: "Explore: author intake/plan-discovery/README.md (## Use Cases) + plan-discovery.feature (boolean Gherkin) — recognition (a *.plan.md under .agents/plans is an unretired/resumable mission), frontmatter+NEXT parse, todo tally, TOON output, no-registry derivation."
    status: completed
  - id: gateway-reopen
    content: "Explore: re-open frozen gateway.feature (ratified in-session) — add 'in-progress plans surfaced on re-entry' scenario beside 'pending strategy is surfaced'; update gateway/README.md behaviors table + Intake bullets."
    status: completed
  - id: spec-gate
    content: "Spec gate: spawn cold sdd:sdd-spec-judge over plan-discovery.feature + gateway.feature; on ALIGNED freeze both (@frozen); record a gate line in .agents/specs/sdd/ledger.jsonl."
    status: completed
  - id: skill-wrapper
    content: "Deliver: SKILL.md (user-invocable:false, internal:true) + README.md for discover-plans, naming the script run-line (discover-specs pattern)."
    status: completed
  - id: gateway-wire
    content: "Deliver: wire gateway sdd SKILL.md — add a 'Surface in-progress plans' subsection beside 'Surface pending strategy' that runs discover-plans on entry to offer resume; note in gateway README."
    status: completed
  - id: verify-commit
    content: "Impl gate (cold impl-judge) + run node:test + pnpm verify; commit per concern (skill+spec, gateway)."
    status: completed
---

## NEXT

▶ MISSION COMPLETE (2026-06-29). Spec gate (ledger seq 4) + impl gate (ledger seq 5) both passed; `intake/plan-discovery/plan-discovery.feature` + `gateway/gateway.feature` frozen. Engine + 16 node:tests green; cold spec-judge ALIGNED on both units; cold impl-judge passed all 12 frozen scenarios. Nothing to resume — awaiting doctrine-distill + `plan-retirement`.

Follow-up (not this CR): the `pending strategy is surfaced on re-entry` gateway scenario has no null-case sibling though the prose promises "a zero count is not surfaced" — a symmetry gap the strategist flagged; file as its own CR.

## CR

Local CR `discover-plans`. Source: user request (this session). Re-opens frozen `gateway/gateway.feature` — re-open ratified by the user in-session (2026-06-29) by requesting the new surface. Keeps the existing pending-strategy surface (distinct concern).
