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
    status: done
    content: Clearance granted (full Part B) to re-open ACED frozen scenarios that forbid @rubric; recorded in ledger
  - id: explore-spec
    status: done
    content: re-froze ACED contracts (scenario-writer, spec-validator, impl-judge, judge, eval-run/run) to read .feature directly; spec gate line in ledger (6162748)
  - id: deliver-impl
    status: done
    content: ACED agents + skills + bars + docs read the suite directly (4e22b9b); all 7 eval.md reorganized two-level + tmux-fork-right migrated end-to-end as the reference proof (a19d4bd)
  - id: impl-gate
    status: done
    content: audit green all edited skills, check-suite green all .feature, pnpm verify green (13 tasks); impl gate line in ledger. Live behavioral dogfood deferred (follow-up)
  - id: handoff
    status: in_progress
    content: PR; file follow-up CRs (migrate remaining 6 suites; behavioral dogfood; benchmark + telemetry measurement kinds)
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

## NEXT — resume here

**Next action:** push `aced-suite-direct` and open the PR — `gh pr create`. **Decide the base first**
(`main` vs `next`; repo has `main` ahead of a stale `next` — confirm with the user before pushing).
Nothing else is blocking: both gates passed and `pnpm verify` is green (13 tasks). PR body = the five
mission commits below; keep the ledger shard in the PR.

Mission commits (all local, unpushed): `c4c3c61` SDD suite-format enablement · `6162748` ACED spec
gate (contracts re-frozen) · `4e22b9b` ACED agents/skills read the suite · `a19d4bd` eval.md two-level
+ tmux-fork-right reference migration · `0662df6` impl gate + brief.

**Follow-up CRs to file at handoff (not blocking the PR):**
1. Migrate the remaining 6 golden-set suites (define-skill, define-governance, manage,
   manage-model-runners, aced-create-spec, sdd-orchestrator) to a frozen `.feature` — same shape as
   `tmux-fork-right`. Until migrated, `aced run` on those needs the `.feature` authored first (their
   `eval.md` is already two-level).
2. Live behavioral dogfood: `aced run` the tmux-fork-right `.feature` and `compare` vs a golden-set
   baseline to confirm verdict parity (deferred at the impl gate — no stored baseline, spawns judges).
3. `benchmark` (model-matrix over the runner family; see `manage-model-runners`) and `telemetry`
   measurement kinds as their own CRs — `eval.md` already reserves them as siblings of `eval:`.

**Do not relearn** the design/decisions — the mission body above and the full plan
`~/.claude/plans/aced-used-eval-enchanted-otter.md` hold the settled rubric-ownership shift, the
two-level eval.md shape, and the Clearance scope. Retire this plan once merged + doctrine-distilled.
