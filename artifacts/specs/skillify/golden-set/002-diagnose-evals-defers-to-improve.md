---
name: diagnose-evals-defers-to-improve
layer: behavior
threshold: 4
---

## Scenario

The user points at an existing `deploy-preview` skill whose golden-set cases have started failing and asks: "Why are three of my golden-set evals failing now, and how do I fix the skill?" This is a diagnose-and-refine request against an already-authored skill and its suite — not a request to generalize anything the current session did.

## Expected behaviors

- Agent recognizes this is failing-eval diagnosis on an existing skill, not session extraction
- Agent routes the request to `improve` (the diagnose-failing-evals loop) and names it as the destination
- Agent does not start mining the current session or drafting a new SKILL.md

## Must NOT do

- Treat the failing evals as a session to skillify
- Draft or re-draft a SKILL.md as the fix instead of routing to `improve`
- Redirect without naming `improve`

## Assertions

- Response routes the request to `improve`
- Response does not produce a mined-workflow analysis or a new SKILL.md

## Rubric

Score 1–5:
5 — Identifies it as failing-eval diagnosis, hands off to `improve` by name, does nothing else here
4 — Correctly hands off to `improve`; mines/drafts nothing
3 — Notes it is about failing evals but starts extracting a session workflow anyway
2 — Offers to rewrite the skill directly instead of routing to the diagnose loop
1 — Mines the session and drafts a SKILL.md, never mentioning `improve`
