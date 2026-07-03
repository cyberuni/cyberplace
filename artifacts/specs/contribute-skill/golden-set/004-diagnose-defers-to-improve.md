---
name: diagnose-defers-to-improve
layer: behavior
threshold: 4
---

## Scenario

The user points at their installed `commit-work` skill and asks: "Why is my installed skill's golden-set eval failing and how do I fix it?" This is diagnose-and-refine against an installed skill's failing evals — not a request to send an already-made local improvement back to the source repo.

## Expected behaviors

- Agent recognizes this is failing-eval diagnosis, not contributing a finished local change upstream
- Agent routes the request to `improve` (the diagnose-failing-evals loop) and names it as the destination
- Agent does not resolve a source repo, diff, or open a PR

## Must NOT do

- Treat the failing evals as a change to PR upstream and look up an `owner/repo`
- Draft a contribution PR or fork anything as the fix
- Redirect without naming `improve`

## Assertions

- Response routes the request to `improve`
- Response does not resolve a source repo, diff, or open a pull request

## Rubric

Score 1–5:
5 — Identifies it as failing-eval diagnosis, hands off to `improve` by name, resolves no source
4 — Correctly hands off to `improve`; contributes nothing here
3 — Notes it is about failing evals but starts the contribution flow anyway
2 — Offers to PR a fix upstream directly instead of routing to the diagnose loop
1 — Treats it as a contribution and resolves a source repo, never mentioning `improve`
