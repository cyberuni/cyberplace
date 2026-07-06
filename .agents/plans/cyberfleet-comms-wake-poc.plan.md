---
name: cyberfleet-comms-wake-poc
status: active
todos:
  - content: "RESEARCH done: firstmate = multiplexer keystroke-injector (~14k Bash; tmux send-keys + retried/verified Enter + composer screen-scrape); NO PTY-own/socket/MCP; files-only hub-and-spoke, append-only .status logs polled by a watcher"
    status: completed
  - content: "LANDSCAPE done: no keystroke-free between-turns inject into a live human-launched claude/codex TUI; cursor ACP session/prompt works ONLY if you own the process; codex inject = open FR openai/codex#11415"
    status: completed
  - content: "MODEL done: waking a session = 3 paths — (A) receiver blocks on a wait [mux-free, must park] | (B) multiplexer injects keystrokes | (C) own the PTY; a SessionStart-hook listener is a CHILD and cannot write its parent's stdin"
    status: completed
  - content: "PoC Stage 0+A DONE (PASS): inbox/identity as plain cmds + FIFO self-block proved mux-free SOLICITED wake — receiver parked in process-state S (zero CPU), kernel woke the blocked read; nudge-not-body variant also PASS"
    status: completed
  - content: "PoC Stage B DONE (PASS): herdr pane send-text + verified/retried Enter injected into a foreign un-parked shell — UNSOLICITED inject works but needs the multiplexer (firstmate worker path)"
    status: completed
  - content: "PoC Stage C DONE (PASS): script(1) owned-PTY + stdin-from-FIFO proved mux-free UNSOLICITED inject — writing our held-open FIFO drives bash via the PTY we own, no herdr"
    status: completed
  - content: "PoC Stage D (opt-in, NOT run): real claude receiver would confirm a real new user turn + composer/Enter fragility; skipped (costs tokens), architecture already answered by A/B/C"
    status: pending
  - content: "DECIDE (empirically confirmed): transport (inbox/files/FIFO) stays multiplexer-agnostic; fleet layer owns the PTY-wrapper/multiplexer only for unsolicited wakes into un-parked foreign sessions — feeds the transport-decouple restructure"
    status: completed
---

# PoC: waking an interactive agent session with an inbox message — multiplexer-free vs multiplexer

Investigation + PoC de-risking the comms/wake mechanism under the "decouple messaging transport from
the fleet metaphor" direction. Sibling of [`cyberfleet-stations.plan.md`](./cyberfleet-stations.plan.md)
(the warm+observable channel backend). Target package: `packages/cyberfleet`.

## Question

Can a message sent from one pane reach a live **interactive** agent session in another pane and become
its **next turn** — WITHOUT going through the multiplexer (herdr), and without the receiver polling?

## Findings (research complete)

