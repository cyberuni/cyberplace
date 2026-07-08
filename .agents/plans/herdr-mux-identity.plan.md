---
name: herdr-mux-identity
status: active
todos:
  - content: "explore: draft identity + surfacing spec revisions (mux-agnostic self-id, auto-register, record locator carries mux)"
    status: completed
  - content: "spec gate: cold spec-judge, freeze touched .feature, record re-open of the 3 rewritten scenarios"
    status: completed
  - content: "deliver: build impl against frozen suite (mux-probe HERDR_PANE_ID fix, mux-agnostic resolveSelfId/register, auto-register hook, prune herdr-liveness)"
    status: completed
  - content: "impl gate: cold impl-judge over frozen scenarios"
    status: completed
  - content: "handoff: Warden placement pass, branch + PR, follow-ups"
    status: in_progress
---

# herdr-mux-identity

Make cyberlegion identity resolution mux-agnostic so a **herdr** session is recognized and
self-registers the same way tmux already is. Target project spec:
`packages/cyberlegion/.agents/spec` (`cyberlegion` package).

See `herdr-mux-identity.design.md` (sibling) for the root-cause analysis and the concrete finding.

## Change

1. **`HERDR_PANE_ID` bugfix** — `src/console/mux-probe.ts` reads `env.HERDR_PANE`; herdr actually
   exports `HERDR_PANE_ID` (verified live: `w3:p4`). herdr pane detection never worked. Fix the name.
2. **Mux-agnostic self-resolution** — `resolveSelfId`/`register` (`src/identity.ts`) resolve "my pane
   id" from the current multiplexer (tmux `$TMUX_PANE` OR herdr `$HERDR_PANE_ID`, plus the
   `$CYBERLEGION_MUX_PANE` fast-path) via one shared helper; the `$CYBERLEGION_AGENT_ID` fallback
   fires only when the session is in NO mux pane. Index pane→id for herdr too.
3. **Record locator carries the mux** — `AgentRecord.tmux` (`src/store/store.ts`) generalizes to a
   pane locator tagged with its mux, so `prune` runs the right liveness check per mux instead of
   `tmux has-session` on a herdr pane id (which would false-reap live herdr sessions).
4. **Auto-register on SessionStart** — the surfacing hook (`injectInbox`, `src/runtime/inject-inbox.ts`)
   registers a live-pane session that has no identity yet, instead of silently no-op'ing.
5. **Prune herdr-liveness** — `prune` reaps a *closed* herdr pane immediately (herdr pane-existence
   query) rather than only after the 15-min staleness window.

## Spec impact

- `identity/` node — REVISE. Rewrite the 2 self-recovery scenarios ("$CYBERLEGION_AGENT_ID … only
  when there is no $TMUX_PANE"; "an unregistered pane does not fall back …") to be mux-generic
  (freeze RE-OPEN, ratified in-session). Add herdr-parallel register + prune scenarios (additive).
- `surfacing/` node — REVISE. Rewrite "unregistered caller gets no output" — a freeze RE-OPEN and a
  **narrowing**, not a rewording: a no-identity caller in a live pane now auto-registers (a new hub
  write) before surfacing (ratified in-session). Add the auto-register + best-effort scenarios.

Freeze re-open covers **3** rewritten scenarios total (2 identity + 1 surfacing); everything else is
additive and self-clears.

## NEXT

DONE through handoff. Spec gate (seq:2 `by:agent`) + impl gate (seq:3 `by:unional`) approved; both
`.feature` re-frozen. **PR #90** open on branch `herdr-mux-identity` (awaiting merge). Post-mission
Warden formation pass spawned detached. Keep this plan until the PR is merged and doctrine-distilled,
then retire.

Follow-ups:
1. e2e-verify the auto-register + best-effort scenarios through a real `mail hook` subprocess (today
   unit-level at `injectInbox()`). → **filed #91**
2. herdr harness auto-detection (the `tmux display-message` pane-command probe stays tmux-only). →
   **filed #92**
3. Doctrine note: check plan/design "freeze impact" against `gherkin-cli diff` counts before trusting
   them complete (the surfacing narrowing slipped the first accounting). — doctrine-loop note, not a
   GH CR (belongs in the SDD ledger, not an issue).
