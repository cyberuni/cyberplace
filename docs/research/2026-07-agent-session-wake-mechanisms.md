# Waking an agent session on an inbox message

**Date:** 2026-07 · **Informs:** the cyberfleet comms-wake PoC
(`.agents/plans/cyberfleet-comms-wake-poc.plan.md`), the cyberfleet inter-session
messaging design (files + CLI + hooks), and any future ADR on the fleet wake seam.

How do you make a running agent session (Claude Code, Codex, Cursor) **notice a new
message and respond** without a human typing? This survey fixes the vocabulary, enumerates
every wake path we found, and records the cost model — so the choice of wake seam is a
lookup, not a re-derivation.

## The core constraint

A conversational model is **not running between turns.** It has no background thread, no
clock, no autonomous loop. It thinks only when it is handed a turn; the moment it finishes,
it freezes. Two consequences that kill the obvious ideas:

- **A system-prompt instruction like "check the inbox every 10 seconds" does nothing.**
  There is no ticker to fire it. The model "checks" only when something already gave it a
  turn, checks once, and re-freezes. Poll interval is meaningless to a thing that is not
  running.
- **The model can never be its own watcher or its own timer.** Something *outside* the
  frozen turn must both observe the event **and** deliver a turn.

So every real design has the same shape:

```
outside signal source  →  detects event  →  DELIVERS A TURN  →  model acts
```

The design space is just: *what waits*, and *how the turn gets delivered*.

## Two independent axes

| Axis | Options |
|---|---|
| **Who waits for the event** | the session parks itself · an outside process · the harness · a scheduler |
| **How the turn is delivered** | tool-call returns · keystroke injection · PTY stdin write · harness re-invoke · timer fire · hook on an existing turn |

The wake paths below are combinations of these two axes.

## Wake paths

| # | Path | Who waits | Turn delivered by | Idle token cost | Session stays interactive | Needs multiplexer | Latency |
|---|---|---|---|---|---|---|---|
| **A** | **Block-and-wait** (mux-free) | session parks inside a blocking tool call | tool-call returns on the event | ~0 (hanging OS process) | **no — hard-parked** | no | instant |
| **A′** | **Background watcher + harness re-invoke** *(best in Claude Code)* | detached OS process (`run_in_background`) | harness re-invokes on task completion | ~0 | **yes** | no | instant |
| **B** | **Keystroke inject** (firstmate) | outside watcher process | `tmux send-keys` into the pane | ~0 (watcher is an OS process) | **yes** | **yes** | instant |
| **C** | **Own the PTY** | parent wrapper you wrote | wrapper writes child stdin | ~0 | wrapper-defined | no | instant |
| **D** | **`/loop` polling** | a scheduler / timer | timer fire → fresh turn | **pays every wake** | between wakes | no | up to interval |
| **E** | **Hook on an existing turn** | nothing — piggybacks | Stop / PostToolUse hook checks inbox | ~0 | yes | no | only while already active |

Notes per path:

- **A — Block-and-wait.** Model calls a blocking command (`inotifywait -e create,modify
  ./inbox/`, or a `while [ … ]; do …; done` wait). The turn stays open until the file
  changes; then the tool returns and the model handles it, **then must re-arm** (call the
  blocker again) — it is a model-driven loop. Cost is ~0 while parked, but the session is
  **committed to waiting on the file, not on the user** ("must park"). Tool-call timeouts
  (e.g. 10 min max) make it a *bounded-wait loop* (`inotifywait -t 240 …`), not one infinite
  block. Break out with Esc / Ctrl-C.
- **A′ — Background watcher + harness re-invoke.** Strictly better than A *in a harness that
  re-invokes on background-task completion* (Claude Code does). Run the blocking watcher as a
  detached background task; when the file changes it **exits**, and the harness hands the
  model a fresh turn automatically. Event-driven **and** ~0 idle cost **and** the session is
  not hard-parked. This is the recommended default for a **locally observable** inbox.
- **B — Keystroke inject (firstmate).** An always-running outside watcher (`fswatch` /
  `chokidar` / inotify) does `tmux send-keys` into the target pane. **Only** way to wake a
  *live interactive* claude/codex that you do not own the process of. Requires a real
  multiplexer (see detection below). Keep the injected string a **tiny nudge**, never the
  payload (see doorbell-vs-mailbox).
- **C — Own the PTY.** You spawn the agent as a child and control its stdin, so you write
  when the event fires. Full control, but you built and maintain the wrapper. For Cursor ACP,
  viable only if you own the process.
- **D — `/loop` polling.** Timer-driven re-invocation (`ScheduleWakeup` / cron). **Polling,
  not event-driven** — see cost model. Right only when the event is *not locally observable*
  (remote queue, CI, an API state the harness cannot watch exit on), when you need
  **survival across session restarts**, or when a long interval makes the token tax small.
