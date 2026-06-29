---
name: "discover-specs: location-bounded spec recognition + discovery's frontmatter engine"
overview: "CR against the sdd project spec. Implement corpus/discovery's concrete frontmatter-reading engine as a new non-user-invocable skill `discover-specs` carrying a self-contained .mts script: scan the three SDD spec locations (.agents/spec, .agents/specs/<project>, **/.agents/spec), filter candidates by lifecycle `status` shape, parse frontmatter only, emit a TOON list of specs with their frontmatter. This NARROWS spec recognition from ADR-0017's 'any spec.md with a status, anywhere' to the three .agents/spec(s) locations + status filter — a full reconcile across the corpus. The sdd gateway uses the skill for its status scan (Help me choose / surfacing). Re-opens the frozen discovery.feature (user-ratified)."
todos:
  - id: script
    content: "Explore (build-to-learn): write scripts/discover-specs.mts (3-location scan, status filter, frontmatter-only parse, TOON output) + discover-specs.test.mts (node:test). Green = the behavior oracle."
    status: pending
  - id: discovery-spec
    content: "Explore: rewrite corpus/discovery/README.md + re-open & rewrite discovery.feature to the location-bounded recognition + the TOON-returning engine. Keep status-shape filter + name-resolution-over-the-list."
    status: pending
  - id: spec-gate
    content: "Spec gate: review discovery spec+feature against suite/spec-format bars; freeze discovery.feature (@frozen); record gate line in .agents/specs/sdd/ledger.jsonl."
    status: pending
  - id: skill-wrapper
    content: "Deliver: SKILL.md (user-invocable:false, internal:true) + README.md for discover-specs, naming the script run-line (plan-retirement pattern)."
    status: pending
  - id: reconcile
    content: "Deliver: reconcile the narrowed recognition rule across corpus/README.md (discovery row), lifecycle-governance/SKILL.md (recognition paragraph), and amend ADR-0017."
    status: pending
  - id: gateway-wire
    content: "Deliver: wire the gateway (`sdd` skill SKILL.md) to use discover-specs for the status scan (Help me choose / surfacing); note in gateway README. No gateway.feature re-open (consistent with frozen contract)."
    status: pending
  - id: verify-commit
    content: "Run node:test + pnpm verify (specs); commit per concern (skill+spec, reconcile, gateway)."
    status: pending
---

## NEXT

Start with `script` — write discover-specs.mts + its node:test, get green. That proves the behavior the discovery spec will freeze.

## CR

Local CR `discover-specs`. Source: user request (this session). Re-opens frozen `corpus/discovery/discovery.feature` — ratified by the user in-session (2026-06-29).
