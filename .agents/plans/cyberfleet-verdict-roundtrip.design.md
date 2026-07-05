# Design: cyberfleet verdict round-trip primitive (CR-0)

Repo-local design carrier for the `cyberfleet-verdict-roundtrip` CR (brought in-repo from an
external plan-mode doc per the safe-to-publish floor). This is **CR-0** of a four-CR initiative that
reframes the SDD mission lifecycle so it runs past `handoff` to `land` (merge), owned by a cyberfleet
**Tender** persona. CR-0 is the shared transport primitive both the SDD dispatch seam (CR-c channel
backend) and the Tender (CR-b) need.

## Problem

The cyberfleet message layer (`messaging` node) is one-way fire-and-forget: `send` drops a file,
`inbox`/`read` pull. Its own Non-goals defer two things this initiative now needs:

- **thread correlation** — a caller cannot filter its inbox to one conversation (`inbox` filters only
  `--unread` / `--from`), even though every `Message` already carries an optional `thread`.
- **a blocking wait** — "waking an idle peer the instant mail lands (a live send nudge and a watcher)
  are deferred phase-2 CRs." A conductor that dispatches a delegate as a peer session must **block
  until that delegate's structured verdict comes back**, correlated to *this* dispatch.

Without these, a dispatched peer can send a verdict but the dispatcher has no first-class way to
await and correlate it.

## Scope (what CR-0 adds — additive to the frozen `messaging` suite)

1. **Thread-scoped inbox** — `InboxQuery.thread` + `inbox()` filters by `Message.thread`; CLI
   `cyberfleet inbox --thread <id>` (composes with `--unread` / `--from`).
2. **`cyberfleet await --thread <id> [--from <h>] [--timeout <ms>]`** — blocks, polling the caller's
   unread inbox on an interval until the first message matching the thread (and optional sender)
   arrives, then prints it and acks it (the existing `read` move-to-`read/`), so the reply leaves the
   unread set. On timeout it exits non-zero without acking anything.
3. **Verdict-as-`--body-file` convention** — no new mechanism: a peer writes its structured verdict to
   a JSON file in its worktree and `cyberfleet send --to <caller> --thread <id> --body-file
   verdict.json`; the caller `await`s and parses the body. Wire the `--thread` / `--reply-to` flags on
   `send` (the data model already carries them; the CLI does not yet expose them).

## Reuse (no new mechanics)

- `Message.thread` / `Message.replyTo` — already on the interface (`message.ts:14-15`).
- `SendInput.thread` / `replyTo` — already accepted by `send()` (`message.ts:30-31`).
- `resolveBody(--body / --body-file / -)` — already supports the body-file convention (`message.ts:59`).
- `read()` move-to-`read/` ack — `await` reuses it once a match is found (`message.ts:96`).
- `spawn`'s returned `agent.id` — the correlation key a dispatcher mints/uses as the thread id.

## Out of scope (later CRs)

- The SDD `dispatch()` seam and its backend probe (CR-c).
- The Tender persona / land loop (CR-b).
- A filesystem watcher / inotify push (still deferred — `await` polls; a true nudge stays future).
- Verdict *schema* validation — the caller (conductor, CR-c) validates the parsed body; `await`
  transports an opaque body.

## Open design decisions (resolved in the explore grill)

- `await` poll interval + default timeout, and timeout exit behavior (non-zero vs empty).
- Whether `await` returns the first match only, and whether it acks on match.
- Whether `--from` is required alongside `--thread` or optional.
