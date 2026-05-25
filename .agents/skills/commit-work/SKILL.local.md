# commit-work local augmentation

## Auto-commit rule

In this repo, commit each unit of work immediately when it is complete and verified — do not wait for the user to ask. This is required by the repo's commit discipline.

A unit is complete when:
- All files for that concern are written/edited
- `pnpm verify` passes (or the pre-commit hook confirms tests pass)

Commit, then continue to the next unit. Never finish multiple units before committing.
