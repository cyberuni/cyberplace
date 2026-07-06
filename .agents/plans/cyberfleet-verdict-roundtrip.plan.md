---
cr-ref: cyberfleet-verdict-roundtrip
project: cyberfleet
project-path: packages/cyberfleet
status: superseded
superseded-by: legion-wake
todos:
  - content: "Explore: grill messaging revise (thread filter + await verb + body-file), spike await polling"
    status: in_progress
  - content: "Spec gate: cold spec-judge ALIGNED; add scenarios, un-defer Non-goals; freeze + gate line + status"
    status: pending
  - content: "Deliver: spawn impl-producer — InboxQuery.thread, inbox() filter, await verb + CLI wiring, per-scenario verification"
    status: pending
  - content: "Impl gate: cold impl-judge; on pass advance status to implemented"
    status: pending
  - content: "Handoff: pnpm verify, commit by unit, open PR; spawn detached Warden"
    status: pending
---

# CR: cyberfleet-verdict-roundtrip — the reply-and-correlate primitive

> **SUPERSEDED** by the cyberlegion extraction (`.agents/plans/cyberlegion.design.md`). This capability —
> thread-correlated inbox, blocking `await`, verdict-as-body-file, and its four resolved `await`
> decisions — is folded into cyberlegion's `mail` + `wake` nodes and built there in **CR-4
> `legion-wake`**, not against cyberfleet's `messaging` node. The `await` design decisions below carry
> over verbatim. Kept for provenance; do not resume this mission.

Revise the `messaging/` node of the cyberfleet CLI project. Add the deferred phase-2 slice its own
Non-goals anticipated: **thread-correlated inbox** (`InboxQuery.thread` + `inbox()` filter, CLI
`inbox --thread`), a **blocking `cyberfleet await --thread <id> [--from] [--timeout]`** (poll → match →
print + ack), and the **verdict-as-`--body-file`** convention (wire `send --thread/--reply-to`; data
model already carries them). Foundation for the SDD dispatch seam (CR-c) and the Tender (CR-b).

Additive to the frozen `messaging.feature` (new scenarios, nothing narrowed) → self-clears, stays
`@frozen`. README Non-goals prose is un-deferred (spec.md-side, never frozen). No ADR.

Design: [`cyberfleet-verdict-roundtrip.design.md`](./cyberfleet-verdict-roundtrip.design.md).

## NEXT — resume here

**Next action:** settle the four `await` design decisions below (a cold reader can adopt the
recommended defaults and proceed), then draft the new `messaging.feature` scenarios + the README
revise (un-defer the threads/reply + watcher Non-goals), spawn the cold spec-judge, and converge to
the spec gate. Node to touch: `packages/cyberfleet/.agents/spec/messaging/` (README + `.feature`).

**Open decisions (raised in the grill, not yet ratified — recommendations to confirm):**
- **Timeout exit** — on `--timeout` elapsed with no match: *recommend* non-zero exit + a clear
  "no reply on thread <id> within <ms>" message, print nothing (lets the CR-c conductor fail closed;
  distinguishes a silent delegate from a real verdict). Alt: exit 0 empty.
- **Ack on match** — *recommend* await = block-then-read: on match, print body AND move the file to
  `read/` (reuse `read()`), so a later `inbox` won't re-surface it and each await consumes exactly
  its round. Alt: leave unread (risks double-match).
- **Default timeout** — *recommend* a bounded default (≈600s) with `--timeout 0` = wait forever;
  poll interval a fixed internal ~1s, not user-facing. Alt: infinite by default.
- **`--from` with `--thread`** — *recommend* optional (thread id is the primary correlator; `--from`
  narrows only when several senders share a thread).

**State this session:** branch `cyberfleet-verdict-roundtrip` off `origin/main`. Intake done —
messaging node located as a **revise**; confirmed `Message.thread`/`replyTo` + `SendInput` already
carry the fields and `resolveBody` already supports `--body-file`, so CR-0 adds `InboxQuery.thread` +
`inbox()` filter, the `await` verb + CLI wiring (`inbox --thread`, `send --thread/--reply-to`, `await`),
no new mechanics. Scope + reuse map in the sibling
[`cyberfleet-verdict-roundtrip.design.md`](./cyberfleet-verdict-roundtrip.design.md). No spec/suite
drafted yet; no gate written.

Part of the 4-CR lifecycle-reframe initiative (CR-0 here → CR-a resume-trigger ∥ CR-c dispatch-seam →
CR-b Tender). Sequencing + full context in the initiative plan (external, not committed).
