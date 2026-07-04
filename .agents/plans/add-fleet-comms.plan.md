---
name: add-fleet-comms
status: active
todos:
  - content: "Intake: locate cyberspace spec, scaffold plan + leash shard"
    status: completed
  - content: "Author fleet/ capability index README (descriptive)"
    status: completed
  - content: "Author fleet/gateway node (the fleet skill — ACED squad: @trigger + @rubric)"
    status: completed
  - content: "Author fleet/identity node (cyberfleet register/who/self-recall/harness-detect — SDD-default boolean)"
    status: completed
  - content: "Author fleet/messaging node (send/inbox/read/ack, epochMs-hex ordering, collision-free — SDD-default)"
    status: completed
  - content: "Author fleet/spawn node (tmux split, pre-register, brief-via-hook — SDD-default)"
    status: completed
  - content: "Author fleet/surfacing node (inbox --hook emitter payload + per-vendor registration — SDD-default)"
    status: completed
  - content: "Update root spec.md Capability map + Placement map with the fleet capability"
    status: completed
  - content: "Cold spec-judge pass over the draft; incorporate verdict (done, ALIGNED:false resolved)"
    status: completed
  - content: "Cold spec-judge RE-GRADE after fixes → ALIGNED:true, all 5 nodes PASS 3 lenses"
    status: completed
  - content: "SPEC GATE passed — froze 5 .feature, gate:spec ledger line, root status→approved (commit 8bb2314)"
    status: completed
  - content: "Build cyberfleet CLI package from frozen suite + verification per scenario (7a5f2b7, 38 tests)"
    status: completed
  - content: "Ship fleet gateway skill (471d08e, audit clean); plugin hooks.json + shared registerHooks DEFERRED (not frozen-required)"
    status: completed
  - content: "Impl gate (cold impl-judges: sdd engine PASS + aced gateway PASS) → status implemented (d13344b)"
    status: completed
  - content: "Handoff: push branch + open PR (OUTWARD-FACING — awaiting user confirm); then follow-ups + Warden"
    status: in_progress
---

# add-fleet-comms — harness-agnostic agent sessions + messaging (MCP-free)

CR against `.agents/specs/cyberspace/` (status: implemented). Adds a new **top-level `fleet/`
capability**: create agent sessions + message between them, harness-agnostic (Claude ↔ Cursor ↔
Codex), MCP-free. Engine = new `cyberfleet` CLI (offloaded, like universal-plugin); interface =
`fleet` gateway skill in the cyberspace plugin; surfacing = SessionStart/PostToolUse hooks.

Approved design plan: `.agents/plans/add-fleet-comms.design.md`.

## Node breakdown (fleet/<unit>, never 3 deep)

- `fleet/gateway` — the `fleet` skill (agent-behavior → **ACED** squad: @trigger + @rubric).
- `fleet/identity` — `cyberfleet register/who`, pane-keyed self-recall ($TMUX_PANE), harness
  detect (**SDD-default**, boolean, script-verifiable).
- `fleet/messaging` — `cyberfleet send/inbox/read`, per-recipient file queue under `.cyberfleet/`,
  ack-by-move, `<epochMs>-<hex>` ordering, collision-free per ADR-0020 (**SDD-default**).
- `fleet/spawn` — `cyberfleet spawn`: tmux split, pre-register spawnee, brief via SessionStart
  hook (not send-keys), per-harness launch map (**SDD-default**).
- `fleet/surfacing` — `cyberfleet inbox --hook` emits the SessionStart `additionalContext`
  payload; registration reuses `vendors.json`/`build-definition` per-vendor mapping (**SDD-default**).

MVP = pull via hooks, project-scoped `.cyberfleet/`, tmux spawn. Phase 2 (own CRs) = watcher,
live send-nudge, threads, cross-repo root, Copilot.

## STATUS — mission implemented, awaiting push/PR

Both SDD gates passed and self-asserted `by:agent`; root spec `status: implemented`. Commits on
branch `add-fleet-comms`: `8bb2314` spec gate (froze 5 nodes) · `7a5f2b7` cyberfleet CLI engine
(44 tests) · `471d08e` fleet skill · `fec1a2c` impl-gate blocker fixes · `d13344b` impl gate.
Ledger shard `add-fleet-comms.f1e2d3.jsonl` has leash + gate:spec + gate:impl. Whole monorepo green.

