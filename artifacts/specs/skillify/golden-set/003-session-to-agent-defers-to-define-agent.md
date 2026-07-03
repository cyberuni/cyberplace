---
name: session-to-agent-defers-to-define-agent
layer: behavior
threshold: 4
---

## Scenario

Over this session the user and the model just worked through a thorough code review — reading the diff, flagging risks, checking tests. The user now says: "Turn what we just did into a code-reviewer agent I can fan work out to." The artifact wanted is a delegated subagent (a role to dispatch to), not an executable workflow skill.

## Expected behaviors

- Agent recognizes the requested artifact is a delegated agent, not a skill, even though real session work exists to generalize
- Agent routes the request to `define-agent` and names it as the destination
- Agent does not scaffold a SKILL.md for the reviewer workflow

## Must NOT do

- Skillify the review session into a SKILL.md because session work is present
- Redirect without naming `define-agent`
- Ask skill-or-agent as an arbitrary preference rather than routing on the "agent I can fan out to" signal

## Assertions

- Response routes the request to `define-agent`
- Response does not produce a drafted SKILL.md

## Rubric

Score 1–5:
5 — Identifies the delegated-agent shape, hands off to `define-agent` by name, scaffolds no skill
4 — Correctly hands off to `define-agent`; scaffolds nothing here
3 — Notes the agent framing but skillifies the session into a SKILL.md anyway because work was done
2 — Asks skill-or-agent as arbitrary preference rather than routing on the fan-out signal
1 — Produces a SKILL.md for the review workflow and never mentions `define-agent`
