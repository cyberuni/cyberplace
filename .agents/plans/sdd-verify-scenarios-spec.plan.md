---
name: sdd-verify-scenarios-spec
status: done
todos:
  - content: "classify + place: behavioral node mission/verify-scenarios (concept: delivery, near impl-judge/impl-producer)"
    status: completed
  - content: "author README (## Use Cases) + 29-scenario .feature: source-set parse/union, gherkin key derivation (@id/outline), junit node/leaf/key + XML unescape + literal-> non-trunc, PASS/FAIL/UNBOUND/EXTRA fold, CLI surface, non-zero exit"
    status: completed
  - content: "backfill from shipped engine; cold spec-judge ALIGNED (2 iters)"
    status: completed
  - content: "spec gate froze the .feature; deliver added 14 tests (1/scenario) + 3 pure-lift refactors; cold impl-judge PASS (1 iter)"
    status: completed
  - content: "root pnpm verify green (387 tests); committed d0a86616; concept-index regenerated"
    status: completed
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

DONE — committed `d0a86616` on branch `sdd-scenario-test-bridge` (not pushed). New frozen node
`mission/verify-scenarios/` (concept: delivery). Unblocks `sdd-impl-judge-consume-bridge` (CR #2).
Plan retires once the branch merges and is doctrine-distilled.