**Remaining (handoff):**
1. **Push `add-fleet-comms` + open PR** — outward-facing; do only on user confirm.
2. **Follow-up CRs** (all non-blocking, from the judges):
   - plugin-level `hooks/hooks.json` auto-wire in the cyberspace plugin (needs manifest `hooks` +
     per-vendor build) — the convenience layer over `cyberfleet install --agent`.
   - dedupe `cyberfleet install`'s per-vendor writer vs cyberplace's hook engine (blocked: cyberplace
     `buildHookDefinition` hardwires `cyberplace hook run`, no arbitrary-command reuse).
   - `eval.md` run-policy under `.agents/specs/cyberspace/` (ACED judge fell back to defaults).
   - test coverage: identity self-file fallback branch; broader cli.ts paths (register/read/spawn/install).
   - Warden corpus gap: `build-definition.ts`/`vendors.json` per-vendor mapping has no spec node.
   - fleet e2e in `acceptance/` (init → register → spawn → exchange).
3. **Post-merge:** run the detached Warden formation pass (deferred to avoid a shared-tree clobber
   on this branch); retire this plan once merged + doctrine-distilled.

## NEXT — resume here (historical: spec gate; superseded by STATUS above)

**Next action — execute the spec gate (verdict already IN, nothing to re-decide).** The cold
spec-judge re-grade returned **ALIGNED: true**, all 5 nodes PASS on {oracle, builder, architect}.
Paused before recording, so it is a clean draft. To land the gate (all in one commit):
1. Freeze the 5 `.feature`s — prepend a `@frozen` line:
   `for f in .agents/specs/cyberspace/fleet/*/*.feature; do sed -i '1i @frozen' "$f"; done`
2. Append a `gate` line to the ledger shard `.agents/specs/cyberspace/ledger/add-fleet-comms.f1e2d3.jsonl`:
   `{kind:gate, cr:add-fleet-comms, gate:spec, verdict:approve, by:agent, cause:dimension, why:"…", frozen:[the 5 feature paths]}` (free-text why, matches the write-vendor-config precedent line in this same dir).
3. Root `spec.md`: set `status: implemented → approved`; replace the `approval` map with `approval.spec`
   for THIS cr (`verdict:approve, by:agent, cause:dimension, why:{floor,blast,novelty,confidence}` per
   `lifecycle-governance`) — drop the stale `add-write-vendor-config` approval blocks. (Root has one
   lifecycle; it rides `approved` until the impl gate returns it to `implemented`, per the
   write-vendor-config precedent.)
4. Validate: `node <sdd-skills>/spec-gate/scripts/check-spec-state.mts --root .agents/specs/cyberspace`
   (+ re-run check-spec-structure / concept-index --check). Commit the gate as one unit.

**Then Step 3 (deliver) — build from the frozen suite.** Design plan
`.agents/plans/add-fleet-comms.design.md` §"Files to create/modify" is the
impl reference. Scaffold **new `packages/cyberfleet/`** mirroring `packages/cyberplace` (already read:
package.json → name `cyberfleet`, bin `cyberfleet`, dep commander, tsdown `entry: src/cli.ts`, bin shim
`dist/cli.mjs`; copy `src/output.ts` helpers). Modules: `src/{cli,paths,identity,registry,message,spawn,
output,runtime/inject-inbox}.ts` + co-located tests, one verification per frozen scenario. Register in
`pnpm-workspace.yaml` (`packages/*` already globs it) + add `.cyberfleet/` to root `.gitignore`. For
`cyberfleet install --agent`, reuse cyberplace's `registerHook(input, options)` (src/hook/register.ts,
exported) + `buildHookDefinition` via a `workspace:*` dep on cyberplace — that's the one cross-package
seam. Then spawn the cold impl-judge → `status: implemented` + `approval.impl` + ledger `gate:impl` line;
handoff PR.

**Carry-forward follow-ups (from the judge; not gate blockers — file as their own CRs):**
- `build-definition.ts` / `vendors.json` (the per-vendor hook mapping surfacing depends on) has no spec
  node under cyberspace → Warden corpus gap.
- No fleet e2e in `acceptance/` (consistent with bootstrap/plugin also empty) → follow-up.
- `gateway` must-not/edge density at the floor (3) → no margin if the ACED impl-judge wants more.

Constraints: all-additive — do not touch any existing frozen scenario. Session ledger hash `f1e2d3`
(reuse for any further line this session). Both SDD gates run in-session by the conductor (default),
self-asserted `by:agent` within the `auto-spec` leash.
