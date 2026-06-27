---
name: pause-mission
description: "Checkpoint an in-progress SDD mission INTO its plan brief so it can be resumed cleanly later. Use when asked to 'pause', 'checkpoint', 'save state to the plan', 'wrap up for now', or 'stop here' mid-mission — update the plan's todo statuses and rewrite its ## NEXT anchor so a fresh session (or resume-mission) picks up exactly where you left off."
metadata:
  internal: true
---

# Pause an SDD mission into its plan

The inverse of `resume-mission`. An SDD mission's durable handoff artifact **is** its plan
brief at `.agents/plans/<cr-ref>.plan.md` — so a pause is not a scratch note in a temp dir; it
is a **write back into the plan** that makes the next resume clean. Capture *enough to
continue, nothing to relitigate.*

## Procedure

1. **Honor the focus.** If the user named what the pause should emphasize (a focus
   descriptor), scope the checkpoint to it; otherwise checkpoint the whole live frontier.

2. **Update the todo statuses.** In the plan frontmatter `todos`, set each touched todo to its
   true `status` (`pending` | `in_progress` | `completed`). Mark the one you were on
   `in_progress`; never mark a todo `completed` unless it truly is — partial work stays
   `in_progress` with a one-line note of what remains. Add a todo for any new work or decision
   that surfaced this session.

3. **Rewrite the `## NEXT — resume here` anchor** (create it if absent) so it states, tersely:
   - the **live frontier** — the single next action, and what is upstream of it;
   - **blocking decisions** — open scope calls or unresolved `<!-- open: -->` markers, each with
     its choices, so the next session *resolves* rather than rediscovers them;
   - **findings this session** — what you learned that the diff does not make obvious;
   - a pointer to the **working method / resolved decisions** already in the plan body ("do not
     relearn").

4. **Reference, don't restate.** Point to commits (SHAs), files (paths), design rules, and
   issues by reference — never paste their contents into the plan. The plan is an index to the
   work, not a copy of it.

5. **Keep it commit-message-grade.** The plan is tracked and committed: no secrets, keys,
   prompts, or PII — describe the decision or its class, not literal payloads.

6. **Commit the checkpoint.** Commit the plan update (`docs:`) so the pause is durable in git
   and the working tree is clean for the next session. Leave no uncommitted work behind.

## What a good pause is not

- **Not a transcript.** Capture decisions and the next action, not a play-by-play.
- **Not a duplicate.** If it already lives in a commit, an ADR, the spec, or an issue, link it.
- **Not final-sounding.** A pause is a *resumable* checkpoint — leave the live frontier and the
  open questions explicit, not smoothed over into a summary that hides where to start.

Pair: `resume-mission` reads exactly what this writes.
