# cyberlegion-init-legate — CLI init front door + legate main-pane binding (design)

Package CR against `packages/cyberlegion`. Builds on the standing-identity (A1) + owner-mailbox (A2)
substrate (`cyberlegion-standing-identity.design.md`, `cyberlegion-owner-mailbox.design.md`). The
plugin-side `init-cyberlegion` skill + legate classification row is a **separate follow-up CR** against
the `cyberlegion-plugin` spec (a thin CLI wrapper, filed after this package CR — same pattern
`manage-inbox` followed A2).

## Why

The plugin never registers itself at session start — a human must run `admin install --agent <harness>`
by hand, no owner inbox is minted by default, and A2 surfaces owner mail into **every** root session
(`!spawnedBy`) rather than one designated pane. We want a front door that (a) auto-registers the
SessionStart surfacing hook and (b) lets a confirmed top-level pane become the single durable `legate`
owner inbox's live presence.

Decisions locked with the user: durable session-independent standing inbox handle **`legate`** (the
always-deliverable target for cron/headless units); the confirmed root pane bound as the **sole**
surfacer of legate's mail via a new hub-level `mainPane` pointer; detect root then **ask** (no silent
bind); the ask is delivered by both an init skill and a SessionStart nudge.

## What — three nodes

### 1. NEW `init/` capability node — the front door
`cyberlegion init [--agent claude|cursor|codex] [--dir <path>]`:
- Resolves the harness: explicit `--agent` wins, else auto-detect via `detectHarness` (identity.ts);
  clear error when undetectable.
- Registers the surfacing hook by calling the existing `install(harness, dir)` — idempotent
  (`registered | already present`), same per-vendor SessionStart/PostToolUse mapping.
- Prints the install summary; when no `legate` standing owner is bound yet, emits a `nextStep` toward
  the owner-binding step.
- Factor a shared harness resolver so `admin install` (explicit-only) and `init` (auto-detect) share
  one path; `admin install` stays as the low-level verb.

### 2. `identity/` node — durable legate owner + main-pane pointer (additive)
- Owner inbox: reuse `identity owner --handle legate` (`registerStanding`) — no new mint code.
- New hub-level `mainPane` singleton on the `Store` seam: `setMainPane(pane|null)` / `getMainPane()`,
  backed by a single trimmed-text file at hub root (mirrors the pane-index read/write); add
  `paths.mainPaneFile(root)`.
- New verbs: `identity bind-main` (store `currentPane`; error when in no pane), `identity bind-main
  --clear` (unbind), `identity main` (show binding).

### 3. `surfacing/` node — main-pane gate + nudge (RE-OPEN, rewrites A2 scenarios)
`src/runtime/inject-inbox.ts`:
- **Gate rewrite:** when a `mainPane` **is** bound, surface standing-owner mail only if
  `currentPane == getMainPane()`. When **none** is bound, keep the A2 `!spawnedBy` behavior
  (no regression before onboarding). Still best-effort / try-catch, never acks.
- **Nudge (new):** when the caller is root (`!spawnedBy`), in a live pane, and no `mainPane` is bound
  (or no `legate` standing owner exists), append a best-effort `## Legion setup` line pointing at
  `cyberlegion init`. Never fails the turn.
- **Non-mux parity:** a root session in no pane still emits the nudge; binding is a no-op there, so
  init just mints the durable `legate` owner and the root surfaces it via the `!spawnedBy` fallback.

## Scenarios (seed)
- init (new): auto-detect registers the SessionStart hook; explicit `--agent` overrides; undetectable
  harness errors clearly; re-run is idempotent (`already present`); nextStep points at owner binding
  when unbound.
- identity (+): `bind-main` stores current pane; errors in no pane; `--clear` unbinds; `main` shows the
  binding; durable `legate` owner mints session-independently.
- surfacing (rewrite): bound main pane surfaces owner mail; a bound but non-main pane does NOT; with no
  main pane bound, any root session still surfaces (fallback); nudge fires for an unbound root pane;
  spawned unit gets neither nudge nor owner mail; nudge/gate never fail the turn.

## Non-goals (follow-up CR)
The `init-cyberlegion` skill, the legate classification row, and the top-level `init` companion
surfacing — all `plugins/cyberlegion` / `plugins/cyberspace` artifacts against the `cyberlegion-plugin`
spec.
