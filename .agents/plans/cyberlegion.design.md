# Design: cyberlegion — agent spawn + messaging + dispatch foundation

Durable design carrier for the cyberlegion extraction (brought in-repo from an approved plan-mode doc
per the safe-to-publish floor). Target: a new `packages/cyberlegion` (bin `cyberlegion`) + a new
`plugins/cyberlegion`, extracted from `packages/cyberfleet`.

## Purpose

The harness-agnostic "spawn a session + carry mail + dispatch work" primitive currently lives in
`packages/cyberfleet`. Both SDD and the cyberfleet fleet-persona layer need it. If it stays in
cyberfleet, SDD would depend on the whole warm fleet layer — backwards. **Extract it into cyberlegion**;
both SDD and cyberfleet depend **up** on it. cyberlegion carries no fleet metaphor and no SDD knowledge.

The Legion: distinct agent-**units**, mustered and reaped (lifecycle), commanded and communicating
(dispatch + mail + wake), each individually addressable (named 1:1 peers). The headless automaton is
**the Legate** (`legate`).

## Dependency direction (CI-enforced)

`cyberlegion` depends on nothing internal. `cyberfleet` → cyberlegion. `sdd` → cyberlegion **by intent**
(ADR-0021) + one pinned `npx cyberlegion@<ver>` site. **`sdd` never references `cyberfleet`** — the
ADR-0021 cross-reference resolver in `pnpm verify` asserts it.

## Extraction line

Mechanism → cyberlegion: `message`, `console/*`, `output`, `install`, `runtime/inject-inbox`,
`identity` (`resolveShip`→`resolveAgent`), `spawn`/`decommission` (`session`), `paths` (global hub).
Stays in cyberfleet: `missions`, `sdd/hal`, `sdd/read` (fleet + SDD coupling), fleet CLI verbs
(`missions`/`gate`/`jump`/`pause`/HAL). cyberfleet is unpublished → no re-export shims, breaking OK;
cyberfleet imports cyberlegion as a workspace dep.

## CLI = pure mechanism; the Legate = routing brain

The CLI is dumb hands: **no `--backend auto`, no headless-subprocess, no Task invocation.** Groups:
`identity · session (warm peer/channel) · mail · dispatch · agent · admin`. `dispatch prep` returns an
envelope (spawns nothing); `dispatch channel` is the one CLI-driven convenience (prep + `session spawn`
+ `mail await`).

The **Legate** (in-session as the plugin's `dispatch-governance`; headless as the `legate` automaton)
maps an intent → strategy from the agent-def's `warm`/`interactive` tags × mux availability:
- warm + interactive + mux → **warm peer** on the def's cheaper model (grills the user in-pane / mails back)
- warm + interactive + no mux → **run inline** (a cold subagent cold-reloads per round and has no user channel)
- cold + one-shot → **subagent** (the Legate invokes its own Task tool; the CLI cannot)

## Agent-definition-driven dispatch

`--agent <name>` resolves `.agents/agents/*.md` — `model`/`effort` + cyberlegion-only `harness`/`warm`/
`interactive` tags; body = instructions. Unifies SDD's cold-grader defs, cyberfleet's Tuner (which edits
a def), and a user role library. Resolving a def reads a *file* only — no upward dependency.

## State hub + storage

Global `~/.agents/cyberlegion/` (identity + mail + dispatch data — addressable across project and
worktree boundaries; `--space` isolates) + project-local `<project>/.agents/cyberlegion/` (tracked
marker + spawned worktree checkouts). Self-id by pane or `$CYBERLEGION_AGENT_ID`, no shared `self` file.
All mailbox + registry access goes through a domain **`Store` interface** with a **`FileStore`** impl
(current `.json` layout, per-writer sharding + atomic rename — ADR-0020). `SqliteStore` is the sanctioned
later swap (embedded `node:sqlite`, still daemon-free); triggers = FTS search, relational features, or
measured volume/concurrency pain.

## Wake (ship 3 of the matrix)

**B** multiplexer doorbell (`session nudge` = send-keys, needs an ancestry-verified mux) · **A-loop/A**
bounded `mail await` (poll under the cache TTL, clean sentinel) · **E** hook surfacing. Drop C (own-PTY)
and D (`/loop`); A′ is a usage pattern (run `await` via `run_in_background`). Doorbell/mailbox split: the
nudge is a dumb bell, the mail is the payload. Mux detection is two-mode: fast-path `$CYBERLEGION_MUX`
(also override `=none`) else ancestry discovery from `$$`.

## AXI output (#1–#10)

TOON default + `--format json` escape; 3–4 field rows + `--full`; pre-computed aggregates; definitive
empty states; structured errors + fail-loud + never prompt; content-first groups; stderr next-step; per
`--help`. #7 (ambient context) is natively met — `admin install` wires the hook + the gateway skill is
the installable skill.

## CR decomposition (tags mark progress; one PR when complete)

CR-1 `legion-scaffold` (done) → CR-2 `legion-extract-core` (Store+FileStore, global hub, grouped CLI +
AXI, cyberfleet imports cyberlegion, breaking) → CR-3 `legion-dispatch-primitives` ∥ CR-4 `legion-wake`
(absorbs + retires `cyberfleet-verdict-roundtrip`) ∥ CR-4b `legion-agentdef` → CR-5
`legion-gateway-legate` (the routing brain + `legate`) → CR-6 `cyberfleet-repoint` ∥ CR-7
`sdd-depend-on-legion` (ADR-0023 `subagent|channel` seam) → CR-8 `legion-publish`.

Consolidates `add-fleet-comms` (source), `cyberfleet-comms-wake-poc` (informs wake), and
`cyberfleet-verdict-roundtrip` (folds into CR-4). `cyberfleet-stations` and the Tender become downstream
consumers of cyberlegion.
