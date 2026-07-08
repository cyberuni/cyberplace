# herdr-mux-identity — design & root cause

## The symptom

In a herdr session, `cyberlegion mail inbox` fails with *"no identity in this session"* even after
`cyberlegion identity register`. Two separate CLI invocations in the same herdr pane never correlate
to one identity, so registration never "sticks" the way it does under tmux.

## Root cause (two compounding misses)

1. **Latent wrong-env-var bug.** `src/console/mux-probe.ts` resolves the herdr pane from
   `env.HERDR_PANE`. herdr does not set that. It exports **`HERDR_PANE_ID`** (verified live in a herdr
   pane: `HERDR_PANE_ID=w3:p4`, alongside `HERDR_ENV=1`, `HERDR_TAB_ID`, `HERDR_WORKSPACE_ID`,
   `HERDR_SOCKET_PATH`). So every herdr pane lookup silently returned `undefined` — herdr pane
   detection never actually worked anywhere, even in the wake/session code that nominally "supports"
   herdr.

2. **Identity was never reconciled to the mux abstraction.** `src/identity.ts` (`resolveSelfId`,
   `register`) reaches directly for `env.TMUX_PANE` — it never consults any herdr signal at all. It
   was authored as a faithful migration of cyberfleet's tmux-only identity (CR-2, before herdr
   existed in this codebase) and its `.feature` froze that tmux-only rule. herdr support landed later
   in session/wake (CR-4, `mux-probe`) but that CR's spec scope never touched the already-frozen
   identity node.

## Why the spec/architect "missed" it (the honest answer)

The identity spec was **complete and internally consistent for its own scope** — it correctly froze
tmux-only self-resolution at the time it was written. Each CR's spec gate grades **its own diff**, not
whether a newly-added shared primitive (the mux probe) obsoletes an assumption in a sibling,
already-frozen spec. That cross-node question — *"does identity know about every multiplexer the
project now supports?"* — is the **Warden's** (formation-loop) job: corpus-wide, post-mission,
node-shape/reconcile. CR-4 should have kicked a Warden finding against `identity`/`session` and did
not (unfiled Warden follow-ups are a recurring pattern here). The wrong-env-var bug (#1 above) then
**masked** the gap: with herdr pane detection silently broken and no test exercising a real
`HERDR_PANE_ID`, nothing ever surfaced that identity was tmux-only.

So: not a spec-completeness failure — a latent bug plus an unfiled cross-node reconcile.

## The fix (clean, mostly additive)

herdr provides the exact tmux analog: a native per-pane env var (`HERDR_PANE_ID`) in the same
`wX:pY` namespace that herdr's `pane split` returns. So identity needs no TTY redesign and no
ancestry walk in the hot path — just resolve "my pane" mux-agnostically from env.

1. Fix `HERDR_PANE` → `HERDR_PANE_ID` in `mux-probe.ts`.
2. One shared "current pane id" helper (fast-path `$CYBERLEGION_MUX_PANE` → `$TMUX_PANE` →
   `$HERDR_PANE_ID`); `resolveSelfId`/`register` use it. Env fallback `$CYBERLEGION_AGENT_ID` fires
   only when in NO mux pane. Pane→id index is already a plain string key, so it works for herdr
   unchanged once fed the right pane id.
3. Generalize `AgentRecord.tmux` to a pane locator tagged with its mux, so `prune` runs the correct
   liveness check per mux (never `tmux has-session` on a herdr pane id).
4. `injectInbox` (SessionStart hook) auto-registers a live-pane session with no identity yet.
5. `prune` gains herdr pane-existence liveness (reap a closed herdr pane immediately, not only after
   the staleness window).

## Freeze impact

Both `identity.feature` and `surfacing.feature` are `@frozen`. Most of this diff is additive
(herdr-parallel scenarios self-clear), but **three** previously-frozen scenarios are **rewritten** —
a freeze re-open (Clearance), ratified in-session by the channel holder:

1. `identity` — *"$CYBERLEGION_AGENT_ID resolves self-id only when there is no $TMUX_PANE"* →
   generalized to *"…only when the session is in no multiplexer pane"* (a herdr pane must also block
   the env fallback). Tmux case preserved.
2. `identity` — *"an unregistered pane does not fall back to $CYBERLEGION_AGENT_ID"* → became a
   `Scenario Outline` over `{tmux, herdr}`; the tmux row reproduces the original guarantee verbatim.
3. `surfacing` — *"an unregistered caller gets no output and no error"* → **narrowed**: the old
   guarantee (silence + no side effect for *any* caller with no self id) now applies only to the
   no-pane subset. A no-identity caller **in a live pane** gains a new, previously-disallowed side
   effect — best-effort auto-registration (a hub write) — before the "print nothing" path. This is
   the headline behavior the CR exists to add (auto-register on session start); the narrowing is
   intentional and ratified, not incidental.

## Follow-ups considered

- Herdr harness auto-detection via `herdr pane read` (the tmux-pane-command probe is tmux-only). Rare
  path; env-var harness detection (CLAUDECODE etc.) already works mux-agnostically. Deferred.
