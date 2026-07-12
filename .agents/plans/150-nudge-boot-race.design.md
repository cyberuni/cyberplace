# Design: nudge boot-race robustness (#150)

## The race

`unit nudge` submits text+Enter atomically via `SessionAdapter.send` (`herdr pane run <pane> <text>`
/ tmux `send-keys -t <pane> <text> Enter`). During harness boot the TUI is on its splash/init screen
and swallows the Enter: the text lands in the input box but is never submitted. nudge returns success
regardless, so the caller believes the ship started while it idles at $0.00.

## Two approaches (from the issue)

### (a) verify-readiness-before-submit

Poll `pane read` until the harness prompt is present / splash cleared, then `send` once.

- **Pro:** exactly one submit; no risk of duplicating staged text; no new adapter primitive.
- **Con:** "ready" is **harness-specific** — each TUI (claude/codex/cursor/copilot) has a different
  prompt signature and splash. Detecting readiness means a per-harness readiness map, brittle and
  broad. It also gates on a *predicted* precondition rather than the *actual* symptom, so a harness
  whose ready-signature drifts silently regresses to the same idle-at-$0.00 failure.

### (b) submit-then-verify-then-retry  ← chosen

Submit; read the pane back; if the exact nudge text is still staged unsent in the input line, the
Enter was swallowed → re-submit (a bare Enter to flush the already-staged buffer, so the text is
never re-typed / duplicated); repeat up to a bounded cap with a short wait between attempts. On
confirmed submission, report success. If the cap is exhausted with the text still staged, **throw**
— never report a false success.

- **Pro:** acts on the **actual failure symptom**, not a predicted precondition. The verify anchor is
  the caller's *own* message string sitting unsent — uniform across harnesses (no per-harness ready
  signature). Directly encodes the issue's contract ("the peer has actually taken the turn"). Fails
  loud, killing the silent idle-at-$0.00 mode.
- **Con:** needs a bare-Enter **`submit`** primitive on the adapter (distinct from `send`'s
  text+Enter) so a retry flushes the staged buffer instead of re-typing. Verify still scrapes the
  pane, but keys on our own text rather than a harness-specific prompt glyph.

## Decision

**(b).** It is adapter-general (the brief's requirement), harness-agnostic in its verify anchor, and
directly realizes the contract. (a)'s per-harness readiness modeling is more surface area and more
brittle for the same guarantee.

## Mechanism

- Add `SessionAdapter.submit(exec, target)` — a bare Enter (herdr `pane run <id> ""` submits the
  staged buffer with no new text; tmux `send-keys -t <id> Enter`). `send` stays text+Enter atomic.
- A session-layer `nudge` helper: `send(text)` once, then loop up to N: `read` the pane; if the
  trailing input still shows the staged `text`, `submit` (bare Enter) and wait; else success. On cap
  exhaustion, throw naming the pane and that the turn was never taken.
- Staged-detection: the nudge text present on/after the input-prompt region of the freshly-read pane
  tail. Keys on our message string (harness-agnostic), tolerant of wrapping.

## Verification (impl gate binding)

The prior nudge scenarios landed UNBOUND (junit bridge: no test binds the CLI wiring). Bind the new
scenarios with a mocked-`exec` test at the session/command layer: simulate (1) first read shows
staged text then a resubmit clears it → success + resubmit issued; (2) reads always show staged →
throws after the cap; (3) first read already clear → no resubmit. Adapter `submit` covered in
`session.herdr.test.ts` / `session.tmux.test.ts`.
