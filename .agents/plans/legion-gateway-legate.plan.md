---
name: legion-gateway-legate
status: active
todos:
  - content: "explore/backfill: realign dispatch/ spec.md prose off retired pre-CR-4 CLI verbs; author boolean .feature from shipped dispatch-governance + subagent-backend + relay skills"
    status: completed
  - content: "spec gate: cold aced-spec-validator ALIGNED; dispatch.feature FROZEN, ledger gate:spec approve by:unional; root status stays draft (init/ precedent)"
    status: completed
  - content: "impl gate: cold aced-impl-judge PASS 24/24; deliver = fail-loud guard + result-file reconcile committed; ledger gate:impl approve by:unional"
    status: completed
  - content: "handoff: pnpm verify green, no changeset (marketplace plugin), rebased on main + pushed, PR #132 open; follow-up CR = untested subagent|channel seam scenario"
    status: completed
---

# CR legion-gateway-legate (CR-5) — freeze the Legate routing-brain spec

Target spec: `.agents/specs/cyberlegion-plugin` — **`dispatch/` node only** (scope locked with human).
Domain-type = agent behavior → **ACED** chain (spec-producer `aced-scenario-writer`, spec-judge
`aced-spec-validator`, impl-judge `aced-impl-judge`; bars `aced-builder-spec`/`aced-builder-impl`).

## Shot-before-aim backfill — impl is AHEAD of spec

The routing brain **already ships** and is CR-4-current; this CR formalizes + freezes its spec, it
does **not** build new behavior. Shipped impl (the read-set for backfill):
- `plugins/cyberlegion/skills/dispatch-governance/SKILL.md` — strategy pick, wake-matrix table
  (`selectWakePath` folded in), `unit spawn`+`mail await` composition, subagent-via-Task-result.
- `plugins/cyberlegion/skills/subagent-backend-governance/SKILL.md` — subagent path (no prep/collect/
  result-file; caller reads Task return).
- `plugins/cyberlegion/skills/relay-governance/SKILL.md` — report/ask keyed on reporting agent's
  lifecycle (framed → return needsInput; bare top-level/cron → mail owner + exit).
- `plugins/cyberlegion/agents/headless-legate.md` — headless realization (batch needsInput).

## The gap this CR closes

- Plugin spec root = `draft`, dispatch node **never spec-gated**, **no `.feature`** exists.
- `dispatch/README.md` still describes the **retired** pre-CR-4 CLI contract (`dispatch channel
  --agent --brief-file --wait`, `prep → collect`, result-file `DispatchResult`) — stale, must realign.

## Carried contract (recovered from retired migration-map §CR-4)

`cyberlegion-cli-realign.migration-map.md` §"CR-4 — retired dispatch contract" (recovered from git
`202757ec`) maps each retired behavior to where it lives now: prep/collect/result-slot DROPPED;
subagent result = **Task-result**; channel result = **`mail await`**; verdict-schema DEFERRED to a
`mail --verdict-schema` CR; CLI never auto-routes (standing charter invariant). The `.feature` must
encode the *surviving* contract, not the retired verbs.

## Resolved decisions (settled; do not relitigate)

- **Scope = dispatch/ only.** gateway/init/inbox stay draft for later CRs.
- **Backfill, not build.** Frozen scenarios must match shipped skills; a mismatch = fix the *scenario
  draft* in explore (pre-freeze), not the skill.
- **Leash `auto-none`** — surface both gates for human ratification (first plugin freeze).

## Emergent scope note — small behavior add on top of backfill

The human caught that the pre-CR-5 collapse `NOT(warm AND interactive) → subagent` wrongly swept a
`warm=false, interactive=true` def into the one-shot subagent path (which can't converse). Decided:
**fail loud** — the Legate (`dispatch-governance` §3), not the CLI, rejects that combination as a
malformed def (interactive ⇒ must be warm; cold one-shot ⇒ must not be interactive); not a
`needsInput`, never swept to subagent. So CR-5 = backfill **+** one guard. Two skills now changed:
`dispatch-governance` (+fail-loud row/bullet) and `subagent-backend-governance` (result-file residue
→ Task-result). These are the deliver artifacts for the impl gate.

## NEXT — resume here

**MISSION COMPLETE — PR #132 open.** Both gates ratified (spec + impl, `by:unional`), 3 commits on
branch `legion-gateway-legate` rebased on origin/main, `pnpm verify` green (19/19), pushed.

**Remaining, not blocking:**
- **Await merge of PR #132**, then retire this brief at doctrine distillation.
- **Follow-up CR** (unfiled): freeze the `subagent | channel` seam's "never pin a command name" half
  as a testable scenario (spec-judge flagged it consumer-coupling, out of dispatch/'s own surface).
- Formation pass due corpus-wide (on-demand via `sdd:manage`) — not gated on.
