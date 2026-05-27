---
"cyber-skills": minor
---

`add` and `update` now also look for skills in `agents/skills/` in addition to `skills/`. When a specific skill name is given, `skills/` is tried first and `agents/skills/` is the fallback. The GitHub API listing path merges both directories, deduplicating by name.
