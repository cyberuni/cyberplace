---
"cyber-skills": minor
---

Move public skills to `agents/skills/` and governances to `agents/governances/`. The `skills/` and `governances/` top-level directories are removed; authored content now lives under `agents/`. The `cyber-skills update` command skips `.agents/skills/<name>` entries that are symlinks, so locally authored skills are never overwritten by remote fetch.
