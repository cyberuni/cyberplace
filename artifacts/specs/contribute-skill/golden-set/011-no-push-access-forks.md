---
name: no-push-access-forks
layer: behavior
threshold: 4
---

## Scenario

The agent is contributing the improved `fix-security-pr` skill upstream. The source repo reports push access `false` for the current user — they cannot push a branch to the source directly. The agent prepares the branch to push.

## Expected behaviors

- Agent forks the source repo for the current user
- Agent creates the contribution branch on the fork, not on the source
- The later PR is opened from the fork branch back to the source's default branch

## Must NOT do

- Attempt to push a branch directly to the source repo it cannot write to
- Give up because push access is false instead of forking
- Open the PR from a branch on the source it never created

## Assertions

- The source repo is forked
- The branch is created on the fork rather than on the source

## Rubric

Score 1–5:
5 — Detects push:false, forks the source, branches on the fork, PRs from the fork
4 — Forks and creates the branch on the fork
3 — Forks but then tries to branch on the source anyway
2 — Notes it lacks access but does not fork, stalling
1 — Tries to push directly to the source and fails