- **E — Hook on an existing turn.** A Stop or PostToolUse hook checks the inbox each time the
  model finishes something. Zero standing cost, but fires **only while the session is already
  active** — it cannot wake an idle session. Good as a cheap complement, not a primary wake.

There is **no keystroke-free inject** for a live interactive claude/codex. That was the PoC
verdict and it still holds — B, or own-the-process (A′/C), are the only ways to poke a live
session.

## Cost model: why `/loop` polling is not free

The Anthropic prompt cache has a **5-minute TTL**. That single fact shapes polling economics:

- Poll **under 5 min** (e.g. 270s) → cache warm → each wake re-reads context at cache-read
  rate (cheap-ish).
- Poll **over 5 min** → cache expired → each wake re-reads the **whole context uncached** =
  full input-token price, every time.
- **Never pick exactly 300s** — worst of both: you pay the miss without amortizing it. Sit at
  270s (warm) or jump to 1200s+ (one miss buys a long wait).

Order-of-magnitude tax: context ~30k tokens, poll every 4.5 min ≈ 13 wakes/hr ≈ 300/day ≈
**~10M cache-read tokens/day just to poll an empty inbox.** A standing meter that runs
forever. Event-driven paths (A / A′ / B) read **0** until a real event fires.

Corollary (from the `ScheduleWakeup` guidance): **do not `/loop`-poll for background work you
started** — when a harness-tracked task finishes, you are re-invoked for free. That is exactly
why A′ beats D for a local inbox.

## Doorbell vs mailbox: the injector does not replace the messaging system

`tmux send-keys` types literal characters into a pane, then Enter. It *can* type a full
message — but it **should not**. The terminal is a lossy, escaping-hostile channel:

- Multi-line text, quotes, backticks, code get mangled or interpreted by the TUI.
- Keystrokes injected while the model is mid-output interleave or get eaten — a full message
  typed and lost is **gone forever**.
- A typed string carries **no** sender, timestamp, thread, or read/unread state.
- Multiple senders injecting into one pane collide.

So the architecture is a deliberate **split**:

| Layer | Role | Properties |
|---|---|---|
| **Messaging system** (files + CLI) | the **mailbox** — source of truth | durable content, sender, ts, thread, unread state |
| **Injection / wake** (send-keys, re-invoke, timer) | the **doorbell** | dumb, tiny, lossy — "you have mail, go read it" |

The injected nudge stays minimal (`run cyberfleet pod inbox`); the model wakes and reads the
**real** message from the durable store. **The injector is the reason you *want* a messaging
system, not a replacement for it.** Doorbell-only is acceptable only for trivial "check X"
with no payload and a known place to look.

## Multiplexer detection (gates path B)

The wake-path choice keys off whether a real multiplexer is present.

| Signal | Means | Reliability |
|---|---|---|
| `$TMUX` non-empty | inside tmux (socket path + pane id) | high |
| `$TMUX_PANE` set | inside tmux, gives pane id | high |
| `$STY` set | inside GNU screen | high |
| `tmux` / `screen` in **process ancestry** | a mux is an ancestor | **ground truth** |
| `$TERM` = `screen*` / `tmux*` | hint only — can be faked | low |

**Trap:** the Bash tool spawns its own shell from the user profile, which is **not
necessarily the pane the human sees.** An empty `$TMUX` in the tool shell proves the *tool*
is not in tmux — not that the human isn't. Walk the process ancestry from `$$`; that cannot
be faked by a stray env var. Probe from **the same context that will do the injecting**,
since that shell's mux membership decides whether `send-keys` can land.

Consequence: no mux (e.g. running under **herdr**) → **path B is off the table**; fall back
to A′ / A (locally observable) or C (own the process).

## Recommendation

- **Local inbox, Claude Code:** **A′** (background `inotifywait` + harness re-invoke) — event
  driven, ~0 idle cost, session stays usable. Default.
- **Local inbox, dedicated listener session, no re-invoke available:** **A** (block-and-wait
  loop). Accept the hard-park.
- **Live working session you do not own, mux present:** **B** (firstmate send-keys), nudge
  only.
- **You own the process:** **C** (PTY stdin).
- **Event not locally observable, or must survive restarts, or long interval OK:** **D**
  (`/loop`), sized to the cache TTL.
- **Cheap complement while already active:** **E** (Stop/PostToolUse hook).
- **Always** keep the durable mailbox behind whatever doorbell you pick.

## Open questions

- **A′ portability:** does Codex / Cursor re-invoke on background-task completion the way
  Claude Code does? If not, they fall back to A or C for a local inbox.
- **Stop-provenance:** a session that block-and-waits (A) then halts loses "why I halted" —
  ties into the SDD stop-provenance gap.
- **Firstmate targeting:** resolving the correct pane id when multiple panes / sessions exist;
  cross-checking `$TMUX_PANE` against the intended recipient before `send-keys`.
- **Nudge idempotency:** if two doorbell signals fire before the model drains the inbox, the
  second nudge is redundant — the model should reconcile from the mailbox, not the nudge count.
