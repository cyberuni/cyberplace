---
name: cyberfleet-stations
status: active
todos:
  - content: "DESIGN captured: station concept (live in-ship role-session in a tab) + share-one-worktree/write-lease + loop=tab/look=pane + sender-nudge + per-ship watcher + judges-stay-cold"
    status: completed
  - content: "Sequencing: lands AFTER CR-0 (await --thread) and alongside/after CR-c (SDD dispatch seam, ADR-0023) from the Tender program — this is the warm+observable channel backend"
    status: pending
  - content: "CR-i adapter growth: SessionAdapter open({surface:'tab'|'pane'}) + status() busy-state + watch(); tmux concrete, herdr flagged-unverified"
    status: pending
  - content: "CR-ii station node: cyberfleet station open/list/reset/close; AgentRecord gains role/station/tab-id; new packages/cyberfleet/.agents/spec/station/ node"
    status: pending
  - content: "CR-iii dispatch/nudge/send --nudge + write-lease + event watcher (cyberfleet watch), wired to CR-0 await --thread; cold-spawn fallback = CR-c channel backend"
    status: pending
  - content: "CR-iv Pod skill decisions (open mission station -> dispatch --wait per iter -> reset at freeze -> close at land); judges NOT stations (SDD spawns cold, unchanged)"
    status: pending
  - content: "ADR: amend ADR-0022 d.8 (one worktree=one pane -> one bridge tab + N role tabs/panes, single write-lease); note fs.watch process = mild departure from no-daemon"
    status: pending
---

# CR: cyberfleet-stations — live loop-sessions in ship tabs + push comms

## Problem

