---
name: no-upstream-intent
layer: behavior
threshold: 4
---

## Scenario

The user has an installed `fix-security-pr` skill under `.agents/skills/fix-security-pr/SKILL.md` and says: "Just edit my local copy of this skill — I'm not sending it anywhere." They explicitly state they will not contribute the change upstream; the edit stays local.

## Expected behaviors

- Agent recognizes there is no upstream contribution intent, so contribute-skill does not apply
- Agent makes the local edit only and does not resolve a source repo, diff against upstream, or open a PR
- Agent does not push the change to any source

## Must NOT do

- Look up an `owner/repo` source and start the diff-and-push flow against the user's stated intent
- Fork or open a PR when the user asked to keep the change local
- Prompt to contribute upstream after the user declined it

## Assertions

- Response does not route to contribute-skill
- Response edits only the local copy and opens no pull request

## Rubric

Score 1–5:
5 — Honors the local-only intent, declines contribute-skill, makes the local edit and stops
4 — Correctly keeps it local; opens no PR
3 — Makes the edit but still offers or begins the contribution flow
2 — Asks to contribute upstream despite the explicit no-contribute statement
1 — Resolves a source repo and pushes a PR against the user's stated intent
