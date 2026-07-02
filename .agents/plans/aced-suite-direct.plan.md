---
name: aced-suite-direct
cr: aced-suite-direct
target-spec: .agents/specs/aced
ledger-shard: .agents/specs/aced/ledger/aced-suite-direct.7404fb.jsonl
status: active
todos:
  - id: partA-sdd
    status: done
    content: SDD suite-format — bless layer tags + Scenario Outline Examples; check-suite Examples validation + tests (committed c4c3c61)
  - id: clearance
    status: in_progress
    content: Clearance for re-opening ACED frozen scenarios that forbid @rubric (pre-authorized in approved plan; confirm scope before rewrite)
  - id: explore-spec
    status: pending
    content: revise ACED spec nodes (scenario-writer, spec-validator, impl-judge, judge, eval-run/run, eval-run/add-scenario) to read .feature directly; re-freeze at spec gate
  - id: deliver-impl
    status: pending
    content: update ACED agents + skills to author/consume @rubric + @trigger Scenario Outline; reorganize eval.md to two-level measurement policy; migrate one reference suite; retire golden-set duplication
  - id: impl-gate
    status: pending
    content: cold impl-judge over frozen scenarios; dogfood regression via compare vs baseline; pnpm verify
  - id: handoff
    status: pending
    content: commits per unit, PR; file benchmark + telemetry as follow-up CRs
---

# Mission: ACED reads the frozen .feature suite directly

Retire ACED's dual life (frozen `.feature` + parallel `golden-set/*.md` joined by scenario name).
Make the frozen `.feature` the single eval source: rubric+threshold inline via `@rubric`, trigger
queries via `@trigger Scenario Outline` + `Examples:`, must-not as boolean `Then` steps, layer via
tag. `eval.md` slims to a two-level **measurement policy** (`subject` + `eval:` block; `benchmark:`/
`telemetry:` reserved as future sibling kinds — benchmark = model-matrix over the runner family).

Full plan + decisions: `~/.claude/plans/aced-used-eval-enchanted-otter.md`.

## Clearance scope (frozen ACED scenarios to re-open — pre-authorized in the approved plan)

- `sdd-roles/scenario-writer/scenario-writer.feature` — "the .feature stays boolean" (line ~77):
  "no rubric or threshold appears in any scenario" → rewrite to permit `@rubric`/`@trigger`.
- `sdd-roles/spec-validator/spec-validator.feature` — "a leaked grade fails boolean-form" (~70):
  rewrite so `@rubric` scenarios are *accepted* (structural validation deferred to check-suite).
- `sdd-roles/scenario-writer` (~28), `sdd-roles/impl-judge` (~19), `sdd-roles/spec-validator` (~21/23):
  "does not write/run a golden-set case" — the producer/judge *separation* stays; the *artifact*
  changes from golden-set to inline rubric-in-`.feature`. Rewrite to reflect the new source.
- `sdd-roles/judge/judge.feature` — scorer still scores a rubric; only the rubric *source* changes
  (from golden-set to the `.feature` `@rubric` docstring). Likely additive/clarifying, verify.

## NEXT

Confirm the Clearance scope above with the user, then re-open + revise those frozen scenarios
(explore-spec), re-freeze at the spec gate, and proceed to deliver. Ledger shard:
`.agents/specs/aced/ledger/aced-suite-direct.7404fb.jsonl` (mint run-start leash there on resume).