- **No harness** (Claude Code, Codex) lets you inject a between-turns prompt into an *already-running,
  human-launched* interactive TUI without keystroke injection. **Cursor ACP** `session/prompt`
  (JSON-RPC over stdio) can — but only if you **own the process** from launch. `codex inject` is an
  open feature request (openai/codex#11415).
- **firstmate** (github.com/kunchenguid/firstmate) is a multiplexer keystroke-injector: ~14k lines of
  Bash driving an *external* multiplexer (tmux default; herdr/zellij/orca/cmux experimental) via
  `send-keys -l` + retried `Enter`, **verified by screen-scraping** a ghost-text/border-stripped
  composer detector. No PTY ownership (except its Orca backend), no sockets, no MCP. Topology is
  files-only hub-and-spoke; worker→orchestrator replies flow through append-only per-task `.status`
  event logs polled by a watcher (no peer inbox mesh).
- firstmate has **two wake mechanisms**: (1) the orchestrator wakes *daemonlessly* because it was
  **blocked on its own wait command** and an external event makes that command return — no injection,
  no multiplexer; (2) workers/AFK-escalation wake by **keystroke injection** (needs the multiplexer).
  It has no multiplexer-free way to wake a *different, un-parked* live session.

## The fundamental tradeoff

- **Multiplexer-free + no-injection** ⇒ the receiver must **voluntarily block on a wait**; push
  reaches only a session that parked itself (kernel wakes the blocked read). Maps to a `await --thread`
  verb.
- **Unsolicited push** into a session doing nothing special ⇒ needs the **multiplexer OR an owned PTY**.
- A SessionStart-hook-registered listener is a **child** of the session and cannot write its parent's
  stdin — so "send prompt to session" always resolves to blocking-wait, multiplexer, or owned-PTY.

Registration/surfacing is already solved infra: `packages/cyberfleet/src/install.ts` wires per-harness
SessionStart hooks (`.claude/settings.json`, `.cursor/hooks.json`, `.codex/hooks.json`) running
`cyberfleet inbox --hook`.

## Environment (verified live at capture)

- Running under herdr (agent-aware multiplexer): live pane + a sibling pane in the same tab; socket
  API available. herdr verbs confirmed: `pane split/run/send-text/send-keys/read/close`,
  `wait output --match`, `agent start/send/wait`.
- Tooling present: `script` (util-linux PTY owner), `nc`, `claude`. Absent: `node-pty`, `expect`,
  `socat`.

## PoC approach (scratchpad-only; NOTHING in the repo)

Single orchestrating shell script; messages epoch-tagged; each stage verifies via a shared receiver
log so the mux-free stages verify mux-free too. Stages run independently.

- **Stage 0 — inbox + identity:** model the hook side effects as plain commands — `register` writes a
  registry json (id + inbox paths); create the inbox dir + a per-agent FIFO.
- **Stage A — mux-free solicited wake:** receiver runs `msg=$(cat <fifo>)` (idle, zero CPU, no herdr);
  sender does `printf ... > <fifo>`; the read returns and the receiver logs/acts. Plus a nudge-not-body
  variant (nudge carries no body; receiver reads the mail file).
- **Stage B — multiplexer unsolicited inject (CONTRAST):** receiver runs `bash -i` (not waiting);
  sender injects via herdr `pane send-text` + `send-keys Enter`, verified with `herdr wait output`.
- **Stage C — owned-PTY unsolicited (mux-free):** launch `bash -i` under `script -qec ... /dev/null`
  with stdin from a FIFO; writing the FIFO injects via *our* PTY — no herdr.
- **Stage D (opt-in) — real `claude` receiver:** launch claude in a new herdr pane; show Stage-B
  injection landing as a real new user turn (and optionally Stage-A: claude runs a blocking
  `inbox-wait` as its action). Confirms real-agent behavior + fragility. Costs tokens; skip by default.
- **Teardown + verdict:** clean up FIFOs/panes; print `STAGE A/B/C: PASS|FAIL` + a one-line verdict
  mapping each stage to its architecture.

## What this decides

The **messaging transport** (inbox/files/FIFO) is fully multiplexer-free. The **wake** is multiplexer-
free too *if* the receiver parks on a wait (A) or is launched under a PTY we own (C). herdr keystroke
injection (B) is needed only to push into a foreign, un-parked live session. ⇒ the extracted transport
primitive can stay multiplexer-agnostic; the fleet layer owns the PTY-wrapper/multiplexer for
unsolicited wakes.

## Out of scope

No repo code, no cyberfleet integration, no ACP/Cursor implementation, no ADR/spec changes.

## Verdict (PoC ran — all three paths PASS)

The scratchpad `poc-wake.sh` ran Stages 0/A/B/C live under herdr 0.7.1. Empirical result:

- **A — mux-free solicited: PASS.** Receiver parked on `cat <fifo>`, observed in process-state `S`
  (interruptible sleep, zero CPU). Sender's write to the FIFO returned the blocked read; body
  delivered. Nudge-not-body variant also PASS (empty nudge wakes; receiver reads the mail file).
- **B — multiplexer unsolicited: PASS.** `herdr pane split` → a default interactive shell (NOT
  parked); `herdr pane send-text` + retried/verified `Enter` landed the command. Confirms unsolicited
  push into a foreign live session needs the multiplexer.
- **C — owned-PTY unsolicited: PASS.** `script -qec 'bash -i' /dev/null` with stdin from a held-open
  FIFO; writing the FIFO drove bash through the PTY we own — mux-free, no herdr.

All four receiver markers verified in the shared receiver log. `socat`/`expect` absent (unused);
`script`, `nc`, `claude`, `herdr` present. Nothing written to the repo.

**Decision (confirmed):** the messaging **transport** (inbox/files/FIFO) is fully multiplexer-agnostic
and can be extracted as-is; the **fleet layer** owns the PTY-wrapper/multiplexer ONLY for unsolicited
wakes into un-parked foreign sessions. Solicited wake maps to an `await --thread` verb; owned-PTY is
the mux-free unsolicited path when we launch the session.

## NEXT

Architecture question is answered — this PoC can be retired once the verdict is carried forward.
Optional remaining: **Stage D** (real `claude` receiver) to observe composer/Enter fragility on a real
agent turn — opt-in, costs tokens, not required for the decision. Feed the verdict into the
transport-decouple restructure and the sibling `cyberfleet-stations.plan.md`.
