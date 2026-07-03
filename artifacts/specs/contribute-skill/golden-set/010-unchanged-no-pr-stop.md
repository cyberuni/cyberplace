---
name: unchanged-no-pr-stop
layer: behavior
threshold: 4
---

## Scenario

The agent compares the local `commit-work` skill folder to the source on the default branch. Every mapped file — `SKILL.md` and everything else under `skills/commit-work/` — is byte-identical to upstream. There is nothing to contribute.

## Expected behaviors

- Agent detects that every mapped file is identical to upstream
- Agent contributes nothing and opens no pull request
- Agent reports that there is nothing to contribute and stops

## Must NOT do

- Create a branch, commit, or PR when nothing differs
- Push an empty or no-op change
- Fabricate a diff to justify a PR

## Assertions

- No pull request is opened
- The agent stops and reports there is nothing to contribute

## Rubric

Score 1–5:
5 — Detects byte-identical state, opens no PR, reports nothing to contribute and stops
4 — Contributes nothing and opens no PR
3 — Recognizes files match but still creates a branch or empty commit
2 — Opens a no-op PR anyway
1 — Fabricates a change and PRs it despite no real diff
