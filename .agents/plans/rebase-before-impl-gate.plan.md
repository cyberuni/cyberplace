---
status: active
todos:
  - content: "explore: draft conductor rebase-before-gate scenarios + prose, cold spec-judge"
    status: pending
  - content: "spec gate: additive scenarios self-clear (stay @frozen), status stays approved"
    status: pending
  - content: "deliver: add rebase-before-impl-gate step to start-mission SKILL + sdd-automaton"
    status: pending
  - content: "impl gate: cold impl-judge over merged-tree behavior"
    status: pending
  - content: "handoff: pnpm verify, branch + PR"
    status: pending
---

# CR: rebase onto target before the impl gate (Design A)

**Intent.** In the mission loop, before handoff pushes the PR, the CR branch must be rebased
onto the target branch to keep a clean linear history and resolve conflicts. **When:** the
rebase is the conductor's **last deliver act, before the impl gate** — so the frozen suite is
verified against the *merged* tree that actually lands. Handoff stays a pure consumer that
never re-verifies (its frozen non-goal is intact).

**Target node:** `.agents/specs/sdd/mission/conductor/` (revise — additive scenarios only).
**Impl:** `plugins/sdd/skills/start-mission/SKILL.md`, `plugins/sdd/agents/sdd-automaton.md`.

## Decisions (settled)

- **Design A** (chosen by operator over B "first handoff act" and "both seams"): rebase in
  deliver, before the impl gate. The gate always runs on the merged tree, so clean-vs-conflict
  never changes *whether* re-verify happens — it always does.
- **No new hard floor.** Rebasing an unmerged CR branch is git-reversible (reflog) — not a gate.
  A conflict resolution that *narrows* a frozen scenario fires the existing **Clearance** floor;
  semver-over-ceiling fires **Compatibility**; a genuine contradiction fires **Conflict**.
- **commit-to-main shape:** same principle as `pull --rebase` onto latest `main` before the gate.
- **Freeze:** additive scenarios self-clear, stay `@frozen`, no re-open (conductor stays `approved`).

## Scope guard

- Handoff `.feature` untouched (Design A keeps re-verify in the conductor/deliver gate).
- Push-race (target moves again between gate and push) left as a follow-up CR, not spec'd here.

## NEXT

Draft the additive scenarios in `mission/conductor/conductor.feature` + the
`### Rebase onto the target before the gate` subsection in `mission/conductor/README.md`,
then spawn the cold spec-judge.

CR source: bare prompt (start-mission argument).
