---
"cyber-skills": minor
---

Add `add`, `remove`, `update`, `list`, `find`, `migrate`, and `config provider` commands for skill registry management.

- `cyber-skills add <org/repo[:skill]>` installs skills from GitHub, GitLab, or custom providers.
- `cyber-skills add <package>` installs skills from an npm package.
- `cyber-skills remove <name>`, `update [name]`, and `list` manage installed skills.
- `cyber-skills find [query]` searches `cyberuni/cyber-skills` or a custom repo.
- `cyber-skills migrate` imports existing `skills-lock.json` entries into the new `.agents/cyber-skills-lock.json` format.
- `cyber-skills config provider add <url>` registers a custom skill source (GitHub, GitLab, or custom).

Config is stored in `.agents/cyber-skills.json`; the lock is stored in `.agents/cyber-skills-lock.json`.