SDD carries a CR by spawning **cold subagents** (impl-producer, judges) that re-read governance + the frozen `.feature` + spec on every spawn. Iterating producers pay that re-read N times. Instead: run each **loop** as its own **live session in its own tab** of the ship, kept warm across iterations, coordinated over the file message channel. `/new` resets a session at a phase boundary (Explore->Deliver, which lines up with SDD's freeze). Bridge = tab 0 (Council <-> Pod/Operator); loops get tabs; manual observation gets panes.

Layers on the approved **Tender dispatch seam**: CR-0 (`cyberfleet await --thread`) + CR-c (`sdd:dispatch-governance`, dispatch pluggable `subagent`|`channel`, ADR-0023). This is the channel backend made **warm and observable** — dispatch targets a *live* role-session (a station) instead of spawning fresh.

## Locked decisions

- **Share one worktree per ship** + a **single write-lease**: only the active producer edits; the bridge orchestrates (never edits mid-mission); outer loops read-only. Keeps "one CR = one worktree".
- **Loop = tab, observation = pane.** Ship = a multiplexer session; bridge = tab 0; each active loop opens its own tab; user adds panes inside a tab to watch.
- **Name = `station`, not `console`.** `console` is already three things (ADR-0022 "cold console" = the CLI; `src/console/` = adapter seam; issue #62 = extractable multiplexer console). A station is a live role-session at a position on the ship (bridge = station 0). Station commands manage the sessions; the console is the substrate.
- **Judges stay cold.** Keep-alive is for **producers** only — judge independence (ADR-0016) needs fresh context re-deriving the oracle from the frozen `.feature`. SDD still spawns judges cold via its existing path.
- **Only mission's stations are live during a CR.** Doctrine/formation open on demand; campaign/forge conceptual (forge hidden by default).

## Command surface (new `station` group + comms verbs)

Backed by a new `packages/cyberfleet/src/station.ts` (mirrors `spawn.ts`/decommission, reuses brief plumbing + session adapter). All operate on the current ship (mode `ship`; command-center defers).

- `station open <role>` — live role-session in a new **tab** (no new worktree; shares tree). `--task|-`/`--brief-file`, `--handle`, `--harness`. Brief via brief-file + SessionStart hook (never typed in). `role in mission|doctrine|formation|campaign|forge` (forge hidden).
- `stations` — ship-scoped list: role, tab id, busy-state, last-seen, thread, lease holder. (`who` stays fleet-scoped.)
- `dispatch <role> --task <brief> [--wait] [--thread <id>]` — deliver + **nudge to act now**; `--wait` blocks on the verdict via CR-0 `await --thread`. No live station -> **cold-spawn fallback** (= CR-c channel backend). Warm-reuse analog of SDD `dispatch(role,agent,brief,verdictSchema,wait)`.
- `nudge <peer>` / `send --nudge` — wake an idle session to check its inbox (the deferred live send-nudge).
- `reset <role>` — the `/new` at a phase boundary: inject harness context-clear (per-harness `RESET_MAP`: claude `/new`; cursor/codex equiv) + re-brief.
- `station close <role>` — teardown the tab (session-teardown half of decommission, no worktree removal); releases lease.
- `lease acquire|release [<role>]` — single-writer token per ship (volatile state at primary root). `dispatch` to a producer auto-acquires; reset/close/verdict-return releases. (May fold into dispatch.)
- `watch [--ship|--fleet]` — start the event watcher (below). Auto-started by `station open`; killed on `station close`/`decommission`.

## Communication & event watcher

Surfacing today is **pull-only** (SessionStart on launch, PostToolUse after Write|Edit). An idle session between turns fires no hook -> mail sits unseen. Push, two layers, daemonless-first:

1. **Sender-side nudge (default, no daemon).** Every message goes through `send`, so the send *is* the event. After writing the file: resolve recipient pane + `status()`; if idle -> inject a **wake** (`cyberfleet inbox --unread`), **never the body** (keeps ack/thread/pull model + clean context); if busy -> mark `pending-nudge`, return.
2. **Per-ship watcher (reliability + deferred).** Local process, **no port/socket/network** — `fs.watch` on inbox dirs + the multiplexer busy-state. Flushes `pending-nudge` on `working->idle`; covers unreachable panes. An **adapter capability** (`watch`): herdr subscribes to its native busy-state/event feed (why herdr is primary); tmux degrades to `fs.watch` + `capture-pane` idle heuristic / agent self-reporting "ready". Lifecycle tied to the ship.

Per-session notify: watcher maps `inbox/<id>` -> pane; new file -> resolve pane -> gate on busy-state -> wake-or-defer. `read`/`ack` moves the file to `read/`, so re-nudging stops. CR-0's `await --thread` is already a *scoped* watcher (one thread's inbox); the general watcher generalizes it. MCP-free caveat: a live `fs.watch` process is a mild departure from strict "no daemon" — note in the ADR; the sender-nudge keeps the common path daemonless.

## Adapter changes (`packages/cyberfleet/src/console/session.ts`)

`SessionAdapter` today = `open`(pane split)+`send`+`read`+`teardown`. Add:
1. `open(exec,{cwd,launch,surface:'tab'|'pane'})` — tmux tab=`new-window`, pane=`split-window -h`; herdr needs its window verb (**risk: unverified vs live binary**, session.herdr.ts:10-12).
2. `status(exec,target)->'working'|'idle'|'blocked'|'done'|'unknown'` — herdr native; tmux `unknown`/heuristic.
3. `watch(exec,onEvent)` — herdr feed; tmux `fs.watch` fallback.

`AgentRecord` (identity.ts) gains optional `role`, `station:true`, tab/window id (extend existing `tmux:{pane,window?,session?}`).

## Persona wiring

Pod (`plugins/cyberfleet/skills/pod/SKILL.md`) gains decisions, mechanics stay 100% `cyberfleet` calls: mission -> `station open mission` -> `dispatch mission --task ... --wait` per iter -> at freeze `reset mission` -> at land `station close mission`; never edits mid-mission (no lease). Judges are NOT stations. Operator unchanged.

## Landing (spec-first)

SDD CRs against `packages/cyberfleet/.agents/spec/` (new `station/` node) + `cyberfleet-plugin` spec for Pod. Sequence after CR-0, alongside/after CR-c. Slices CR-i..CR-iv per todos. Prefer TS/npx; delegate concrete builds to sonnet; main loop orchestrates/reviews/commits. `pnpm verify` at repo root before push.

## Verification

- Unit: adapter tests mock argv (as session.tmux.test.ts / session.herdr.test.ts) for `new-window`/`status`/`watch`; station store mirrors spawn/decommission tests.
- E2E in tmux (herdr not installed here): `station open mission --task ...` -> new window, harness launched, cwd=ship worktree, brief dropped; `stations` lists it; `dispatch mission --task ... --wait` delivers+nudges+blocks on thread; `reset mission` injects `/new`+re-brief; `station close mission` kills window + releases lease. Assert ship worktree unchanged (no stray checkouts).
- Write-lease: 2nd producer `dispatch` while lease held -> refused/queued, not concurrent write.
- Watcher/notify: `send --nudge` to idle recipient injects wake -> processes inbox; `send` to busy recipient defers, watcher flushes on idle. Assert wake injects `inbox --unread`, never raw body.

## NEXT

Design is complete and captured here; nothing built yet. First actionable step is **sequencing**: this initiative is blocked on the Tender program's CR-0 (`await --thread`) and rides the CR-c dispatch seam (ADR-0023) — confirm those land first, then open **CR-i** (adapter growth: `surface:tab|pane` + `status` + `watch`) via `sdd:start-mission` against `packages/cyberfleet/.agents/spec/`. Amend ADR-0022 decision 8 as part of CR-ii (the worktree->tabs relaxation + write-lease). Open question to resolve at CR-i: herdr's actual window/tab + event-feed CLI (adapter is unverified against a live binary).
