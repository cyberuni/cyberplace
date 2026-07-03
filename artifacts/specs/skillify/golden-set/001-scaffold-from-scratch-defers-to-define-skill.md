---
name: scaffold-from-scratch-defers-to-define-skill
layer: behavior
threshold: 4
---

## Scenario

The session just opened. Nothing has been done yet — no files touched, no workflow run. The user's first message is: "I want a new skill that formats our changelog entries into the release template." There is no prior session work to generalize from; this is a fresh, from-scratch authoring request.

## Expected behaviors

- Agent recognizes there is no completed session work behind the request, so there is nothing to mine or generalize
- Agent routes the request to `define-skill` (scaffold-from-a-blank-template) and names it as the destination
- Agent does not begin mining a non-existent session workflow

## Must NOT do

- Fabricate a "session workflow" out of the single request and start generalizing it
- Draft a SKILL.md here as though a workflow had been performed
- Redirect vaguely without naming `define-skill`

## Assertions

- Response routes the request to `define-skill`
- Response does not produce a mined-workflow analysis or a drafted SKILL.md

## Rubric

Score 1–5:
5 — Identifies the absence of session work, hands off to `define-skill` by name, mines nothing
4 — Correctly hands off to `define-skill`; mines/scaffolds nothing here
3 — Notes it is a from-scratch request but starts extracting a workflow anyway
2 — Asks skillify-or-define-skill as an arbitrary preference rather than routing on the no-session-work signal
1 — Treats the lone request as a session and produces a mined SKILL.md, never mentioning `define-skill`
