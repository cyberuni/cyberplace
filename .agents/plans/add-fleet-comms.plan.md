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
  - content: "SPEC GATE (user-ratified): freeze the .feature suite, set gate line"
    status: pending
  - content: "Build cyberfleet CLI package from frozen suite + verification per scenario"
    status: pending
  - content: "Ship fleet skill + plugin hooks/hooks.json + shared registerHooks; gitignore .cyberfleet/"
    status: pending
  - content: "Impl gate (cold impl-judge) → status implemented; handoff PR"
    status: pending
---

# add-fleet-comms — harness-agnostic agent sessions + messaging (MCP-free)

CR against `.agents/specs/cyberspace/` (status: implemented). Adds a new **top-level `fleet/`
capability**: create agent sessions + message between them, harness-agnostic (Claude ↔ Cursor ↔
Codex), MCP-free. Engine = new `cyberfleet` CLI (offloaded, like universal-plugin); interface =
`fleet` gateway skill in the cyberspace plugin; surfacing = SessionStart/PostToolUse hooks.

Approved design plan: `/home/user/.claude/plans/for-cyberspace-i-want-streamed-beaver.md`.

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

## NEXT

Spec draft complete + cold-spec-judge verdict incorporated (branch `add-fleet-comms`; commits
`ad02930` draft, `732215e` judge fixes). All five nodes clean: `check-spec-structure` 0/0,
`concept-index` no drift, `check-suite` OK, no residual slug-path refs. Judge went ALIGNED:false →
all eight fixes applied (sibling refs→bare names, spawn Scenario Outline + errors, identity/messaging/
surfacing negatives, cut --reply-to, sequence diagram). Features still **un-@frozen** (draft).

Resume here:
1. **Run the grill / spec gate with the user.** The gate is a user-ratified step — do NOT
   self-freeze five brand-new nodes. Present the draft + judge verdict, do a grill round if the
   user wants, then at approve: add `@frozen` to each `.feature`, write the `gate` line to the
   `add-fleet-comms.f1e2d3.jsonl` ledger shard, keep root `spec.md` in sync.
3. **Then Step 3 (deliver):** build the `cyberfleet` CLI package + the `fleet` skill + hook wiring
   from the frozen suite (see the design plan `/home/user/.claude/plans/for-cyberspace-i-want-streamed-beaver.md`
   §"Files to create / modify"), one verification per frozen scenario; cold impl-judge; handoff PR.

Do not touch any existing frozen scenario (all-additive). Design plan is the impl reference.
