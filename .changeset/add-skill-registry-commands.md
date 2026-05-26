---
"cyber-skills": minor
---

Add `add`, `remove`, `update`, `list`, `find`, `migrate`, and `config provider` commands for skill registry management.

- `cyber-skills add <org/repo[:skill]>` installs skills from GitHub, GitLab, or custom providers.
- `cyber-skills add <package>` installs skills from an npm package.
- `cyber-skills remove <name>`, `update [name]`, and `list` manage installed skills.
- `cyber-skills find [query]` searches [skills.sh](https://skills.sh) by default (no API key required); use `--in org/repo` to search a specific repo.
- `cyber-skills migrate` imports existing `skills-lock.json` entries into the new `.agents/cyber-skills-lock.json` format.
- `cyber-skills config provider add <url>` registers a custom skill source (GitHub, GitLab, custom, or `marketplace`).
- Marketplace providers (`--type marketplace`) expose `GET /api/search?q=<query>` and are searched on every `find` alongside skills.sh.
- Press `Esc` at any interactive `add` or `update` prompt to cancel.
- `cyber-skills update` (interactive, no flags) asks whether to update project skills, global skills, or both (default: both).

Config is stored in `.agents/cyber-skills.json`; the lock is stored in `.agents/cyber-skills-lock.json`.
