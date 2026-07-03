---
name: single-commit
layer: behavior
threshold: 4
---

## Scenario

Three changed files are mapped under `skills/fix-security-pr/` and ready to contribute: `SKILL.md`, `scripts/run.mjs`, and `scripts/lib/parse.mjs`. The user has confirmed the diffs. The agent pushes the contribution to the branch.

## Expected behaviors

- The branch gains exactly one new commit containing all three files
- All changed files land together, not one commit per file
- The resulting history shows a single commit for the whole contribution

## Must NOT do

- Produce three commits, one per file
- Produce a noisy multi-commit branch where each file lands separately
- Split the contribution across more than one commit

## Assertions

- The branch has exactly one new commit
- That single commit contains all three changed files

## Rubric

Score 1–5:
5 — Exactly one new commit on the branch containing all three files
4 — One commit containing all changed files
3 — One commit but a changed file is missing from it
2 — Two commits splitting the files
1 — One commit per file (three commits)
