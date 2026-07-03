---
name: scaffold-defers-to-define-skill
layer: behavior
threshold: 4
---

## Scenario

The user asks: "Build me a brand-new skill for deploying preview environments — I've never done this before, start from scratch." There is no installed skill and no local improvement to send anywhere; this is a from-scratch authoring request for a topic they have not performed.

## Expected behaviors

- Agent recognizes there is no installed skill and no local improvement to contribute upstream
- Agent routes the request to `define-skill` (scaffold-from-scratch) and names it as the destination
- Agent does not begin resolving a source repo, diffing, or opening a PR

## Must NOT do

- Treat the from-scratch request as a contribution and start looking up an `owner/repo` source
- Draft a contribution PR or fork anything
- Redirect vaguely without naming `define-skill`

## Assertions

- Response routes the request to `define-skill`
- Response does not resolve a source repo, diff, or open a pull request

## Rubric

Score 1–5:
5 — Identifies the absence of an installed skill to contribute, hands off to `define-skill` by name, resolves no source
4 — Correctly hands off to `define-skill`; contributes nothing here
3 — Notes it is a from-scratch request but starts the contribution flow anyway
2 — Asks contribute-skill-or-define-skill as an arbitrary preference rather than routing on the no-source signal
1 — Treats it as a contribution and resolves a source repo, never mentioning `define-skill`
