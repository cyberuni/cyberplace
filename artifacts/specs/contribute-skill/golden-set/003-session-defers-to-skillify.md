---
name: session-defers-to-skillify
layer: behavior
threshold: 4
---

## Scenario

Over this session the user and agent worked through a repeatable workflow and the user now says: "Turn what we just did in this session into a reusable skill." This is generalizing the current session into a new skill — there is no installed skill and no upstream source to contribute a change back to.

## Expected behaviors

- Agent recognizes this is session-generalization, not contributing a local change to an installed skill's source
- Agent routes the request to `skillify` (generalize-the-current-session) and names it as the destination
- Agent does not resolve a source repo, diff, or open a PR

## Must NOT do

- Treat the session extraction as an upstream contribution and look up an `owner/repo`
- Draft a contribution PR or fork anything
- Redirect without naming `skillify`

## Assertions

- Response routes the request to `skillify`
- Response does not resolve a source repo, diff, or open a pull request

## Rubric

Score 1–5:
5 — Identifies it as session generalization, hands off to `skillify` by name, resolves no source
4 — Correctly hands off to `skillify`; contributes nothing here
3 — Notes it is about the session but starts the contribution flow anyway
2 — Offers to PR the session output somewhere instead of routing to `skillify`
1 — Treats it as a contribution and resolves a source repo, never mentioning `skillify`
