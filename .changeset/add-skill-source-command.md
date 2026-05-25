---
"cyber-skills": minor
---

Add `skill-source` command to look up an installed skill's source repository.

Checks the repo-local `skills-lock.json`, the global `~/.agents/.skill-lock.json`, then falls back to `npx skills find`. Exits non-zero when the skill is not found in any source.

```
npx cyber-skills skill-source <name>
```
