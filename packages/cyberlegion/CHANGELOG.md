# cyberlegion

## 0.2.0

### Minor Changes

- 211de72: **BREAKING** — `unit spawn --at` now defaults to `tab` instead of `pane:right`, and the redundant
  `window` placement value is removed.
  - **Default placement is `tab`.** A spawned peer opens as a new tab in the caller's current window,
    opened without stealing focus (herdr `tab create --no-focus`, tmux `new-window -d`), so it no
    longer shrinks the caller's pane by splitting it side-by-side. Pass `--at pane:right` explicitly
    for the old behavior.
  - **herdr now honors `tab`.** The herdr adapter previously mis-routed `tab` to a right-split pane;
    it now opens a real herdr tab via `tab create`. tmux already mapped `tab` → `new-window`.
  - **`window` is removed** from `--at`. It was tmux's local name for the Tab concept, redundant with
    `tab`; the allowed set is now `pane:right | pane:down | tab | workspace`. `--at window` is
    rejected. Placement vocabulary is aligned to the canonical Session › Workspace › Tab › Pane
    concepts (documented in the mux node README and the website architecture page).

- ddb1458: **BREAKING** — realign the CLI to its real architecture (ADR-0024). Command groups now mirror the
  mux/legion layering instead of the retired `surfacing`/`wake` concept axis:
  - `identity <verb>` and `session <verb>` collapse into one **`unit`** group: `unit register`,
    `unit whoami`, `unit who` (now carries a `pane` field and a `"N units"` aggregate — the old
    `session list` folded in), `unit prune`, `unit spawn`, `unit close`, `unit focus`, `unit nudge`,
    `unit read`.
  - `identity owner` → **`unit register --standing`** (bare, no `--handle`, lists the standing records).
  - `identity bind-main` / `identity main` → **`attach`** (bare binds; `--clear` unbinds; `--show`
    reads the bound pane).
  - `admin doctor` / `admin mode` → **`mux doctor`** / **`mux mode`**.
  - `admin install` folds into **`init`** (which owns hook installation directly); `admin` now carries
    only `migrate`.

  Hot-path top-level aliases (`who`, `send`, `inbox`, `spawn`) and the bare-status default action are
  unchanged. `mail`, `agent`, and `dispatch` are unchanged.

- b863089: **BREAKING** — dissolve the CLI's `dispatch` command group, `Store` result-slot
  (`resultPath`/`writeResult`/`readResult`), and `realizeSubagentInstruction`/`selectWakePath` library
  exports. A cold subagent now returns via the caller's own Task-result (its final returned message)
  instead of a `dispatch prep`/collect result file, and a warm peer returns via `mail await` on a
  thread instead of `dispatch channel`. Routing (warm-peer vs subagent vs run-inline) and the
  wake-matrix decision move out of the CLI into the Legate plugin's governance
  (`dispatch-governance`/`subagent-backend-governance`), which now composes `unit spawn` + `mail
await` + `agent resolve` directly. Verdict-schema validation is dropped for now, to return later as
  a dedicated `mail --verdict-schema` capability.
- 7ed73d0: Owner-mail doorbell rings the bound main pane only when it is focused.
  - **New focus probe.** `SessionAdapter.isPaneFocused` reports whether the attached client is currently viewing a pane — tri-state `focused | not-focused | unknown`. tmux reads `pane_active` + `window_active` + `session_attached`; herdr reads the pane record's own `focused` flag (`pane get`). A backend that cannot report focus, or a query that errors, answers `unknown`.
  - **Doorbell focus gate.** When a standing-owner message is delivered, the doorbell now skips ringing the bound main pane if that pane is **positively not focused** — the human has roamed off it, so ringing would wake a session nobody is watching. The report stays queued in the durable owner inbox and surfaces on the pane's next SessionStart pull; nothing is lost. When the pane is focused, or focus is `unknown`, the ring proceeds as before (fail-open, no regression). A peer recipient's ring is never focus-gated, and a focus probe that errors never fails the send.

- da6935a: Add `cyberlegion mail read <id> --ack` — read and acknowledge a message in one atomic step. It
  prints the message body (as `read` does) and acks it in the same call, so "receive and consume" is
  one round-trip instead of read-then-separately-ack. It is idempotent: it always prints the body and
  acks only when the message is still unread, so running it on an already-acked message prints the
  body and succeeds (`acked: false`) rather than erroring like a bare `mail ack`. An unknown message
  id still errors, and it composes with `--owner` for the standing owner mailbox. Bare `mail read`
  (no `--ack`) is unchanged — it stays the non-consuming peek.
