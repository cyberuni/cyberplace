---
name: dispatch-queue — approved-plan dispatch queue for the automaton
overview: "A plan brief gains status: approved; the gateway dispatches approved missions first, one at a time, each in a fresh cold automaton to avoid cross-mission token carryover."
cr: local-dispatch-queue
cr-url: local — /home/user/.claude/plans/when-workin-on-a-zippy-parrot.md
status: active
todos:
  - id: schema-status-field
    content: "U1 — status field on plan-brief schema (provenance-model.md) + 3-way distinction — SPEC DONE"
    status: completed
  - id: discover-plans-status
    content: "U2 — discover-plans spec+scenarios DONE; engine --status/status column + 25 tests green; README+SKILL updated — DELIVER DONE"
    status: completed
  - id: gateway-dispatch-node
    content: "U3 — gateway/dispatch node DONE; sdd SKILL.md dispatch loop prose added; automaton verdict-packet contract already covered — DELIVER DONE"
    status: completed
  - id: checkpoint-node
    content: "U4 — mission/checkpoint node DONE; pause-mission --approve section + README + description — DELIVER DONE"
    status: completed
  - id: handoff
    content: "Handoff — finalize node placement, land as branch → PR (next → main)"
    status: pending
---

# dispatch-queue — approved-plan dispatch queue for the automaton

Dogfood CR against the SDD project spec. Seed intent: the approved plan at
`/home/user/.claude/plans/when-workin-on-a-zippy-parrot.md`.

## Working method

- Conductor in-session (user driving). Leash `auto-spec` — self-assert the spec gate, human-gate impl + PR.
- **All changes are additive** — new `status` parsing, new `--status` scenario, new dispatch scenarios.
  Nothing narrows an existing frozen scenario → self-clears, stays `@frozen`, no ratified re-open.
- **SDD-default squad, not ACES** for every unit (SDD corpus is boolean/conductor-authored; ledger seq 43
  + standing memory: ACES fits agent-behavior, not deterministic engines/thin dispatchers). Record the
  override in the combat log.
- Keep the plan-level `status` flag **independent of `kind:strategy`** (ledger seq 41 flags a strategy
  overload; do not couple "approved to dispatch" to "ratified strategy" — the leash governs autonomy
  separately: a tight leash just makes the automaton stop + relay, which is safe).

## Resolved decisions

- **Transition mechanism = fresh spawn per mission** (not compact/clear). The automaton is already
  stateless-across-segments; each mission reads only its brief and dies. The gateway session holds only
  the queue + tiny verdict packets. Optional cron (one mission per run) composes on top.
- **Write path = pause-mission --approve** (user choice) sets `status: approved` at checkpoint.
- **Dispatch loop = new `gateway/dispatch` node**, mirroring `gateway/manage` — keeps the gateway
  classifier thin; the loop (fan-out coordinator) gets its own behavioral node.
- **Sequential, not parallel** — matches "one after another" + avoids the shared-tree hazard.

- **U4 = new `mission/checkpoint` node** (user choice) — specs pause-mission's brief-write behavior
  incl. `--approve` sets `status: approved`. Fills the un-noded-pause-mission gap. resume-mission stays
  un-noded (a standing formation observation, not this CR).

## NEXT — resume here

> **▶ NEXT ACTION — `handoff`: branch → PR (next → main).** Both gates passed: spec gate self-asserted
> (ledger seq 45), impl gate ratified by unional (seq 46). Commit the impl unit, then land as a branch
> off `next` → PR. Keep the combat log; do NOT retire this plan until merged AND doctrine-distilled.
> Root spec.md stays `approved` (per-unit verdict).
>
> **Placement note:** the two new nodes (gateway/dispatch, mission/checkpoint) were placed directly in
> their blessed homes (siblings of gateway/manage and the mission phases) — no relocation needed at
> handoff. resume-mission remains un-noded (a standing formation observation, not this CR).
> All 4 units' spec+suite authored. Mechanical checks green (check-feature / check-spec-structure /
> check-spec-state OK; concept-index refreshed). Cold sdd-spec-judge dispatched over the diff.
> On ALIGNED → freeze the touched/new `.feature`s (add `@frozen` to the two NEW features
> gateway/dispatch + mission/checkpoint; the revised frozen features already carry it), append the
> spec `gate` line to the ledger (self-assert, leash auto-spec), set no spec.md status change (per-unit
> nodes; root stays approved). Then DELIVER: discover-plans engine `--status` + `status` column + test;
> pause-mission `--approve`; gateway SKILL.md dispatch prose. Then cold impl-judge → impl gate (human-
> gated) → handoff (branch → PR next→main).
>
> Changed spec files: provenance-model.md, gateway/README.md + gateway.feature, intake/plan-discovery/
> {README,feature}, mission/README.md, + NEW gateway/dispatch/ + mission/checkpoint/. ledger seq 44 =
> run-start strategy.
