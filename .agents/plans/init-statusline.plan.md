---
cr: init-statusline
project: sdd
target: main
status: active
todos:
  - id: spec-init
    content: "Draft init node (gateway/init): user-invocable onboarding; v1 offers the statusline feature"
    status: completed
  - id: spec-conductor
    content: "Additive conductor scenarios: write status on phase transition, clear on every exit (handoff/pause/abort)"
    status: completed
  - id: spec-manage
    content: "Additive manage scenario: a configure-statusline setup request loads init"
    status: completed
  - id: spec-gate
    content: "Spec gate: cold spec-judge ALIGNED, READMEs synced, init.feature frozen, gate line written"
    status: completed
  - id: deliver
    content: "Build: new init SKILL+README, edit manage SKILL, add status write/clear to start-mission"
    status: in_progress
  - id: impl-gate
    content: "Rebase onto main, cold impl-judge per frozen scenario, status=implemented"
    status: pending
  - id: handoff
    content: "Warden placement pass, branch->PR, changeset"
    status: pending
---

# CR: init-statusline

Add a user-invocable `sdd:init` onboarding skill whose v1 capability is an optional statusline
feature: during the mission loop only, show the current mission phase/task in the Claude Code
status line.

## Design (locked with user)

- **init is user-invocable** (front-door, parallel to start-mission/manage; matches init-aced/init-quill/init-cyberlegion). manage references it under Setup & discovery.
- **Statusline feature, mission-loop only.** init asks the end user: (1) enable? (2) newline vs same-line.
- **Mechanism.** File-backed status value at `.agents/sdd/statusline` (single line, overwrite each write). init wires project `.claude/settings.json` `statusLine` command to read it; **composes with — never stomps** an existing statusLine. When the file is absent the status line shows nothing / falls through.
- **Conductor owns the status lifecycle.** Writes the phase/task on each phase transition; clears on every exit path (handoff / pause / abort). Conductor-owned so `checkpoint` ("writes only the plan brief") stays frozen-untouched.
- **Gitignore.** init adds `.agents/sdd/statusline` to `.gitignore` when the folder is a git repo; skips when not. Idempotent.
- **Static staleness — no heartbeat.** SDD loop is turn-based (no daemon), so a fixed staleness threshold would false-positive on slow-but-alive phases. A hard crash leaves a stale value until the next mission overwrites; accepted for v1.
- **Placement=gateway/init (provisional)**, finalized at handoff.
- **Wire to project settings, not global** (SDD is repo-scoped; user's global statusline is theirs).

## Non-goals (this CR)

- Not moving backfill/anchors/ignore code into init (they stay manage engines; init may chain them in a later CR).
- Headless automaton statusline (no interactive status line in headless; file-write would be harmless but out of scope).
- Heartbeat / stale-detection.

## NEXT

Draft `gateway/init/` node (README.md spec prose + init.feature), then additive conductor + manage scenarios, then spawn the cold spec-judge.

CR: bare prompt (no external source) — no closing reference.
