---
"cyberlegion": minor
---

Bind a standing owner's **presence** — the live unit standing in for it — and ring it on delivery.

A standing owner record (`unit register --standing`) is durable but has no session of its own, so it
cannot take a turn. It now carries a presence pointer:

- **`unit claim <handle>`** binds the caller's unit as that standing owner's presence — a
  per-record singleton, last-claim-wins, so the pointer moves as the principal moves between units.
  `--clear` unbinds, `--show` reads. An unknown handle fails loud and never auto-mints: `--clear` is
  forgiving about *nothing being bound*, never about *the owner not existing*, so a typo'd handle
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
