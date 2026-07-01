---
name: "manage-gateway: add the manage dispatcher skill"
overview: "Add /sdd:manage — a user-facing thin dispatcher (sibling of start-mission) that handles the gateway's dangling option-2 'Manage the corpus'. Full manage surface (Bootstrap/Inspect/Audit/Housekeeping) routing to existing engines; non-mission; hands off behavior changes to start-mission. Add CR against .agents/specs/sdd/: new gateway/manage node + revise gateway node (ratified re-open of frozen gateway.feature) to name manage as the option-2 handler. Design: ~/.claude/plans/create-a-new-manage-dazzling-parrot.md."
todos:
  - id: intake
    content: "Open CR, scaffold plan, emit run-level strategy (sdd ledger seq 29). DONE."
    status: completed
  - id: explore-spec
    content: "Explore + spec gate — DONE. Authored gateway/manage/README.md + manage.feature (boolean, matches sibling gateway); ADDITIVE gateway.feature scenarios (self-clear, no unfreeze) + gateway README routing → manage; concept-index regen. Cold sdd-spec-judge oracle+builder PASS, architect blocker (nonexistent doctrine-surfacing engine) fixed per instruction, no scenario change. sdd ledger seq 30; manage.feature frozen."
    status: completed
  - id: deliver-impl
    content: "Deliver: manage SKILL.md + README.md vs frozen manage.feature; rewire sdd/SKILL.md routing. Cold impl-judge; pnpm verify + audit."
    status: pending
  - id: handoff
    content: "Warden placement pass; commit by concern (spec / manage skill / gateway rewire); land."
    status: pending
isProject: false
---

# Plan — manage-gateway: add the `manage` dispatcher skill

> Mission plan (portable handoff brief). Tracked, per-worktree.
> CR: add `/sdd:manage`, the user-facing handler for the gateway's option-2 "Manage the corpus".
> Target: `.agents/specs/sdd/` (project-path `plugins/sdd-new`), `status: implemented`. Runs on
> `next`. Design + confirmed scope: `~/.claude/plans/create-a-new-manage-dazzling-parrot.md`.

## What manage is

A **thin dispatcher** mirroring the `sdd` gateway: classify a manage request, **load the matching
engine in-session**, hold no production logic, write no contract state, open **no CR / gate**. When
an operation surfaces a real behavior change (formation reconcile, align-spec drift), it **hands off
to `start-mission`**.

Two-level intake (≤4-option rule). Four operation groups:

| Group | Engines it loads |
|---|---|
| **Bootstrap** | `backfill-project-spec` |
| **Inspect** | `discover-specs` · `concept-index` · `place-node` · `discover-plans` |
| **Audit & align** | `check-spec-structure` · `align-spec` · `formation-loop` |
| **Housekeeping** | `plan-retirement` · `doctrine-loop` / pending-strategy surfacing |

## Touched nodes

- **new** `gateway/manage/README.md` + `manage.feature` (spec-type: behavioral, concept: routing;
  placement provisional, confirm via place-node, Warden finalizes at handoff).
- **revise** `gateway/README.md` + `gateway.feature` — option-2 route names `manage` as handler
  (frozen `.feature` → ratified re-open in-session).

## Impl (deliver)

- **new** `plugins/sdd-new/skills/manage/SKILL.md` + `README.md` (user-invocable dispatcher).
- **revise** `plugins/sdd-new/skills/sdd/SKILL.md` routing (option-2 → `manage`).
- engines stay `user-invocable: false`; manifest auto-discovers (no `.plugin/plugin.json` edit).

## NEXT

Explore: run place-node for the manage node, then author `gateway/manage/README.md` +
`manage.feature`; ratify the gateway re-open and add the option-2→manage scenarios to
`gateway.feature`. Then the spec gate.

## Verification

- `pnpm verify` (green before any commit) + `audit validate --path .../skills/manage`.
- Smoke: `/sdd:manage` → four-group menu; `/sdd:manage backfill` → backfill; `/sdd` opt-2 → manage.
