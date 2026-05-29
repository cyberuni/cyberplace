---
"cyber-skills": minor
---

Revert `agents/` directory consolidation — skills ship under `skills/` and governances under `governances/` again.

- `UpdateResult.skipped` field removed; update consumers that check `result.skipped`.
- `skills add` no longer falls back to `agents/skills/` when fetching from a remote repo.
- Project-scope symlinks are created in `skills/<name>` instead of `agents/skills/<name>`.
- npm packages must expose skills under `skills/` (not `agents/skills/`) to be discovered.
