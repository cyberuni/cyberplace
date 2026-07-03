---
name: report-pr-url-and-refresh
layer: behavior
threshold: 4
---

## Scenario

The agent has opened the pull request contributing the improved `fix-security-pr` skill back to its source. It now reports the result to the user.

## Expected behaviors

- Agent outputs the pull request URL
- Agent advises running `npx skills update` in the consumer repo after the PR merges to refresh the lockfile
- Both the URL and the refresh step appear in the report

## Must NOT do

- Report completion without the PR URL
- Omit the post-merge `npx skills update` refresh step
- Point the refresh step at the source repo instead of the consumer repo

## Assertions

- The pull request URL is reported
- The report advises running `npx skills update` in the consumer repo after merge

## Rubric

Score 1–5:
5 — Reports the PR URL and advises `npx skills update` in the consumer repo after merge
4 — Reports both the URL and the refresh step
3 — Reports the URL but omits or garbles the refresh step
2 — Mentions a refresh vaguely without the URL
1 — Reports neither the URL nor the refresh step
