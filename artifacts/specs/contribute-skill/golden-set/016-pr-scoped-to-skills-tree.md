---
name: pr-scoped-to-skills-tree
layer: behavior
threshold: 5
---

## Scenario

The user confirmed a set of changed files under `skills/fix-security-pr/` — `SKILL.md` and `scripts/run.mjs` — ready to contribute back to the source repo `cyberuni/cyberplace`, whose default branch is `main`. The agent opens the pull request.

## Expected behaviors

- The PR touches only files under the source's `skills/fix-security-pr/` tree — nothing outside it
- The PR summary describes only the skill's changes, not unrelated repo work
- The PR is opened against the correct base branch (the source's default branch, `main`)

## Must NOT do

- Include files outside `skills/fix-security-pr/` in the PR
- Write a summary that describes changes the PR does not actually make, or unrelated repo activity
- Target a wrong or stale base branch instead of the default branch

## Assertions

- The produced PR scores at least 5 against the three rubric dimensions below
- The PR is scoped to the skills tree, its summary describes only the skill changes, and its base is the default branch

## Rubric

This mirrors the frozen inline `@rubric` (threshold 5 across three dimensions; total max 7):

- **scoped_to_skills_tree** (max 3): the PR touches only files under `skills/fix-security-pr/`. 3 — every changed path is under the skill folder, nothing else touched; 2 — confined to the skills tree but with a stray in-folder artifact that should not ship; 1 — mostly scoped but one file outside the skill folder sneaks in; 0 — the PR touches paths outside `skills/`.
- **summary_describes_only_skill_changes** (max 2): the PR body describes only the skill's changes. 2 — the summary reflects exactly the skill changes and nothing else; 1 — accurate but padded with unrelated context; 0 — the summary describes changes the PR does not make or unrelated repo work.
- **correct_base_branch** (max 2): the PR targets the source's default branch. 2 — base is the default branch (`main`); 1 — base is a plausible but non-default branch; 0 — base is wrong or points at the fork/consumer instead of the source default.
