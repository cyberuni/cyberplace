---
name: pause-mission
description: "Checkpoint an in-progress SDD mission INTO its plan brief so any later session can pick it up. Use this skill when asked to 'pause', 'wrap up for now', or 'stop here' mid-mission — update the plan's todo statuses and rewrite its ## NEXT anchor so a fresh session continues exactly where you left off. Pass --approve to also clear the mission for headless dispatch (sets the brief's status: approved)."
argument-hint: "[what the next session should focus on] [--approve]"
---

# Pause an SDD mission into its plan

An SDD mission's durable handoff is its **plan brief** at `.agents/plans/<cr-ref>.plan.md`. A
pause writes this session's state back into that plan so **any** next session can pick the
mission up by reading it — no special tool required (`resume-mission` is one convenient reader;
the plan stands on its own). Capture *enough to continue, nothing to relitigate.*

## Procedure

1. **Honor the focus.** If the user named what the pause should emphasize, scope the checkpoint
   to it; otherwise checkpoint the whole live frontier.

2. **Locate the plan — scaffold it if missing.** Find `.agents/plans/<cr-ref>.plan.md`. If none
   exists, create a minimal one (frontmatter `todos` + a `## NEXT` anchor) so the checkpoint has
   a durable home; a pause always leaves a plan behind.

3. **Update the todo statuses.** In the frontmatter `todos`, set each touched todo to its true
   `status` (`pending | in_progress | completed`). Mark the one you were on `in_progress`; never
   mark a todo `completed` unless it truly is — partial work stays `in_progress` with a one-line
   note of what remains. Add a todo for any new work or decision that surfaced this session.

4. **Rewrite the `## NEXT — resume here` anchor** (create it if absent) so a cold reader can
   start in under a minute. Order it for pickup, **action first**:
   - **The next action — first, concrete, runnable.** One line the resumer can act on
     immediately: the file or unit to touch *and the skill or command to invoke for it* — e.g.
     "build `<unit>`'s spec + suite via `start-mission`, then run the project's spec check," never
     a vague "continue authoring."
   - **Blocking decisions** — open scope calls and unresolved `<!-- open: -->` markers, each with
     its options, so the next session *resolves* rather than rediscovers them.
   - **Findings the commits won't show** — only what isn't obvious from the diff and changes the
     next move. Skip the play-by-play.
   - **A pointer to the working method / resolved decisions** already in the plan body ("do not
     relearn — see `## Resolved decisions`").

   Lead with the action; put history and findings *below* it. A resumer needs *what to do* first
   and *what happened* second.

5. **Reference, don't restate.** Point to commits (SHAs), files (paths), design rules, and issues
   by reference — never paste their contents. The plan is an index to the work, not a copy of it.

6. **Keep it commit-message-grade.** The plan is tracked and committed: no secrets, keys, prompts,
   or PII — describe the decision or its class, not literal payloads.

7. **Commit the checkpoint.** Commit the plan update (`docs:`) so the pause is durable in git and
   the working tree is clean. Leave no uncommitted work behind.

**Write scope.** A checkpoint writes **only the plan brief** — the `todos`, the `## NEXT` anchor,
and (with `--approve`) the top-level `status`. It never touches `spec.md`'s `status` or `approval`:
the mission's contract lifecycle is the gates', not the checkpoint's.

## Clear for headless dispatch — `--approve`

A plain pause never touches the brief's top-level `status`. When invoked with **`--approve`**, the
checkpoint additionally sets the brief's **`status: approved`** — the human review act that clears
the mission for the gateway's headless dispatch queue (the go-signal `dispatch` selects on; the
enum + the three-way `status` distinction live in the SDD `provenance-model`). Rules:

- **Human act only.** Setting `approved` is a review decision — a person has read the brief (todos,
  `## NEXT`, the strategy/leash) and cleared it. A **headless automaton never self-approves**: with
  no user channel it may checkpoint progress but must **refuse `--approve`** and leave `status`
  unchanged (the same positional-authority rule that reserves a human-ratified gate verdict).
- **Idempotent.** Approving an already-`approved` brief leaves it `approved`.
- **Flag-only.** It writes the one frontmatter field; it does not dispatch the mission (that is the
  gateway) and does not touch the strategy leash — `approved` says *run it*, the leash says *how far*.

## What a good pause is not

- **Not a transcript.** Capture decisions and the next action, not a play-by-play.
- **Not a duplicate.** If it already lives in a commit, an ADR, the spec, or an issue, link it.
- **Not buried.** The next action leads the anchor; if a resumer has to hunt for where to start,
  the pause failed.
- **Not self-referential.** The plan never tells its reader to "invoke `resume-mission`" or
  explains how to resume — a session reading the plan is already past that, and the
  `## NEXT — resume here` heading orients a human on its own. Open `## NEXT` with the *work*.
- **Not final-sounding.** A pause is a *resumable* checkpoint — leave the live frontier and the
  open questions explicit, not smoothed into a summary that hides where to begin.

The plan is self-sufficient: any session that opens it can continue. `resume-mission` reads this
back conveniently, but is not required.