- 7598bf5: `unit who --reconcile` (and top-level `who --reconcile`) now also adopts live-but-unregistered panes: any live pane in the current multiplexer running a detectable harness (`claude | cursor | codex`) with no matching record gets a minted record — pane bound to a new id, handle derived from the pane's cwd basename (`id.slice(0, 6)` when no cwd is reported), status `active`, `lastSeen` now — so a manually-opened or hook-failed pane becomes listable, mailable, and dispatchable. Panes with no detectable harness are never adopted (herdr reports the running agent; tmux does not, so tmux adoption is deferred), a bound pane — exited included — is never re-adopted or resurrected, and `unit prune` stays cull-only.
- 0988b81: Add `unit who --reconcile` (and top-level `who --reconcile`, mirroring `--all`) to live-probe the current multiplexer and mark any dead-pane record `exited` before listing. `unit prune` now reconcile-culls the same way in addition to its existing per-record liveness and staleness checks.
- 38756f9: `unit spawn` now delivers the spawned peer's **first turn** on a fresh paned session, so a spawned
  pod acts on its brief with no human nudge (issue #188).

  A paned agent boots to an idle prompt: its brief is injected into context by its own SessionStart
  hook, but the model takes no turn on its own (unlike a subagent, where the caller's Task call _is_
  the turn). So `unit spawn` now rings a best-effort **first-turn doorbell** over the same boot-race-
  aware submit-verify path `unit nudge` uses, exactly mirroring `mail send`'s delivery ring: the
  worktree/session/registry record is the guaranteed effect and the ring is opportunistic on top.
  - **Best-effort, never fails the spawn.** A ring that never completes within the retry budget (the
    harness never reaches its prompt) is surfaced as a stderr warning; the peer is still spawned. The
    spawn result carries a `rung` field.
  - **`--no-wake` opts out** (mirroring `mail send --no-nudge`) for a caller that will drive the first
    turn itself.

  This is mechanism, not routing — it completes the spawn, it does not select a backend — so it stays
  within the CLI's dumb-hands charter and fixes every paned caller at once (Operator, Pod, and the
  Legate's `channel` dispatch strategy) with no persona change.

- 9955e97: Bind a standing owner's **presence** — the live unit standing in for it — and ring it on delivery.

  A standing owner record (`unit register --standing`) is durable but has no session of its own, so it
  cannot take a turn. It now carries a presence pointer:
  - **`unit claim <handle>`** binds the caller's unit as that standing owner's presence — a
    per-record singleton, last-claim-wins, so the pointer moves as the principal moves between units.
    `--clear` unbinds, `--show` reads. An unknown handle fails loud and never auto-mints: `--clear` is
    forgiving about _nothing being bound_, never about _the owner not existing_, so a typo'd handle
    can't report a clear it never performed.
  - **The claim is gated on spawn capability** — it probes the multiplexer and throws when there is
    none (no panes ⇒ no dispatch ⇒ no presence), leaving the pointer untouched. The gate is a
    checkable precondition, never an introspective carve-out about what kind of agent is asking: a
    caller in a real pane can spawn and may hold the presence; a pane-less one cannot, however it was
    realized.
  - **A presence resolves live-only** — a presence whose unit has exited reads as no presence bound,
    so the pointer can never name a reader that isn't there.
  - **`mail send` rings a bound live presence unconditionally**, falling back to the focus-gated bound
    main pane when none is bound. A presence is an agent expected to take the turn, not a human whose
    attention is the scarce resource, so it inherits the existing peer rule rather than the
    human-attention focus gate — which matters precisely because a presence exists to act on a
    delivery while the human is away.

  Additive: with no presence bound, the standing-owner ring and its focus gate behave exactly as
  before.

### Patch Changes

- 9df2bf4: Address live units only, and fail fast on a dead pane.

  A handle is reusable, so over time the dead units holding a name outnumber the live one.
  `resolveRecipient`/`resolveAgent` matched on handle without filtering status, so a name could
  resolve to an exited unit — `mail send` then reported "delivered" for an inbox with no reader.
  Handles (and worktree-branch refs) now resolve to live units only, and a name matching only exited
  units throws and lists them. An explicit id still addresses an exited unit.

  `nudge` now probes `paneExists` before sending: a gone pane and a booting one both read back empty,
  so a dead peer was being retried ten times and reported as "never took the turn" — the boot-race
  shape — instead of the real cause.

## 0.1.0

### Minor Changes

- 667163c: Add a `workspace` value to `session spawn --at` (and `dispatch channel --at`) that opens a genuinely new workspace/session instead of a pane inside the caller's current one. Under herdr this also creates the new worktree via `herdr worktree create`, so it lands properly nested under its source workspace instead of just adding to the caller's own pane count; under tmux it opens a new detached session.
- 2758ea9: Add the owner mailbox read path. `mail hook` now surfaces every standing owner's unread mail
  (with bodies) into a root session's injected context under a distinct `## Owner mail — <handle>
(<N>)` heading — read-only, so a message keeps re-surfacing until explicitly acked; a session
  that was legion-spawned (has `spawnedBy`) never gets an owner section. `mail inbox`, `mail read`,
  and `mail ack` take a new `--owner <handle>` selector that targets a standing owner's mailbox
  instead of the caller's own; `--owner` on a handle that is not a standing record errors rather
  than falling back to reading a session's inbox as an owner mailbox.
- 9e24386: Add `identity owner --handle <name>` to mint a standing, session-independent owner inbox — a durable recipient identity with no live session, tmux pane, or harness. Standing records are exempt from `prune` staleness checks, are listed by `who`, and take precedence over a live session when a handle is shared. Bare `identity owner` lists existing standing records.

### Patch Changes

- 667163c: Fix `session spawn`'s default worktree checkout location: it now lives as a sibling of the primary checkout (`<repo>.worktrees/legion-<id>`) instead of nested inside `<primary>/.agents/cyberlegion/worktrees/`, which polluted `git status` in the primary checkout and confused tooling that walks the tree recursively. The directory name uses the same 6-character id slice the peer's `handle` already defaults to.

## 0.0.1

### Patch Changes

- 7c92d8e: Mark the CLI bin shim as executable so it runs directly after install.
