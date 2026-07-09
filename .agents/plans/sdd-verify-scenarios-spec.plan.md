---
name: sdd-verify-scenarios-spec
status: active
todos:
  - content: "classify: verify-scenarios is a behavioral SDD capability (deterministic engine) — scaffold a spec node under .agents/specs/sdd/ (placement: mission/ family, near impl-judge/impl-producer; confirm home via place-node)"
    status: pending
  - content: "author spec.md (## Use Cases) + <unit>.feature covering: source-set union+fold, junit adapter node/leaf/key extraction, @id: override, outline-as-one-key, XML unescape, PASS/FAIL/UNBOUND/EXTRA classification, non-zero exit on UNBOUND/FAIL"
    status: pending
  - content: "backfill from the shipped engine (source+tests already exist at plugins/sdd/skills/verify-scenarios/) — read source/tests/history, do not re-grill seed intent"
    status: pending
  - content: "spec gate: freeze the .feature; the existing verify-scenarios.test.mts is the impl-side coverage — confirm every frozen scenario has a verification before impl gate"
    status: pending
  - content: "root pnpm verify; commit; handoff"
    status: pending
---

# CR sdd-verify-scenarios-spec — spec + freeze the scenario→test bridge engine

Target spec: `.agents/specs/sdd/` (new behavioral node for `verify-scenarios`).

## Origin

The `verify-scenarios` engine shipped as a **shot-before-aim spike** (branch
`sdd-scenario-test-bridge`, commit `1ca086b3`) to prove the Gherkin-scenario→test-report bridge on
the cyberlegion identity node (46/46 BOUND). SDD's own doctrine says spec the behavior first and
build from a frozen `.feature`; this CR closes that loop by backfilling the spec — SDD dogfooding
its own tool. Live impl exists, so this is a **backfill** (producer reads source/tests/history, not
a fresh grill).

## Scope

The engine at `plugins/sdd/skills/verify-scenarios/scripts/verify-scenarios.mts` + its SKILL.md.
Spec the observable behavior (below), not the regex internals. This is the first half of a two-CR
arc — see `sdd-impl-judge-consume-bridge` for wiring it into the gate.

## Behavior to spec (from the shipped engine)

- Config `.agents/sdd/scenario-bridge.toml` = a list of `[[source]]` (`adapter`/`command`/`reportPath`).
- Scenario set from `gherkin-cli parse`; KEY = `@id:<slug>` tag if present else verbatim name; a
  Scenario Outline is one key.
- Adapter `(source, root) -> [{node, key, outcome}]`; `junit` adapter reads report, extracts node
  from the `spec:` describe segment, leaf = last `" > "` segment, unescapes 5 XML entities.
- Union across sources → fold by `(node, key)`: UNBOUND (no result) / PASS (≥1, all pass) / FAIL
  (any fail); EXTRA = bound results matching no scenario key. Non-zero exit on any UNBOUND/FAIL.

## NEXT

Not yet started. Run `start-mission` against `.agents/specs/sdd/`. First confirm the node home with
`place-node` (near `mission/impl-judge`), then backfill spec.md + `.feature` from the shipped engine.
