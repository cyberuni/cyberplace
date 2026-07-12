---
name: nudge-carries-message
status: active
todos:
  - content: "intake + leash: revise unit/lifecycle nudge behavior; Clearance floor (removed frozen scenario) authorized in-session"
    status: completed
  - content: "spec gate: cold spec-judge ALIGNED (3 lenses PASS); lifecycle.feature re-frozen; ledger + spec.md approval.spec"
    status: completed
  - content: "impl gate: cold impl-judge IMPLEMENTATION_PASS true; ledger + spec.md approval.impl; status stays implemented"
    status: completed
  - content: "handoff: commit SDD artifacts, file follow-up CRs (bind scenarios + error cases), PR"
    status: in_progress
---

# nudge-carries-message

Revise CR against the cyberlegion project spec (`packages/cyberlegion/.agents/spec`), `unit/lifecycle` node.

**Change (already implemented, shot-before-aim, commit f8618fc4):** `unit nudge` delivers a check-mail
message as a turn (default, overridable via `--message`) instead of `send(target, '')`. An empty ring
is a no-op on the herdr adapter (`pane run <id> ""` submits nothing) and a live agent session takes a
turn only on real input.

**Spec backfill:** rewrote the frozen `unit/lifecycle` nudge scenario (payload-free empty keystroke →
delivers the default check-mail message as a turn) and added a `--message` override scenario; README
updated. Edit-class (gherkin-cli diff vs origin/main): 1 removed + 2 added → Clearance floor
(removed acceptance scenario), authorized in-session by the human conductor.

## NEXT

Both gates ratified (spec + impl, `by: unional`, in-session Clearance authorization). Handoff:
commit SDD artifacts, run root `pnpm verify`, push `fix/nudge-carries-message` + PR. Follow-up CRs:
(1) bind the two nudge scenarios with a CLI test (they are UNBOUND — reverting to `''` passes
315/315); (2) error-case scenarios for nudge/focus/read (pre-existing cluster gap).
